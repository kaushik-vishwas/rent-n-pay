// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter } from 'next/navigation';
// import { vendorLogout } from '../../../redux/slices/vendorSlice';
// import {
//   apiGetMyProducts,
//   apiGetMyServiceProducts,
//   apiGetVendorOrders,
//   apiGetVendorServiceBookings,
//   apiGetVendorSettlements,
// } from '@/service/api';
// import VendorSidebar from '../../Components/Common/VendorSidebar';
// import VendorTopBar from '../../Components/Common/VendorTopBar';
// import grossRev from '@/assets/icons/gross-rev.png';
// import platformComm from '@/assets/icons/platform-comm.png';
// import netPayout from '@/assets/icons/net-payout.png';
// import jsPDF from 'jspdf';
// import downLoad from '@/assets/icons/download.png';
// import DateIcon from '@/assets/icons/date.png';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
// } from 'recharts';

// const VendorDashboardPage = () => {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const { user } = useSelector((state) => state.vendor);
//   const [products, setProducts] = useState([]);
//   const [serviceProducts, setServiceProducts] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [serviceBookings, setServiceBookings] = useState([]);
//   const [vendorSettlements, setVendorSettlements] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedMonth, setSelectedMonth] = useState('');

//   useEffect(() => {
//     const token =
//       typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null;
//     if (!token) {
//       setLoading(false);
//       return;
//     }
//     let cancelled = false;
//     setLoading(true);
//     Promise.all([
//       apiGetMyProducts(token),
//       apiGetMyServiceProducts(token),
//       apiGetVendorOrders(token),
//       apiGetVendorServiceBookings(token),
//       apiGetVendorSettlements(token).catch((err) => {
//         console.error(
//           'Vendor settlements fetch failed:',
//           err?.response?.data || err.message,
//         );
//         return { data: { settlements: [] } };
//       }),
//     ])
//       .then(([pRes, spRes, oRes, sbRes, settlRes]) => {
//         if (cancelled) return;
//         setProducts(
//           Array.isArray(pRes?.data?.products) ? pRes.data.products : [],
//         );
//         setServiceProducts(
//           Array.isArray(spRes?.data?.products) ? spRes.data.products : [],
//         );
//         setOrders(Array.isArray(oRes?.data) ? oRes.data : []);
//         setServiceBookings(Array.isArray(sbRes?.data) ? sbRes.data : []);
//         console.log('vendorSettlements raw response:', settlRes?.data);
//         setVendorSettlements(
//           Array.isArray(settlRes?.data?.settlements)
//             ? settlRes.data.settlements
//             : [],
//         );
//       })
//       .catch(() => {
//         if (cancelled) return;
//         setProducts([]);
//         setServiceProducts([]);
//         setOrders([]);
//         setServiceBookings([]);
//       })
//       .finally(() => {
//         if (!cancelled) setLoading(false);
//       });
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   const handleDownloadPDF = () => {
//     const pdf = new jsPDF();
//     const pageWidth = pdf.internal.pageSize.getWidth();
//     const marginX = 14;
//     let y = 18;

//     // ---------- Header ----------
//     pdf.setFont('helvetica', 'bold');
//     pdf.setFontSize(18);
//     pdf.setTextColor(37, 99, 235); // #2563EB
//     pdf.text('Vendor Dashboard Report', marginX, y);

//     pdf.setFont('helvetica', 'normal');
//     pdf.setFontSize(9);
//     pdf.setTextColor(120, 120, 120);
//     const generatedOn = new Date().toLocaleDateString('en-GB', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//     });
//     pdf.text(`Generated on: ${generatedOn}`, pageWidth - marginX, y, {
//       align: 'right',
//     });

//     y += 4;
//     pdf.setDrawColor(230, 230, 230);
//     pdf.line(marginX, y, pageWidth - marginX, y);

//     // ---------- Summary Cards ----------
//     y += 12;
//     pdf.setFont('helvetica', 'bold');
//     pdf.setFontSize(12);
//     pdf.setTextColor(15, 23, 42);
//     pdf.text('Financial Summary', marginX, y);

//     y += 8;

//     const summaryItems = [
//       {
//         label: 'GROSS REVENUE',
//         value: `₹${stats.grossRevenue.toLocaleString('en-IN')}`,
//         sub: 'Total sales before deductions',
//         color: [37, 99, 235],
//       },
//       {
//         label: 'PLATFORM COMMISSION',
//         value: `₹${stats.platformCommission.toLocaleString('en-IN')}`,
//         sub: "Fees paid to Rent'n Pay",
//         color: [249, 115, 22],
//       },
//       {
//         label: 'NET PAYOUT',
//         value: `₹${stats.netPayout.toLocaleString('en-IN')}`,
//         sub: 'Final income received',
//         color: [16, 185, 129],
//       },
//       {
//         label: 'SETTLEMENTS',
//         value: `₹${stats.paidSettlement.toLocaleString('en-IN')}`,
//         sub: 'Total amount paid to your account',
//         color: [16, 185, 129],
//       },
//     ];

//     const cardWidth = (pageWidth - marginX * 2 - 9) / 2;
//     const cardHeight = 24;
//     const gapX = 9;
//     const gapY = 8;

//     summaryItems.forEach((item, i) => {
//       const col = i % 2;
//       const row = Math.floor(i / 2);
//       const x = marginX + col * (cardWidth + gapX);
//       const cardY = y + row * (cardHeight + gapY);

//       pdf.setDrawColor(230, 230, 230);
//       pdf.setFillColor(250, 250, 251);
//       pdf.roundedRect(x, cardY, cardWidth, cardHeight, 2, 2, 'FD');

//       pdf.setFont('helvetica', 'normal');
//       pdf.setFontSize(8);
//       pdf.setTextColor(100, 100, 100);
//       pdf.text(item.label, x + 5, cardY + 7);

//       pdf.setFont('helvetica', 'bold');
//       pdf.setFontSize(13);
//       pdf.setTextColor(item.color[0], item.color[1], item.color[2]);
//       pdf.text(item.value, x + 5, cardY + 15);

//       pdf.setFont('helvetica', 'normal');
//       pdf.setFontSize(7.5);
//       pdf.setTextColor(130, 130, 130);
//       pdf.text(item.sub, x + 5, cardY + 20);
//     });

//     y += 2 * (cardHeight + gapY) + 6;

//     // ---------- Revenue Distribution ----------
//     pdf.setFont('helvetica', 'bold');
//     pdf.setFontSize(12);
//     pdf.setTextColor(15, 23, 42);
//     pdf.text('Revenue Distribution', marginX, y);

//     y += 8;
//     pdf.setFont('helvetica', 'normal');
//     pdf.setFontSize(10);
//     const distColors = [
//       [124, 58, 237],
//       [249, 115, 22],
//       [37, 99, 235],
//     ];
//     revenueDistribution.forEach((item, i) => {
//       const rowY = y + i * 6;
//       pdf.setFillColor(distColors[i][0], distColors[i][1], distColors[i][2]);
//       pdf.circle(marginX + 1.5, rowY - 1.5, 1.5, 'F');
//       pdf.setTextColor(80, 80, 80);
//       pdf.text(item.label, marginX + 6, rowY);
//       pdf.setFont('helvetica', 'bold');
//       pdf.setTextColor(15, 23, 42);
//       pdf.text(item.value, marginX + 60, rowY);
//       pdf.setFont('helvetica', 'normal');
//     });

//     y += revenueDistribution.length * 6 + 10;

//     // ---------- Transactions Table ----------
//     pdf.setFont('helvetica', 'bold');
//     pdf.setFontSize(12);
//     pdf.setTextColor(15, 23, 42);
//     pdf.text('Detailed Transaction Summary', marginX, y);

//     y += 8;

//     const colX = {
//       date: marginX,
//       id: marginX + 32,
//       gross: marginX + 78,
//       commission: marginX + 118,
//       settled: marginX + 150,
//     };

//     // Table header
//     pdf.setFillColor(243, 244, 246);
//     pdf.rect(marginX, y - 5, pageWidth - marginX * 2, 8, 'F');
//     pdf.setFont('helvetica', 'bold');
//     pdf.setFontSize(8.5);
//     pdf.setTextColor(100, 116, 139);
//     pdf.text('DATE', colX.date + 2, y);
//     pdf.text('ORDER ID', colX.id, y);
//     pdf.text('GROSS AMOUNT', colX.gross, y);
//     pdf.text('COMMISSION', colX.commission, y);
//     pdf.text('SETTLED AMOUNT', colX.settled, y);

//     y += 8;
//     pdf.setFont('helvetica', 'normal');
//     pdf.setFontSize(9);

//     if (transactions.length === 0) {
//       pdf.setTextColor(150, 150, 150);
//       pdf.text('No transactions yet.', marginX, y);
//       y += 7;
//     } else {
//       transactions.forEach((tx, idx) => {
//         if (y > 275) {
//           pdf.addPage();
//           y = 20;
//         }
//         if (idx % 2 === 0) {
//           pdf.setFillColor(250, 250, 251);
//           pdf.rect(marginX, y - 5, pageWidth - marginX * 2, 7, 'F');
//         }
//         pdf.setTextColor(80, 80, 80);
//         pdf.text(tx.date, colX.date + 2, y);
//         pdf.setTextColor(15, 23, 42);
//         pdf.text(tx.id, colX.id, y);
//         pdf.setTextColor(37, 99, 235);
//         pdf.text(tx.gross, colX.gross, y);
//         pdf.setTextColor(249, 115, 22);
//         pdf.text(tx.commission, colX.commission, y);
//         pdf.setTextColor(16, 185, 129);
//         pdf.text(tx.settled, colX.settled, y);
//         y += 7;
//       });
//     }

//     // ---------- Footer ----------
//     const pageCount = pdf.internal.getNumberOfPages();
//     for (let p = 1; p <= pageCount; p++) {
//       pdf.setPage(p);
//       pdf.setFont('helvetica', 'normal');
//       pdf.setFontSize(8);
//       pdf.setTextColor(160, 160, 160);
//       pdf.text(`Page ${p} of ${pageCount}`, pageWidth - marginX, 290, {
//         align: 'right',
//       });
//       pdf.text("Rent'n Pay Vendor Dashboard", marginX, 290);
//     }

//     pdf.save('dashboard-report.pdf');
//   };
//   const handleLogout = async () => {
//     await dispatch(vendorLogout());
//     router.replace('/vendor-main');
//   };

//   const computed = useMemo(() => {
//     // const getOrderGross = (order) => {
//     //   const duration = Number(order?.rentalDuration) || 0;
//     //   const lines = Array.isArray(order?.products) ? order.products : [];
//     //   return lines.reduce((sum, line) => {
//     //     const unit = Number(line?.pricePerDay) || 0;
//     //     const qty = Number(line?.quantity) || 0;
//     //     return sum + unit * qty * duration;
//     //   }, 0);
//     // };
//     const grossRevenue = vendorSettlements.reduce(
//       (s, st) => s + Number(st.grossAmount || 0),
//       0,
//     );
//     const platformCommission = vendorSettlements.reduce(
//       (s, st) => s + Number(st.platformFee || 0),
//       0,
//     );
//     const otherDeductions = 0;
//     const netPayout = vendorSettlements.reduce(
//       (s, st) => s + Number(st.netPayout || 0),
//       0,
//     );
//     const totalSettled = netPayout;

//     // DEBUG LOG — remove after confirming data is correct
//     // console.log(' vendorSettlements from API:', vendorSettlements);
//     // console.log(
//     //   ' Paid settlements:',
//     //   vendorSettlements.filter((s) => s.status === 'Paid'),
//     // );
//     // console.log(
//     //   ' Pending settlements:',
//     //   vendorSettlements.filter((s) => s.status === 'Pending'),
//     // );

//     const pendingSettlement = vendorSettlements
//       .filter((s) => s.status === 'Pending')
//       .reduce((sum, s) => sum + Number(s.netPayout || 0), 0);

//     const paidSettlement = vendorSettlements
//       .filter((s) => s.status === 'Paid')
//       .reduce((sum, s) => {
//         // console.log(
//         //   ' Paid settlement:',
//         //   s.settlementId || s._id,
//         //   '→',
//         //   s.netPayout,
//         // );
//         return sum + Number(s.netPayout || 0);
//       }, 0);

//     // console.log(' Total paidSettlement:', paidSettlement);
//     const rentalCount = products.filter((p) => p?.type === 'Rental').length;
//     const sellCount = products.filter((p) => p?.type === 'Sell').length;
//     const serviceCount = serviceProducts.length;
//     const totalCount = Math.max(1, rentalCount + sellCount + serviceCount);
//     const rentalPct = Math.round((rentalCount / totalCount) * 100);
//     const sellPct = Math.round((sellCount / totalCount) * 100);
//     const servicePct = Math.max(0, 100 - rentalPct - sellPct);
//     // const filteredOrders = orders.filter((o) => {
//     //   if (!selectedDate) return true;

//     //   const orderDate = new Date(o.createdAt).toDateString();
//     //   const filterDate = new Date(selectedDate).toDateString();

//     //   return orderDate === filterDate;
//     // });
//     // const transactions = filteredOrders.slice(0, 6).map((o) => {
//     //   const gross = getOrderGross(o);
//     //   const commission = Math.round(gross * 0.1);
//     //   const settled = Math.max(0, gross - commission);
//     //   return {
//     //     // date: o?.createdAt
//     //     //   ? new Date(o.createdAt).toLocaleDateString('en-IN')
//     //     //   : '—',
//     //     date: o?.createdAt
//     //       ? new Date(o.createdAt).toLocaleDateString('en-GB', {
//     //           day: '2-digit',
//     //           month: 'short',
//     //           year: 'numeric',
//     //         })
//     //       : '—',
//     //     id: o?._id ? `ORD-${String(o._id).slice(-6).toUpperCase()}` : 'ORD-—',
//     //     gross: `₹${gross.toLocaleString('en-IN')}`,
//     //     commission: '10%',
//     //     settled: `₹${settled.toLocaleString('en-IN')}`,
//     //   };
//     // });

//     const filteredSettlements = vendorSettlements.filter((s) => {
//       if (!selectedMonth) return true;
//       if (!s?.createdAt) return false;

//       const d = new Date(s.createdAt);
//       const settleKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

//       return settleKey === selectedMonth;
//     });
//     // const transactions = filteredSettlements.slice(0, 6).map((s) => {
//     const transactions = filteredSettlements.slice(0, 10).map((s) => {
//       const gross = Number(s.grossAmount || 0);
//       const fee = Number(s.platformFee || 0);
//       const settled = Number(s.netPayout || 0);
//       const pct = gross ? Math.round((fee / gross) * 100) : 0;

//       return {
//         date: s?.createdAt
//           ? new Date(s.createdAt).toLocaleDateString('en-GB', {
//               day: '2-digit',
//               month: 'short',
//               year: 'numeric',
//             })
//           : '—',
//         id: s?.orderId
//           ? `ORD-${String(s.orderId).slice(-6).toUpperCase()}`
//           : 'ORD-—',
//         gross: `₹${gross.toLocaleString('en-IN')}`,
//         commission: `${pct}%`,
//         settled: `₹${settled.toLocaleString('en-IN')}`,
//       };
//     });
//     return {
//       stats: {
//         grossRevenue,
//         platformCommission,
//         otherDeductions,
//         netPayout,
//         totalSettled,
//         pendingSettlement,
//         paidSettlement,
//       },
//       revenueDistribution: [
//         { label: 'Rentals', value: `${rentalPct}%` },
//         { label: 'Services', value: `${servicePct}%` },
//         { label: 'Sales', value: `${sellPct}%` },
//       ],
//       transactions,
//     };
//   }, [products, serviceProducts, selectedMonth, vendorSettlements]);

//   const { stats, revenueDistribution, transactions } = computed;
//   const salesTrend = useMemo(() => {
//     const map = {};
//     const now = new Date();

//     // Pre-fill last 6 months (including current month) with 0 revenue
//     for (let i = 5; i >= 0; i--) {
//       const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
//       const key = `${d.getFullYear()}-${d.getMonth()}`;
//       map[key] = {
//         month: d.toLocaleString('default', { month: 'short' }),
//         revenue: 0,
//         sortDate: d,
//       };
//     }

//     orders.forEach((o) => {
//       const date = new Date(o.createdAt);
//       const key = `${date.getFullYear()}-${date.getMonth()}`;

//       const duration = Number(o?.rentalDuration) || 0;

//       const total = (o.products || []).reduce((s, p) => {
//         return s + (p.pricePerDay || 0) * (p.quantity || 0) * duration;
//       }, 0);

//       // Only accumulate if this order falls within the last 6 months window
//       if (map[key]) {
//         map[key].revenue += total;
//       }
//     });

//     return Object.values(map)
//       .sort((a, b) => a.sortDate - b.sortDate) // chronological
//       .map(({ month, revenue }) => ({ month, revenue }));
//   }, [orders]);

//   const availableMonths = useMemo(() => {
//     const map = {};
//     vendorSettlements.forEach((s) => {
//       if (!s?.createdAt) return;
//       const d = new Date(s.createdAt);
//       const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
//       if (!map[key]) {
//         map[key] = {
//           value: key,
//           label: d.toLocaleString('default', {
//             month: 'short',
//             year: 'numeric',
//           }),
//           sortDate: new Date(d.getFullYear(), d.getMonth(), 1),
//         };
//       }
//     });
//     return Object.values(map).sort((a, b) => b.sortDate - a.sortDate);
//   }, [vendorSettlements]);

//   return (
//     <div className="flex h-screen bg-gray-50 overflow-hidden">
//       {/* Sidebar */}
//       <VendorSidebar onLogout={handleLogout} />

//       {/* Main content area */}
//       <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
//         {/* Top bar */}
//         <VendorTopBar user={user} onLogout={handleLogout} />

//         {/* Scrollable dashboard content */}
//         <main className="flex-1 overflow-y-auto px-6 pb-6 pt-0">
//           <div className="space-y-6">
//             <div className="flex items-start justify-between">
//               {/* <div>
//                 <h1 className="text-2xl font-semibold">Dashboard</h1>
//                 <p className="text-sm text-gray-500">
//                   Comprehensive financial overview and performance metrics
//                 </p>
//               </div> */}

//               {/* <div className="flex items-center gap-3">
//                 <input
//                   type="date"
//                   value={selectedDate}
//                   onChange={(e) => setSelectedDate(e.target.value)}
//                   className="border rounded-lg px-3 py-2 text-sm"
//                 />

//                 <button
//                   onClick={handleDownloadPDF}
//                   className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white"
//                 >
//                   Download PDF Report
//                 </button>

//               </div> */}
//             </div>
//             {/* Top stat cards */}
//             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
//               <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-2">
//                 <p className="text-xs font-medium text-gray-500 flex items-center gap-2">
//                   <img
//                     src={grossRev.src}
//                     alt="Gross Revenue"
//                     className="w-10 h-10 shrink-0"
//                   />
//                   GROSS REVENUE
//                 </p>

//                 <p className="text-2xl font-semibold text-[#2563EB]">
//                   ₹{stats.grossRevenue.toLocaleString('en-IN')}
//                 </p>

//                 <p className="text-[11px] text-gray-500">
//                   {loading ? 'Loading...' : 'Total sales before deductions'}
//                 </p>
//               </div>
//               {/* <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-2">
//                 <p className="text-xs font-medium text-gray-500">
//                   PLATFORM COMMISSION
//                 </p>
//                 <p className="text-2xl font-semibold text-orange-500">
//                   ₹{stats.platformCommission.toLocaleString('en-IN')}
//                 </p>
//                 <p className="text-[11px] text-gray-500">
//                   {loading ? 'Loading...' : "Fees paid to Rent'n Pay"}
//                 </p>
//               </div> */}
//               <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-2">
//                 <p className="text-xs font-medium text-gray-500 flex items-center gap-2">
//                   <img
//                     src={platformComm.src}
//                     alt="Platform Commission"
//                     className="w-10 h-10 shrink-0"
//                   />
//                   PLATFORM COMMISSION
//                 </p>

//                 <p className="text-2xl font-semibold text-[#F97316]">
//                   ₹{stats.platformCommission.toLocaleString('en-IN')}
//                 </p>

//                 <p className="text-[11px] text-gray-500">
//                   {loading ? 'Loading...' : "Fees paid to Rent'n Pay"}
//                 </p>
//               </div>
//               {/* <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-2">
//                 <p className="text-xs font-medium text-gray-500">
//                   OTHER DEDUCTIONS
//                 </p>
//                 <p className="text-2xl font-semibold text-red-500">
//                   ₹{stats.otherDeductions.toLocaleString('en-IN')}
//                 </p>
//                 <p className="text-[11px] text-gray-500">
//                   {loading ? 'Loading...' : 'Loan EMIs & refund adjustments'}
//                 </p>
//               </div> */}
//               {/*
//               <div className="bg-white rounded-2xl border border-emerald-200 p-5 flex flex-col gap-2">
//                 <p className="text-xs font-medium text-gray-500">NET PAYOUT</p>
//                 <p className="text-2xl font-semibold text-emerald-600">
//                   ₹{stats.netPayout.toLocaleString('en-IN')}
//                 </p>
//                 <p className="text-[11px] text-gray-500">
//                   {loading ? 'Loading...' : 'Final income received'}
//                 </p>
//               </div> */}
//               <div className="bg-white rounded-2xl border border-emerald-200 p-5 flex flex-col gap-2">
//                 <p className="text-xs font-medium text-gray-500 flex items-center gap-2">
//                   <img
//                     src={netPayout.src}
//                     alt="Net Payout"
//                     className="w-10 h-10 shrink-0"
//                   />
//                   NET PAYOUT
//                 </p>

//                 <p className="text-2xl font-semibold text-[#10B981]">
//                   ₹{stats.netPayout.toLocaleString('en-IN')}
//                 </p>

//                 <p className="text-[11px] text-gray-500">
//                   {loading ? 'Loading...' : 'Final income received'}
//                 </p>
//               </div>

//               {/* <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-2">
//                 <p className="text-xs font-medium text-gray-500 flex items-center gap-2">
//                   <img
//                     src={netPayout.src}
//                     alt="Settlement Amount"
//                     className="w-10 h-10 shrink-0"
//                   />
//                   SETTLEMENT AMOUNT
//                 </p>
//                 <p className="text-2xl font-semibold text-[#7C3AED]">
//                   ₹{stats.totalSettled.toLocaleString('en-IN')}
//                 </p>
//                 <p className="text-[11px] text-gray-500">
//                   {loading ? 'Loading...' : 'Total amount settled to date'}
//                 </p>
//               </div> */}
//               <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-2">
//                 <p className="text-xs font-medium text-gray-500 flex items-center gap-2">
//                   <img
//                     src={netPayout.src}
//                     alt="Pending Settlement"
//                     className="w-10 h-10 shrink-0"
//                   />
//                   SETTLEMENTS
//                 </p>
//                 <p className="text-2xl font-semibold text-[#10B981]">
//                   ₹{stats.paidSettlement.toLocaleString('en-IN')}
//                 </p>
//                 <p className="text-[11px] text-gray-500">
//                   {loading ? 'Loading...' : 'Total amount paid to your account'}
//                 </p>
//               </div>
//             </div>

//             {/* Middle charts */}
//             <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
//               {/* Sales Trend */}
//               {/* <div className="bg-white rounded-2xl border border-gray-200 p-5 xl:col-span-2">
//                 <div className="flex items-center justify-between mb-4">
//                   <div>
//                     <p className="text-sm font-semibold text-gray-900">
//                       Sales Trend
//                     </p>
//                     <p className="text-[11px] text-gray-500">
//                       Monthly revenue growth over the last 6 months
//                     </p>
//                   </div>
//                 </div>
//                 <div className="mt-2 h-52 md:h-60">
//                   <div className="w-full h-full rounded-xl bg-gradient-to-b from-indigo-50 to-white border border-dashed border-indigo-100 flex items-center justify-center">
//                     <p className="text-xs text-gray-500">
//                       Line chart placeholder – plug real chart library later
//                     </p>
//                   </div>
//                 </div>
//               </div> */}

//               {/* Sales Trend */}
//               <div className="bg-white rounded-2xl border border-gray-200 p-5 xl:col-span-2">
//                 <div className="mb-4 flex items-start justify-between gap-3 flex-wrap">
//                   <div>
//                     <p className="text-sm font-semibold text-gray-900">
//                       Sales Trend
//                     </p>
//                     <p className="text-[11px] text-gray-500">
//                       Monthly revenue growth over the last 6 months
//                     </p>
//                   </div>

//                   <div className="flex items-center gap-2">
//                     <select
//                       value={selectedMonth}
//                       onChange={(e) => setSelectedMonth(e.target.value)}
//                       className="border rounded-lg px-3 py-2 text-xs bg-white outline-none"
//                     >
//                       <option value="">All Months</option>
//                       {availableMonths.map((m) => (
//                         <option key={m.value} value={m.value}>
//                           {m.label}
//                         </option>
//                       ))}
//                     </select>

//                     <button
//                       onClick={handleDownloadPDF}
//                       className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-3 py-2 text-xs font-medium text-white whitespace-nowrap"
//                     >
//                       <img
//                         src={downLoad.src}
//                         alt="download"
//                         className="w-4 h-4 shrink-0"
//                       />
//                       Download PDF Report
//                     </button>
//                   </div>
//                 </div>

//                 <div className="h-60">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <LineChart data={salesTrend}>
//                       <CartesianGrid strokeDasharray="3 3" vertical={false} />

//                       <XAxis
//                         dataKey="month"
//                         tick={{ fontSize: 12 }}
//                         axisLine={false}
//                         tickLine={false}
//                       />

//                       <YAxis
//                         tickFormatter={(v) => `₹${v / 1000}k`}
//                         tick={{ fontSize: 12 }}
//                         axisLine={false}
//                         tickLine={false}
//                       />

//                       <Tooltip
//                         formatter={(v) => [
//                           `₹${v.toLocaleString('en-IN')}`,
//                           'Revenue',
//                         ]}
//                       />

//                       <Line
//                         type="monotone"
//                         dataKey="revenue"
//                         stroke="#7C3AED"
//                         strokeWidth={3}
//                         dot={{ r: 4 }}
//                         activeDot={{ r: 6 }}
//                       />
//                     </LineChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>

//               {/* Revenue Distribution */}
//               {/* <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col">
//                 <p className="text-sm font-semibold text-gray-900 mb-1">
//                   Revenue Distribution
//                 </p>
//                 <p className="text-[11px] text-gray-500 mb-4">
//                   Income sources breakdown
//                 </p>
//                 <div className="flex-1 flex items-center justify-center">
//                   <div className="relative w-40 h-40">
//                     <div className="absolute inset-0 rounded-full bg-orange-100" />
//                     <div className="absolute inset-2 rounded-full border-[10px] border-transparent border-t-indigo-500 border-r-orange-400 border-b-emerald-400" />
//                     <div className="absolute inset-8 rounded-full bg-white" />
//                   </div>
//                 </div>
//                 <div className="mt-4 space-y-1.5 text-xs">
//                   {revenueDistribution.map((item) => (
//                     <div
//                       key={item.label}
//                       className="flex items-center justify-between text-gray-600"
//                     >
//                       <div className="flex items-center gap-2">
//                         <span className="w-2 h-2 rounded-full bg-indigo-500" />
//                         <span>{item.label}</span>
//                       </div>
//                       <span className="font-medium text-gray-800">
//                         {item.value}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div> */}
//               {/* Revenue Distribution */}
//               <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col">
//                 <p className="text-sm font-semibold text-gray-900 mb-1">
//                   Revenue Distribution
//                 </p>
//                 <p className="text-[11px] text-gray-500 mb-4">
//                   Income sources breakdown
//                 </p>

//                 {/* Donut */}
//                 {/* <div className="flex-1 flex items-center justify-center">
//                   <div className="relative w-40 h-40 rounded-full bg-gradient-to-r from-violet-500 via-violet-500 to-violet-500">
//                     <div
//                       className="absolute inset-0 rounded-full"
//                       style={{
//                         background:
//                           'conic-gradient(#7C3AED 0% 55%, #F97316 55% 80%, #2563EB 80% 100%)',
//                       }}
//                     />
//                     <div className="absolute inset-6 rounded-full bg-white" />
//                   </div>
//                 </div> */}
//                 <div className="flex-1 flex items-center justify-center">
//                   <div className="relative w-40 h-40 rounded-full bg-gradient-to-r from-violet-500 via-violet-500 to-violet-500">
//                     <div
//                       className="absolute inset-0 rounded-full transition-[background] duration-700 ease-out"
//                       style={{
//                         background: (() => {
//                           const rentalStop = parseFloat(
//                             revenueDistribution[0]?.value || '0',
//                           );
//                           const serviceStop =
//                             rentalStop +
//                             parseFloat(revenueDistribution[1]?.value || '0');
//                           return `conic-gradient(#7C3AED 0% ${rentalStop}%, #F97316 ${rentalStop}% ${serviceStop}%, #2563EB ${serviceStop}% 100%)`;
//                         })(),
//                       }}
//                     />
//                     <div className="absolute inset-6 rounded-full bg-white" />
//                   </div>
//                 </div>

//                 {/* Legend */}
//                 <div className="mt-4 space-y-2 text-xs">
//                   {revenueDistribution.map((item, index) => {
//                     const colors = [
//                       'bg-violet-500',
//                       'bg-orange-500',
//                       'bg-blue-600',
//                     ];

//                     return (
//                       <div
//                         key={item.label}
//                         className="flex items-center justify-between text-gray-600"
//                       >
//                         <div className="flex items-center gap-2">
//                           <span
//                             className={`w-2.5 h-2.5 rounded-full ${colors[index]}`}
//                           />
//                           <span>{item.label}</span>
//                         </div>

//                         <span className="font-medium text-gray-900">
//                           {item.value}
//                         </span>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>

//             {/* Detailed Transaction Summary */}
//             <div className="bg-white rounded-2xl border border-gray-200 p-5">
//               <div className="flex items-center justify-between mb-4">
//                 <div>
//                   <p className="text-lg font-semibold text-gray-900">
//                     Detailed Transaction Summary
//                   </p>
//                   <p className="text-sm text-gray-500">
//                     Recent payouts and settlement history
//                   </p>
//                 </div>
//               </div>
//               <div className="overflow-x-auto">
//                 {/* <table className="min-w-full text-xs md:text-sm">
//                   <thead>
//                     <tr className="text-gray-500 border-b border-gray-100">
//                       <th className="py-3 text-left font-medium">DATE</th>
//                       <th className="py-3 text-left font-medium">ORDER ID</th>
//                       <th className="py-3 text-right font-medium">
//                         GROSS AMOUNT
//                       </th>
//                       <th className="py-3 text-right font-medium">
//                         COMMISSION (%)
//                       </th>
//                       <th className="py-3 text-right font-medium">
//                         SETTLED AMOUNT
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {transactions.map((tx, idx) => (
//                       <tr
//                         key={tx.id}
//                         className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
//                       >
//                         <td className="py-2.5 text-gray-600">{tx.date}</td>
//                         <td className="py-2.5 text-indigo-600 font-medium">
//                           {tx.id}
//                         </td>
//                         <td className="py-2.5 text-right text-gray-700">
//                           {tx.gross}
//                         </td>
//                         <td className="py-2.5 text-right text-gray-600">
//                           {tx.commission}
//                         </td>
//                         <td className="py-2.5 text-right text-emerald-600 font-medium">
//                           {tx.settled}
//                         </td>
//                       </tr>
//                     ))}
//                     {!loading && transactions.length === 0 ? (
//                       <tr>
//                         <td
//                           colSpan={5}
//                           className="py-4 text-center text-gray-500"
//                         >
//                           No transactions yet.
//                         </td>
//                       </tr>
//                     ) : null}
//                   </tbody>
//                 </table> */}
//                 <table className="min-w-full text-xs md:text-sm">
//                   <thead>
//                     <tr className="text-[#64748B] border-b border-gray-100">
//                       <th className="py-3 text-left font-medium">DATE</th>
//                       <th className="py-3 text-left font-medium">ORDER ID</th>
//                       <th className="py-3 text-left font-medium">
//                         GROSS AMOUNT
//                       </th>
//                       <th className="py-3 text-left font-medium">
//                         COMMISSION (%)
//                       </th>
//                       <th className="py-3 text-left font-medium">
//                         SETTLED AMOUNT
//                       </th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {transactions.map((tx, idx) => (
//                       <tr
//                         key={tx.id}
//                         className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
//                       >
//                         {/* <td className="py-2.5 text-gray-600">{tx.date}</td> */}
//                         <td className="py-2.5 text-gray-600">
//                           <div className="flex items-center gap-2">
//                             <img
//                               src={DateIcon.src}
//                               alt="date"
//                               className="w-3 h-3 shrink-0"
//                             />
//                             {tx.date}
//                           </div>
//                         </td>
//                         <td className="py-2.5 text-[#0F172A] font-medium">
//                           {tx.id}
//                         </td>
//                         <td className="py-2.5 text-left text-[#2563EB]">
//                           {tx.gross}
//                         </td>
//                         <td className="py-2.5 text-left text-[#F97316]">
//                           {tx.commission}
//                         </td>
//                         <td className="py-2.5 text-left text-emerald-600 font-medium">
//                           {tx.settled}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default VendorDashboardPage;

// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter } from 'next/navigation';
// import { vendorLogout } from '../../../redux/slices/vendorSlice';
// import {
//   apiGetMyProducts,
//   apiGetMyServiceProducts,
//   apiGetVendorOrders,
//   apiGetVendorServiceBookings,
//   apiGetVendorSettlements,
//   apiGetVendorNotifications,
// } from '@/service/api';
// import VendorSidebar from '../../Components/Common/VendorSidebar';
// import VendorTopBar from '../../Components/Common/VendorTopBar';
// import VendorNewOrderModal from '../../Components/Modals/VendorNewOrderModal';
// import VendorReturnRequestedModal from '../../Components/Modals/VendorReturnRequestedModal';
// import VendorNewServiceBookingModal from '../../Components/Modals/VendorNewServiceBookingModal';
// import grossRev from '@/assets/icons/gross-rev.png';
// import platformComm from '@/assets/icons/platform-comm.png';
// import netPayout from '@/assets/icons/net-payout.png';
// import jsPDF from 'jspdf';
// import downLoad from '@/assets/icons/download.png';
// import DateIcon from '@/assets/icons/date.png';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
// } from 'recharts';

// const VendorDashboardPage = () => {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const { user } = useSelector((state) => state.vendor);
//   const [products, setProducts] = useState([]);
//   const [serviceProducts, setServiceProducts] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [serviceBookings, setServiceBookings] = useState([]);
//   const [vendorSettlements, setVendorSettlements] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedMonth, setSelectedMonth] = useState('');
//   const [liveFeed, setLiveFeed] = useState([]);
//   const [liveFeedLoading, setLiveFeedLoading] = useState(false);
//   const [showAllFeed, setShowAllFeed] = useState(false);
//   const [orderModalId, setOrderModalId] = useState(null);
//   const [returnModal, setReturnModal] = useState({
//     orderId: null,
//     productId: null,
//   });
//   const [serviceBookingModalId, setServiceBookingModalId] = useState(null);

//   useEffect(() => {
//     const token =
//       typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null;
//     if (!token) {
//       setLoading(false);
//       return;
//     }
//     let cancelled = false;
//     setLoading(true);
//     Promise.all([
//       apiGetMyProducts(token),
//       apiGetMyServiceProducts(token),
//       apiGetVendorOrders(token),
//       apiGetVendorServiceBookings(token),
//       apiGetVendorSettlements(token).catch((err) => {
//         console.error(
//           'Vendor settlements fetch failed:',
//           err?.response?.data || err.message,
//         );
//         return { data: { settlements: [] } };
//       }),
//     ])
//       .then(([pRes, spRes, oRes, sbRes, settlRes]) => {
//         if (cancelled) return;
//         setProducts(
//           Array.isArray(pRes?.data?.products) ? pRes.data.products : [],
//         );
//         setServiceProducts(
//           Array.isArray(spRes?.data?.products) ? spRes.data.products : [],
//         );
//         setOrders(Array.isArray(oRes?.data) ? oRes.data : []);
//         setServiceBookings(Array.isArray(sbRes?.data) ? sbRes.data : []);
//         console.log('vendorSettlements raw response:', settlRes?.data);
//         setVendorSettlements(
//           Array.isArray(settlRes?.data?.settlements)
//             ? settlRes.data.settlements
//             : [],
//         );
//       })
//       .catch(() => {
//         if (cancelled) return;
//         setProducts([]);
//         setServiceProducts([]);
//         setOrders([]);
//         setServiceBookings([]);
//       })
//       .finally(() => {
//         if (!cancelled) setLoading(false);
//       });
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   useEffect(() => {
//     const token =
//       typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null;
//     if (!token) return;
//     let cancelled = false;
//     setLiveFeedLoading(true);
//     apiGetVendorNotifications(token)
//       .then(({ data }) => {
//         if (cancelled) return;
//         const list = Array.isArray(data?.notifications)
//           ? data.notifications
//           : [];
//         setLiveFeed(list);
//       })
//       .catch(() => {
//         if (!cancelled) setLiveFeed([]);
//       })
//       .finally(() => {
//         if (!cancelled) setLiveFeedLoading(false);
//       });
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   const orderIdFromNotification = (n) => {
//     if (n?.orderId) return n.orderId;
//     if (typeof n?.id === 'string' && n.id.startsWith('order-')) {
//       return n.id.slice('order-'.length);
//     }
//     return null;
//   };

//   const getVendorToken = () => {
//     if (typeof window !== 'undefined') {
//       return localStorage.getItem('vendorToken');
//     }
//     return null;
//   };

//   const handleFeedCardClick = (n) => {
//     const oid = orderIdFromNotification(n);
//     if (n.type === 'ticket_alert') {
//       router.push('/vendor/tickets');
//     } else if (n.type === 'service_booking') {
//       setServiceBookingModalId(n.bookingId);
//     } else if (n.type === 'return_request') {
//       setReturnModal({ orderId: oid, productId: n.productId || null });
//       // } else if ((n.type === 'order' || !n.type) && oid) {
//       //   setOrderModalId(oid);
//       // }
//     } else if (
//       (n.type === 'order' || n.type === 'order_cancelled' || !n.type) &&
//       oid
//     ) {
//       setOrderModalId(oid);
//     }
//   };

//   const formatFeedTime = (dateStr) => {
//     const date = new Date(dateStr);
//     if (Number.isNaN(date.getTime())) return '';
//     const sec = Math.floor((Date.now() - date.getTime()) / 1000);
//     if (sec < 45) return 'just now';
//     if (sec < 3600) return `${Math.max(1, Math.floor(sec / 60))} min ago`;
//     if (sec < 86400) return `${Math.floor(sec / 3600)} hr ago`;
//     if (sec < 604800) return `${Math.floor(sec / 86400)} day ago`;
//     return date.toLocaleDateString();
//   };

//   const handleDownloadPDF = () => {
//     const pdf = new jsPDF();
//     const pageWidth = pdf.internal.pageSize.getWidth();
//     const marginX = 14;
//     let y = 18;

//     // ---------- Header ----------
//     pdf.setFont('helvetica', 'bold');
//     pdf.setFontSize(18);
//     pdf.setTextColor(37, 99, 235); // #2563EB
//     pdf.text('Vendor Dashboard Report', marginX, y);

//     pdf.setFont('helvetica', 'normal');
//     pdf.setFontSize(9);
//     pdf.setTextColor(120, 120, 120);
//     const generatedOn = new Date().toLocaleDateString('en-GB', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//     });
//     pdf.text(`Generated on: ${generatedOn}`, pageWidth - marginX, y, {
//       align: 'right',
//     });

//     y += 4;
//     pdf.setDrawColor(230, 230, 230);
//     pdf.line(marginX, y, pageWidth - marginX, y);

//     // ---------- Summary Cards ----------
//     y += 12;
//     pdf.setFont('helvetica', 'bold');
//     pdf.setFontSize(12);
//     pdf.setTextColor(15, 23, 42);
//     pdf.text('Financial Summary', marginX, y);

//     y += 8;

//     const summaryItems = [
//       {
//         label: 'GROSS REVENUE',
//         value: `₹${stats.grossRevenue.toLocaleString('en-IN')}`,
//         sub: 'Total sales before deductions',
//         color: [37, 99, 235],
//       },
//       {
//         label: 'PLATFORM COMMISSION',
//         value: `₹${stats.platformCommission.toLocaleString('en-IN')}`,
//         sub: "Fees paid to Rent'n Pay",
//         color: [249, 115, 22],
//       },
//       {
//         label: 'NET PAYOUT',
//         value: `₹${stats.netPayout.toLocaleString('en-IN')}`,
//         sub: 'Final income received',
//         color: [16, 185, 129],
//       },
//       {
//         label: 'SETTLEMENTS',
//         value: `₹${stats.paidSettlement.toLocaleString('en-IN')}`,
//         sub: 'Total amount paid to your account',
//         color: [16, 185, 129],
//       },
//     ];

//     const cardWidth = (pageWidth - marginX * 2 - 9) / 2;
//     const cardHeight = 24;
//     const gapX = 9;
//     const gapY = 8;

//     summaryItems.forEach((item, i) => {
//       const col = i % 2;
//       const row = Math.floor(i / 2);
//       const x = marginX + col * (cardWidth + gapX);
//       const cardY = y + row * (cardHeight + gapY);

//       pdf.setDrawColor(230, 230, 230);
//       pdf.setFillColor(250, 250, 251);
//       pdf.roundedRect(x, cardY, cardWidth, cardHeight, 2, 2, 'FD');

//       pdf.setFont('helvetica', 'normal');
//       pdf.setFontSize(8);
//       pdf.setTextColor(100, 100, 100);
//       pdf.text(item.label, x + 5, cardY + 7);

//       pdf.setFont('helvetica', 'bold');
//       pdf.setFontSize(13);
//       pdf.setTextColor(item.color[0], item.color[1], item.color[2]);
//       pdf.text(item.value, x + 5, cardY + 15);

//       pdf.setFont('helvetica', 'normal');
//       pdf.setFontSize(7.5);
//       pdf.setTextColor(130, 130, 130);
//       pdf.text(item.sub, x + 5, cardY + 20);
//     });

//     y += 2 * (cardHeight + gapY) + 6;

//     // ---------- Revenue Distribution ----------
//     pdf.setFont('helvetica', 'bold');
//     pdf.setFontSize(12);
//     pdf.setTextColor(15, 23, 42);
//     pdf.text('Revenue Distribution', marginX, y);

//     y += 8;
//     pdf.setFont('helvetica', 'normal');
//     pdf.setFontSize(10);
//     const distColors = [
//       [124, 58, 237],
//       [249, 115, 22],
//       [37, 99, 235],
//     ];
//     revenueDistribution.forEach((item, i) => {
//       const rowY = y + i * 6;
//       pdf.setFillColor(distColors[i][0], distColors[i][1], distColors[i][2]);
//       pdf.circle(marginX + 1.5, rowY - 1.5, 1.5, 'F');
//       pdf.setTextColor(80, 80, 80);
//       pdf.text(item.label, marginX + 6, rowY);
//       pdf.setFont('helvetica', 'bold');
//       pdf.setTextColor(15, 23, 42);
//       pdf.text(item.value, marginX + 60, rowY);
//       pdf.setFont('helvetica', 'normal');
//     });

//     y += revenueDistribution.length * 6 + 10;

//     // ---------- Transactions Table ----------
//     pdf.setFont('helvetica', 'bold');
//     pdf.setFontSize(12);
//     pdf.setTextColor(15, 23, 42);
//     pdf.text('Detailed Transaction Summary', marginX, y);

//     y += 8;

//     const colX = {
//       date: marginX,
//       id: marginX + 32,
//       gross: marginX + 78,
//       commission: marginX + 118,
//       settled: marginX + 150,
//     };

//     // Table header
//     pdf.setFillColor(243, 244, 246);
//     pdf.rect(marginX, y - 5, pageWidth - marginX * 2, 8, 'F');
//     pdf.setFont('helvetica', 'bold');
//     pdf.setFontSize(8.5);
//     pdf.setTextColor(100, 116, 139);
//     pdf.text('DATE', colX.date + 2, y);
//     pdf.text('ORDER ID', colX.id, y);
//     pdf.text('GROSS AMOUNT', colX.gross, y);
//     pdf.text('COMMISSION', colX.commission, y);
//     pdf.text('SETTLED AMOUNT', colX.settled, y);

//     y += 8;
//     pdf.setFont('helvetica', 'normal');
//     pdf.setFontSize(9);

//     if (transactions.length === 0) {
//       pdf.setTextColor(150, 150, 150);
//       pdf.text('No transactions yet.', marginX, y);
//       y += 7;
//     } else {
//       transactions.forEach((tx, idx) => {
//         if (y > 275) {
//           pdf.addPage();
//           y = 20;
//         }
//         if (idx % 2 === 0) {
//           pdf.setFillColor(250, 250, 251);
//           pdf.rect(marginX, y - 5, pageWidth - marginX * 2, 7, 'F');
//         }
//         pdf.setTextColor(80, 80, 80);
//         pdf.text(tx.date, colX.date + 2, y);
//         pdf.setTextColor(15, 23, 42);
//         pdf.text(tx.id, colX.id, y);
//         pdf.setTextColor(37, 99, 235);
//         pdf.text(tx.gross, colX.gross, y);
//         pdf.setTextColor(249, 115, 22);
//         pdf.text(tx.commission, colX.commission, y);
//         pdf.setTextColor(16, 185, 129);
//         pdf.text(tx.settled, colX.settled, y);
//         y += 7;
//       });
//     }

//     // ---------- Footer ----------
//     const pageCount = pdf.internal.getNumberOfPages();
//     for (let p = 1; p <= pageCount; p++) {
//       pdf.setPage(p);
//       pdf.setFont('helvetica', 'normal');
//       pdf.setFontSize(8);
//       pdf.setTextColor(160, 160, 160);
//       pdf.text(`Page ${p} of ${pageCount}`, pageWidth - marginX, 290, {
//         align: 'right',
//       });
//       pdf.text("Rent'n Pay Vendor Dashboard", marginX, 290);
//     }

//     pdf.save('dashboard-report.pdf');
//   };
//   const handleLogout = async () => {
//     await dispatch(vendorLogout());
//     router.replace('/vendor-main');
//   };

//   const computed = useMemo(() => {
//     // const getOrderGross = (order) => {
//     //   const duration = Number(order?.rentalDuration) || 0;
//     //   const lines = Array.isArray(order?.products) ? order.products : [];
//     //   return lines.reduce((sum, line) => {
//     //     const unit = Number(line?.pricePerDay) || 0;
//     //     const qty = Number(line?.quantity) || 0;
//     //     return sum + unit * qty * duration;
//     //   }, 0);
//     // };
//     const grossRevenue = vendorSettlements.reduce(
//       (s, st) => s + Number(st.grossAmount || 0),
//       0,
//     );
//     const platformCommission = vendorSettlements.reduce(
//       (s, st) => s + Number(st.platformFee || 0),
//       0,
//     );
//     const otherDeductions = 0;
//     const netPayout = vendorSettlements.reduce(
//       (s, st) => s + Number(st.netPayout || 0),
//       0,
//     );
//     const totalSettled = netPayout;

//     // DEBUG LOG — remove after confirming data is correct
//     // console.log(' vendorSettlements from API:', vendorSettlements);
//     // console.log(
//     //   ' Paid settlements:',
//     //   vendorSettlements.filter((s) => s.status === 'Paid'),
//     // );
//     // console.log(
//     //   ' Pending settlements:',
//     //   vendorSettlements.filter((s) => s.status === 'Pending'),
//     // );

//     const pendingSettlement = vendorSettlements
//       .filter((s) => s.status === 'Pending')
//       .reduce((sum, s) => sum + Number(s.netPayout || 0), 0);

//     const paidSettlement = vendorSettlements
//       .filter((s) => s.status === 'Paid')
//       .reduce((sum, s) => {
//         // console.log(
//         //   ' Paid settlement:',
//         //   s.settlementId || s._id,
//         //   '→',
//         //   s.netPayout,
//         // );
//         return sum + Number(s.netPayout || 0);
//       }, 0);

//     // console.log(' Total paidSettlement:', paidSettlement);
//     const rentalCount = products.filter((p) => p?.type === 'Rental').length;
//     const sellCount = products.filter((p) => p?.type === 'Sell').length;
//     const serviceCount = serviceProducts.length;
//     const totalCount = Math.max(1, rentalCount + sellCount + serviceCount);
//     const rentalPct = Math.round((rentalCount / totalCount) * 100);
//     const sellPct = Math.round((sellCount / totalCount) * 100);
//     const servicePct = Math.max(0, 100 - rentalPct - sellPct);
//     // const filteredOrders = orders.filter((o) => {
//     //   if (!selectedDate) return true;

//     //   const orderDate = new Date(o.createdAt).toDateString();
//     //   const filterDate = new Date(selectedDate).toDateString();

//     //   return orderDate === filterDate;
//     // });
//     // const transactions = filteredOrders.slice(0, 6).map((o) => {
//     //   const gross = getOrderGross(o);
//     //   const commission = Math.round(gross * 0.1);
//     //   const settled = Math.max(0, gross - commission);
//     //   return {
//     //     // date: o?.createdAt
//     //     //   ? new Date(o.createdAt).toLocaleDateString('en-IN')
//     //     //   : '—',
//     //     date: o?.createdAt
//     //       ? new Date(o.createdAt).toLocaleDateString('en-GB', {
//     //           day: '2-digit',
//     //           month: 'short',
//     //           year: 'numeric',
//     //         })
//     //       : '—',
//     //     id: o?._id ? `ORD-${String(o._id).slice(-6).toUpperCase()}` : 'ORD-—',
//     //     gross: `₹${gross.toLocaleString('en-IN')}`,
//     //     commission: '10%',
//     //     settled: `₹${settled.toLocaleString('en-IN')}`,
//     //   };
//     // });

//     const filteredSettlements = vendorSettlements.filter((s) => {
//       if (!selectedMonth) return true;
//       if (!s?.createdAt) return false;

//       const d = new Date(s.createdAt);
//       const settleKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

//       return settleKey === selectedMonth;
//     });
//     // const transactions = filteredSettlements.slice(0, 6).map((s) => {
//     const transactions = filteredSettlements.slice(0, 10).map((s) => {
//       const gross = Number(s.grossAmount || 0);
//       const fee = Number(s.platformFee || 0);
//       const settled = Number(s.netPayout || 0);
//       const pct = gross ? Math.round((fee / gross) * 100) : 0;

//       return {
//         date: s?.createdAt
//           ? new Date(s.createdAt).toLocaleDateString('en-GB', {
//               day: '2-digit',
//               month: 'short',
//               year: 'numeric',
//             })
//           : '—',
//         id: s?.orderId
//           ? `ORD-${String(s.orderId).slice(-6).toUpperCase()}`
//           : 'ORD-—',
//         gross: `₹${gross.toLocaleString('en-IN')}`,
//         commission: `${pct}%`,
//         settled: `₹${settled.toLocaleString('en-IN')}`,
//       };
//     });
//     return {
//       stats: {
//         grossRevenue,
//         platformCommission,
//         otherDeductions,
//         netPayout,
//         totalSettled,
//         pendingSettlement,
//         paidSettlement,
//       },
//       revenueDistribution: [
//         { label: 'Rentals', value: `${rentalPct}%` },
//         { label: 'Services', value: `${servicePct}%` },
//         { label: 'Sales', value: `${sellPct}%` },
//       ],
//       transactions,
//     };
//   }, [products, serviceProducts, selectedMonth, vendorSettlements]);

//   const { stats, revenueDistribution, transactions } = computed;
//   const salesTrend = useMemo(() => {
//     const map = {};
//     const now = new Date();

//     // Pre-fill last 6 months (including current month) with 0 revenue
//     for (let i = 5; i >= 0; i--) {
//       const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
//       const key = `${d.getFullYear()}-${d.getMonth()}`;
//       map[key] = {
//         month: d.toLocaleString('default', { month: 'short' }),
//         revenue: 0,
//         sortDate: d,
//       };
//     }

//     orders.forEach((o) => {
//       const date = new Date(o.createdAt);
//       const key = `${date.getFullYear()}-${date.getMonth()}`;

//       const duration = Number(o?.rentalDuration) || 0;

//       const total = (o.products || []).reduce((s, p) => {
//         return s + (p.pricePerDay || 0) * (p.quantity || 0) * duration;
//       }, 0);

//       // Only accumulate if this order falls within the last 6 months window
//       if (map[key]) {
//         map[key].revenue += total;
//       }
//     });

//     return Object.values(map)
//       .sort((a, b) => a.sortDate - b.sortDate) // chronological
//       .map(({ month, revenue }) => ({ month, revenue }));
//   }, [orders]);

//   const availableMonths = useMemo(() => {
//     const map = {};
//     vendorSettlements.forEach((s) => {
//       if (!s?.createdAt) return;
//       const d = new Date(s.createdAt);
//       const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
//       if (!map[key]) {
//         map[key] = {
//           value: key,
//           label: d.toLocaleString('default', {
//             month: 'short',
//             year: 'numeric',
//           }),
//           sortDate: new Date(d.getFullYear(), d.getMonth(), 1),
//         };
//       }
//     });
//     return Object.values(map).sort((a, b) => b.sortDate - a.sortDate);
//   }, [vendorSettlements]);

//   return (
//     <div className="flex h-screen bg-gray-50 overflow-hidden">
//       {/* Sidebar */}
//       <VendorSidebar onLogout={handleLogout} />

//       {/* Main content area */}
//       <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
//         {/* Top bar */}
//         <VendorTopBar user={user} onLogout={handleLogout} />

//         {/* Scrollable dashboard content */}
//         <main className="flex-1 overflow-y-auto px-6 pb-6 pt-0">
//           <div className="space-y-6">
//             <div className="flex items-start justify-between">
//               {/* <div>
//                 <h1 className="text-2xl font-semibold">Dashboard</h1>
//                 <p className="text-sm text-gray-500">
//                   Comprehensive financial overview and performance metrics
//                 </p>
//               </div> */}

//               {/* <div className="flex items-center gap-3">
//                 <input
//                   type="date"
//                   value={selectedDate}
//                   onChange={(e) => setSelectedDate(e.target.value)}
//                   className="border rounded-lg px-3 py-2 text-sm"
//                 />

//                 <button
//                   onClick={handleDownloadPDF}
//                   className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white"
//                 >
//                   Download PDF Report
//                 </button>

//               </div> */}
//             </div>
//             {/* Top stat cards */}
//             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
//               <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-2">
//                 <p className="text-xs font-medium text-gray-500 flex items-center gap-2">
//                   <img
//                     src={grossRev.src}
//                     alt="Gross Revenue"
//                     className="w-10 h-10 shrink-0"
//                   />
//                   GROSS REVENUE
//                 </p>

//                 <p className="text-2xl font-semibold text-[#2563EB]">
//                   ₹{stats.grossRevenue.toLocaleString('en-IN')}
//                 </p>

//                 <p className="text-[11px] text-gray-500">
//                   {loading ? 'Loading...' : 'Total sales before deductions'}
//                 </p>
//               </div>
//               {/* <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-2">
//                 <p className="text-xs font-medium text-gray-500">
//                   PLATFORM COMMISSION
//                 </p>
//                 <p className="text-2xl font-semibold text-orange-500">
//                   ₹{stats.platformCommission.toLocaleString('en-IN')}
//                 </p>
//                 <p className="text-[11px] text-gray-500">
//                   {loading ? 'Loading...' : "Fees paid to Rent'n Pay"}
//                 </p>
//               </div> */}
//               <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-2">
//                 <p className="text-xs font-medium text-gray-500 flex items-center gap-2">
//                   <img
//                     src={platformComm.src}
//                     alt="Platform Commission"
//                     className="w-10 h-10 shrink-0"
//                   />
//                   PLATFORM COMMISSION
//                 </p>

//                 <p className="text-2xl font-semibold text-[#F97316]">
//                   ₹{stats.platformCommission.toLocaleString('en-IN')}
//                 </p>

//                 <p className="text-[11px] text-gray-500">
//                   {loading ? 'Loading...' : "Fees paid to Rent'n Pay"}
//                 </p>
//               </div>
//               {/* <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-2">
//                 <p className="text-xs font-medium text-gray-500">
//                   OTHER DEDUCTIONS
//                 </p>
//                 <p className="text-2xl font-semibold text-red-500">
//                   ₹{stats.otherDeductions.toLocaleString('en-IN')}
//                 </p>
//                 <p className="text-[11px] text-gray-500">
//                   {loading ? 'Loading...' : 'Loan EMIs & refund adjustments'}
//                 </p>
//               </div> */}
//               {/*
//               <div className="bg-white rounded-2xl border border-emerald-200 p-5 flex flex-col gap-2">
//                 <p className="text-xs font-medium text-gray-500">NET PAYOUT</p>
//                 <p className="text-2xl font-semibold text-emerald-600">
//                   ₹{stats.netPayout.toLocaleString('en-IN')}
//                 </p>
//                 <p className="text-[11px] text-gray-500">
//                   {loading ? 'Loading...' : 'Final income received'}
//                 </p>
//               </div> */}
//               <div className="bg-white rounded-2xl border border-emerald-200 p-5 flex flex-col gap-2">
//                 <p className="text-xs font-medium text-gray-500 flex items-center gap-2">
//                   <img
//                     src={netPayout.src}
//                     alt="Net Payout"
//                     className="w-10 h-10 shrink-0"
//                   />
//                   NET PAYOUT
//                 </p>

//                 <p className="text-2xl font-semibold text-[#10B981]">
//                   ₹{stats.netPayout.toLocaleString('en-IN')}
//                 </p>

//                 <p className="text-[11px] text-gray-500">
//                   {loading ? 'Loading...' : 'Final income received'}
//                 </p>
//               </div>

//               {/* <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-2">
//                 <p className="text-xs font-medium text-gray-500 flex items-center gap-2">
//                   <img
//                     src={netPayout.src}
//                     alt="Settlement Amount"
//                     className="w-10 h-10 shrink-0"
//                   />
//                   SETTLEMENT AMOUNT
//                 </p>
//                 <p className="text-2xl font-semibold text-[#7C3AED]">
//                   ₹{stats.totalSettled.toLocaleString('en-IN')}
//                 </p>
//                 <p className="text-[11px] text-gray-500">
//                   {loading ? 'Loading...' : 'Total amount settled to date'}
//                 </p>
//               </div> */}
//               <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-2">
//                 <p className="text-xs font-medium text-gray-500 flex items-center gap-2">
//                   <img
//                     src={netPayout.src}
//                     alt="Pending Settlement"
//                     className="w-10 h-10 shrink-0"
//                   />
//                   SETTLEMENTS
//                 </p>
//                 <p className="text-2xl font-semibold text-[#10B981]">
//                   ₹{stats.paidSettlement.toLocaleString('en-IN')}
//                 </p>
//                 <p className="text-[11px] text-gray-500">
//                   {loading ? 'Loading...' : 'Total amount paid to your account'}
//                 </p>
//               </div>
//             </div>

//             {/* Middle charts */}
//             <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
//               {/* Sales Trend */}
//               {/* <div className="bg-white rounded-2xl border border-gray-200 p-5 xl:col-span-2">
//                 <div className="flex items-center justify-between mb-4">
//                   <div>
//                     <p className="text-sm font-semibold text-gray-900">
//                       Sales Trend
//                     </p>
//                     <p className="text-[11px] text-gray-500">
//                       Monthly revenue growth over the last 6 months
//                     </p>
//                   </div>
//                 </div>
//                 <div className="mt-2 h-52 md:h-60">
//                   <div className="w-full h-full rounded-xl bg-gradient-to-b from-indigo-50 to-white border border-dashed border-indigo-100 flex items-center justify-center">
//                     <p className="text-xs text-gray-500">
//                       Line chart placeholder – plug real chart library later
//                     </p>
//                   </div>
//                 </div>
//               </div> */}

//               {/* Sales Trend */}
//               <div className="bg-white rounded-2xl border border-gray-200 p-5 xl:col-span-2">
//                 <div className="mb-4 flex items-start justify-between gap-3 flex-wrap">
//                   <div>
//                     <p className="text-sm font-semibold text-gray-900">
//                       Sales Trend
//                     </p>
//                     <p className="text-[11px] text-gray-500">
//                       Monthly revenue growth over the last 6 months
//                     </p>
//                   </div>

//                   <div className="flex items-center gap-2">
//                     <select
//                       value={selectedMonth}
//                       onChange={(e) => setSelectedMonth(e.target.value)}
//                       className="border rounded-lg px-3 py-2 text-xs bg-white outline-none"
//                     >
//                       <option value="">All Months</option>
//                       {availableMonths.map((m) => (
//                         <option key={m.value} value={m.value}>
//                           {m.label}
//                         </option>
//                       ))}
//                     </select>

//                     <button
//                       onClick={handleDownloadPDF}
//                       className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-3 py-2 text-xs font-medium text-white whitespace-nowrap"
//                     >
//                       <img
//                         src={downLoad.src}
//                         alt="download"
//                         className="w-4 h-4 shrink-0"
//                       />
//                       Download PDF Report
//                     </button>
//                   </div>
//                 </div>

//                 <div className="h-60">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <LineChart data={salesTrend}>
//                       <CartesianGrid strokeDasharray="3 3" vertical={false} />

//                       <XAxis
//                         dataKey="month"
//                         tick={{ fontSize: 12 }}
//                         axisLine={false}
//                         tickLine={false}
//                       />

//                       <YAxis
//                         tickFormatter={(v) => `₹${v / 1000}k`}
//                         tick={{ fontSize: 12 }}
//                         axisLine={false}
//                         tickLine={false}
//                       />

//                       <Tooltip
//                         formatter={(v) => [
//                           `₹${v.toLocaleString('en-IN')}`,
//                           'Revenue',
//                         ]}
//                       />

//                       <Line
//                         type="monotone"
//                         dataKey="revenue"
//                         stroke="#7C3AED"
//                         strokeWidth={3}
//                         dot={{ r: 4 }}
//                         activeDot={{ r: 6 }}
//                       />
//                     </LineChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>

//               {/* Revenue Distribution */}
//               {/* <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col">
//                 <p className="text-sm font-semibold text-gray-900 mb-1">
//                   Revenue Distribution
//                 </p>
//                 <p className="text-[11px] text-gray-500 mb-4">
//                   Income sources breakdown
//                 </p>
//                 <div className="flex-1 flex items-center justify-center">
//                   <div className="relative w-40 h-40">
//                     <div className="absolute inset-0 rounded-full bg-orange-100" />
//                     <div className="absolute inset-2 rounded-full border-[10px] border-transparent border-t-indigo-500 border-r-orange-400 border-b-emerald-400" />
//                     <div className="absolute inset-8 rounded-full bg-white" />
//                   </div>
//                 </div>
//                 <div className="mt-4 space-y-1.5 text-xs">
//                   {revenueDistribution.map((item) => (
//                     <div
//                       key={item.label}
//                       className="flex items-center justify-between text-gray-600"
//                     >
//                       <div className="flex items-center gap-2">
//                         <span className="w-2 h-2 rounded-full bg-indigo-500" />
//                         <span>{item.label}</span>
//                       </div>
//                       <span className="font-medium text-gray-800">
//                         {item.value}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div> */}
//               {/* Revenue Distribution */}
//               <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col">
//                 <p className="text-sm font-semibold text-gray-900 mb-1">
//                   Revenue Distribution
//                 </p>
//                 <p className="text-[11px] text-gray-500 mb-4">
//                   Income sources breakdown
//                 </p>

//                 {/* Donut */}
//                 {/* <div className="flex-1 flex items-center justify-center">
//                   <div className="relative w-40 h-40 rounded-full bg-gradient-to-r from-violet-500 via-violet-500 to-violet-500">
//                     <div
//                       className="absolute inset-0 rounded-full"
//                       style={{
//                         background:
//                           'conic-gradient(#7C3AED 0% 55%, #F97316 55% 80%, #2563EB 80% 100%)',
//                       }}
//                     />
//                     <div className="absolute inset-6 rounded-full bg-white" />
//                   </div>
//                 </div> */}
//                 <div className="flex-1 flex items-center justify-center">
//                   <div className="relative w-40 h-40 rounded-full bg-gradient-to-r from-violet-500 via-violet-500 to-violet-500">
//                     <div
//                       className="absolute inset-0 rounded-full transition-[background] duration-700 ease-out"
//                       style={{
//                         background: (() => {
//                           const rentalStop = parseFloat(
//                             revenueDistribution[0]?.value || '0',
//                           );
//                           const serviceStop =
//                             rentalStop +
//                             parseFloat(revenueDistribution[1]?.value || '0');
//                           return `conic-gradient(#7C3AED 0% ${rentalStop}%, #F97316 ${rentalStop}% ${serviceStop}%, #2563EB ${serviceStop}% 100%)`;
//                         })(),
//                       }}
//                     />
//                     <div className="absolute inset-6 rounded-full bg-white" />
//                   </div>
//                 </div>

//                 {/* Legend */}
//                 <div className="mt-4 space-y-2 text-xs">
//                   {revenueDistribution.map((item, index) => {
//                     const colors = [
//                       'bg-violet-500',
//                       'bg-orange-500',
//                       'bg-blue-600',
//                     ];

//                     return (
//                       <div
//                         key={item.label}
//                         className="flex items-center justify-between text-gray-600"
//                       >
//                         <div className="flex items-center gap-2">
//                           <span
//                             className={`w-2.5 h-2.5 rounded-full ${colors[index]}`}
//                           />
//                           <span>{item.label}</span>
//                         </div>

//                         <span className="font-medium text-gray-900">
//                           {item.value}
//                         </span>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>

//             {/* Live Feed */}
//             <div className="bg-white rounded-2xl border border-gray-200 p-5">
//               <div className="mb-4">
//                 <div className="flex items-center gap-2">
//                   <p className="text-lg font-semibold text-gray-900">
//                     Live Feed
//                   </p>
//                   <span className="relative flex h-2.5 w-2.5">
//                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
//                     <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
//                   </span>
//                 </div>

//                 <p className="text-sm text-gray-500 ">Recent platform events</p>
//               </div>

//               {liveFeedLoading && (
//                 <p className="text-sm text-gray-500 text-center py-6">
//                   Loading…
//                 </p>
//               )}

//               {!liveFeedLoading && liveFeed.length === 0 && (
//                 <p className="text-sm text-gray-500 text-center py-6">
//                   No recent activity yet.
//                 </p>
//               )}

//               {!liveFeedLoading && liveFeed.length > 0 && (
//                 <>
//                   <div
//                     className={
//                       showAllFeed
//                         ? 'grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent'
//                         : 'grid grid-cols-1 md:grid-cols-2 gap-4'
//                     }
//                   >
//                     {(showAllFeed ? liveFeed : liveFeed.slice(0, 4)).map(
//                       (n, idx) => (
//                         <div
//                           key={n.id || idx}
//                           onClick={() => handleFeedCardClick(n)}
//                           role="button"
//                           tabIndex={0}
//                           className="rounded-xl border border-gray-100 bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
//                         >
//                           <p className="text-sm font-semibold text-gray-900">
//                             {n.title}
//                           </p>
//                           <p className="text-xs text-gray-500 mt-1 line-clamp-2">
//                             {n.detail}
//                           </p>
//                           <p className="text-[11px] text-gray-400 mt-2">
//                             {formatFeedTime(n.at)}
//                           </p>
//                         </div>
//                       ),
//                     )}
//                   </div>

//                   {liveFeed.length > 4 && (
//                     <button
//                       type="button"
//                       onClick={() => setShowAllFeed((v) => !v)}
//                       className="mt-4 w-full rounded-lg border border-orange-200 bg-white py-2.5 text-sm font-medium text-orange-500 hover:bg-orange-50"
//                     >
//                       {showAllFeed ? 'Show Less' : 'View All Activity'}
//                     </button>
//                   )}
//                 </>
//               )}
//             </div>

//             <VendorNewOrderModal
//               open={Boolean(orderModalId)}
//               orderId={orderModalId}
//               vendorIdStr={String(user?.id || user?._id || '')}
//               getToken={getVendorToken}
//               onClose={() => setOrderModalId(null)}
//             />

//             <VendorReturnRequestedModal
//               open={Boolean(returnModal.orderId)}
//               orderId={returnModal.orderId}
//               productId={returnModal.productId}
//               vendorIdStr={String(user?.id || user?._id || '')}
//               getToken={getVendorToken}
//               onClose={() => setReturnModal({ orderId: null, productId: null })}
//             />

//             <VendorNewServiceBookingModal
//               open={Boolean(serviceBookingModalId)}
//               bookingId={serviceBookingModalId}
//               getToken={getVendorToken}
//               onClose={() => setServiceBookingModalId(null)}
//             />

//             {/* Detailed Transaction Summary */}
//             {/* <div className="bg-white rounded-2xl border border-gray-200 p-5">
//               <div className="flex items-center justify-between mb-4">
//                 <div>
//                   <p className="text-lg font-semibold text-gray-900">
//                     Detailed Transaction Summary
//                   </p>
//                   <p className="text-sm text-gray-500">
//                     Recent payouts and settlement history
//                   </p>
//                 </div>
//               </div>
//               <div className="overflow-x-auto">
//                 <table className="min-w-full text-xs md:text-sm">
//                   <thead>
//                     <tr className="text-[#64748B] border-b border-gray-100">
//                       <th className="py-3 text-left font-medium">DATE</th>
//                       <th className="py-3 text-left font-medium">ORDER ID</th>
//                       <th className="py-3 text-left font-medium">
//                         GROSS AMOUNT
//                       </th>
//                       <th className="py-3 text-left font-medium">
//                         COMMISSION (%)
//                       </th>
//                       <th className="py-3 text-left font-medium">
//                         SETTLED AMOUNT
//                       </th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {transactions.map((tx, idx) => (
//                       <tr
//                         key={tx.id}
//                         className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
//                       >
//                         <td className="py-2.5 text-gray-600">
//                           <div className="flex items-center gap-2">
//                             <img
//                               src={DateIcon.src}
//                               alt="date"
//                               className="w-3 h-3 shrink-0"
//                             />
//                             {tx.date}
//                           </div>
//                         </td>
//                         <td className="py-2.5 text-[#0F172A] font-medium">
//                           {tx.id}
//                         </td>
//                         <td className="py-2.5 text-left text-[#2563EB]">
//                           {tx.gross}
//                         </td>
//                         <td className="py-2.5 text-left text-[#F97316]">
//                           {tx.commission}
//                         </td>
//                         <td className="py-2.5 text-left text-emerald-600 font-medium">
//                           {tx.settled}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div> */}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default VendorDashboardPage;

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { vendorLogout } from '../../../redux/slices/vendorSlice';
import {
  apiGetMyProducts,
  apiGetMyServiceProducts,
  apiGetVendorOrders,
  apiGetVendorServiceBookings,
  apiGetVendorSettlements,
  apiGetVendorNotifications,
  apiGetCategories,
} from '@/service/api';
import {
  buildCategoryRateMap,
  computeVendorLineMoney,
  computeVendorLinesPayout,
} from '../../utils/vendorPayout';
import VendorSidebar from '../../Components/Common/VendorSidebar';
import VendorTopBar from '../../Components/Common/VendorTopBar';
import VendorNewOrderModal from '../../Components/Modals/VendorNewOrderModal';
import VendorReturnRequestedModal from '../../Components/Modals/VendorReturnRequestedModal';
import VendorNewServiceBookingModal from '../../Components/Modals/VendorNewServiceBookingModal';
import grossRev from '@/assets/icons/gross-rev.png';
import platformComm from '@/assets/icons/platform-comm.png';
import netPayout from '@/assets/icons/net-payout.png';
import jsPDF from 'jspdf';
import downLoad from '@/assets/icons/download.png';
import DateIcon from '@/assets/icons/date.png';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const VendorDashboardPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.vendor);
  const vendorIdStr = String(user?.id || user?._id || '');
  const [products, setProducts] = useState([]);
  const [serviceProducts, setServiceProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [serviceBookings, setServiceBookings] = useState([]);
  const [vendorSettlements, setVendorSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [liveFeed, setLiveFeed] = useState([]);
  const [liveFeedLoading, setLiveFeedLoading] = useState(false);
  const [showAllFeed, setShowAllFeed] = useState(false);
  const [orderModalId, setOrderModalId] = useState(null);
  const [returnModal, setReturnModal] = useState({
    orderId: null,
    productId: null,
  });
  const [serviceBookingModalId, setServiceBookingModalId] = useState(null);
  const [categoryRateMap, setCategoryRateMap] = useState({});

  useEffect(() => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('vendorToken')
        : null;
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      apiGetMyProducts(token),
      apiGetMyServiceProducts(token),
      apiGetVendorOrders(token),
      apiGetVendorServiceBookings(token),
      apiGetVendorSettlements(token).catch((err) => {
        console.error(
          'Vendor settlements fetch failed:',
          err?.response?.data || err.message,
        );
        return { data: { settlements: [] } };
      }),
      apiGetCategories().catch(() => ({ data: [] })),
    ])
      .then(([pRes, spRes, oRes, sbRes, settlRes, catRes]) => {
        if (cancelled) return;
        setProducts(
          Array.isArray(pRes?.data?.products) ? pRes.data.products : [],
        );
        setServiceProducts(
          Array.isArray(spRes?.data?.products) ? spRes.data.products : [],
        );
        setOrders(Array.isArray(oRes?.data) ? oRes.data : []);
        setServiceBookings(Array.isArray(sbRes?.data) ? sbRes.data : []);
        console.log('vendorSettlements raw response:', settlRes?.data);
        setVendorSettlements(
          Array.isArray(settlRes?.data?.settlements)
            ? settlRes.data.settlements
            : [],
        );
        setCategoryRateMap(
          buildCategoryRateMap(Array.isArray(catRes?.data) ? catRes.data : []),
        );
      })
      .catch(() => {
        if (cancelled) return;
        setProducts([]);
        setServiceProducts([]);
        setOrders([]);
        setServiceBookings([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('vendorToken')
        : null;
    if (!token) return;
    let cancelled = false;
    setLiveFeedLoading(true);
    apiGetVendorNotifications(token)
      .then(({ data }) => {
        if (cancelled) return;
        const list = Array.isArray(data?.notifications)
          ? data.notifications
          : [];
        setLiveFeed(list);
      })
      .catch(() => {
        if (!cancelled) setLiveFeed([]);
      })
      .finally(() => {
        if (!cancelled) setLiveFeedLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const orderIdFromNotification = (n) => {
    if (n?.orderId) return n.orderId;
    if (typeof n?.id === 'string' && n.id.startsWith('order-')) {
      return n.id.slice('order-'.length);
    }
    return null;
  };

  const getVendorToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vendorToken');
    }
    return null;
  };

  const handleFeedCardClick = (n) => {
    const oid = orderIdFromNotification(n);
    if (n.type === 'ticket_alert') {
      router.push('/vendor/tickets');
    } else if (n.type === 'service_booking') {
      setServiceBookingModalId(n.bookingId);
    } else if (n.type === 'return_request') {
      const relatedOrder = orders.find((o) => String(o._id) === String(oid));
      const relatedLine = relatedOrder?.products?.find((line) => {
        const p = line?.product;
        const pid = typeof p === 'object' && p ? p._id : p;
        return String(pid) === String(n.productId || '');
      });
      const alreadyScheduled = Boolean(
        relatedLine?.returnRequest?.pickupScheduledAt,
      );
      const alreadyCompleted = Boolean(
        relatedLine?.returnRequest?.refundInitiatedAt,
      );
      if (!alreadyScheduled && !alreadyCompleted) {
        setReturnModal({ orderId: oid, productId: n.productId || null });
      }
    } else if ((n.type === 'order' || !n.type) && oid) {
      setOrderModalId(oid);
    }
  };

  const formatFeedTime = (dateStr) => {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '';
    const sec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (sec < 45) return 'just now';
    if (sec < 3600) return `${Math.max(1, Math.floor(sec / 60))} min ago`;
    if (sec < 86400) return `${Math.floor(sec / 3600)} hr ago`;
    if (sec < 604800) return `${Math.floor(sec / 86400)} day ago`;
    return date.toLocaleDateString();
  };

  const handleDownloadPDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const marginX = 14;
    let y = 18;

    // ---------- Header ----------
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.setTextColor(37, 99, 235); // #2563EB
    pdf.text('Vendor Dashboard Report', marginX, y);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(120, 120, 120);
    const generatedOn = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    pdf.text(`Generated on: ${generatedOn}`, pageWidth - marginX, y, {
      align: 'right',
    });

    y += 4;
    pdf.setDrawColor(230, 230, 230);
    pdf.line(marginX, y, pageWidth - marginX, y);

    // ---------- Summary Cards ----------
    y += 12;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(15, 23, 42);
    pdf.text('Financial Summary', marginX, y);

    y += 8;

    const summaryItems = [
      {
        label: 'GROSS REVENUE',
        value: `${stats.grossRevenue.toLocaleString('en-IN')}`,
        sub: 'Total sales before deductions',
        color: [37, 99, 235],
      },
      {
        label: 'PLATFORM COMMISSION',
        value: `${stats.platformCommission.toLocaleString('en-IN')}`,
        sub: 'Fees paid to Rentnpay',
        color: [249, 115, 22],
      },
      {
        label: 'NET PAYOUT',
        value: `${stats.netPayout.toLocaleString('en-IN')}`,
        sub: 'Final income received',
        color: [16, 185, 129],
      },
      {
        label: 'SETTLEMENTS',
        value: `${stats.paidSettlement.toLocaleString('en-IN')}`,
        sub: 'Total amount paid to your account',
        color: [16, 185, 129],
      },
    ];

    summaryItems.forEach((item) => {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(item.label, marginX, y);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.setTextColor(item.color[0], item.color[1], item.color[2]);
      pdf.text(item.value, marginX + 65, y);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(130, 130, 130);
      pdf.text(item.sub, marginX + 105, y);

      y += 8;
    });

    y += 6;

    // ---------- Revenue Distribution ----------
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(15, 23, 42);
    pdf.text('Revenue Distribution', marginX, y);

    y += 8;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    const distColors = [
      [124, 58, 237],
      [249, 115, 22],
      [37, 99, 235],
    ];
    revenueDistribution.forEach((item, i) => {
      const rowY = y + i * 6;
      pdf.setFillColor(distColors[i][0], distColors[i][1], distColors[i][2]);
      pdf.circle(marginX + 1.5, rowY - 1.5, 1.5, 'F');
      pdf.setTextColor(80, 80, 80);
      pdf.text(item.label, marginX + 6, rowY);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text(item.value, marginX + 60, rowY);
      pdf.setFont('helvetica', 'normal');
    });

    y += revenueDistribution.length * 6 + 10;

    // ---------- Footer ----------
    const pageCount = pdf.internal.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      pdf.setPage(p);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(160, 160, 160);
      pdf.text(`Page ${p} of ${pageCount}`, pageWidth - marginX, 290, {
        align: 'right',
      });
      pdf.text("Rent'n Pay Vendor Dashboard", marginX, 290);
    }

    pdf.save('dashboard-report.pdf');
  };
  const handleLogout = async () => {
    await dispatch(vendorLogout());
    router.replace('/vendor-main');
  };

  const computed = useMemo(() => {
    // Gross Revenue = rent + security deposit (matches settlements page)
    const grossRevenue = vendorSettlements.reduce(
      (s, st) =>
        s + Number(st.grossAmount || 0) + Number(st.depositAmount || 0),
      0,
    );
    const platformCommission = vendorSettlements.reduce(
      (s, st) => s + Number(st.platformFee || 0),
      0,
    );
    const otherDeductions = 0;
    // Backend netPayout = (rent - fee) only; add the deposit back in so
    // Net Payout reflects the full amount reaching the vendor's bank.
    const netPayout = vendorSettlements.reduce(
      (s, st) => s + Number(st.netPayout || 0) + Number(st.depositAmount || 0),
      0,
    );
    const totalSettled = netPayout;

    // DEBUG LOG — remove after confirming data is correct
    // console.log(' vendorSettlements from API:', vendorSettlements);
    // console.log(
    //   ' Paid settlements:',
    //   vendorSettlements.filter((s) => s.status === 'Paid'),
    // );
    // console.log(
    //   ' Pending settlements:',
    //   vendorSettlements.filter((s) => s.status === 'Pending'),
    // );

    const pendingSettlement = vendorSettlements
      .filter((s) => s.status === 'Pending')
      .reduce((sum, s) => sum + Number(s.netPayout || 0), 0);

    const paidSettlement = vendorSettlements
      .filter((s) => s.status === 'Paid')
      .reduce((sum, s) => {
        return sum + Number(s.netPayout || 0) + Number(s.depositAmount || 0);
      }, 0);
    // console.log(' Total paidSettlement:', paidSettlement);
    // Real revenue per line item, using each line's own productType
    // (falls back to order-level rentalDuration when the line doesn't
    // carry its own, same fallback used elsewhere in this file).
    let rentalRevenue = 0;
    let sellRevenue = 0;
    orders.forEach((o) => {
      (o.products || []).forEach((line) => {
        const p = line?.product;
        if (!p || typeof p === 'string') return;
        const vid = p.vendorId?._id ?? p.vendorId;
        if (String(vid) !== vendorIdStr) return;

        const net = computeVendorLineMoney(line, categoryRateMap, o).netProduct;
        if (line?.productType === 'Sell') {
          sellRevenue += net;
        } else {
          rentalRevenue += net;
        }
      });
    });
    const serviceRevenue = serviceBookings.reduce(
      (sum, b) => sum + (Number(b?.totalAmount) || 0),
      0,
    );

    const totalRevenue = Math.max(
      1,
      rentalRevenue + sellRevenue + serviceRevenue,
    );
    const rentalPct = Math.round((rentalRevenue / totalRevenue) * 100);
    const sellPct = Math.round((sellRevenue / totalRevenue) * 100);
    const servicePct = Math.max(0, 100 - rentalPct - sellPct);
    // const filteredOrders = orders.filter((o) => {
    //   if (!selectedDate) return true;

    //   const orderDate = new Date(o.createdAt).toDateString();
    //   const filterDate = new Date(selectedDate).toDateString();

    //   return orderDate === filterDate;
    // });
    // const transactions = filteredOrders.slice(0, 6).map((o) => {
    //   const gross = getOrderGross(o);
    //   const commission = Math.round(gross * 0.1);
    //   const settled = Math.max(0, gross - commission);
    //   return {
    //     // date: o?.createdAt
    //     //   ? new Date(o.createdAt).toLocaleDateString('en-IN')
    //     //   : '—',
    //     date: o?.createdAt
    //       ? new Date(o.createdAt).toLocaleDateString('en-GB', {
    //           day: '2-digit',
    //           month: 'short',
    //           year: 'numeric',
    //         })
    //       : '—',
    //     id: o?._id ? `ORD-${String(o._id).slice(-6).toUpperCase()}` : 'ORD-—',
    //     gross: `₹${gross.toLocaleString('en-IN')}`,
    //     commission: '10%',
    //     settled: `₹${settled.toLocaleString('en-IN')}`,
    //   };
    // });

    const filteredSettlements = vendorSettlements.filter((s) => {
      if (!selectedMonth) return true;
      if (!s?.createdAt) return false;

      const d = new Date(s.createdAt);
      const settleKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      return settleKey === selectedMonth;
    });
    // const transactions = filteredSettlements.slice(0, 6).map((s) => {
    const transactions = filteredSettlements.slice(0, 10).map((s) => {
      const gross = Number(s.grossAmount || 0);
      const fee = Number(s.platformFee || 0);
      const settled = Number(s.netPayout || 0);
      const pct = gross ? Math.round((fee / gross) * 100) : 0;

      return {
        date: s?.createdAt
          ? new Date(s.createdAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '—',
        id: s?.orderId
          ? `ORD-${String(s.orderId).slice(-6).toUpperCase()}`
          : 'ORD-—',
        gross: `₹${gross.toLocaleString('en-IN')}`,
        commission: `${pct}%`,
        settled: `₹${settled.toLocaleString('en-IN')}`,
      };
    });
    return {
      stats: {
        grossRevenue,
        platformCommission,
        otherDeductions,
        netPayout,
        totalSettled,
        pendingSettlement,
        paidSettlement,
      },
      revenueDistribution: [
        { label: 'Rent', value: `${rentalPct}%` },
        { label: 'Buy', value: `${sellPct}%` },
        { label: 'Services', value: `${servicePct}%` },
      ],
      transactions,
    };
  }, [
    products,
    serviceProducts,
    selectedMonth,
    vendorSettlements,
    orders,
    serviceBookings,
    categoryRateMap,
    vendorIdStr,
  ]);

  const { stats, revenueDistribution, transactions } = computed;
  // const salesTrend = useMemo(() => {
  //   const getOrderTotal = (o) => {
  //     const duration = Number(o?.rentalDuration) || 0;
  //     return (o.products || []).reduce((s, p) => {
  //       return s + (p.pricePerDay || 0) * (p.quantity || 0) * duration;
  //     }, 0);
  //   };
  const salesTrend = useMemo(() => {
    // Mirrors the Orders page's per-line payout: order value - platform fee
    // + refundable deposit + other taxes, summed ONLY across this vendor's
    // own lines in the order (not every vendor's lines on a shared order).
    const getOrderTotal = (o) => {
      const vendorLines = (o?.products || []).filter((line) => {
        const p = line?.product;
        if (!p || typeof p === 'string') return false;
        const vid = p.vendorId?._id ?? p.vendorId;
        return String(vid) === vendorIdStr;
      });
      return computeVendorLinesPayout(vendorLines, categoryRateMap, o);
    };

    if (selectedMonth) {
      // Daily breakdown for the selected month
      const [yearStr, monthStr] = selectedMonth.split('-');
      const year = Number(yearStr);
      const monthIdx = Number(monthStr) - 1;
      const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

      const dayMap = {};
      for (let d = 1; d <= daysInMonth; d++) {
        dayMap[d] = { month: String(d), revenue: 0 };
      }

      orders.forEach((o) => {
        const date = new Date(o.createdAt);
        if (date.getFullYear() === year && date.getMonth() === monthIdx) {
          const day = date.getDate();
          if (dayMap[day]) {
            dayMap[day].revenue += getOrderTotal(o);
          }
        }
      });

      serviceBookings.forEach((b) => {
        const date = new Date(b.createdAt);
        if (date.getFullYear() === year && date.getMonth() === monthIdx) {
          const day = date.getDate();
          if (dayMap[day]) {
            dayMap[day].revenue += Number(b?.totalAmount || 0);
          }
        }
      });

      return Object.values(dayMap);
    }

    const map = {};
    const now = new Date();

    // Pre-fill last 6 months (including current month) with 0 revenue
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      map[key] = {
        month: d.toLocaleString('default', { month: 'short' }),
        revenue: 0,
        sortDate: d,
      };
    }

    orders.forEach((o) => {
      const date = new Date(o.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;

      // Only accumulate if this order falls within the last 6 months window
      if (map[key]) {
        map[key].revenue += getOrderTotal(o);
      }
    });

    // Include this vendor's service bookings too, so the chart total
    // matches the Orders page's "Total value" (which also includes services).
    serviceBookings.forEach((b) => {
      const date = new Date(b.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (map[key]) {
        map[key].revenue += Number(b?.totalAmount || 0);
      }
    });

    return Object.values(map)
      .sort((a, b) => a.sortDate - b.sortDate) // chronological
      .map(({ month, revenue }) => ({ month, revenue }));
  }, [orders, serviceBookings, selectedMonth, vendorIdStr, categoryRateMap]);

  // const availableMonths = useMemo(() => {
  //   const map = {};
  //   vendorSettlements.forEach((s) => {
  //     if (!s?.createdAt) return;
  //     const d = new Date(s.createdAt);
  //     const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  //     if (!map[key]) {
  //       map[key] = {
  //         value: key,
  //         label: d.toLocaleString('default', {
  //           month: 'short',
  //           year: 'numeric',
  //         }),
  //         sortDate: new Date(d.getFullYear(), d.getMonth(), 1),
  //       };
  //     }
  //   });
  //   return Object.values(map).sort((a, b) => b.sortDate - a.sortDate);
  // }, [vendorSettlements]);
  const availableMonths = useMemo(() => {
    const now = new Date();
    const map = {};

    // Pre-fill last 6 months (including current month), same window as salesTrend
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map[key] = {
        value: key,
        label: d.toLocaleString('default', {
          month: 'short',
          year: 'numeric',
        }),
        sortDate: d,
      };
    }

    return Object.values(map).sort((a, b) => b.sortDate - a.sortDate);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <VendorSidebar onLogout={handleLogout} />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <VendorTopBar user={user} onLogout={handleLogout} />

        {/* Scrollable dashboard content */}
        <main className="flex-1 overflow-y-auto px-6 pb-6 pt-0">
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              {/* <div>
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <p className="text-sm text-gray-500">
                  Comprehensive financial overview and performance metrics
                </p>
              </div> */}

              {/* <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm"
                />

                <button
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white"
                >
                  Download PDF Report
                </button>
              
              </div> */}
            </div>
            {/* Top stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-2">
                <p className="text-xs font-medium text-gray-500 flex items-center gap-2">
                  <img
                    src={grossRev.src}
                    alt="Gross Revenue"
                    className="w-10 h-10 shrink-0"
                  />
                  GROSS REVENUE
                </p>

                <p className="text-2xl font-semibold text-[#2563EB]">
                  ₹{stats.grossRevenue.toLocaleString('en-IN')}
                </p>

                <p className="text-[11px] text-gray-500">
                  {loading ? 'Loading...' : 'Total before deductions '}
                </p>
                {/* <p className="text-[11px] text-gray-500">
                  {loading ? 'Loading...' : 'Total (including deposit)'}
                </p> */}
              </div>
              {/* <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-2">
                <p className="text-xs font-medium text-gray-500">
                  PLATFORM COMMISSION
                </p>
                <p className="text-2xl font-semibold text-orange-500">
                  ₹{stats.platformCommission.toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-gray-500">
                  {loading ? 'Loading...' : "Fees paid to Rent'n Pay"}
                </p>
              </div> */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-2">
                <p className="text-xs font-medium text-gray-500 flex items-center gap-2">
                  <img
                    src={platformComm.src}
                    alt="Platform Commission"
                    className="w-10 h-10 shrink-0"
                  />
                  PLATFORM COMMISSION
                </p>

                <p className="text-2xl font-semibold text-[#F97316]">
                  ₹{stats.platformCommission.toLocaleString('en-IN')}
                </p>

                <p className="text-[11px] text-gray-500">
                  {loading ? 'Loading...' : 'Fees paid to Rentnpay'}
                </p>
              </div>
              {/* <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-2">
                <p className="text-xs font-medium text-gray-500">
                  OTHER DEDUCTIONS
                </p>
                <p className="text-2xl font-semibold text-red-500">
                  ₹{stats.otherDeductions.toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-gray-500">
                  {loading ? 'Loading...' : 'Loan EMIs & refund adjustments'}
                </p>
              </div> */}
              {/* 
              <div className="bg-white rounded-2xl border border-emerald-200 p-5 flex flex-col gap-2">
                <p className="text-xs font-medium text-gray-500">NET PAYOUT</p>
                <p className="text-2xl font-semibold text-emerald-600">
                  ₹{stats.netPayout.toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-gray-500">
                  {loading ? 'Loading...' : 'Final income received'}
                </p>
              </div> */}
              <div className="bg-white rounded-2xl border border-emerald-200 p-5 flex flex-col gap-2">
                <p className="text-xs font-medium text-gray-500 flex items-center gap-2">
                  <img
                    src={netPayout.src}
                    alt="Net Payout"
                    className="w-10 h-10 shrink-0"
                  />
                  NET PAYOUT
                </p>

                <p className="text-2xl font-semibold text-[#10B981]">
                  ₹{stats.netPayout.toLocaleString('en-IN')}
                </p>

                <p className="text-[11px] text-gray-500">
                  {loading ? 'Loading...' : 'Final income to receive'}
                </p>
              </div>

              {/* <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-2">
                <p className="text-xs font-medium text-gray-500 flex items-center gap-2">
                  <img
                    src={netPayout.src}
                    alt="Settlement Amount"
                    className="w-10 h-10 shrink-0"
                  />
                  SETTLEMENT AMOUNT
                </p>
                <p className="text-2xl font-semibold text-[#7C3AED]">
                  ₹{stats.totalSettled.toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-gray-500">
                  {loading ? 'Loading...' : 'Total amount settled to date'}
                </p>
              </div> */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-2">
                <p className="text-xs font-medium text-gray-500 flex items-center gap-2">
                  <img
                    src={netPayout.src}
                    alt="Pending Settlement"
                    className="w-10 h-10 shrink-0"
                  />
                  SETTLEMENTS
                </p>
                <p className="text-2xl font-semibold text-[#10B981]">
                  ₹{stats.paidSettlement.toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-gray-500">
                  {loading ? 'Loading...' : 'Total amount paid to your account'}
                </p>
              </div>
            </div>

            {/* Middle charts */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {/* Sales Trend */}
              {/* <div className="bg-white rounded-2xl border border-gray-200 p-5 xl:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Sales Trend
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Monthly revenue growth over the last 6 months
                    </p>
                  </div>
                </div>
                <div className="mt-2 h-52 md:h-60">
                  <div className="w-full h-full rounded-xl bg-gradient-to-b from-indigo-50 to-white border border-dashed border-indigo-100 flex items-center justify-center">
                    <p className="text-xs text-gray-500">
                      Line chart placeholder – plug real chart library later
                    </p>
                  </div>
                </div>
              </div> */}

              {/* Sales Trend */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 xl:col-span-2">
                <div className="mb-4 flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Revenue Overview
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Monthly revenue growth over the last 6 months
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="border rounded-lg px-3 py-2 text-xs bg-white outline-none"
                    >
                      <option value="">All Months</option>
                      {availableMonths.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={handleDownloadPDF}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-3 py-2 text-xs font-medium text-white whitespace-nowrap"
                    >
                      <img
                        src={downLoad.src}
                        alt="download"
                        className="w-4 h-4 shrink-0"
                      />
                      Download PDF Report
                    </button>
                  </div>
                </div>

                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />

                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        tickFormatter={(v) => `₹${v / 1000}k`}
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip
                        formatter={(v) => [
                          `₹${v.toLocaleString('en-IN')}`,
                          'Revenue',
                        ]}
                      />

                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#7C3AED"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Revenue Distribution */}
              {/* <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  Revenue Distribution
                </p>
                <p className="text-[11px] text-gray-500 mb-4">
                  Income sources breakdown
                </p>
                <div className="flex-1 flex items-center justify-center">
                  <div className="relative w-40 h-40">
                    <div className="absolute inset-0 rounded-full bg-orange-100" />
                    <div className="absolute inset-2 rounded-full border-[10px] border-transparent border-t-indigo-500 border-r-orange-400 border-b-emerald-400" />
                    <div className="absolute inset-8 rounded-full bg-white" />
                  </div>
                </div>
                <div className="mt-4 space-y-1.5 text-xs">
                  {revenueDistribution.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between text-gray-600"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span>{item.label}</span>
                      </div>
                      <span className="font-medium text-gray-800">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div> */}
              {/* Revenue Distribution */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  Revenue Distribution
                </p>
                <p className="text-[11px] text-gray-500 mb-4">
                  Income sources breakdown
                </p>

                {/* Donut */}
                {/* <div className="flex-1 flex items-center justify-center">
                  <div className="relative w-40 h-40 rounded-full bg-gradient-to-r from-violet-500 via-violet-500 to-violet-500">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background:
                          'conic-gradient(#7C3AED 0% 55%, #F97316 55% 80%, #2563EB 80% 100%)',
                      }}
                    />
                    <div className="absolute inset-6 rounded-full bg-white" />
                  </div>
                </div> */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="relative w-40 h-40 rounded-full bg-gradient-to-r from-violet-500 via-violet-500 to-violet-500">
                    <div
                      className="absolute inset-0 rounded-full transition-[background] duration-700 ease-out"
                      style={{
                        background: (() => {
                          const rentalStop = parseFloat(
                            revenueDistribution[0]?.value || '0',
                          );
                          const serviceStop =
                            rentalStop +
                            parseFloat(revenueDistribution[1]?.value || '0');
                          return `conic-gradient(#7C3AED 0% ${rentalStop}%, #F97316 ${rentalStop}% ${serviceStop}%, #2563EB ${serviceStop}% 100%)`;
                        })(),
                      }}
                    />
                    <div className="absolute inset-6 rounded-full bg-white" />
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-4 space-y-2 text-xs">
                  {revenueDistribution.map((item, index) => {
                    const colors = [
                      'bg-violet-500',
                      'bg-orange-500',
                      'bg-blue-600',
                    ];

                    return (
                      <div
                        key={item.label}
                        className="flex items-center justify-between text-gray-600"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${colors[index]}`}
                          />
                          <span>{item.label}</span>
                        </div>

                        <span className="font-medium text-gray-900">
                          {item.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Live Feed */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-gray-900">
                    Live Feed
                  </p>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                  </span>
                </div>

                <p className="text-sm text-gray-500 ">Recent platform events</p>
              </div>

              {liveFeedLoading && (
                <p className="text-sm text-gray-500 text-center py-6">
                  Loading…
                </p>
              )}

              {!liveFeedLoading && liveFeed.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-6">
                  No recent activity yet.
                </p>
              )}

              {!liveFeedLoading && liveFeed.length > 0 && (
                <>
                  <div
                    className={
                      showAllFeed
                        ? 'grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent'
                        : 'grid grid-cols-1 md:grid-cols-2 gap-4'
                    }
                  >
                    {(showAllFeed ? liveFeed : liveFeed.slice(0, 4)).map(
                      (n, idx) => (
                        <div
                          key={n.id || idx}
                          onClick={() => handleFeedCardClick(n)}
                          role="button"
                          tabIndex={0}
                          className="rounded-xl border border-gray-100 bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <p className="text-sm font-semibold text-gray-900">
                            {n.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {n.detail}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-2">
                            {formatFeedTime(n.at)}
                          </p>
                        </div>
                      ),
                    )}
                  </div>

                  {liveFeed.length > 4 && (
                    <button
                      type="button"
                      onClick={() => setShowAllFeed((v) => !v)}
                      className="mt-4 w-full rounded-lg border border-orange-200 bg-white py-2.5 text-sm font-medium text-orange-500 hover:bg-orange-50"
                    >
                      {showAllFeed ? 'Show Less' : 'View All Activity'}
                    </button>
                  )}
                </>
              )}
            </div>

            <VendorNewOrderModal
              open={Boolean(orderModalId)}
              orderId={orderModalId}
              vendorIdStr={String(user?.id || user?._id || '')}
              getToken={getVendorToken}
              onClose={() => setOrderModalId(null)}
            />

            <VendorReturnRequestedModal
              open={Boolean(returnModal.orderId)}
              orderId={returnModal.orderId}
              productId={returnModal.productId}
              vendorIdStr={String(user?.id || user?._id || '')}
              getToken={getVendorToken}
              onClose={() => setReturnModal({ orderId: null, productId: null })}
            />

            <VendorNewServiceBookingModal
              open={Boolean(serviceBookingModalId)}
              bookingId={serviceBookingModalId}
              getToken={getVendorToken}
              onClose={() => setServiceBookingModalId(null)}
            />

            {/* Detailed Transaction Summary */}
            {/* <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    Detailed Transaction Summary
                  </p>
                  <p className="text-sm text-gray-500">
                    Recent payouts and settlement history
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs md:text-sm">
                  <thead>
                    <tr className="text-[#64748B] border-b border-gray-100">
                      <th className="py-3 text-left font-medium">DATE</th>
                      <th className="py-3 text-left font-medium">ORDER ID</th>
                      <th className="py-3 text-left font-medium">
                        GROSS AMOUNT
                      </th>
                      <th className="py-3 text-left font-medium">
                        COMMISSION (%)
                      </th>
                      <th className="py-3 text-left font-medium">
                        SETTLED AMOUNT
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {transactions.map((tx, idx) => (
                      <tr
                        key={tx.id}
                        className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      >
                        <td className="py-2.5 text-gray-600">
                          <div className="flex items-center gap-2">
                            <img
                              src={DateIcon.src}
                              alt="date"
                              className="w-3 h-3 shrink-0"
                            />
                            {tx.date}
                          </div>
                        </td>
                        <td className="py-2.5 text-[#0F172A] font-medium">
                          {tx.id}
                        </td>
                        <td className="py-2.5 text-left text-[#2563EB]">
                          {tx.gross}
                        </td>
                        <td className="py-2.5 text-left text-[#F97316]">
                          {tx.commission}
                        </td>
                        <td className="py-2.5 text-left text-emerald-600 font-medium">
                          {tx.settled}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div> */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default VendorDashboardPage;
