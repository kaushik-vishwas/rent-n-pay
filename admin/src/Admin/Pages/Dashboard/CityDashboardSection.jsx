// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import Link from 'next/link';
// import { apiGetCityDashboard, apiGetCities } from '@/service/api';

// const PERIODS = [
//   { key: 'today', label: 'Today' },
//   { key: 'week', label: 'Week' },
//   { key: 'month', label: 'Month' },
//   { key: 'quarter', label: 'Quarter' },
//   { key: 'year', label: 'Year' },
// ];

// function MetricCard({ label, value, sub, accent, icon, ringColor }) {
//   return (
//     <div className="group bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-1 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
//       <div className="flex items-center justify-between mb-2">
//         <div
//           className={`w-11 h-11 rounded-full flex items-center justify-center text-lg ring-4 ${accent} ${ringColor || 'ring-gray-50'}`}
//         >
//           {icon || '📊'}
//         </div>
//         {sub && (
//           <span
//             className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${accent}`}
//           >
//             {sub}
//           </span>
//         )}
//       </div>
//       <p className="text-2xl font-bold text-black leading-tight">{value}</p>
//       <p className="text-[11px] text-gray-400 font-medium tracking-wide uppercase">
//         {label}
//       </p>
//     </div>
//   );
// }

// function SectionHeading({ children }) {
//   return (
//     <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2 mt-4">
//       {children}
//     </p>
//   );
// }

// /**
//  * Rounded donut chart, styled like the "Category Performance" widget.
//  * rows: [{ key, label, value, pct, color }]
//  * centerTopLabel / centerBottomLabel render in the middle of the ring.
//  */
// function BreakdownDonut({ rows, centerTopLabel, centerBottomLabel }) {
//   const [hoveredKey, setHoveredKey] = useState(null);

//   const size = 220;
//   const pad = 30;
//   const stroke = 38;
//   const r = (size - stroke) / 2;
//   const c = size / 2;
//   const circ = 2 * Math.PI * r;

//   let offset = 0;
//   const arcs = rows.map((row) => {
//     const len = (row.pct / 100) * circ;
//     const isHovered = hoveredKey === row.key;
//     const isDimmed = hoveredKey !== null && !isHovered;
//     const el = (
//       <circle
//         key={row.key}
//         cx={c}
//         cy={c}
//         r={isHovered ? r + 3 : r}
//         fill="none"
//         stroke={row.color}
//         strokeWidth={isHovered ? stroke + 4 : stroke}
//         strokeDasharray={`${len} ${circ - len}`}
//         strokeDashoffset={-offset}
//         strokeLinecap="round"
//         transform={`rotate(-90 ${c} ${c})`}
//         opacity={isDimmed ? 0.35 : 1}
//         style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
//         onMouseEnter={() => setHoveredKey(row.key)}
//         onMouseLeave={() => setHoveredKey(null)}
//       />
//     );
//     offset += len;
//     return el;
//   });

//   const hoveredRow = rows.find((row) => row.key === hoveredKey) || null;

//   return (
//     <svg
//       width="100%"
//       viewBox={`${-pad} ${-pad} ${size + pad * 2} ${size + pad * 2}`}
//       className="max-w-[240px] mx-auto"
//     >
//       {arcs}
//       <circle cx={c} cy={c} r={r - stroke / 2 + 2} fill="#ffffff" />
//       <text
//         x={c}
//         y={c - 10}
//         textAnchor="middle"
//         dominantBaseline="middle"
//         className="text-[11px] font-medium"
//         fill="#94a3b8"
//       >
//         {hoveredRow ? hoveredRow.label : centerTopLabel}
//       </text>
//       <text
//         x={c}
//         y={c + 12}
//         textAnchor="middle"
//         dominantBaseline="middle"
//         className="text-base font-bold"
//         fill={hoveredRow ? hoveredRow.color : '#0f172a'}
//       >
//         {hoveredRow ? `${hoveredRow.pct}%` : centerBottomLabel}
//       </text>
//     </svg>
//   );
// }

// function DonutLegend({ rows, unit }) {
//   return (
//     <div className="space-y-2.5 mt-4">
//       {rows.map((row) => (
//         <div
//           key={row.key}
//           className="flex items-center justify-between text-sm"
//         >
//           <div className="flex items-center gap-2 min-w-0">
//             <span
//               className="w-2.5 h-2.5 rounded-full shrink-0"
//               style={{ backgroundColor: row.color }}
//             />
//             {row.href ? (
//               <Link
//                 href={row.href}
//                 className="text-gray-600 truncate hover:text-orange-600 hover:underline"
//               >
//                 {row.label}
//               </Link>
//             ) : (
//               <span className="text-gray-600 truncate">{row.label}</span>
//             )}
//           </div>
//           {/* <div className="flex items-center gap-2 shrink-0">
//             <span className="text-xs font-semibold text-gray-700">
//               {row.pct}%
//             </span>
//             <span className="text-xs text-gray-400">
//               (
//               {unit === '₹'
//                 ? `₹${row.value.toLocaleString('en-IN')}`
//                 : row.value.toLocaleString('en-IN')}
//               )
//             </span>
//           </div> */}
//           <div className="flex items-center gap-2 shrink-0">
//             <span className="text-xs font-semibold text-gray-700">
//               {unit === '₹'
//                 ? `₹${row.value.toLocaleString('en-IN')}`
//                 : row.value.toLocaleString('en-IN')}
//             </span>
//             {/* <span className="text-xs text-gray-400">({row.pct}%)</span> */}
//             <span className="text-xs text-gray-400">
//               ({String(row.pct).padStart(2, '0')}%)
//             </span>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// function CityDashboardSection() {
//   const [city, setCity] = useState('all');
//   const [period, setPeriod] = useState('month');
//   const [cities, setCities] = useState([]);
//   const [m, setMetrics] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // useEffect(() => {
//   //   apiGetCities()
//   //     .then((data) => setCities(data?.cities || data || []))
//   //     .catch((err) => console.error('Failed to load cities', err));
//   // }, []);

//   // useEffect(() => {
//   //   setLoading(true);
//   //   apiGetCityDashboard(city, period)
//   //     .then((data) => setMetrics(data))
//   //     .catch((err) => console.error('Failed to load dashboard', err))
//   //     .finally(() => setLoading(false));
//   // }, [city, period]);

//   // useEffect(() => {
//   //   const token =
//   //     typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
//   //   if (!token) return;

//   //   apiGetCities(token)
//   //     .then((r) => setCities(r.data?.cities || r.data || []))
//   //     .catch((err) => console.error('Failed to load cities', err));
//   // }, []);
//   useEffect(() => {
//     const token =
//       typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
//     if (!token) {
//       console.warn(
//         'CityDashboardSection: no adminToken in localStorage, skipping apiGetCities',
//       );
//       return;
//     }

//     // apiGetCities(token)
//     //   .then((r) => {
//     //     const list = Array.isArray(r)
//     //       ? r
//     //       : r?.data?.cities || r?.data || r?.cities || [];
//     //     setCities(Array.isArray(list) ? list : []);
//     //   })
//     //   .catch((err) => console.error('Failed to load cities', err));
//     apiGetCities(token)
//       .then((r) => {
//         const list = Array.isArray(r)
//           ? r
//           : r?.data?.cities || r?.data || r?.cities || [];
//         console.log(
//           '[CityDashboardSection] cities list=',
//           JSON.stringify(list),
//         );
//         setCities(Array.isArray(list) ? list : []);
//       })
//       .catch((err) => console.error('Failed to load cities', err));
//   }, []);

//   useEffect(() => {
//     const token =
//       typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
//     if (!token) return;

//     //   setLoading(true);
//     //   apiGetCityDashboard(token, city, period)
//     //     .then((r) => setMetrics(r?.data ?? r))
//     //     .catch((err) => console.error('Failed to load dashboard', err))
//     //     .finally(() => setLoading(false));
//     // }, [city, period]);

//     console.log(
//       '[CityDashboardSection] fetching dashboard for city=',
//       JSON.stringify(city),
//       'period=',
//       period,
//     );
//     setLoading(true);
//     apiGetCityDashboard(token, city, period)
//       .then((r) => {
//         const data = r?.data ?? r;
//         console.log(
//           '[CityDashboardSection] response for city=',
//           city,
//           'data=',
//           JSON.stringify(data),
//         );
//         setMetrics(data);
//       })
//       .catch((err) => console.error('Failed to load dashboard', err))
//       .finally(() => setLoading(false));
//   }, [city, period]);

//   const marketRows = useMemo(() => {
//     if (!m) return [];
//     const raw = [
//       {
//         key: 'activeProducts',
//         label: 'Active Products',
//         value: m.activeProducts || 0,
//         color: '#2563eb',
//         href: '/custom-listings',
//       },
//       {
//         key: 'customers',
//         label: 'Customers',
//         value: m.uniqueCustomers || 0,
//         color: '#9333ea',
//         href: '/users',
//       },
//       {
//         key: 'tickets',
//         label: 'Open Tickets',
//         value: m.tickets || 0,
//         color: '#f43f5e',
//         href: '/system/tickets',
//       },
//       {
//         key: 'partners',
//         label: 'Live Partners',
//         value: m.livePartners || 0,
//         color: '#10b981',
//         href: '/all-vendors',
//       },
//     ];
//     const total = raw.reduce((s, x) => s + x.value, 0) || 1;
//     const rows = raw.map((x) => ({
//       ...x,
//       pct: Math.round((x.value / total) * 100),
//     }));
//     const diff = 100 - rows.reduce((s, x) => s + x.pct, 0);
//     if (rows.length) rows[0].pct += diff;
//     return rows;
//   }, [m]);

//   const revenueRows = useMemo(() => {
//     if (!m) return [];
//     const raw = [
//       {
//         key: 'gross',
//         label: 'Total Revenue',
//         value: m.grossRevenue || 0,
//         color: '#16a34a',
//         href: '/orders',
//       },
//       {
//         key: 'commission',
//         label: 'Commission',
//         value: m.commission || 0,
//         color: '#f97316',
//         href: '/system/commission',
//       },
//       {
//         key: 'pending',
//         label: 'Pending Settlements',
//         value: m.pendingSettlements || 0,
//         color: '#f59e0b',
//         href: '/finances/settlements',
//       },
//       {
//         key: 'refunds',
//         label: 'Pending Refunds',
//         value: m.pendingRefunds || 0,
//         color: '#e11d48',
//         href: '/orders',
//       },
//     ];
//     const total = raw.reduce((s, x) => s + x.value, 0) || 1;
//     const rows = raw.map((x) => ({
//       ...x,
//       pct: Math.round((x.value / total) * 100),
//     }));
//     const diff = 100 - rows.reduce((s, x) => s + x.pct, 0);
//     if (rows.length) rows[0].pct += diff;
//     return rows;
//   }, [m]);

//   const taxRows = useMemo(() => {
//     if (!m) return [];
//     const raw = [
//       // {
//       //   key: 'refunds',
//       //   label: 'Pending Refunds',
//       //   value: m.pendingRefunds || 0,
//       //   color: '#e11d48',
//       // },
//       {
//         key: 'gst',
//         label: 'GST Tax',
//         value: m.gstTax || 0,
//         color: '#4f46e5',
//         href: '/finances/systeminvoice',
//       },
//       {
//         key: 'care',
//         label: 'Care Tax',
//         value: m.careTax || 0,
//         color: '#0ea5e9',
//         href: '/finances/systeminvoice',
//       },
//       {
//         key: 'lateFees',
//         label: 'Late Fees',
//         value: m.lateFees || 0,
//         color: '#a855f7',
//         href: '/finances/systeminvoice',
//       },
//     ];
//     const total = raw.reduce((s, x) => s + x.value, 0) || 1;
//     const rows = raw.map((x) => ({
//       ...x,
//       pct: Math.round((x.value / total) * 100),
//     }));
//     const diff = 100 - rows.reduce((s, x) => s + x.pct, 0);
//     if (rows.length) rows[0].pct += diff;
//     return rows;
//   }, [m]);

//   const taxTotal = useMemo(() => {
//     if (!m) return 0;
//     return (m.gstTax || 0) + (m.careTax || 0) + (m.lateFees || 0);
//   }, [m]);

//   const approvalsRows = useMemo(() => {
//     if (!m) return [];
//     const raw = [
//       {
//         key: 'vendorKyc',
//         label: 'Vendor KYC ',
//         value: m.vendorKycApprovals || 0,
//         color: '#4f46e5',
//         href: '/kyc/vendor',
//       },
//       {
//         key: 'customerKyc',
//         label: 'Customer KYC ',
//         value: m.customerKycApprovals || 0,
//         color: '#14b8a6',
//         href: '/kyc/customer',
//       },
//       // {
//       //   key: 'activeApprovals',
//       //   label: 'Active Approvals',
//       //   value: 0, // TODO: wire up dynamic value later
//       //   color: '#f59e0b',
//       // },
//       {
//         key: 'productApprovals',
//         label: 'Product Approvals',
//         value: m.productApprovals || 0,
//         color: '#dc2626',
//         href: '/system/approval',
//       },
//       {
//         key: 'refundApprovals', // NEW
//         label: 'Refund Approvals',
//         value: m.refundApprovals || 0,
//         color: '#0891b2',
//         href: '/system/refund-approval', // change to your actual refund-review page
//       },
//     ];
//     const total = raw.reduce((s, x) => s + x.value, 0) || 1;
//     const rows = raw.map((x) => ({
//       ...x,
//       pct: Math.round((x.value / total) * 100),
//     }));
//     const diff = 100 - rows.reduce((s, x) => s + x.pct, 0);
//     if (rows.length) rows[0].pct += diff;
//     return rows;
//   }, [m]);

//   const topMarketRow = marketRows.length
//     ? [...marketRows].sort((a, b) => b.value - a.value)[0]
//     : null;
//   const topRevenueRow = revenueRows.length
//     ? [...revenueRows].sort((a, b) => b.value - a.value)[0]
//     : null;
//   const topTaxRow = taxRows.length
//     ? [...taxRows].sort((a, b) => b.value - a.value)[0]
//     : null;
//   const topApprovalsRow = approvalsRows.length
//     ? [...approvalsRows].sort((a, b) => b.value - a.value)[0]
//     : null;

//   if (!m) {
//     return <div className="mt-5 text-sm text-gray-400">Loading dashboard…</div>;
//   }

//   const fmt = (n) =>
//     n >= 1_00_000
//       ? `₹${(n / 1_00_000).toFixed(1)}L`
//       : `₹${Number(n).toLocaleString('en-IN')}`;

//   return (
//     <div className="mt-1">
//       {/* ── Header bar ── */}
//       <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
//         <div>
//           <h2 className="text-xl font-semibold text-black">
//             City-wise Market Overview
//           </h2>
//         </div>

//         <div className="flex flex-wrap items-center gap-2">
//           {/* City dropdown */}
//           <select
//             value={city}
//             onChange={(e) => setCity(e.target.value)}
//             className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
//           >
//             <option value="all">All Cities</option>
//             {cities.map((c) => (
//               <option key={c.cityKey} value={c.cityKey}>
//                 {c.city}
//               </option>
//             ))}
//           </select>

//           {/* Period pills */}
//           <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
//             {PERIODS.map(({ key, label }) => (
//               <button
//                 key={key}
//                 type="button"
//                 onClick={() => setPeriod(key)}
//                 className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all ${
//                   period === key
//                     ? 'bg-orange-500 text-white shadow'
//                     : 'text-gray-500 hover:text-gray-800'
//                 }`}
//               >
//                 {label}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* ── Selected city badge ── */}
//       {/* {city !== 'all' && (
//         <div className="mb-4 inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-sm font-medium px-3 py-1.5 rounded-full">
//           <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
//           Showing data for{' '}
//           <strong>
//             {cities.find((c) => c.cityKey === city)?.city || city}
//           </strong>
//         </div>
//       )} */}

//       {/* ── Approvals ── */}
//       {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
//         <MetricCard
//           label="Vendor KYC Approvals"
//           value={m.vendorKycApprovals || 0}
//           icon="🏪"
//           accent="bg-indigo-50 text-indigo-600"
//         />
//         <MetricCard
//           label="Customer KYC Approvals"
//           value={m.customerKycApprovals || 0}
//           icon="🧾"
//           accent="bg-teal-50 text-teal-600"
//         />
//       </div> */}

//       {/* ── Market Mix / Revenue Split / Tax & Fee Split (one row) ── */}
//       {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"> */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
//         <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
//           <SectionHeading>Active (Live) Market</SectionHeading>
//           <p className="text-xs font-semibold text-gray-700">Market Mix</p>
//           <p className="text-[11px] text-gray-400 mb-2">Share by segment</p>
//           <BreakdownDonut
//             rows={marketRows}
//             centerTopLabel="Top Segment"
//             centerBottomLabel={topMarketRow?.label || '—'}
//           />
//           <DonutLegend rows={marketRows} />
//         </div>

//         <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
//           <SectionHeading>Revenue &amp; Settlements</SectionHeading>
//           <p className="text-xs font-semibold text-gray-700">Revenue Split</p>
//           <p className="text-[11px] text-gray-400 mb-2">Distribution by type</p>
//           <BreakdownDonut
//             rows={revenueRows}
//             centerTopLabel="Top Share"
//             centerBottomLabel={topRevenueRow?.label || '—'}
//           />
//           <DonutLegend rows={revenueRows} unit="₹" />
//         </div>

//         <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
//           <SectionHeading>Taxes &amp; Fees</SectionHeading>
//           <p className="text-xs font-semibold text-gray-700">
//             Tax &amp; Fee Split
//           </p>
//           <p className="text-[11px] text-gray-400 mb-2">Distribution by type</p>
//           <BreakdownDonut
//             rows={taxRows}
//             centerTopLabel="Top Item"
//             centerBottomLabel={topTaxRow?.label || '—'}
//           />
//           <DonutLegend rows={taxRows} unit="₹" />
//           <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
//             <span className="text-xs font-semibold text-gray-700">
//               Total (Taxes &amp; Late Fees)
//             </span>
//             <span className="text-sm font-bold text-black">
//               ₹{taxTotal.toLocaleString('en-IN')}
//             </span>
//           </div>
//         </div>

//         <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
//           <SectionHeading>Approvals</SectionHeading>
//           <p className="text-xs font-semibold text-gray-700">
//             KYC Approvals Split
//           </p>
//           <p className="text-[11px] text-gray-400 mb-2">Distribution by type</p>
//           <BreakdownDonut
//             rows={approvalsRows}
//             centerTopLabel="Top Type"
//             centerBottomLabel={topApprovalsRow?.label || '—'}
//           />
//           <DonutLegend rows={approvalsRows} />
//         </div>
//       </div>
//     </div>
//   );
// }
// export default CityDashboardSection;

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiGetCityDashboard, apiGetCities } from '@/service/api';

const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'quarter', label: 'Quarter' },
  { key: 'year', label: 'Year' },
];

function MetricCard({ label, value, sub, accent, icon, ringColor }) {
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-1 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center text-lg ring-4 ${accent} ${ringColor || 'ring-gray-50'}`}
        >
          {icon || '📊'}
        </div>
        {sub && (
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${accent}`}
          >
            {sub}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-black leading-tight">{value}</p>
      <p className="text-[11px] text-gray-400 font-medium tracking-wide uppercase">
        {label}
      </p>
    </div>
  );
}

function SectionHeading({ children }) {
  return (
    <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2 mt-4">
      {children}
    </p>
  );
}

/**
 * Rounded donut chart, styled like the "Category Performance" widget.
 * rows: [{ key, label, value, pct, color }]
 * centerTopLabel / centerBottomLabel render in the middle of the ring.
 */
function BreakdownDonut({ rows, centerTopLabel, centerBottomLabel }) {
  const [hoveredKey, setHoveredKey] = useState(null);

  const size = 220;
  const pad = 30;
  const stroke = 38;
  const r = (size - stroke) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;

  let offset = 0;
  const arcs = rows.map((row) => {
    const len = (row.pct / 100) * circ;
    const isHovered = hoveredKey === row.key;
    const isDimmed = hoveredKey !== null && !isHovered;
    const el = (
      <circle
        key={row.key}
        cx={c}
        cy={c}
        r={isHovered ? r + 3 : r}
        fill="none"
        stroke={row.color}
        strokeWidth={isHovered ? stroke + 4 : stroke}
        strokeDasharray={`${len} ${circ - len}`}
        strokeDashoffset={-offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${c} ${c})`}
        opacity={isDimmed ? 0.35 : 1}
        style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
        onMouseEnter={() => setHoveredKey(row.key)}
        onMouseLeave={() => setHoveredKey(null)}
      />
    );
    offset += len;
    return el;
  });

  const hoveredRow = rows.find((row) => row.key === hoveredKey) || null;

  return (
    <svg
      width="100%"
      viewBox={`${-pad} ${-pad} ${size + pad * 2} ${size + pad * 2}`}
      className="max-w-[240px] mx-auto"
    >
      {arcs}
      <circle cx={c} cy={c} r={r - stroke / 2 + 2} fill="#ffffff" />
      <text
        x={c}
        y={c - 10}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-[11px] font-medium"
        fill="#94a3b8"
      >
        {hoveredRow ? hoveredRow.label : centerTopLabel}
      </text>
      <text
        x={c}
        y={c + 12}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-base font-bold"
        fill={hoveredRow ? hoveredRow.color : '#0f172a'}
      >
        {hoveredRow ? `${hoveredRow.pct}%` : centerBottomLabel}
      </text>
    </svg>
  );
}

function DonutLegend({ rows, unit }) {
  return (
    <div className="space-y-2.5 mt-4">
      {rows.map((row) => (
        <div
          key={row.key}
          className="flex items-center justify-between text-sm"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: row.color }}
            />
            {row.href ? (
              <Link
                href={row.href}
                className="text-gray-600 truncate hover:text-orange-600 hover:underline"
              >
                {row.label}
              </Link>
            ) : (
              <span className="text-gray-600 truncate">{row.label}</span>
            )}
          </div>
          {/* <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-gray-700">
              {row.pct}%
            </span>
            <span className="text-xs text-gray-400">
              (
              {unit === '₹'
                ? `₹${row.value.toLocaleString('en-IN')}`
                : row.value.toLocaleString('en-IN')}
              )
            </span>
          </div> */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-gray-700">
              {unit === '₹'
                ? `₹${row.value.toLocaleString('en-IN')}`
                : row.value.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function CityDashboardSection() {
  // const [city, setCity] = useState('all');
  // const [period, setPeriod] = useState('month');
  // const [cities, setCities] = useState([]);
  // const [m, setMetrics] = useState(null);
  // const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('all');
  const [period, setPeriod] = useState('month');
  const [cities, setCities] = useState([]);
  const [m, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubadmin, setIsSubadmin] = useState(false);
  const [subadminCityKey, setSubadminCityKey] = useState(null);
  const [subadminCityLabel, setSubadminCityLabel] = useState('');

  // useEffect(() => {
  //   apiGetCities()
  //     .then((data) => setCities(data?.cities || data || []))
  //     .catch((err) => console.error('Failed to load cities', err));
  // }, []);

  // useEffect(() => {
  //   setLoading(true);
  //   apiGetCityDashboard(city, period)
  //     .then((data) => setMetrics(data))
  //     .catch((err) => console.error('Failed to load dashboard', err))
  //     .finally(() => setLoading(false));
  // }, [city, period]);

  // useEffect(() => {
  //   const token =
  //     typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  //   if (!token) return;

  //   apiGetCities(token)
  //     .then((r) => setCities(r.data?.cities || r.data || []))
  //     .catch((err) => console.error('Failed to load cities', err));
  // }, []);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = JSON.parse(localStorage.getItem('adminUser') || 'null');
      if (stored?.role === 'subadmin') {
        setIsSubadmin(true);
        const rawLocation = String(stored.location || '').trim();
        const key = rawLocation.toLowerCase();
        if (key) {
          setSubadminCityKey(key);
          setSubadminCityLabel(rawLocation);
          setCity(key);
        }
      }
    } catch (err) {
      console.error('Failed to read adminUser from localStorage', err);
    }
  }, []);

  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (!token) {
      console.warn(
        'CityDashboardSection: no adminToken in localStorage, skipping apiGetCities',
      );
      return;
    }

    // apiGetCities(token)
    //   .then((r) => {
    //     const list = Array.isArray(r)
    //       ? r
    //       : r?.data?.cities || r?.data || r?.cities || [];
    //     setCities(Array.isArray(list) ? list : []);
    //   })
    //   .catch((err) => console.error('Failed to load cities', err));
    apiGetCities(token)
      .then((r) => {
        const list = Array.isArray(r)
          ? r
          : r?.data?.cities || r?.data || r?.cities || [];
        console.log(
          '[CityDashboardSection] cities list=',
          JSON.stringify(list),
        );
        setCities(Array.isArray(list) ? list : []);
      })
      .catch((err) => console.error('Failed to load cities', err));
  }, []);

  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (!token) return;

    //   setLoading(true);
    //   apiGetCityDashboard(token, city, period)
    //     .then((r) => setMetrics(r?.data ?? r))
    //     .catch((err) => console.error('Failed to load dashboard', err))
    //     .finally(() => setLoading(false));
    // }, [city, period]);

    console.log(
      '[CityDashboardSection] fetching dashboard for city=',
      JSON.stringify(city),
      'period=',
      period,
    );
    setLoading(true);
    apiGetCityDashboard(token, city, period)
      .then((r) => {
        const data = r?.data ?? r;
        console.log(
          '[CityDashboardSection] response for city=',
          city,
          'data=',
          JSON.stringify(data),
        );
        setMetrics(data);
      })
      .catch((err) => console.error('Failed to load dashboard', err))
      .finally(() => setLoading(false));
  }, [city, period]);

  const marketRows = useMemo(() => {
    if (!m) return [];
    const raw = [
      // {
      //   key: 'activeProducts',
      //   label: 'Active Products',
      //   value: m.activeProducts || 0,
      //   color: '#2563eb',
      //   href: '/global-products',
      // },
      // {
      //   key: 'customers',
      //   label: 'Customers',
      //   value: m.uniqueCustomers || 0,
      //   color: '#9333ea',
      //   href: '/users',
      // },
      {
        key: 'soldProducts',
        label: 'Sold Products',
        value: m.soldProducts || 0,
        color: '#2563eb',
        href: '/orders',
      },
      {
        key: 'soldCustomers',
        label: 'Sold Customers',
        value: m.soldCustomers || 0,
        color: '#9333ea',
        href: '/orders',
      },
      {
        key: 'tickets',
        label: 'Open Tickets',
        value: m.tickets || 0,
        color: '#f43f5e',
        href: '/system/tickets',
      },
      {
        key: 'partners',
        label: 'Live Partners',
        value: m.livePartners || 0,
        color: '#10b981',
        href: '/all-vendors',
      },
    ];
    const total = raw.reduce((s, x) => s + x.value, 0) || 1;
    const rows = raw.map((x) => ({
      ...x,
      pct: Math.round((x.value / total) * 100),
    }));
    const diff = 100 - rows.reduce((s, x) => s + x.pct, 0);
    if (rows.length) rows[0].pct += diff;
    return rows;
  }, [m]);

  const revenueRows = useMemo(() => {
    if (!m) return [];
    const raw = [
      {
        key: 'gross',
        label: 'Total Revenue',
        value: m.grossRevenue || 0,
        color: '#16a34a',
        href: '/orders',
      },
      {
        key: 'commission',
        label: 'Commission',
        value: m.commission || 0,
        color: '#f97316',
        href: '/system/commission',
      },
      {
        key: 'pending',
        label: 'Pending Settlements',
        value: m.pendingSettlements || 0,
        color: '#f59e0b',
        href: '/finances/settlements',
      },
      {
        key: 'refunds',
        label: 'Pending Refunds',
        value: m.pendingRefunds || 0,
        color: '#e11d48',
        // href: '/orders',
        href: '/finances/refunds',
      },
    ];
    const total = raw.reduce((s, x) => s + x.value, 0) || 1;
    const rows = raw.map((x) => ({
      ...x,
      pct: Math.round((x.value / total) * 100),
    }));
    const diff = 100 - rows.reduce((s, x) => s + x.pct, 0);
    if (rows.length) rows[0].pct += diff;
    return rows;
  }, [m]);

  const taxRows = useMemo(() => {
    if (!m) return [];
    const raw = [
      // {
      //   key: 'refunds',
      //   label: 'Pending Refunds',
      //   value: m.pendingRefunds || 0,
      //   color: '#e11d48',
      // },
      {
        key: 'gst',
        label: 'GST Tax',
        value: m.gstTax || 0,
        color: '#4f46e5',
        href: '/finances/systeminvoice',
      },
      {
        key: 'care',
        label: 'Care Tax',
        value: m.careTax || 0,
        color: '#0ea5e9',
        href: '/finances/systeminvoice',
      },
      {
        key: 'lateFees',
        label: 'Late Fees',
        value: m.lateFees || 0,
        color: '#a855f7',
        href: '/finances/systeminvoice',
      },
    ];
    const total = raw.reduce((s, x) => s + x.value, 0) || 1;
    const rows = raw.map((x) => ({
      ...x,
      pct: Math.round((x.value / total) * 100),
    }));
    const diff = 100 - rows.reduce((s, x) => s + x.pct, 0);
    if (rows.length) rows[0].pct += diff;
    return rows;
  }, [m]);

  const taxTotal = useMemo(() => {
    if (!m) return 0;
    return (m.gstTax || 0) + (m.careTax || 0) + (m.lateFees || 0);
  }, [m]);

  const approvalsRows = useMemo(() => {
    if (!m) return [];
    const raw = [
      {
        key: 'vendorKyc',
        label: 'Vendor KYC ',
        value: m.vendorKycApprovals || 0,
        color: '#4f46e5',
        href: '/kyc/vendor',
      },
      {
        key: 'customerKyc',
        label: 'Customer KYC ',
        value: m.customerKycApprovals || 0,
        color: '#14b8a6',
        href: '/kyc/customer',
      },
      // {
      //   key: 'activeApprovals',
      //   label: 'Active Approvals',
      //   value: 0, // TODO: wire up dynamic value later
      //   color: '#f59e0b',
      // },
      {
        key: 'productApprovals',
        label: 'Product Approvals',
        value: m.productApprovals || 0,
        color: '#dc2626',
        href: '/system/approval',
      },
      {
        key: 'refundApprovals', // NEW
        label: 'Refund Approvals',
        value: m.refundApprovals || 0,
        color: '#0891b2',
        href: '/system/refund-approval', // change to your actual refund-review page
      },
    ];
    const total = raw.reduce((s, x) => s + x.value, 0) || 1;
    const rows = raw.map((x) => ({
      ...x,
      pct: Math.round((x.value / total) * 100),
    }));
    const diff = 100 - rows.reduce((s, x) => s + x.pct, 0);
    if (rows.length) rows[0].pct += diff;
    return rows;
  }, [m]);

  const topMarketRow = marketRows.length
    ? [...marketRows].sort((a, b) => b.value - a.value)[0]
    : null;
  const topRevenueRow = revenueRows.length
    ? [...revenueRows].sort((a, b) => b.value - a.value)[0]
    : null;
  const topTaxRow = taxRows.length
    ? [...taxRows].sort((a, b) => b.value - a.value)[0]
    : null;
  const topApprovalsRow = approvalsRows.length
    ? [...approvalsRows].sort((a, b) => b.value - a.value)[0]
    : null;

  if (!m) {
    return <div className="mt-5 text-sm text-gray-400">Loading dashboard…</div>;
  }

  const fmt = (n) =>
    n >= 1_00_000
      ? `₹${(n / 1_00_000).toFixed(1)}L`
      : `₹${Number(n).toLocaleString('en-IN')}`;

  return (
    <div className="mt-1">
      {/* ── Header bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-black">
            City-wise Market Overview
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* City dropdown */}
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={isSubadmin}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            {!isSubadmin && <option value="all">All Cities</option>}
            {isSubadmin ? (
              <option value={subadminCityKey}>
                {cities.find((c) => c.cityKey === subadminCityKey)?.city ||
                  subadminCityLabel}
              </option>
            ) : (
              cities.map((c) => (
                <option key={c.cityKey} value={c.cityKey}>
                  {c.city}
                </option>
              ))
            )}
          </select>

          {/* Period pills */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {PERIODS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setPeriod(key)}
                className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all ${
                  period === key
                    ? 'bg-orange-500 text-white shadow'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Selected city badge ── */}
      {/* {city !== 'all' && (
        <div className="mb-4 inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-sm font-medium px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          Showing data for{' '}
          <strong>
            {cities.find((c) => c.cityKey === city)?.city || city}
          </strong>
        </div>
      )} */}

      {/* ── Approvals ── */}
      {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <MetricCard
          label="Vendor KYC Approvals"
          value={m.vendorKycApprovals || 0}
          icon="🏪"
          accent="bg-indigo-50 text-indigo-600"
        />
        <MetricCard
          label="Customer KYC Approvals"
          value={m.customerKycApprovals || 0}
          icon="🧾"
          accent="bg-teal-50 text-teal-600"
        />
      </div> */}

      {/* ── Market Mix / Revenue Split / Tax & Fee Split (one row) ── */}
      {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <SectionHeading>Active (Live) Market</SectionHeading>
          <p className="text-xs font-semibold text-gray-700">Market Mix</p>
          <p className="text-[11px] text-gray-400 mb-2">Share by segment</p>
          <BreakdownDonut
            rows={marketRows}
            centerTopLabel="Top Segment"
            centerBottomLabel={topMarketRow?.label || '—'}
          />
          <DonutLegend rows={marketRows} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <SectionHeading>Revenue &amp; Settlements</SectionHeading>
          <p className="text-xs font-semibold text-gray-700">Revenue Split</p>
          <p className="text-[11px] text-gray-400 mb-2">Distribution by type</p>
          <BreakdownDonut
            rows={revenueRows}
            centerTopLabel="Top Share"
            centerBottomLabel={topRevenueRow?.label || '—'}
          />
          <DonutLegend rows={revenueRows} unit="₹" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <SectionHeading>Taxes &amp; Fees</SectionHeading>
          <p className="text-xs font-semibold text-gray-700">
            Tax &amp; Fee Split
          </p>
          <p className="text-[11px] text-gray-400 mb-2">Distribution by type</p>
          <BreakdownDonut
            rows={taxRows}
            centerTopLabel="Top Item"
            centerBottomLabel={topTaxRow?.label || '—'}
          />
          <DonutLegend rows={taxRows} unit="₹" />
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">
              Total (Taxes &amp; Late Fees)
            </span>
            <span className="text-sm font-bold text-black">
              ₹{taxTotal.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <SectionHeading>Approvals</SectionHeading>
          <p className="text-xs font-semibold text-gray-700">
            KYC Approvals Split
          </p>
          <p className="text-[11px] text-gray-400 mb-2">Distribution by type</p>
          <BreakdownDonut
            rows={approvalsRows}
            centerTopLabel="Top Type"
            centerBottomLabel={topApprovalsRow?.label || '—'}
          />
          <DonutLegend rows={approvalsRows} />
        </div>
      </div>
    </div>
  );
}
export default CityDashboardSection;
