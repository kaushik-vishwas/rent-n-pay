// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import { Building2, Circle, MoreVertical, Plus, Search } from 'lucide-react';
// import API from '@/service/api';

// const getToken = () =>
//   typeof window !== 'undefined' ? localStorage.getItem('adminToken') || '' : '';

// const CitiesAnalytics = () => {
//   const [cities, setCities] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [query, setQuery] = useState('');
//   const [togglingKey, setTogglingKey] = useState('');

//   useEffect(() => {
//     const token = getToken();
//     if (!token) {
//       setError('Not authenticated.');
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     API.get('/admin/cities', {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     })
//       .then((res) => setCities(res.data.cities ?? []))
//       .catch((err) => setError(err.message))
//       .finally(() => setLoading(false));
//   }, []);

//   const stats = useMemo(() => {
//     const total = cities.length;
//     const active = cities.filter((c) => c.serviceEnabled).length;
//     const inactive = total - active;
//     return { total, active, inactive };
//   }, [cities]);

//   const stateWise = useMemo(() => {
//     const map = new Map();
//     cities.forEach((c) => {
//       const key = c.state || 'Unknown';
//       if (!map.has(key)) map.set(key, { state: key, total: 0, active: 0 });
//       const row = map.get(key);
//       row.total += 1;
//       if (c.serviceEnabled) row.active += 1;
//     });
//     return [...map.values()].sort(
//       (a, b) => b.active - a.active || a.state.localeCompare(b.state),
//     );
//   }, [cities]);

//   const filteredCities = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     if (!q) return cities;
//     return cities.filter(
//       (c) =>
//         c.city.toLowerCase().includes(q) ||
//         c.state.toLowerCase().includes(q) ||
//         c.country.toLowerCase().includes(q) ||
//         c.id.toLowerCase().includes(q),
//     );
//   }, [cities, query]);

//   const toggleCity = async (cityEntry) => {
//     const token = getToken();
//     if (!token || togglingKey) return;

//     const nextEnabled = !cityEntry.serviceEnabled;
//     setTogglingKey(cityEntry.cityKey);
//     setError(null);

//     setCities((prev) =>
//       prev.map((c) =>
//         c.cityKey === cityEntry.cityKey
//           ? { ...c, serviceEnabled: nextEnabled }
//           : c,
//       ),
//     );

//     try {
//       await API.patch(
//         `/admin/cities/${cityEntry.cityKey}/service-status`,
//         { serviceEnabled: nextEnabled },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );
//     } catch (err) {
//       setError(err.message || 'Failed to update city. Please try again.');

//       setCities((prev) =>
//         prev.map((c) =>
//           c.cityKey === cityEntry.cityKey
//             ? { ...c, serviceEnabled: !nextEnabled }
//             : c,
//         ),
//       );
//     } finally {
//       setTogglingKey('');
//     }
//   };

//   return (
//     <div className="min-h-full bg-[#f2f4f8] -m-3 sm:-m-4 md:-m-6 p-4 sm:p-6 md:p-8">
//       <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
//         {/* <div>
//           <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
//             Cities
//           </h1>
//           <p className="mt-1 text-sm sm:text-base text-gray-500">
//             Manage service availability across cities
//           </p>
//         </div> */}

//         {loading && <p className="text-sm text-gray-400">Loading cities…</p>}
//         {error && (
//           <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//             {error}
//           </div>
//         )}

//         {/* <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
//           <div className="relative w-full md:max-w-sm">
//             <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
//             <input
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               placeholder="Search by city or state..."
//               className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-400"
//             />
//           </div>
//         </div> */}

//         {/* Stat Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//           {[
//             {
//               title: 'Total Cities',
//               value: stats.total,
//               icon: Building2,
//               iconClass: 'text-blue-600 bg-blue-100',
//               borderClass: 'border-blue-100',
//               valueClass: 'text-blue-700',
//             },
//             {
//               title: 'Active Cities',
//               value: stats.active,
//               icon: Circle,
//               iconClass: 'text-emerald-600 bg-emerald-100',
//               borderClass: 'border-emerald-100',
//               valueClass: 'text-emerald-700',
//             },
//             {
//               title: 'Inactive Cities',
//               value: stats.inactive,
//               icon: Circle,
//               iconClass: 'text-red-600 bg-red-100',
//               borderClass: 'border-red-100',
//               valueClass: 'text-red-700',
//             },
//           ].map((card) => (
//             <div
//               key={card.title}
//               className={`rounded-2xl border ${card.borderClass} bg-white shadow-sm p-4`}
//             >
//               <div className="flex items-center gap-3">
//                 <div
//                   className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.iconClass}`}
//                 >
//                   <card.icon className="w-4 h-4" />
//                 </div>
//                 <p className="text-sm text-gray-500">{card.title}</p>
//               </div>
//               <p className={`mt-2 text-3xl font-bold ${card.valueClass}`}>
//                 {card.value}
//               </p>
//             </div>
//           ))}
//         </div>

//         {/* State-wise Distribution */}
//         <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm">
//           <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
//             <h2 className="text-xl font-semibold text-slate-900">
//               State-wise Distribution
//             </h2>
//             <div className="relative w-full md:max-w-sm">
//               <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
//               <input
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 placeholder="Search by city or state..."
//                 className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-400"
//               />
//             </div>
//           </div>
//           <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//             {stateWise.slice(0, 6).map((s) => (
//               <div
//                 key={s.state}
//                 className="rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-3"
//               >
//                 <p className="text-sm text-gray-700">{s.state}</p>
//                 <p className="mt-1 text-xl font-semibold text-blue-700">
//                   {s.active}{' '}
//                   <span className="text-xs font-normal text-gray-500">
//                     active
//                   </span>
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Table */}
//         <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[760px] text-sm">
//               {/* <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
//                 <tr>
//                   <th className="text-left px-4 py-3">City ID</th>
//                   <th className="text-left px-4 py-3">City Name</th>
//                   <th className="text-left px-4 py-3">State</th>
//                   <th className="text-left px-4 py-3">Country</th>
//                   <th className="text-left px-4 py-3">Status</th>
//                   <th className="text-left px-4 py-3">Actions</th>
//                 </tr>
//               </thead> */}
//               <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
//                 <tr>
//                   <th className="text-center px-4 py-3">City ID</th>
//                   <th className="text-center px-4 py-3">City Name</th>
//                   <th className="text-center px-4 py-3">State</th>
//                   <th className="text-center px-4 py-3">Country</th>
//                   <th className="text-center px-4 py-3">Status</th>
//                   <th className="text-center px-4 py-3">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredCities.map((c) => {
//                   const isToggling = togglingKey === c.cityKey;
//                   return (
//                     // <tr key={c.cityKey} className="border-t border-gray-100">
//                     //   <td className="px-4 py-3 font-medium text-gray-700">
//                     //     {c.id}
//                     //   </td>
//                     //   <td className="px-4 py-3 text-gray-900">{c.city}</td>
//                     //   <td className="px-4 py-3 text-gray-600">
//                     //     {c.state || '—'}
//                     //   </td>
//                     //   <td className="px-4 py-3 text-gray-600">{c.country}</td>
//                     //   <td className="px-4 py-3">
//                     //     <button
//                     //       type="button"
//                     //       onClick={() => toggleCity(c)}
//                     //       disabled={isToggling}
//                     //       className={`inline-flex items-center gap-2 rounded-full px-2 py-1  disabled:opacity-60 disabled:cursor-wait ${
//                     //         c.serviceEnabled
//                     //           ? 'bg-white  text-blue-700'
//                     //           : 'bg-white  text-gray-500'
//                     //       }`}
//                     //     >
//                     //       <span
//                     //         className={`w-8 h-4 rounded-full relative ${c.serviceEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
//                     //       >
//                     //         <span
//                     //           className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${c.serviceEnabled ? 'left-4' : 'left-0.5'}`}
//                     //         />
//                     //       </span>
//                     //       <span
//                     //         className={`text-xs px-2 py-0.5 rounded-full ${c.serviceEnabled ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}
//                     //       >
//                     //         {isToggling
//                     //           ? 'Updating…'
//                     //           : c.serviceEnabled
//                     //             ? 'Active'
//                     //             : 'Inactive'}
//                     //       </span>
//                     //     </button>
//                     //   </td>
//                     //   <td className="px-4 py-3">
//                     //     <button
//                     //       type="button"
//                     //       className="p-1 rounded hover:bg-gray-100 text-gray-500"
//                     //     >
//                     //       <MoreVertical className="w-4 h-4" />
//                     //     </button>
//                     //   </td>
//                     // </tr>

//                     <tr key={c.cityKey} className="border-t border-gray-100">
//                       <td className="px-4 py-3 text-center font-medium text-gray-700">
//                         {c.id}
//                       </td>
//                       <td className="px-4 py-3 text-center text-gray-900">
//                         {c.city}
//                       </td>
//                       <td className="px-4 py-3 text-center text-gray-600">
//                         {c.state || '—'}
//                       </td>
//                       <td className="px-4 py-3 text-center text-gray-600">
//                         {c.country}
//                       </td>
//                       <td className="px-4 py-3 text-center">
//                         <button
//                           type="button"
//                           onClick={() => toggleCity(c)}
//                           disabled={isToggling}
//                           className={`inline-flex items-center gap-2 rounded-full px-2 py-1  disabled:opacity-60 disabled:cursor-wait ${
//                             c.serviceEnabled
//                               ? 'bg-white  text-blue-700'
//                               : 'bg-white  text-gray-500'
//                           }`}
//                         >
//                           <span
//                             className={`w-8 h-4 rounded-full relative ${c.serviceEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
//                           >
//                             <span
//                               className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${c.serviceEnabled ? 'left-4' : 'left-0.5'}`}
//                             />
//                           </span>
//                           <span
//                             className={`text-xs px-2 py-0.5 rounded-full ${c.serviceEnabled ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}
//                           >
//                             {isToggling
//                               ? 'Updating…'
//                               : c.serviceEnabled
//                                 ? 'Active'
//                                 : 'Inactive'}
//                           </span>
//                         </button>
//                       </td>
//                       <td className="px-4 py-3 text-center">
//                         <button
//                           type="button"
//                           className="p-1 rounded hover:bg-gray-100 text-gray-500"
//                         >
//                           <MoreVertical className="w-4 h-4" />
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//           {!loading && filteredCities.length === 0 && (
//             <div className="px-4 py-8 text-center text-sm text-gray-500 border-t border-gray-100">
//               No cities found for your search.
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CitiesAnalytics;

'use client';

import { useEffect, useMemo, useState } from 'react';
import { Building2, Circle, MoreVertical, Plus, Search } from 'lucide-react';
import API from '@/service/api';

const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('adminToken') || '' : '';

const CitiesAnalytics = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [togglingKey, setTogglingKey] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError('Not authenticated.');
      setLoading(false);
      return;
    }

    setLoading(true);
    API.get('/admin/cities', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => setCities(res.data.cities ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const total = cities.length;
    const active = cities.filter((c) => c.serviceEnabled).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [cities]);

  const stateWise = useMemo(() => {
    const map = new Map();
    cities.forEach((c) => {
      const key = c.state || 'Unknown';
      if (!map.has(key)) map.set(key, { state: key, total: 0, active: 0 });
      const row = map.get(key);
      row.total += 1;
      if (c.serviceEnabled) row.active += 1;
    });
    return [...map.values()].sort(
      (a, b) => b.active - a.active || a.state.localeCompare(b.state),
    );
  }, [cities]);

  const filteredCities = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter(
      (c) =>
        c.city.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q),
    );
  }, [cities, query]);

  const toggleCity = async (cityEntry) => {
    const token = getToken();
    if (!token || togglingKey) return;

    const nextEnabled = !cityEntry.serviceEnabled;
    setTogglingKey(cityEntry.cityKey);
    setError(null);

    setCities((prev) =>
      prev.map((c) =>
        c.cityKey === cityEntry.cityKey
          ? { ...c, serviceEnabled: nextEnabled }
          : c,
      ),
    );

    try {
      await API.patch(
        `/admin/cities/${cityEntry.cityKey}/service-status`,
        { serviceEnabled: nextEnabled },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (err) {
      setError(err.message || 'Failed to update city. Please try again.');

      setCities((prev) =>
        prev.map((c) =>
          c.cityKey === cityEntry.cityKey
            ? { ...c, serviceEnabled: !nextEnabled }
            : c,
        ),
      );
    } finally {
      setTogglingKey('');
    }
  };

  return (
    <div className="min-h-full bg-[#f2f4f8] -m-3 sm:-m-4 md:-m-6 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
        {/* <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Cities
          </h1>
          <p className="mt-1 text-sm sm:text-base text-gray-500">
            Manage service availability across cities
          </p>
        </div> */}

        {loading && <p className="text-sm text-gray-400">Loading cities…</p>}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by city or state..."
              className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-400"
            />
          </div>
        </div> */}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              title: 'Total Cities',
              value: stats.total,
              icon: Building2,
              iconClass: 'text-blue-600 bg-blue-100',
              borderClass: 'border-blue-100',
              valueClass: 'text-blue-700',
            },
            {
              title: 'Active Cities',
              value: stats.active,
              icon: Circle,
              iconClass: 'text-emerald-600 bg-emerald-100',
              borderClass: 'border-emerald-100',
              valueClass: 'text-emerald-700',
            },
            {
              title: 'Inactive Cities',
              value: stats.inactive,
              icon: Circle,
              iconClass: 'text-red-600 bg-red-100',
              borderClass: 'border-red-100',
              valueClass: 'text-red-700',
            },
          ].map((card) => (
            <div
              key={card.title}
              className={`rounded-2xl border ${card.borderClass} bg-white shadow-sm p-4`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.iconClass}`}
                >
                  <card.icon className="w-4 h-4" />
                </div>
                <p className="text-sm text-gray-500">{card.title}</p>
              </div>
              <p className={`mt-2 text-3xl font-bold ${card.valueClass}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* State-wise Distribution */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              State-wise Distribution
            </h2>
            <div className="relative w-full md:max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by city or state..."
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-400"
              />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stateWise.slice(0, 6).map((s) => (
              <div
                key={s.state}
                className="rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-3"
              >
                <p className="text-sm text-gray-700">{s.state}</p>
                <p className="mt-1 text-xl font-semibold text-blue-700">
                  {s.active}{' '}
                  <span className="text-xs font-normal text-gray-500">
                    active
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full min-w-[760px] text-sm relative">
              {/* <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">City ID</th>
                  <th className="text-left px-4 py-3">City Name</th>
                  <th className="text-left px-4 py-3">State</th>
                  <th className="text-left px-4 py-3">Country</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead> */}
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-center px-4 py-3">City ID</th>
                  <th className="text-center px-4 py-3">City Name</th>
                  <th className="text-center px-4 py-3">State</th>
                  <th className="text-center px-4 py-3">Country</th>
                  <th className="text-center px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCities.map((c) => {
                  const isToggling = togglingKey === c.cityKey;
                  return (
                    // <tr key={c.cityKey} className="border-t border-gray-100">
                    //   <td className="px-4 py-3 font-medium text-gray-700">
                    //     {c.id}
                    //   </td>
                    //   <td className="px-4 py-3 text-gray-900">{c.city}</td>
                    //   <td className="px-4 py-3 text-gray-600">
                    //     {c.state || '—'}
                    //   </td>
                    //   <td className="px-4 py-3 text-gray-600">{c.country}</td>
                    //   <td className="px-4 py-3">
                    //     <button
                    //       type="button"
                    //       onClick={() => toggleCity(c)}
                    //       disabled={isToggling}
                    //       className={`inline-flex items-center gap-2 rounded-full px-2 py-1  disabled:opacity-60 disabled:cursor-wait ${
                    //         c.serviceEnabled
                    //           ? 'bg-white  text-blue-700'
                    //           : 'bg-white  text-gray-500'
                    //       }`}
                    //     >
                    //       <span
                    //         className={`w-8 h-4 rounded-full relative ${c.serviceEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
                    //       >
                    //         <span
                    //           className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${c.serviceEnabled ? 'left-4' : 'left-0.5'}`}
                    //         />
                    //       </span>
                    //       <span
                    //         className={`text-xs px-2 py-0.5 rounded-full ${c.serviceEnabled ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}
                    //       >
                    //         {isToggling
                    //           ? 'Updating…'
                    //           : c.serviceEnabled
                    //             ? 'Active'
                    //             : 'Inactive'}
                    //       </span>
                    //     </button>
                    //   </td>
                    //   <td className="px-4 py-3">
                    //     <button
                    //       type="button"
                    //       className="p-1 rounded hover:bg-gray-100 text-gray-500"
                    //     >
                    //       <MoreVertical className="w-4 h-4" />
                    //     </button>
                    //   </td>
                    // </tr>

                    <tr key={c.cityKey} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-center font-medium text-gray-700">
                        {c.id}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-900">
                        {c.city}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {c.state || '—'}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {c.country}
                      </td>
                      {/* <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleCity(c)}
                          disabled={isToggling}
                          className={`inline-flex items-center gap-2 rounded-full px-2 py-1  disabled:opacity-60 disabled:cursor-wait ${
                            c.serviceEnabled
                              ? 'bg-white  text-blue-700'
                              : 'bg-white  text-gray-500'
                          }`}
                        >
                          <span
                            className={`w-8 h-4 rounded-full relative ${c.serviceEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
                          >
                            <span
                              className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${c.serviceEnabled ? 'left-4' : 'left-0.5'}`}
                            />
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${c.serviceEnabled ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}
                          >
                            {isToggling
                              ? 'Updating…'
                              : c.serviceEnabled
                                ? 'Active'
                                : 'Inactive'}
                          </span>
                        </button>
                      </td> */}
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleCity(c)}
                          disabled={isToggling}
                          className={`inline-flex items-center gap-2 rounded-full px-2 py-1 disabled:opacity-60 disabled:cursor-wait ${
                            c.serviceEnabled
                              ? 'bg-white text-blue-700'
                              : 'bg-white text-gray-500'
                          }`}
                        >
                          <span
                            className={`w-8 h-4 rounded-full relative ${c.serviceEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
                          >
                            <span
                              className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${c.serviceEnabled ? 'left-4' : 'left-0.5'}`}
                            />
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${c.serviceEnabled ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}
                          >
                            {isToggling
                              ? 'Updating…'
                              : c.serviceEnabled
                                ? 'Active'
                                : 'Inactive'}
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!loading && filteredCities.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-500 border-t border-gray-100">
              No cities found for your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CitiesAnalytics;
