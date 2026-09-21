// 'use client';

// import React, { useState, useEffect, useRef } from 'react';
// import {
//   CalendarDays,
//   ChevronDown,
//   Download,
//   Info,
//   Shield,
// } from 'lucide-react';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import { apiGetLifelineDistribution } from '@/service/api';

// const colorMap = {
//   '36 Months': 'bg-fuchsia-500',
//   '33 Months': 'bg-amber-500',
//   '30 Months': 'bg-lime-500',
//   '27 Months': 'bg-cyan-500',
//   '24 Months': 'bg-red-500',
//   '21 Months': 'bg-indigo-500',
//   '18 Months': 'bg-teal-500',
//   '15 Months': 'bg-pink-500',
//   Annual: 'bg-blue-600',
//   '09 Months': 'bg-green-500',
//   '06 Months': 'bg-yellow-400',
//   '03 Months': 'bg-orange-500',
//   Daily: 'bg-purple-500',
// };

// const textColorMap = {
//   '36 Months': 'text-fuchsia-500',
//   '33 Months': 'text-amber-500',
//   '30 Months': 'text-lime-500',
//   '27 Months': 'text-cyan-500',
//   '24 Months': 'text-red-500',
//   '21 Months': 'text-indigo-500',
//   '18 Months': 'text-teal-500',
//   '15 Months': 'text-pink-500',
//   Annual: 'text-blue-600',
//   '09 Months': 'text-green-500',
//   '06 Months': 'text-yellow-500',
//   '03 Months': 'text-orange-500',
//   Daily: 'text-purple-500',
// };

// const LifeLine = () => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedRange, setSelectedRange] = useState(30);
//   const [showFilterMenu, setShowFilterMenu] = useState(false);
//   const filterRef = useRef(null);

//   const rangeOptions = [
//     { label: 'Last 7 Days', value: 7 },
//     { label: 'Last 30 Days', value: 30 },
//     { label: 'Last 90 Days', value: 90 },
//     { label: 'Last 12 Months', value: 365 },
//   ];

//   useEffect(() => {
//     const token = localStorage.getItem('adminToken');
//     setLoading(true);

//     apiGetLifelineDistribution(token, selectedRange)
//       .then((res) => {
//         const formatted = res.data.data.map((item) => ({
//           label: item.tenure,
//           value: item.percentage,
//           color: colorMap[item.tenure] || 'bg-gray-400',
//           textColor: textColorMap[item.tenure] || 'text-gray-500',
//         }));
//         setData(formatted);
//         setError(null);
//       })
//       .catch((err) => {
//         console.error('Failed to load lifeline data:', err);
//         setError('Failed to load tenure data');
//       })
//       .finally(() => setLoading(false));
//   }, [selectedRange]);

//   // Close the filter dropdown on outside click
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (filterRef.current && !filterRef.current.contains(e.target)) {
//         setShowFilterMenu(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const handleExportPDF = () => {
//     const doc = new jsPDF();

//     doc.setFontSize(16);
//     doc.text('Life Line - User Tenure Distribution', 14, 18);

//     doc.setFontSize(10);
//     const rangeLabel =
//       rangeOptions.find((r) => r.value === selectedRange)?.label || '';
//     doc.text(`Filter: ${rangeLabel}`, 14, 26);
//     doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

//     autoTable(doc, {
//       startY: 40,
//       head: [['Tenure', 'Percentage']],
//       body: data.map((item) => [item.label, `${item.value}%`]),
//     });

//     doc.save(`lifeline-distribution-${selectedRange}d.pdf`);
//   };

//   if (loading) {
//     return (
//       <div className="p-4 md:p-6 bg-[#f8f8f8] min-h-screen flex items-center justify-center">
//         <p className="text-gray-500">Loading Life Line data...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-4 md:p-6 bg-[#f8f8f8] min-h-screen flex items-center justify-center">
//         <p className="text-red-500">{error}</p>
//       </div>
//     );
//   }

//   const topTenure = data.length
//     ? data.reduce((max, item) => (item.value > max.value ? item : max), data[0])
//     : null;

//   return (
//     <div className="p-4 md:p-6 bg-[#f8f8f8] min-h-screen">
//       <div className="bg-white rounded-2xl shadow-sm border p-4 md:p-6 mt-0">
//         {/* Header */}

//         {/* <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

//           <div className="flex items-center gap-2  px-4 py-2 w-fit">
//             <div className="w-9 h-9 rounded-lg bg-green-100 border border-green-300 flex items-center justify-center">
//               <Shield className="w-5 h-5 text-green-600" />
//             </div>

//             <div>
//               <p className="text-green-600 font-semibold text-sm">
//                 Rentnpay Care
//               </p>

//               <p className="text-xs font-semibold text-gray-500">Protected</p>
//             </div>
//           </div>
//         </div> */}

//         {/* Buttons */}

//         <div className="flex flex-wrap items-center gap-2 mt-1">
//           <div className="relative h-[42px]" ref={filterRef}>
//             <button
//               onClick={() => setShowFilterMenu((prev) => !prev)}
//               className="flex items-center gap-2 border rounded-lg px-4 h-[42px] text-sm hover:bg-gray-100"
//             >
//               <CalendarDays size={18} />
//               {rangeOptions.find((r) => r.value === selectedRange)?.label}
//               <ChevronDown size={16} />
//             </button>

//             {showFilterMenu && (
//               <div className="absolute z-10 mt-2 w-44 bg-white border rounded-lg shadow-md overflow-hidden">
//                 {rangeOptions.map((option) => (
//                   <button
//                     key={option.value}
//                     onClick={() => {
//                       setSelectedRange(option.value);
//                       setShowFilterMenu(false);
//                     }}
//                     className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
//                       option.value === selectedRange
//                         ? 'bg-gray-100 font-semibold'
//                         : ''
//                     }`}
//                   >
//                     {option.label}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           <button
//             onClick={handleExportPDF}
//             disabled={!data.length}
//             className="flex items-center gap-2 bg-orange-500 text-white rounded-lg px-4 h-[42px] text-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <Download size={18} />
//             Export Data
//           </button>

//           <div className="flex items-center gap-2 px-2 h-[42px] w-fit sm:ml-auto">
//             <div className="w-9 h-9 rounded-lg bg-green-100 border border-green-300 flex items-center justify-center">
//               <Shield className="w-5 h-5 text-green-600" />
//             </div>

//             <div>
//               <p className="text-green-600 font-semibold text-sm">
//                 Rentnpay Care
//               </p>

//               <p className="text-xs font-semibold text-gray-500">Protected</p>
//             </div>
//           </div>
//         </div>
//         {/* Graph */}

//         <div className="mt-10 space-y-6">
//           {data.map((item) => (
//             <div
//               key={item.label}
//               className="grid grid-cols-12 gap-2 items-center"
//             >
//               <div className="col-span-3 md:col-span-2 font-semibold text-gray-700 text-sm">
//                 {item.label}
//               </div>

//               <div className="col-span-9 md:col-span-10 h-10 bg-gray-100 rounded-lg relative flex items-center">
//                 <div
//                   className={`${item.color} h-full rounded-lg`}
//                   style={{
//                     width: `${item.value}%`,
//                   }}
//                 />

//                 <span className={`ml-3 font-semibold ${item.textColor}`}>
//                   {item.value}%
//                 </span>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Scale */}
//         <div className="mt-8 grid grid-cols-12 gap-2 px-2">
//           <div className="col-span-3 md:col-span-2"></div>
//           <div className="col-span-9 md:col-span-10 font-semibold flex justify-between text-xs text-gray-600">
//             <span>0%</span>
//             <span>25%</span>
//             <span>50%</span>
//             <span>75%</span>
//             <span>100%</span>
//           </div>
//         </div>

//         {/* Legend */}
//         {/* <div className="flex justify-center mt-8">
//           <div className="flex items-center gap-2 text-sm text-gray-600">
//             <div className="w-3 h-3 rounded-full bg-gray-800"></div>
//             Percentage
//           </div>
//         </div> */}

//         {/* Insight Box */}

//         <div>
//           {topTenure && (
//             <div className="mt-8 border-2 border-[#BEDBFF] bg-blue-50 rounded-xl p-5 flex gap-3">
//               <Info size={22} className="text-[#007BFF] mt-1 flex-shrink-0" />

//               <div>
//                 <h4 className="font-semibold text-black">
//                   User Commitment Insights
//                 </h4>

//                 <p className="text-sm text-[#64748B] mt-2">
//                   <span className="font-semibold text-black">
//                     {topTenure.value}%
//                   </span>{' '}
//                   of your users have committed to{' '}
//                   <span className="font-semibold text-black">
//                     {topTenure.label}
//                   </span>{' '}
//                   plans, indicating strong customer loyalty and steady recurring
//                   revenue. Users with longer tenure periods have a significantly
//                   higher lifetime value.
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LifeLine;

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  CalendarDays,
  ChevronDown,
  Download,
  Info,
  Shield,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { apiGetLifelineDistribution } from '@/service/api';

const colorMap = {
  '36 Months': 'bg-fuchsia-500',
  '33 Months': 'bg-amber-500',
  '30 Months': 'bg-lime-500',
  '27 Months': 'bg-cyan-500',
  '24 Months': 'bg-red-500',
  '21 Months': 'bg-indigo-500',
  '18 Months': 'bg-teal-500',
  '15 Months': 'bg-pink-500',
  Annual: 'bg-blue-600',
  '09 Months': 'bg-green-500',
  '06 Months': 'bg-yellow-400',
  '03 Months': 'bg-orange-500',
  Daily: 'bg-purple-500',
  Other: 'bg-gray-500',
};

const textColorMap = {
  '36 Months': 'text-fuchsia-500',
  '33 Months': 'text-amber-500',
  '30 Months': 'text-lime-500',
  '27 Months': 'text-cyan-500',
  '24 Months': 'text-red-500',
  '21 Months': 'text-indigo-500',
  '18 Months': 'text-teal-500',
  '15 Months': 'text-pink-500',
  Annual: 'text-blue-600',
  '09 Months': 'text-green-500',
  '06 Months': 'text-yellow-500',
  '03 Months': 'text-orange-500',
  Daily: 'text-purple-500',
  Other: 'text-gray-500',
};

const LifeLine = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRange, setSelectedRange] = useState(30);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterRef = useRef(null);

  const rangeOptions = [
    { label: 'Last 7 Days', value: 7 },
    { label: 'Last 30 Days', value: 30 },
    { label: 'Last 90 Days', value: 90 },
  ];

  // useEffect(() => {
  //   const token = localStorage.getItem('adminToken');
  //   setLoading(true);

  //   console.log('[LifeLine] Fetching distribution for range:', selectedRange);
  //   apiGetLifelineDistribution(token, selectedRange)
  //     .then((res) => {
  //       const formatted = res.data.data.map((item) => ({
  //         label: item.tenure,
  //         value: item.percentage,
  //         color: colorMap[item.tenure] || 'bg-gray-400',
  //         textColor: textColorMap[item.tenure] || 'text-gray-500',
  //       }));
  //       setData(formatted);
  //       setError(null);
  //     })
  //     .catch((err) => {
  //       console.error('Failed to load lifeline data:', err);
  //       setError('Failed to load tenure data');
  //     })
  //     .finally(() => setLoading(false));
  // }, [selectedRange]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    let isActive = true;
    setLoading(true);

    apiGetLifelineDistribution(token, selectedRange)
      .then((res) => {
        if (!isActive) return;
        const formatted = res.data.data.map((item) => ({
          label: item.tenure,
          value: item.percentage,
          color: colorMap[item.tenure] || 'bg-gray-400',
          textColor: textColorMap[item.tenure] || 'text-gray-500',
        }));
        setData(formatted);
        setError(null);
      })
      .catch((err) => {
        if (!isActive) return;
        console.error('Failed to load lifeline data:', err);
        setError('Failed to load tenure data');
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [selectedRange]);

  // Close the filter dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Life Line - User Tenure Distribution', 14, 18);

    doc.setFontSize(10);
    const rangeLabel =
      rangeOptions.find((r) => r.value === selectedRange)?.label || '';
    doc.text(`Filter: ${rangeLabel}`, 14, 26);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

    autoTable(doc, {
      startY: 40,
      head: [['Tenure', 'Percentage']],
      body: data.map((item) => [item.label, `${item.value}%`]),
    });

    doc.save(`lifeline-distribution-${selectedRange}d.pdf`);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 bg-[#f8f8f8] min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading Life Line data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 bg-[#f8f8f8] min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const topTenure = data.length
    ? data.reduce((max, item) => (item.value > max.value ? item : max), data[0])
    : null;

  return (
    <div className=" bg-[#f8f8f8] min-h-screen">
      <div className="bg-white rounded-2xl shadow-sm border p-4 md:p-6 mt-0">
        {/* Header */}

        {/* <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
       
          <div className="flex items-center gap-2  px-4 py-2 w-fit">
            <div className="w-9 h-9 rounded-lg bg-green-100 border border-green-300 flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>

            <div>
              <p className="text-green-600 font-semibold text-sm">
                Rentnpay Care
              </p>

              <p className="text-xs font-semibold text-gray-500">Protected</p>
            </div>
          </div>
        </div> */}

        {/* Buttons */}

        <div className="flex flex-wrap items-center gap-2 mt-0">
          <div className="relative h-[42px]" ref={filterRef}>
            <button
              onClick={() => setShowFilterMenu((prev) => !prev)}
              className="flex items-center gap-2 border rounded-lg px-4 h-[42px] text-sm hover:bg-gray-100"
            >
              <CalendarDays size={18} />
              {rangeOptions.find((r) => r.value === selectedRange)?.label}
              <ChevronDown size={16} />
            </button>

            {showFilterMenu && (
              <div className="absolute z-10 mt-2 w-44 bg-white border rounded-lg shadow-md overflow-hidden">
                {rangeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSelectedRange(option.value);
                      setShowFilterMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      option.value === selectedRange
                        ? 'bg-gray-100 font-semibold'
                        : ''
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleExportPDF}
            disabled={!data.length}
            className="flex items-center gap-2 bg-orange-500 text-white rounded-lg px-4 h-[42px] text-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            Export Data
          </button>

          <div className="flex items-center gap-2 px-2 h-[42px] w-fit sm:ml-auto">
            <div className="w-9 h-9 rounded-lg bg-green-100 border border-green-300 flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>

            <div>
              <p className="text-green-600 font-semibold text-sm">
                Rentnpay Care
              </p>

              <p className="text-xs font-semibold text-gray-500">Protected</p>
            </div>
          </div>
        </div>
        {/* Graph */}

        <div className="mt-10 space-y-6">
          {data.map((item) => (
            <div
              key={item.label}
              className="grid grid-cols-12 gap-2 items-center"
            >
              <div className="col-span-3 md:col-span-2 font-semibold text-gray-700 text-sm">
                {item.label}
              </div>

              <div className="col-span-9 md:col-span-10 h-10 bg-gray-100 rounded-lg relative flex items-center">
                <div
                  className={`${item.color} h-full rounded-lg`}
                  style={{
                    width: `${item.value}%`,
                  }}
                />

                <span className={`ml-3 font-semibold ${item.textColor}`}>
                  {item.value}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Scale */}
        <div className="mt-8 grid grid-cols-12 gap-2 px-2">
          <div className="col-span-3 md:col-span-2"></div>
          <div className="col-span-9 md:col-span-10 font-semibold flex justify-between text-xs text-gray-600">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Legend */}
        {/* <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-3 h-3 rounded-full bg-gray-800"></div>
            Percentage
          </div>
        </div> */}

        {/* Insight Box */}

        <div>
          {topTenure && (
            <div className="mt-8 border-2 border-[#BEDBFF] bg-blue-50 rounded-xl p-5 flex gap-3">
              <Info size={22} className="text-[#007BFF] mt-1 flex-shrink-0" />

              <div>
                <h4 className="font-semibold text-black">
                  User Commitment Insights
                </h4>

                <p className="text-sm text-[#64748B] mt-2">
                  <span className="font-semibold text-black">
                    {topTenure.value}%
                  </span>{' '}
                  of your users have committed to{' '}
                  <span className="font-semibold text-black">
                    {topTenure.label}
                  </span>{' '}
                  plans, indicating strong customer loyalty and steady recurring
                  revenue. Users with longer tenure periods have a significantly
                  higher lifetime value.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LifeLine;
