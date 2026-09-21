// 'use client';

// import React, { useEffect, useState } from 'react';
// import {
//   Plus,
//   Download,
//   Search,
//   Calendar,
//   Layers,
//   Home,
//   Tag,
// } from 'lucide-react';
// import { apiGetAllAdsPlans } from '@/service/api';
// import * as XLSX from 'xlsx';

// const PLAN_LABELS = {
//   category_hero: 'Category Hero',
//   featured_spotlight: 'Featured Spotlight',
//   mega_flash: 'Mega Flash',
// };

// function formatDate(value) {
//   if (!value) return '—';
//   const d = new Date(value);
//   if (Number.isNaN(d.getTime())) return '—';
//   return d.toLocaleDateString('en-GB', {
//     day: '2-digit',
//     month: 'short',
//     year: 'numeric',
//   });
// }

// function initialsFromName(name) {
//   const parts = String(name || '')
//     .trim()
//     .split(/\s+/);
//   if (parts.length === 0 || !parts[0]) return 'VN';
//   return parts
//     .slice(0, 2)
//     .map((p) => p[0]?.toUpperCase())
//     .join('');
// }

// function mapAdsPlanToCampaignRow(plan) {
//   const vendorName =
//     plan.vendor?.businessName || plan.vendor?.fullName || 'Unknown Vendor';

//   const durationDays = (() => {
//     const productDurations = (plan.products || [])
//       .map((p) => String(p.duration || ''))
//       .filter(Boolean);
//     return productDurations[0] || '';
//   })();

//   // Best-effort end date: createdAt + duration (fallback: same as start)
//   const startDate = new Date(plan.createdAt);
//   let endDate = new Date(plan.createdAt);
//   const match = durationDays.match(/(\d+)\s*(hr|day)/i);
//   if (match) {
//     const amount = Number(match[1]);
//     const unit = match[2].toLowerCase();
//     if (unit === 'hr') endDate.setHours(endDate.getHours() + amount);
//     if (unit === 'day') endDate.setDate(endDate.getDate() + amount);
//   }

//   return {
//     id: `AD-${String(plan._id).slice(-6).toUpperCase()}`,
//     vendor: vendorName,
//     initials: initialsFromName(vendorName),
//     plan: PLAN_LABELS[plan.planType] || 'Category Hero',
//     products: (plan.products || []).length,
//     start: formatDate(startDate),
//     end: formatDate(endDate),
//     status: plan.status,
//   };
// }
// const HOME_HERO_TOTAL_SLOTS = 5;
// const CATEGORY_HERO_TOTAL_SLOTS = 10;

// const VendorAvatar = ({ initials }) => (
//   <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white">
//     {initials}
//   </div>
// );

// const ITEMS_PER_PAGE = 10;

// const GrowthPlan = () => {
//   const [adsPlans, setAdsPlans] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);

//   useEffect(() => {
//     const token =
//       typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

//     apiGetAllAdsPlans(token)
//       .then((res) => setAdsPlans(res.data?.adsPlans || []))
//       .catch(() => setAdsPlans([]))
//       .finally(() => setLoading(false));
//   }, []);

//   const activeAdsPlans = adsPlans.filter((p) =>
//     ['scheduled', 'active'].includes(String(p.status)),
//   );

//   const allCampaigns = activeAdsPlans
//     .filter((p) =>
//       String(p.vendor?.businessName || p.vendor?.fullName || '')
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase()),
//     )
//     .map(mapAdsPlanToCampaignRow);

//   const totalPages = Math.max(
//     1,
//     Math.ceil(allCampaigns.length / ITEMS_PER_PAGE),
//   );
//   const campaigns = allCampaigns.slice(
//     (currentPage - 1) * ITEMS_PER_PAGE,
//     currentPage * ITEMS_PER_PAGE,
//   );

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchTerm]);

//   const handleExportReport = () => {
//     const rows = allCampaigns.map((c) => ({
//       'Campaign ID': c.id,
//       'Vendor Name': c.vendor,
//       'Plan Selected': c.plan,
//       'Products Boosted': c.products,
//       'Start Date': c.start,
//       'End Date': c.end,
//       Status: c.status,
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(rows);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Growth Plans');

//     const dateStr = new Date().toISOString().slice(0, 10);
//     XLSX.writeFile(workbook, `growth-plans-report-${dateStr}.xlsx`);
//   };

//   const categoryHeroUsed = activeAdsPlans.filter(
//     (p) => p.planType === 'category_hero',
//   ).length;

//   const inventorySlots = [
//     {
//       icon: Home,
//       label: 'Home Page Hero',
//       total: HOME_HERO_TOTAL_SLOTS,
//       used: 0,
//       available: HOME_HERO_TOTAL_SLOTS,
//       barColor: 'bg-blue-600',
//     },
//     {
//       icon: Tag,
//       label: 'Category Hero',
//       total: CATEGORY_HERO_TOTAL_SLOTS,
//       used: Math.min(categoryHeroUsed, CATEGORY_HERO_TOTAL_SLOTS),
//       available: Math.max(0, CATEGORY_HERO_TOTAL_SLOTS - categoryHeroUsed),
//       barColor: 'bg-orange-500',
//     },
//   ];

//   return (
//     <div className="w-full min-h-screen overflow-x-hidden bg-gray-50 p-4 sm:p-6 lg:p-8 pt-2 sm:pt-3 lg:pt-4">
//       <div className="mx-auto w-full max-w-5xl">
//         {/* Header */}
//         {/* <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//           <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-600">
//             <Plus size={16} />
//             Create New Ad Campaign
//           </button>
//         </div> */}

//         {/* Content grid */}
//         <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">
//           {/* Active Campaign Table */}
//           <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
//             <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//               <h2 className="text-base font-semibold text-black">
//                 Active Campaign Table
//               </h2>
//               <div className="flex flex-col gap-2 sm:flex-row">
//                 {/* <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-600">
//                   <Plus size={16} />
//                   Create New Ad Campaign
//                 </button> */}
//                 <button
//                   onClick={handleExportReport}
//                   disabled={allCampaigns.length === 0}
//                   className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
//                 >
//                   <Download size={15} />
//                   Export Report
//                 </button>
//               </div>
//             </div>

//             {/* Search / filter row */}
//             <div className="mb-4 flex flex-col gap-3 sm:flex-row">
//               <div className="relative flex-1">
//                 <Search
//                   size={16}
//                   className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//                 />
//                 <input
//                   type="text"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   placeholder="Search by vendor name or ID..."
//                   className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 />
//               </div>
//               <div className="relative w-full sm:w-48">
//                 <input
//                   type="text"
//                   placeholder=""
//                   className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 />
//               </div>
//             </div>

//             {/* Table - scrolls horizontally on small screens */}
//             <div className="-mx-4 overflow-x-auto sm:mx-0">
//               <table className="w-full min-w-[640px] border-collapse text-sm">
//                 <thead>
//                   <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
//                     <th className="px-4 py-3 sm:px-2">Vendor Name</th>
//                     <th className="px-4 py-3 sm:px-2">Plan Selected</th>
//                     <th className="px-4 py-3 sm:px-2">Products Boosted</th>
//                     <th className="px-4 py-3 sm:px-2">Start / End Date</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {loading && (
//                     <tr>
//                       <td
//                         colSpan={4}
//                         className="px-4 py-8 text-center text-gray-400"
//                       >
//                         Loading campaigns...
//                       </td>
//                     </tr>
//                   )}
//                   {!loading && campaigns.length === 0 && (
//                     <tr>
//                       <td
//                         colSpan={4}
//                         className="px-4 py-8 text-center text-gray-400"
//                       >
//                         No active campaigns found.
//                       </td>
//                     </tr>
//                   )}
//                   {!loading &&
//                     campaigns.map((c) => (
//                       <tr
//                         key={c.id}
//                         className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
//                       >
//                         <td className="px-4 py-3 sm:px-2">
//                           <div className="flex items-center gap-3">
//                             <VendorAvatar initials={c.initials} />
//                             <div>
//                               <div className="font-medium text-black">
//                                 {c.vendor}
//                               </div>
//                               <div className="text-xs text-gray-400">
//                                 {c.id}
//                               </div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-4 py-3 sm:px-2">
//                           <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-600">
//                             <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
//                             {c.plan}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3 text-gray-600 sm:px-2">
//                           <span className="inline-flex items-center gap-1.5">
//                             <Layers size={14} className="text-gray-400" />
//                             {c.products} products
//                           </span>
//                         </td>
//                         <td className="px-4 py-3 text-gray-600 sm:px-2">
//                           <span className="inline-flex items-center gap-1.5">
//                             <Calendar size={14} className="text-gray-400" />
//                             <span>
//                               {c.start}
//                               <br className="hidden sm:block" /> to {c.end}
//                             </span>
//                           </span>
//                         </td>
//                       </tr>
//                     ))}
//                 </tbody>
//               </table>
//             </div>

//             <div className="mt-4 flex flex-col-reverse items-center justify-between gap-3 border-t border-gray-100 pt-4 text-sm sm:flex-row">
//               <span className="text-gray-500">
//                 Showing {campaigns.length} of {allCampaigns.length} campaigns
//                 {allCampaigns.length > 0 && (
//                   <>
//                     {' '}
//                     · Page {currentPage} of {totalPages}
//                   </>
//                 )}
//               </span>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                   disabled={currentPage === 1}
//                   className="rounded-lg border border-gray-300 px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
//                 >
//                   Previous
//                 </button>
//                 <button
//                   onClick={() =>
//                     setCurrentPage((p) => Math.min(totalPages, p + 1))
//                   }
//                   disabled={currentPage === totalPages}
//                   className="rounded-lg bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Inventory Control */}
//           <div className="h-fit rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
//             <div className="mb-1 flex items-center gap-2">
//               <Layers size={16} className="text-gray-700" />
//               <h2 className="text-base font-semibold text-black">
//                 Inventory Control
//               </h2>
//             </div>
//             <p className="mb-4 text-xs font-medium uppercase tracking-wide text-gray-400">
//               Available Slots
//             </p>

//             <div className="flex flex-col gap-4">
//               {inventorySlots.map((slot) => {
//                 const Icon = slot.icon;
//                 const pct = Math.round((slot.used / slot.total) * 100);
//                 return (
//                   <div
//                     key={slot.label}
//                     className="rounded-lg border border-gray-100 p-4"
//                   >
//                     <div className="mb-3 flex items-center gap-2">
//                       <Icon size={15} className="text-gray-500" />
//                       <span className="text-sm font-medium text-black">
//                         {slot.label}
//                       </span>
//                     </div>
//                     <div className="space-y-1.5 text-xs text-gray-500">
//                       <div className="flex justify-between">
//                         <span>Total Slots:</span>
//                         <span className="font-medium text-gray-800">
//                           {slot.total}
//                         </span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span>Used:</span>
//                         <span className="font-medium text-gray-800">
//                           {slot.used}
//                         </span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span>Available:</span>
//                         <span className="font-medium text-green-600">
//                           {slot.available}
//                         </span>
//                       </div>
//                     </div>
//                     <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
//                       <div
//                         className={`h-full rounded-full ${slot.barColor}`}
//                         style={{ width: `${pct}%` }}
//                       />
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default GrowthPlan;

'use client';

import React, { useEffect, useState } from 'react';
import {
  Plus,
  Download,
  Search,
  Calendar,
  Layers,
  Home,
  Tag,
  Sparkle,
  Sparkles,
  ChevronDown,
  Target,
} from 'lucide-react';
import { apiGetAllAdsPlans } from '@/service/api';
import * as XLSX from 'xlsx';

const PLAN_LABELS = {
  category_hero: 'Category Hero',
  featured_spotlight: 'Featured Spotlight',
  mega_flash: 'Mega Flash',
};

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function initialsFromName(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/);
  if (parts.length === 0 || !parts[0]) return 'VN';
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

// function mapAdsPlanToCampaignRow(plan) {
//   const vendorName =
//     plan.vendor?.businessName || plan.vendor?.fullName || 'Unknown Vendor';

//   const durationDays = (() => {
//     const productDurations = (plan.products || [])
//       .map((p) => String(p.duration || ''))
//       .filter(Boolean);
//     return productDurations[0] || '';
//   })();

//   // Best-effort end date: createdAt + duration (fallback: same as start)
//   const startDate = new Date(plan.createdAt);
//   let endDate = new Date(plan.createdAt);
//   const match = durationDays.match(/(\d+)\s*(hr|day)/i);
//   if (match) {
//     const amount = Number(match[1]);
//     const unit = match[2].toLowerCase();
//     if (unit === 'hr') endDate.setHours(endDate.getHours() + amount);
//     if (unit === 'day') endDate.setDate(endDate.getDate() + amount);
//   }

//   return {

function mapAdsPlanToCampaignRow(plan) {
  const vendorName =
    plan.vendor?.businessName || plan.vendor?.fullName || 'Unknown Vendor';

  // Compute each product's own start/end, then take the earliest start
  // and latest end across all products (products can have different
  // schedules/durations).
  const productRanges = (plan.products || []).map((p) => {
    const pStart = p.startDate
      ? new Date(p.startDate)
      : new Date(plan.createdAt);
    const pEnd = new Date(pStart);
    const hours = Number(p.duration) || 0;
    pEnd.setHours(pEnd.getHours() + hours);
    return { start: pStart, end: pEnd };
  });

  const startDate =
    productRanges.length > 0
      ? new Date(Math.min(...productRanges.map((r) => r.start.getTime())))
      : new Date(plan.createdAt);

  const endDate =
    productRanges.length > 0
      ? new Date(Math.max(...productRanges.map((r) => r.end.getTime())))
      : new Date(plan.createdAt);

  return {
    id: `AD-${String(plan._id).slice(-6).toUpperCase()}`,
    vendorId: plan.vendor?._id
      ? `VEN-${String(plan.vendor._id).slice(-3)}`
      : plan.vendor?.vendorId || '—',
    vendor: vendorName,
    initials: initialsFromName(vendorName),
    plan: PLAN_LABELS[plan.planType] || 'Category Hero',
    products: (plan.products || []).length,
    productDetails: (plan.products || []).map((p, idx) => ({
      name: p.productName || 'Untitled Product',
      image: p.image || 'https://placehold.co/80x80/e5e7eb/6b7280?text=IMG',
      start: formatDate(productRanges[idx]?.start),
      end: formatDate(productRanges[idx]?.end),
    })),
    start: formatDate(startDate),
    end: formatDate(endDate),
    status: plan.status,
  };
}
const HOME_HERO_TOTAL_SLOTS = 5;
const CATEGORY_HERO_TOTAL_SLOTS = 50;

const VendorAvatar = ({ initials }) => (
  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white">
    {initials}
  </div>
);

const ITEMS_PER_PAGE = 10;

const GrowthPlan = () => {
  const [adsPlans, setAdsPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRowId, setExpandedRowId] = useState(null);

  useEffect(() => {
    if (!expandedRowId) return;
    const timer = setTimeout(() => setExpandedRowId(null), 15000);
    return () => clearTimeout(timer);
  }, [expandedRowId]);

  const toggleRow = (id) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

    apiGetAllAdsPlans(token)
      .then((res) => setAdsPlans(res.data?.adsPlans || []))
      .catch(() => setAdsPlans([]))
      .finally(() => setLoading(false));
  }, []);

  const activeAdsPlans = adsPlans.filter((p) =>
    ['scheduled', 'active'].includes(String(p.status)),
  );

  const allCampaigns = activeAdsPlans
    .filter((p) => {
      const term = searchTerm.trim().toLowerCase();
      if (!term) return true;

      const name = String(
        p.vendor?.businessName || p.vendor?.fullName || '',
      ).toLowerCase();

      const vendorIdFormatted = p.vendor?._id
        ? `VEN-${String(p.vendor._id).slice(-3)}`.toLowerCase()
        : '';
      const vendorIdRaw = String(p.vendor?._id || '').toLowerCase();

      return (
        name.includes(term) ||
        vendorIdFormatted.includes(term) ||
        vendorIdRaw.includes(term)
      );
    })
    .map(mapAdsPlanToCampaignRow);

  const totalPages = Math.max(
    1,
    Math.ceil(allCampaigns.length / ITEMS_PER_PAGE),
  );
  const campaigns = allCampaigns.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleExportReport = () => {
    const rows = allCampaigns.map((c) => ({
      'Campaign ID': c.id,
      'Vendor Name': c.vendor,
      'Plan Selected': c.plan,
      'Products Boosted': c.products,
      'Start Date': c.start,
      'End Date': c.end,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Growth Plans');

    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `growth-plans-report-${dateStr}.xlsx`);
  };

  const categoryHeroUsed = activeAdsPlans.filter(
    (p) => p.planType === 'category_hero',
  ).length;

  const inventorySlots = [
    // {
    //   icon: Home,
    //   label: 'Home Page Hero',
    //   total: HOME_HERO_TOTAL_SLOTS,
    //   used: 0,
    //   available: HOME_HERO_TOTAL_SLOTS,
    //   barColor: 'bg-blue-600',
    // },
    {
      icon: Target,
      label: 'Category Hero',
      total: CATEGORY_HERO_TOTAL_SLOTS,
      used: Math.min(categoryHeroUsed, CATEGORY_HERO_TOTAL_SLOTS),
      available: Math.max(0, CATEGORY_HERO_TOTAL_SLOTS - categoryHeroUsed),
      barColor: 'bg-orange-500',
    },
  ];

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-gray-50 p-4 sm:p-6 lg:p-8 pt-2 sm:pt-3 lg:pt-4">
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        {/* <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-600">
            <Plus size={16} />
            Create New Ad Campaign
          </button>
        </div> */}

        {/* Content grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">
          {/* Active Campaign Table */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-lg font-semibold text-black">
                Active Campaign Table
              </h1>
              <div className="flex flex-col gap-2 sm:flex-row">
                {/* <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-600">
                  <Plus size={16} />
                  Create New Ad Campaign
                </button> */}
                {/* <button
                  onClick={handleExportReport}
                  disabled={allCampaigns.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download size={15} />
                  Export Report
                </button> */}
              </div>
            </div>

            {/* Search / filter row */}
            <div className="mb-4 flex flex-row items-center gap-2 sm:gap-3">
              <div className="relative min-w-0 flex-1">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by vendor name or ID..."
                  className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:pr-3"
                />
              </div>
              <button
                onClick={handleExportReport}
                disabled={allCampaigns.length === 0}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-gray-300 px-2.5 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-3 sm:text-sm"
              >
                <Download size={15} />
                <span className="hidden xs:inline sm:inline">
                  Export Report
                </span>
                <span className="xs:hidden sm:hidden">Export</span>
              </button>
            </div>

            {/* Table - scrolls horizontally on small screens */}
            <div className="-mx-4 overflow-x-auto sm:mx-0">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3 sm:px-2">Vendor Name</th>
                    <th className="px-4 py-3 sm:px-2">Plan Selected</th>
                    <th className="px-4 py-3 sm:px-2">Products Boosted</th>
                    <th className="px-4 py-3 sm:px-2">Start / End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-gray-400"
                      >
                        Loading campaigns...
                      </td>
                    </tr>
                  )}
                  {!loading && campaigns.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-gray-400"
                      >
                        No active campaigns found.
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    campaigns.map((c) => (
                      <React.Fragment key={c.id}>
                        <tr
                          onClick={() => toggleRow(c.id)}
                          className={`cursor-pointer border-b border-gray-100 last:border-0 hover:bg-gray-50 ${
                            expandedRowId === c.id ? 'bg-gray-50' : ''
                          }`}
                        >
                          <td className="px-4 py-3 sm:px-2">
                            <div className="flex items-center gap-3">
                              <VendorAvatar initials={c.initials} />
                              <div>
                                <div className="font-medium text-black">
                                  {c.vendor}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {c.vendorId}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 sm:px-2">
                            <span className="inline-flex items-center gap-1.5 rounded-xl bg-orange-50 border border-orange-200 px-2.5 py-1 text-xs font-medium text-[#F97316]">
                              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                              {c.plan}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 sm:px-2">
                            <span className="inline-flex items-center gap-1.5">
                              <Sparkles size={14} className="text-[#F97316]" />
                              {c.products} products
                              <ChevronDown
                                size={14}
                                className={`ml-1 text-gray-400 transition-transform ${
                                  expandedRowId === c.id ? 'rotate-180' : ''
                                }`}
                              />
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 sm:px-2">
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar size={14} className="text-gray-400" />
                              <span>
                                {c.start}
                                <br className="hidden sm:block" /> to {c.end}
                              </span>
                            </span>
                          </td>
                        </tr>
                        {expandedRowId === c.id && (
                          <tr className="border-b border-gray-100 bg-gray-50/70">
                            <td colSpan={4} className="px-4 py-4 sm:px-2">
                              <div className="flex flex-wrap gap-3">
                                {c.productDetails.length === 0 && (
                                  <span className="text-xs text-gray-400">
                                    No product details available.
                                  </span>
                                )}
                                {c.productDetails.map((p, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2"
                                  >
                                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-gray-100">
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
                                      <div className="text-sm font-medium text-gray-800">
                                        {p.name}
                                      </div>
                                      <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                                        <Calendar size={11} />
                                        {p.start} to {p.end}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-row items-center justify-between gap-2 border-t border-gray-100 pt-4 text-sm">
              <span className="min-w-0 truncate text-xs text-gray-500 sm:text-sm">
                Showing {campaigns.length} of {allCampaigns.length} campaigns
                {/* {allCampaigns.length > 0 && (
                  <>
                    {' '}
                    · Page {currentPage} of {totalPages}
                  </>
                )} */}
              </span>
              <div className="flex shrink-0 gap-1.5 sm:gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:py-1.5 sm:text-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-lg bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:py-1.5 sm:text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Inventory Control */}
          <div className="h-fit rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-1 flex items-center gap-1">
              <Layers size={16} className="text-[#F97316]" />
              <h2 className="text-base font-semibold text-black">
                Inventory Control
              </h2>
            </div>
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-gray-400">
              Available Slots
            </p>

            <div className="flex flex-col gap-4">
              {inventorySlots.map((slot) => {
                const Icon = slot.icon;
                const pct = Math.round((slot.used / slot.total) * 100);
                return (
                  <div
                    key={slot.label}
                    className="rounded-lg border border-gray-100 p-4"
                  >
                    <div className="mb-3 flex items-center gap-1">
                      <Icon size={16} className="text-[#F97316]" />
                      <span className="text-sm font-medium text-black">
                        {slot.label}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-gray-500">
                      <div className="flex justify-between">
                        <span className="font-semibold">Total Slots:</span>
                        <span className="font-medium text-gray-800">
                          {slot.total}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Used:</span>
                        <span className="font-medium text-red-600">
                          {slot.used}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Available:</span>
                        <span className="font-medium text-green-600">
                          {slot.available}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${slot.barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrowthPlan;
