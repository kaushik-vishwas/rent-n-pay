// import { useMemo, useState, useEffect, useRef } from 'react';
// import dynamic from 'next/dynamic';
// import { MapPin, Store, TrendingUp, Warehouse, Truck } from 'lucide-react';
// import {
//   apiGetAllOrders,
//   apiGetAllAdminProducts,
//   apiGetAdminStores,
// } from '@/service/api';
// // ── Leaflet dynamic imports (SSR-safe) ────────────────────────────────────────
// const MapContainer = dynamic(
//   () => import('react-leaflet').then((m) => m.MapContainer),
//   { ssr: false },
// );
// const TileLayer = dynamic(
//   () => import('react-leaflet').then((m) => m.TileLayer),
//   { ssr: false },
// );
// const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), {
//   ssr: false,
// });
// const Tooltip = dynamic(() => import('react-leaflet').then((m) => m.Tooltip), {
//   ssr: false,
// });
// const CircleMarker = dynamic(
//   () => import('react-leaflet').then((m) => m.CircleMarker),
//   { ssr: false },
// );

// const API_BASE =
//   process.env.NEXT_PUBLIC_API_URL || 'https://backend.delicod.com/api';
// const getToken = () =>
//   typeof window !== 'undefined' ? localStorage.getItem('adminToken') || '' : '';

// // ── Map recenter helper ───────────────────────────────────────────────────────
// function MapRecenter({ center, zoom }) {
//   const { useMap } = require('react-leaflet');
//   const map = useMap();
//   const lastCenterRef = useRef(null);

//   useEffect(() => {
//     map.invalidateSize();

//     const last = lastCenterRef.current;
//     const unchanged =
//       last &&
//       Math.abs(last[0] - center[0]) < 0.0001 &&
//       Math.abs(last[1] - center[1]) < 0.0001 &&
//       last[2] === zoom;

//     // Skip setView if nothing actually changed — calling it on every
//     // render is what fights the user's own drag/zoom.
//     if (!unchanged) {
//       map.setView(center, zoom, { animate: true });
//       lastCenterRef.current = [center[0], center[1], zoom];
//     }
//   }, [center, zoom, map]);

//   useEffect(() => {
//     const id = setTimeout(() => map.invalidateSize(), 250);
//     return () => clearTimeout(id);
//   }, [map]);

//   return null;
// }
// const MapRecenterDynamic = dynamic(() => Promise.resolve(MapRecenter), {
//   ssr: false,
// });

// // ── Ping icon factory ─────────────────────────────────────────────────────────
// function makePingIcon(L, status) {
//   const color =
//     status === 'high' ? '#EF4444' : status === 'medium' ? '#F97316' : '#3B82F6';

//   const html = `
//     <div style="position:relative;width:24px;height:24px;">
//       <div style="
//         position:absolute;inset:0;border-radius:50%;
//         background:${color};opacity:0.25;
//         animation:ping 1.8s cubic-bezier(0,0,0.2,1) infinite;
//       "></div>
//       <div style="
//         position:absolute;top:5px;left:5px;width:14px;height:14px;
//         border-radius:50%;background:${color};
//         border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);
//       "></div>
//     </div>`;

//   return L.divIcon({
//     html,
//     className: '',
//     iconSize: [24, 24],
//     iconAnchor: [12, 12],
//   });
// }

// // ── Order count helpers (same logic as LiveOrderActivitySection) ──────────────
// function buildCityOrderCounts(orders, products, stores) {
//   const productVendorMap = new Map();
//   (products || []).forEach((p) => {
//     productVendorMap.set(
//       String(p._id),
//       String(p.vendorId?._id || p.vendorId || ''),
//     );
//   });

//   const vendorCityMap = new Map();
//   (stores || []).forEach((s) => {
//     if (s?.vendorObjectId && !vendorCityMap.has(String(s.vendorObjectId))) {
//       vendorCityMap.set(
//         String(s.vendorObjectId),
//         String(s.city || '')
//           .trim()
//           .toLowerCase(),
//       );
//     }
//   });

//   const counts = new Map();
//   (orders || []).forEach((order) => {
//     (order.products || []).forEach((line) => {
//       const productId = String(line?.product?._id || line?._id || '');
//       const vendorId = productVendorMap.get(productId);
//       if (!vendorId) return;
//       const cityKey = vendorCityMap.get(vendorId);
//       if (!cityKey) return;
//       counts.set(cityKey, (counts.get(cityKey) || 0) + 1);
//     });
//   });

//   return counts;
// }

// function buildOrderLocationPoints(orders) {
//   const points = [];
//   (orders || []).forEach((order) => {
//     const lat = Number(order?.orderLocation?.lat);
//     const lng = Number(order?.orderLocation?.lng);
//     if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
//     points.push({
//       id: order._id,
//       lat,
//       lng,
//       label: order?.orderLocation?.label || '',
//     });
//   });
//   return points;
// }

// function getStatus(orders, maxOrders) {
//   if (maxOrders === 0) return 'low';
//   const ratio = orders / maxOrders;
//   if (ratio >= 0.7) return 'high';
//   if (ratio >= 0.35) return 'medium';
//   return 'low';
// }

// // ── Live delivery helpers (for "Live Deliveries" map filter) ─────────────────
// function isLiveOrderStatus(status) {
//   const s = String(status || '').toLowerCase();
//   return Boolean(s) && !['delivered', 'cancelled', 'completed'].includes(s);
// }

// function buildLiveCityKeys(orders, products, stores) {
//   const productVendorMap = new Map();
//   (products || []).forEach((p) => {
//     productVendorMap.set(
//       String(p._id),
//       String(p.vendorId?._id || p.vendorId || ''),
//     );
//   });

//   const vendorCityMap = new Map();
//   (stores || []).forEach((s) => {
//     if (s?.vendorObjectId && !vendorCityMap.has(String(s.vendorObjectId))) {
//       vendorCityMap.set(
//         String(s.vendorObjectId),
//         String(s.city || '')
//           .trim()
//           .toLowerCase(),
//       );
//     }
//   });

//   const liveKeys = new Set();
//   (orders || []).forEach((order) => {
//     if (!isLiveOrderStatus(order.status)) return;
//     (order.products || []).forEach((line) => {
//       const productId = String(line?.product?._id || line?._id || '');
//       const vendorId = productVendorMap.get(productId);
//       if (!vendorId) return;
//       const cityKey = vendorCityMap.get(vendorId);
//       if (!cityKey) return;
//       liveKeys.add(cityKey);
//     });
//   });
//   return liveKeys;
// }

// // ── Component ─────────────────────────────────────────────────────────────────
// const EMPTY_ARRAY = [];

// export default function ZonePerformance({
//   orders: ordersProp,
//   products: productsProp,
//   stores: storesProp,
// }) {
//   // ordersPropSafe etc. fall back to ONE stable module-level EMPTY_ARRAY,
//   // not a fresh `[]` literal — a new [] every render was the actual cause
//   // of the map fighting your drag/zoom (see EMPTY_ARRAY below the imports).
//   const ordersPropSafe = ordersProp || EMPTY_ARRAY;
//   const productsPropSafe = productsProp || EMPTY_ARRAY;
//   const storesPropSafe = storesProp || EMPTY_ARRAY;

//   const [mapReady, setMapReady] = useState(false);
//   const [leaflet, setLeaflet] = useState(null);
//   const [cities, setCities] = useState([]);

//   const [fetchedOrders, setFetchedOrders] = useState(EMPTY_ARRAY);
//   const [fetchedProducts, setFetchedProducts] = useState(EMPTY_ARRAY);
//   const [fetchedStores, setFetchedStores] = useState(EMPTY_ARRAY);

//   const orders = ordersPropSafe.length ? ordersPropSafe : fetchedOrders;
//   const products = productsPropSafe.length ? productsPropSafe : fetchedProducts;
//   const stores = storesPropSafe.length ? storesPropSafe : fetchedStores;

//   // Filters UI state (cosmetic toggles, matching the original design)
//   const [showVendors, setShowVendors] = useState(false);
//   const [showHeatmap, setShowHeatmap] = useState(false);
//   const [showLiveDeliveries, setShowLiveDeliveries] = useState(false);

//   // Load Leaflet + CSS client-side only
//   useEffect(() => {
//     Promise.all([import('leaflet/dist/leaflet.css'), import('leaflet')])
//       .then(([, L]) => {
//         setLeaflet(L.default || L);
//         setMapReady(true);
//       })
//       .catch(() => setMapReady(true));
//   }, []);

//   // Inject ping keyframe once
//   useEffect(() => {
//     if (typeof document === 'undefined') return;
//     if (document.getElementById('zone-ping-style')) return;
//     const style = document.createElement('style');
//     style.id = 'zone-ping-style';
//     style.textContent = `
//       @keyframes ping {
//         75%, 100% { transform: scale(2.2); opacity: 0; }
//       }
//     `;
//     document.head.appendChild(style);
//   }, []);

//   // Fetch cities (real lat/lng from vendor store mapLat/mapLng)
//   useEffect(() => {
//     const token = getToken();
//     if (!token) return;
//     fetch(`${API_BASE}/admin/cities`, {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then((r) => r.json())
//       .then((json) => setCities(json.cities ?? []))
//       .catch(() => {});
//   }, []);

//   // Self-fetch orders/products/stores when nothing was passed in as props
//   // Self-fetch orders/products/stores when nothing was passed in as props.
//   // Runs ONCE on mount — not on [ordersProp, productsProp, storesProp],
//   // since those were new array references every render and caused an
//   // infinite fetch → re-render → re-center loop that blocked map dragging.
//   useEffect(() => {
//     if (
//       ordersPropSafe.length ||
//       productsPropSafe.length ||
//       storesPropSafe.length
//     )
//       return;
//     const token = getToken();
//     if (!token) return;

//     Promise.all([
//       apiGetAllOrders(token)
//         .then((r) => r.data || [])
//         .catch(() => []),
//       apiGetAllAdminProducts(token, 'limit=300')
//         .then((r) => r.data.products || [])
//         .catch(() => []),
//       apiGetAdminStores(token)
//         .then((r) => r.data?.stores || [])
//         .catch(() => []),
//     ]).then(([ordersData, productsData, storesData]) => {
//       setFetchedOrders(ordersData);
//       setFetchedProducts(productsData);
//       setFetchedStores(storesData);
//     });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Build order counts per city
//   const orderCounts = useMemo(
//     () => buildCityOrderCounts(orders, products, stores),
//     [orders, products, stores],
//   );

//   // Active cities with valid coords + order count
//   const activeCities = useMemo(() => {
//     const seen = new Map();
//     cities
//       .filter(
//         (c) =>
//           c.hasActiveStore &&
//           Number.isFinite(Number(c.latitude)) &&
//           Number.isFinite(Number(c.longitude)),
//       )
//       .forEach((c) => {
//         const normalizedKey = String(c.cityKey || c.city || '')
//           .trim()
//           .toLowerCase();
//         const entry = {
//           ...c,
//           cityKey: normalizedKey,
//           lat: Number(c.latitude),
//           lng: Number(c.longitude),
//           count: orderCounts.get(normalizedKey) || 0,
//         };
//         const existing = seen.get(normalizedKey);
//         if (!existing || entry.count > existing.count) {
//           seen.set(normalizedKey, entry);
//         }
//       });
//     return [...seen.values()];
//   }, [cities, orderCounts]);

//   // Top 3 cities by order count (only those with orders)
//   const top3Zones = useMemo(() => {
//     const withOrders = activeCities
//       .filter((c) => c.count > 0)
//       .sort((a, b) => b.count - a.count)
//       .slice(0, 3);

//     const max = withOrders[0]?.count || 0;

//     return withOrders.map((c, i) => ({
//       rank: i + 1,
//       name: c.city,
//       orders: c.count,
//       vendors: c.vendorCount || 0,
//       status: getStatus(c.count, max),
//       cityKey: c.cityKey,
//     }));
//   }, [activeCities]);

//   // Map center: average of all active cities
//   const mapCenter = useMemo(() => {
//     if (!activeCities.length) return [20.5937, 78.9629];
//     const avgLat =
//       activeCities.reduce((s, c) => s + c.lat, 0) / activeCities.length;
//     const avgLng =
//       activeCities.reduce((s, c) => s + c.lng, 0) / activeCities.length;
//     return [avgLat, avgLng];
//   }, [activeCities]);

//   const mapZoom = activeCities.length === 1 ? 11 : 6;

//   const getDotColor = (status) => {
//     switch (status) {
//       case 'high':
//         return 'bg-red-500';
//       case 'medium':
//         return 'bg-orange-500';
//       default:
//         return 'bg-blue-500';
//     }
//   };

//   const getStatusLabel = (status) => {
//     switch (status) {
//       case 'high':
//         return 'High Demand';
//       case 'medium':
//         return 'Medium Demand';
//       default:
//         return 'Low Demand';
//     }
//   };

//   // Vendor count per city (from stores)
//   const vendorCountPerCity = useMemo(() => {
//     const map = new Map();
//     (stores || []).forEach((s) => {
//       const city = String(s.city || '').toLowerCase();
//       if (!city) return;
//       map.set(city, (map.get(city) || 0) + 1);
//     });
//     return map;
//   }, [stores]);

//   // Enrich top3Zones with real vendor counts
//   const enrichedTop3 = useMemo(
//     () =>
//       top3Zones.map((z) => ({
//         ...z,
//         vendors: vendorCountPerCity.get(z.cityKey) || z.vendors,
//       })),
//     [top3Zones, vendorCountPerCity],
//   );
//   const maxCityOrders = useMemo(
//     () => activeCities.reduce((m, c) => Math.max(m, c.count), 0) || 1,
//     [activeCities],
//   );

//   // Cities with at least one currently active (non-delivered/cancelled) order
//   const liveCityKeys = useMemo(
//     () => buildLiveCityKeys(orders, products, stores),
//     [orders, products, stores],
//   );

//   // Real per-order customer locations (from navbar snapshot at checkout),
//   // shown as a scatter alongside the vendor's store ping.
//   const orderLocationPoints = useMemo(
//     () => buildOrderLocationPoints(orders),
//     [orders],
//   );

//   // What actually renders on the map after the "Live Deliveries" filter
//   const mapVisibleCities = useMemo(
//     () =>
//       showLiveDeliveries
//         ? activeCities.filter((c) => liveCityKeys.has(c.cityKey))
//         : activeCities,
//     [activeCities, liveCityKeys, showLiveDeliveries],
//   );

//   // Demand Density legend thresholds — derived from the same ratio logic as
//   // getStatus(), so the legend numbers always match what's actually on the map
//   const densityThresholds = useMemo(() => {
//     const high = Math.max(1, Math.ceil(maxCityOrders * 0.7));
//     const mediumMin = Math.max(1, Math.ceil(maxCityOrders * 0.35));
//     return {
//       high,
//       mediumMin,
//       mediumMax: Math.max(mediumMin, high - 1),
//       lowMax: Math.max(mediumMin - 1, 0),
//     };
//   }, [maxCityOrders]);

//   return (
//     <div className="">
//       {/* Header */}
//       {/* <div className="mb-6">
//         <h2 className="text-2xl font-bold text-slate-800">
//           Geographic Insights
//         </h2>
//         <p className="text-slate-500 mt-1">
//           Real-time demand mapping &amp; vendor distribution
//         </p>
//       </div> */}

//       {/* Map Section */}
//       <div className="relative overflow-hidden rounded-3xl border bg-slate-100 h-[260px] md:h-[400px]">
//         {/* Leaflet Map */}
//         {!mapReady ? (
//           <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
//             <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
//           </div>
//         ) : mapVisibleCities.length === 0 ? (
//           <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-2">
//             <span className="text-4xl">🗺️</span>
//             <span className="text-sm">
//               {showLiveDeliveries
//                 ? 'No cities with live deliveries right now'
//                 : 'No active cities found'}
//             </span>
//           </div>
//         ) : (
//           <MapContainer
//             key={`${mapCenter[0]}-${mapCenter[1]}`}
//             center={mapCenter}
//             zoom={mapZoom}
//             style={{ height: '100%', width: '100%' }}
//             zoomControl={true}
//             scrollWheelZoom={false}
//             dragging={true}
//             doubleClickZoom={true}
//             touchZoom={true}
//             boxZoom={true}
//           >
//             <TileLayer
//               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             />
//             <MapRecenterDynamic center={mapCenter} zoom={mapZoom} />

//             {/* Heatmap overlay — toggled by "Show Heatmap" */}
//             {leaflet &&
//               showHeatmap &&
//               mapVisibleCities.map((city) => {
//                 const status = getStatus(city.count, maxCityOrders);
//                 const color =
//                   status === 'high'
//                     ? '#EF4444'
//                     : status === 'medium'
//                       ? '#F97316'
//                       : '#3B82F6';
//                 return (
//                   <CircleMarker
//                     key={`heat-${city.cityKey}`}
//                     center={[city.lat, city.lng]}
//                     radius={18 + (city.count / maxCityOrders) * 32}
//                     pathOptions={{
//                       color,
//                       weight: 0,
//                       fillColor: color,
//                       fillOpacity: 0.3,
//                     }}
//                   />
//                 );
//               })}

//             {/* Vendor density overlay — toggled by "Show Vendors" */}
//             {leaflet &&
//               showVendors &&
//               mapVisibleCities.map((city) => {
//                 const vendorCount = vendorCountPerCity.get(city.cityKey) || 0;
//                 if (vendorCount === 0) return null;
//                 return (
//                   <CircleMarker
//                     key={`vendor-${city.cityKey}`}
//                     center={[city.lat, city.lng]}
//                     radius={14 + vendorCount * 4}
//                     pathOptions={{
//                       color: '#8B5CF6',
//                       weight: 1,
//                       fillColor: '#8B5CF6',
//                       fillOpacity: 0.2,
//                     }}
//                   />
//                 );
//               })}

//             {leaflet &&
//               orderLocationPoints.map((pt) => (
//                 <CircleMarker
//                   key={`order-loc-${pt.id}`}
//                   center={[pt.lat, pt.lng]}
//                   radius={4}
//                   pathOptions={{
//                     color: '#10B981',
//                     weight: 1,
//                     fillColor: '#10B981',
//                     fillOpacity: 0.7,
//                   }}
//                 >
//                   <Tooltip direction="top" offset={[0, -6]} opacity={1}>
//                     <div style={{ fontSize: 11 }}>
//                       {pt.label || 'Order location'}
//                     </div>
//                   </Tooltip>
//                 </CircleMarker>
//               ))}

//             {leaflet &&
//               mapVisibleCities.map((city) => {
//                 const status = getStatus(city.count, maxCityOrders);
//                 return (
//                   <Marker
//                     key={city.cityKey}
//                     position={[city.lat, city.lng]}
//                     icon={makePingIcon(leaflet, status)}
//                   >
//                     <Tooltip
//                       direction="top"
//                       offset={[0, -16]}
//                       opacity={1}
//                       permanent={false}
//                     >
//                       <div
//                         style={{ fontSize: 12, lineHeight: 1.6, minWidth: 100 }}
//                       >
//                         <p style={{ fontWeight: 700, margin: 0 }}>
//                           {city.city}
//                         </p>
//                         <p style={{ color: '#6b7280', margin: 0 }}>
//                           {city.state}
//                         </p>
//                         <p
//                           style={{
//                             color: '#f97316',
//                             margin: 0,
//                             fontWeight: 600,
//                           }}
//                         >
//                           {city.count} orders
//                         </p>
//                         {showVendors && (
//                           <p style={{ color: '#8B5CF6', margin: 0 }}>
//                             {vendorCountPerCity.get(city.cityKey) || 0} vendors
//                           </p>
//                         )}
//                       </div>
//                     </Tooltip>
//                   </Marker>
//                 );
//               })}
//           </MapContainer>
//         )}

//         {/* City Badge — top left */}
//         {/* <div className="absolute top-4 left-4 z-[1000] bg-white rounded-xl shadow-md p-3 flex items-center gap-3">
//           <MapPin className="w-5 h-5 text-orange-500" />
//           <div>
//             <h4 className="font-semibold text-sm">Live Coverage</h4>
//             <p className="text-xs text-slate-500">
//               {activeCities.length} active{' '}
//               {activeCities.length === 1 ? 'city' : 'cities'}
//             </p>
//           </div>
//         </div> */}

//         {/* Filters Card — top right (desktop only) */}
//         <div className="absolute top-5 right-5 z-[1000] w-full max-w-[260px] bg-white rounded-2xl shadow-xl border p-5 hidden md:block">
//           <div className="flex justify-between items-center mb-5">
//             <h3 className="font-bold text-base">Map Filters</h3>
//             <div className="w-2 h-2 bg-green-500 rounded-full" />
//           </div>

//           <div className="space-y-4">
//             {/* Show Heatmap */}
//             <div className="flex justify-between items-center">
//               <div className="flex items-center gap-2 text-sm">
//                 <TrendingUp className="text-[#64748B]" size={16} />
//                 <span>Show Heatmap</span>
//               </div>
//               <button
//                 onClick={() => setShowHeatmap((v) => !v)}
//                 className={`w-11 h-6 rounded-full relative transition-colors ${
//                   showHeatmap ? 'bg-orange-500' : 'bg-gray-300'
//                 }`}
//               >
//                 <div
//                   className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
//                     showHeatmap ? 'right-1' : 'left-1'
//                   }`}
//                 />
//               </button>
//             </div>

//             {/* Show Vendors */}
//             <div className="flex justify-between items-center">
//               <div className="flex items-center gap-2 text-sm">
//                 <Store className="text-[#64748B]" size={16} />
//                 <span className="text-black">Show Vendors</span>
//               </div>
//               <button
//                 onClick={() => setShowVendors((v) => !v)}
//                 className={`w-11 h-6 rounded-full relative transition-colors ${
//                   showVendors ? 'bg-orange-500' : 'bg-gray-300'
//                 }`}
//               >
//                 <div
//                   className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
//                     showVendors ? 'right-1' : 'left-1'
//                   }`}
//                 />
//               </button>
//             </div>

//             {/* Live Deliveries */}
//             <div className="flex justify-between items-center">
//               <div className="flex items-center gap-2 text-sm">
//                 <Truck className="text-[#64748B]" size={16} />
//                 <span>Live Deliveries</span>
//               </div>
//               <button
//                 onClick={() => setShowLiveDeliveries((v) => !v)}
//                 className={`w-11 h-6 rounded-full relative transition-colors ${
//                   showLiveDeliveries ? 'bg-orange-500' : 'bg-gray-300'
//                 }`}
//               >
//                 <div
//                   className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
//                     showLiveDeliveries ? 'right-1' : 'left-1'
//                   }`}
//                 />
//               </button>
//             </div>

//             <hr />

//             <p className="text-xs text-slate-500">
//               Active filters:{' '}
//               <span className="font-semibold">
//                 {
//                   [showHeatmap, showVendors, showLiveDeliveries].filter(Boolean)
//                     .length
//                 }
//               </span>
//             </p>
//           </div>
//         </div>
//         {/* Demand Density legend — bottom left (desktop only) */}
//         <div className="absolute bottom-5 left-5 z-[1000] bg-white rounded-2xl shadow-lg p-4 hidden md:block">
//           <h4 className="font-semibold text-sm mb-3">Demand Density</h4>
//           <div className="space-y-2 text-xs">
//             <div className="flex items-center gap-2">
//               <div className="w-3.5 h-3.5 rounded-full bg-red-500" />
//               <span>High ({densityThresholds.high}+ orders)</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-3.5 h-3.5 rounded-full bg-orange-500" />
//               <span>
//                 Medium ({densityThresholds.mediumMin}–
//                 {densityThresholds.mediumMax} orders)
//               </span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-3.5 h-3.5 rounded-full bg-blue-500" />
//               <span>Low (0–{densityThresholds.lowMax} orders)</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Map Filters — shown only on small screens */}
//       <div className="mt-4 bg-white rounded-2xl border shadow-sm p-4 md:hidden">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="font-bold text-base">Map Filters</h3>
//           <div className="w-2 h-2 bg-green-500 rounded-full" />
//         </div>
//         <div className="space-y-4">
//           <div className="flex justify-between items-center">
//             <div className="flex items-center gap-2 text-sm">
//               <TrendingUp size={16} />
//               <span>Show Heatmap</span>
//             </div>
//             <button
//               onClick={() => setShowHeatmap((v) => !v)}
//               className={`w-11 h-6 rounded-full relative transition-colors ${showHeatmap ? 'bg-orange-500' : 'bg-gray-300'}`}
//             >
//               <div
//                 className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${showHeatmap ? 'right-1' : 'left-1'}`}
//               />
//             </button>
//           </div>
//           <div className="flex justify-between items-center">
//             <div className="flex items-center gap-2 text-sm">
//               <Warehouse size={16} />
//               <span>Show Vendors</span>
//             </div>
//             <button
//               onClick={() => setShowVendors((v) => !v)}
//               className={`w-11 h-6 rounded-full relative transition-colors ${showVendors ? 'bg-orange-500' : 'bg-gray-300'}`}
//             >
//               <div
//                 className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${showVendors ? 'right-1' : 'left-1'}`}
//               />
//             </button>
//           </div>
//           <div className="flex justify-between items-center">
//             <div className="flex items-center gap-2 text-sm">
//               <Truck size={16} />
//               <span>Live Deliveries</span>
//             </div>
//             <button
//               onClick={() => setShowLiveDeliveries((v) => !v)}
//               className={`w-11 h-6 rounded-full relative transition-colors ${showLiveDeliveries ? 'bg-orange-500' : 'bg-gray-300'}`}
//             >
//               <div
//                 className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${showLiveDeliveries ? 'right-1' : 'left-1'}`}
//               />
//             </button>
//           </div>
//           <hr />
//           <p className="text-xs text-slate-500">
//             Active filters:{' '}
//             <span className="font-semibold">
//               {
//                 [showHeatmap, showVendors, showLiveDeliveries].filter(Boolean)
//                   .length
//               }
//             </span>
//           </p>
//         </div>
//       </div>

//       {/* Top Performing Zones */}
//       <div className="mt-8">
//         <div className="flex flex-col lg:flex-row lg:items-center gap-4">
//           <div className="lg:w-52 shrink-0">
//             <h3 className="text-lg font-bold text-slate-800">
//               Top Performing Zones
//             </h3>
//             <p className="text-slate-500 text-sm">
//               Ranked by active order volume
//             </p>
//           </div>

//           {enrichedTop3.length === 0 ? (
//             <div className="flex-1 text-center py-6 text-slate-400 text-sm border rounded-2xl bg-slate-50">
//               <span className="text-2xl block mb-1">📦</span>
//               No order data available yet
//             </div>
//           ) : (
//             <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
//               {enrichedTop3.map((zone) => (
//                 <div
//                   key={zone.cityKey || zone.name}
//                   className="border-2 rounded-xl p-3.5 border-[#E5E7EB]  bg-gradient-to-br from-[#F8FAFC] to-[#FFFFFF] shadow-sm hover:shadow-lg hover:scale-[1.05] hover:-translate-y-0.5 hover:z-10 transition-all duration-200 cursor-pointer"
//                 >
//                   <div className="flex justify-between items-start">
//                     <div className="flex items-center gap-2">
//                       <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
//                         {zone.rank}
//                       </div>
//                       <h4 className="font-bold text-sm leading-tight">
//                         {zone.name}
//                       </h4>
//                     </div>
//                     <div
//                       className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${getDotColor(zone.status)}`}
//                       title={getStatusLabel(zone.status)}
//                     />
//                   </div>

//                   <div className="mt-3 flex items-center justify-between">
//                     <p className="text-slate-500 text-[11px]">Active Orders</p>
//                     <h3 className="text-xl font-bold text-slate-800">
//                       {zone.orders}
//                     </h3>
//                   </div>

//                   {zone.vendors > 0 && (
//                     <div className="mt-2 flex items-center gap-1.5 text-slate-500 text-[11px]">
//                       <Store size={14} />
//                       <span>{zone.vendors} Vendors</span>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// 'use client';

// import { useMemo, useState, useEffect, useRef } from 'react';
// import dynamic from 'next/dynamic';
// import { MapPin, Store, TrendingUp, Warehouse, Truck } from 'lucide-react';
// import {
//   apiGetAllOrders,
//   apiGetAllAdminProducts,
//   apiGetAdminStores,
// } from '@/service/api';
// // ── Leaflet dynamic imports (SSR-safe) ────────────────────────────────────────
// const MapContainer = dynamic(
//   () => import('react-leaflet').then((m) => m.MapContainer),
//   { ssr: false },
// );
// const TileLayer = dynamic(
//   () => import('react-leaflet').then((m) => m.TileLayer),
//   { ssr: false },
// );
// const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), {
//   ssr: false,
// });
// const Tooltip = dynamic(() => import('react-leaflet').then((m) => m.Tooltip), {
//   ssr: false,
// });
// const CircleMarker = dynamic(
//   () => import('react-leaflet').then((m) => m.CircleMarker),
//   { ssr: false },
// );

// const API_BASE =
//   process.env.NEXT_PUBLIC_API_URL || 'https://backend.delicod.com/api';
// const getToken = () =>
//   typeof window !== 'undefined' ? localStorage.getItem('adminToken') || '' : '';

// // ── Map recenter helper ───────────────────────────────────────────────────────
// function MapRecenter({ center, zoom }) {
//   const { useMap } = require('react-leaflet');
//   const map = useMap();
//   const lastCenterRef = useRef(null);

//   useEffect(() => {
//     map.invalidateSize();

//     const last = lastCenterRef.current;
//     const unchanged =
//       last &&
//       Math.abs(last[0] - center[0]) < 0.0001 &&
//       Math.abs(last[1] - center[1]) < 0.0001 &&
//       last[2] === zoom;

//     // Skip setView if nothing actually changed — calling it on every
//     // render is what fights the user's own drag/zoom.
//     if (!unchanged) {
//       map.setView(center, zoom, { animate: true });
//       lastCenterRef.current = [center[0], center[1], zoom];
//     }
//   }, [center, zoom, map]);

//   useEffect(() => {
//     const id = setTimeout(() => map.invalidateSize(), 250);
//     return () => clearTimeout(id);
//   }, [map]);

//   return null;
// }
// const MapRecenterDynamic = dynamic(() => Promise.resolve(MapRecenter), {
//   ssr: false,
// });

// // ── Ping icon factory ─────────────────────────────────────────────────────────
// function makePingIcon(L, status) {
//   const color =
//     status === 'high' ? '#EF4444' : status === 'medium' ? '#F97316' : '#3B82F6';

//   const html = `
//     <div style="position:relative;width:24px;height:24px;">
//       <div style="
//         position:absolute;inset:0;border-radius:50%;
//         background:${color};opacity:0.25;
//         animation:ping 1.8s cubic-bezier(0,0,0.2,1) infinite;
//       "></div>
//       <div style="
//         position:absolute;top:5px;left:5px;width:14px;height:14px;
//         border-radius:50%;background:${color};
//         border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);
//       "></div>
//     </div>`;

//   return L.divIcon({
//     html,
//     className: '',
//     iconSize: [24, 24],
//     iconAnchor: [12, 12],
//   });
// }

// // ── Order count helpers (same logic as LiveOrderActivitySection) ──────────────
// function buildCityOrderCounts(orders, products, stores) {
//   const productStoreMap = new Map();
//   (products || []).forEach((p) => {
//     productStoreMap.set(String(p._id), String(p.storeId || ''));
//   });

//   const storeCityMap = new Map();
//   (stores || []).forEach((s) => {
//     if (!s?.storeId) return;
//     storeCityMap.set(String(s.storeId), {
//       city: String(s.city || '')
//         .trim()
//         .toLowerCase(),
//       active: s.status !== 'disabled',
//     });
//   });
//   const vendorCityMap = new Map();
//   (stores || []).forEach((s) => {
//     if (!s?.vendorObjectId) return;
//     const vendorKey = String(s.vendorObjectId);
//     const isStoreActive = s.status !== 'disabled';
//     const existing = vendorCityMap.get(vendorKey);
//     // Prefer the vendor's ACTIVE store's city. Only fall back to an
//     // inactive store's city if this vendor has no active store at all.
//     if (!existing || (!existing.active && isStoreActive)) {
//       vendorCityMap.set(vendorKey, {
//         city: String(s.city || '')
//           .trim()
//           .toLowerCase(),
//         active: isStoreActive,
//       });
//     }
//   });

//   const counts = new Map();
//   (orders || []).forEach((order) => {
//     (order.products || []).forEach((line) => {
//       const productId = String(line?.product?._id || line?._id || '');
//       const storeKey = productStoreMap.get(productId);
//       if (!storeKey) return;
//       const storeEntry = storeCityMap.get(storeKey);
//       if (!storeEntry || !storeEntry.active) return;
//       const cityKey = storeEntry.city;
//       if (!cityKey) return;
//       counts.set(cityKey, (counts.get(cityKey) || 0) + 1);
//     });
//   });

//   return counts;
// }

// function buildOrderLocationPoints(orders) {
//   const points = [];
//   (orders || []).forEach((order) => {
//     const lat = Number(order?.orderLocation?.lat);
//     const lng = Number(order?.orderLocation?.lng);
//     if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
//     points.push({
//       id: order._id,
//       lat,
//       lng,
//       label: order?.orderLocation?.label || '',
//     });
//   });
//   return points;
// }

// function buildCityAreaBreakdown(orders, products, stores) {
//   const productStoreMap = new Map();
//   (products || []).forEach((p) => {
//     productStoreMap.set(String(p._id), String(p.storeId || ''));
//   });

//   const storeCityMap = new Map();
//   (stores || []).forEach((s) => {
//     if (!s?.storeId) return;
//     storeCityMap.set(String(s.storeId), {
//       city: String(s.city || '')
//         .trim()
//         .toLowerCase(),
//       active: s.status !== 'disabled',
//     });
//   });
//   const vendorCityMap = new Map();
//   (stores || []).forEach((s) => {
//     if (!s?.vendorObjectId) return;
//     const vendorKey = String(s.vendorObjectId);
//     const isStoreActive = s.status !== 'disabled';
//     const existing = vendorCityMap.get(vendorKey);
//     // Prefer the vendor's ACTIVE store's city. Only fall back to an
//     // inactive store's city if this vendor has no active store at all.
//     if (!existing || (!existing.active && isStoreActive)) {
//       vendorCityMap.set(vendorKey, {
//         city: String(s.city || '')
//           .trim()
//           .toLowerCase(),
//         active: isStoreActive,
//       });
//     }
//   });

//   // cityKey -> Map(areaName -> count)
//   const breakdown = new Map();
//   (orders || []).forEach((order) => {
//     const label = String(order?.orderLocation?.label || '').trim();
//     if (!label) return;
//     const areaName = label.split(',')[0].trim();
//     if (!areaName) return;

//     (order.products || []).forEach((line) => {
//       const productId = String(line?.product?._id || line?._id || '');
//       const storeKey = productStoreMap.get(productId);
//       if (!storeKey) return;
//       const storeEntry = storeCityMap.get(storeKey);
//       if (!storeEntry || !storeEntry.active) return;
//       const cityKey = storeEntry.city;
//       if (!cityKey) return;

//       if (!breakdown.has(cityKey)) breakdown.set(cityKey, new Map());
//       const areaMap = breakdown.get(cityKey);
//       areaMap.set(areaName, (areaMap.get(areaName) || 0) + 1);
//     });
//   });

//   return breakdown;
// }

// function getStatus(orders, maxOrders) {
//   if (maxOrders === 0) return 'low';
//   const ratio = orders / maxOrders;
//   if (ratio >= 0.7) return 'high';
//   if (ratio >= 0.35) return 'medium';
//   return 'low';
// }

// // ── Live delivery helpers (for "Live Deliveries" map filter) ─────────────────
// function isLiveOrderStatus(status) {
//   const s = String(status || '').toLowerCase();
//   return Boolean(s) && !['delivered', 'cancelled', 'completed'].includes(s);
// }

// function buildLiveCityKeys(orders, products, stores) {
//   const productStoreMap = new Map();
//   (products || []).forEach((p) => {
//     productStoreMap.set(String(p._id), String(p.storeId || ''));
//   });

//   const storeCityMap = new Map();
//   (stores || []).forEach((s) => {
//     if (!s?.storeId) return;
//     storeCityMap.set(String(s.storeId), {
//       city: String(s.city || '')
//         .trim()
//         .toLowerCase(),
//       active: s.status !== 'disabled',
//     });
//   });
//   const vendorCityMap = new Map();
//   (stores || []).forEach((s) => {
//     if (!s?.vendorObjectId) return;
//     const vendorKey = String(s.vendorObjectId);
//     const isStoreActive = s.status !== 'disabled';
//     const existing = vendorCityMap.get(vendorKey);
//     // Prefer the vendor's ACTIVE store's city. Only fall back to an
//     // inactive store's city if this vendor has no active store at all.
//     if (!existing || (!existing.active && isStoreActive)) {
//       vendorCityMap.set(vendorKey, {
//         city: String(s.city || '')
//           .trim()
//           .toLowerCase(),
//         active: isStoreActive,
//       });
//     }
//   });

//   const liveKeys = new Set();
//   (orders || []).forEach((order) => {
//     if (!isLiveOrderStatus(order.status)) return;
//     (order.products || []).forEach((line) => {
//       const productId = String(line?.product?._id || line?._id || '');
//       const storeKey = productStoreMap.get(productId);
//       if (!storeKey) return;
//       const storeEntry = storeCityMap.get(storeKey);
//       if (!storeEntry || !storeEntry.active) return;
//       const cityKey = storeEntry.city;
//       if (!cityKey) return;
//       liveKeys.add(cityKey);
//     });
//   });
//   return liveKeys;
// }

// // ── Component ─────────────────────────────────────────────────────────────────
// const EMPTY_ARRAY = [];

// export default function ZonePerformance({
//   orders: ordersProp,
//   products: productsProp,
//   stores: storesProp,
// }) {
//   // ordersPropSafe etc. fall back to ONE stable module-level EMPTY_ARRAY,
//   // not a fresh `[]` literal — a new [] every render was the actual cause
//   // of the map fighting your drag/zoom (see EMPTY_ARRAY below the imports).
//   const ordersPropSafe = ordersProp || EMPTY_ARRAY;
//   const productsPropSafe = productsProp || EMPTY_ARRAY;
//   const storesPropSafe = storesProp || EMPTY_ARRAY;

//   const [mapReady, setMapReady] = useState(false);
//   const [leaflet, setLeaflet] = useState(null);
//   const [cities, setCities] = useState([]);

//   const [fetchedOrders, setFetchedOrders] = useState(EMPTY_ARRAY);
//   const [fetchedProducts, setFetchedProducts] = useState(EMPTY_ARRAY);
//   const [fetchedStores, setFetchedStores] = useState(EMPTY_ARRAY);

//   const orders = ordersPropSafe.length ? ordersPropSafe : fetchedOrders;
//   const products = productsPropSafe.length ? productsPropSafe : fetchedProducts;
//   const stores = storesPropSafe.length ? storesPropSafe : fetchedStores;

//   // Filters UI state (cosmetic toggles, matching the original design)
//   const [showVendors, setShowVendors] = useState(false);
//   const [showHeatmap, setShowHeatmap] = useState(false);
//   const [showLiveDeliveries, setShowLiveDeliveries] = useState(false);

//   // Load Leaflet + CSS client-side only
//   useEffect(() => {
//     Promise.all([import('leaflet/dist/leaflet.css'), import('leaflet')])
//       .then(([, L]) => {
//         setLeaflet(L.default || L);
//         setMapReady(true);
//       })
//       .catch(() => setMapReady(true));
//   }, []);

//   // Inject ping keyframe once
//   useEffect(() => {
//     if (typeof document === 'undefined') return;
//     if (document.getElementById('zone-ping-style')) return;
//     const style = document.createElement('style');
//     style.id = 'zone-ping-style';
//     style.textContent = `
//       @keyframes ping {
//         75%, 100% { transform: scale(2.2); opacity: 0; }
//       }
//     `;
//     document.head.appendChild(style);
//   }, []);

//   // Fetch cities (real lat/lng from vendor store mapLat/mapLng)
//   useEffect(() => {
//     const token = getToken();
//     if (!token) return;
//     fetch(`${API_BASE}/admin/cities`, {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then((r) => r.json())
//       .then((json) => setCities(json.cities ?? []))
//       .catch(() => {});
//   }, []);

//   // Self-fetch orders/products/stores when nothing was passed in as props
//   // Self-fetch orders/products/stores when nothing was passed in as props.
//   // Runs ONCE on mount — not on [ordersProp, productsProp, storesProp],
//   // since those were new array references every render and caused an
//   // infinite fetch → re-render → re-center loop that blocked map dragging.
//   useEffect(() => {
//     if (
//       ordersPropSafe.length ||
//       productsPropSafe.length ||
//       storesPropSafe.length
//     )
//       return;
//     const token = getToken();
//     if (!token) return;

//     Promise.all([
//       apiGetAllOrders(token)
//         .then((r) => r.data || [])
//         .catch(() => []),
//       apiGetAllAdminProducts(token, 'limit=300')
//         .then((r) => r.data.products || [])
//         .catch(() => []),
//       apiGetAdminStores(token)
//         .then((r) => r.data?.stores || [])
//         .catch(() => []),
//     ]).then(([ordersData, productsData, storesData]) => {
//       setFetchedOrders(ordersData);
//       setFetchedProducts(productsData);
//       setFetchedStores(storesData);
//     });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Build order counts per city
//   const orderCounts = useMemo(
//     () => buildCityOrderCounts(orders, products, stores),
//     [orders, products, stores],
//   );

//   // Active cities with valid coords + order count
//   const activeCities = useMemo(() => {
//     const seen = new Map();
//     cities
//       .filter(
//         (c) =>
//           c.hasActiveStore &&
//           Number.isFinite(Number(c.latitude)) &&
//           Number.isFinite(Number(c.longitude)),
//       )
//       .forEach((c) => {
//         const normalizedKey = String(c.cityKey || c.city || '')
//           .trim()
//           .toLowerCase();
//         const entry = {
//           ...c,
//           cityKey: normalizedKey,
//           lat: Number(c.latitude),
//           lng: Number(c.longitude),
//           count: orderCounts.get(normalizedKey) || 0,
//         };
//         const existing = seen.get(normalizedKey);
//         if (!existing || entry.count > existing.count) {
//           seen.set(normalizedKey, entry);
//         }
//       });
//     return [...seen.values()];
//   }, [cities, orderCounts]);

//   // Top 3 cities by order count (only those with orders)
//   const top3Zones = useMemo(() => {
//     const withOrders = activeCities
//       .filter((c) => c.count > 0)
//       .sort((a, b) => b.count - a.count)
//       .slice(0, 3);

//     const max = withOrders[0]?.count || 0;

//     return withOrders.map((c, i) => ({
//       rank: i + 1,
//       name: c.city,
//       orders: c.count,
//       vendors: c.vendorCount || 0,
//       status: getStatus(c.count, max),
//       cityKey: c.cityKey,
//     }));
//   }, [activeCities]);

//   // Map center: average of all active cities
//   const mapCenter = useMemo(() => {
//     if (!activeCities.length) return [20.5937, 78.9629];
//     const avgLat =
//       activeCities.reduce((s, c) => s + c.lat, 0) / activeCities.length;
//     const avgLng =
//       activeCities.reduce((s, c) => s + c.lng, 0) / activeCities.length;
//     return [avgLat, avgLng];
//   }, [activeCities]);

//   const mapZoom = activeCities.length === 1 ? 11 : 6;

//   const getDotColor = (status) => {
//     switch (status) {
//       case 'high':
//         return 'bg-red-500';
//       case 'medium':
//         return 'bg-orange-500';
//       default:
//         return 'bg-blue-500';
//     }
//   };

//   const getStatusLabel = (status) => {
//     switch (status) {
//       case 'high':
//         return 'High Demand';
//       case 'medium':
//         return 'Medium Demand';
//       default:
//         return 'Low Demand';
//     }
//   };

//   // Vendor count per city (from stores)
//   const vendorCountPerCity = useMemo(() => {
//     const map = new Map();
//     (stores || []).forEach((s) => {
//       const city = String(s.city || '').toLowerCase();
//       if (!city) return;
//       map.set(city, (map.get(city) || 0) + 1);
//     });
//     return map;
//   }, [stores]);

//   // Enrich top3Zones with real vendor counts
//   const enrichedTop3 = useMemo(
//     () =>
//       top3Zones.map((z) => ({
//         ...z,
//         vendors: vendorCountPerCity.get(z.cityKey) || z.vendors,
//       })),
//     [top3Zones, vendorCountPerCity],
//   );

//   // Per-city breakdown of real customer order sub-areas (from orderLocation
//   // captured at checkout), so each store-city card can show e.g.
//   // "Tirur - 4", "Ramanattukara - 2" underneath the city total.
//   const cityAreaBreakdown = useMemo(
//     () => buildCityAreaBreakdown(orders, products, stores),
//     [orders, products, stores],
//   );

//   // ALL cities with at least one order (not just top 3), used to render a
//   // full grid of city cards instead of the map.
//   const allZones = useMemo(() => {
//     const withOrders = activeCities
//       .filter((c) => c.count > 0)
//       .sort((a, b) => b.count - a.count);
//     const max = withOrders[0]?.count || 0;

//     return withOrders.map((c, i) => ({
//       rank: i + 1,
//       name: c.city,
//       orders: c.count,
//       vendors: vendorCountPerCity.get(c.cityKey) || c.vendorCount || 0,
//       status: getStatus(c.count, max),
//       cityKey: c.cityKey,
//       areas: Array.from(cityAreaBreakdown.get(c.cityKey)?.entries() || []).sort(
//         (a, b) => b[1] - a[1],
//       ),
//     }));
//   }, [activeCities, vendorCountPerCity, cityAreaBreakdown]);
//   const maxCityOrders = useMemo(
//     () => activeCities.reduce((m, c) => Math.max(m, c.count), 0) || 1,
//     [activeCities],
//   );

//   // Cities with at least one currently active (non-delivered/cancelled) order
//   const liveCityKeys = useMemo(
//     () => buildLiveCityKeys(orders, products, stores),
//     [orders, products, stores],
//   );

//   // Real per-order customer locations (from navbar snapshot at checkout),
//   // shown as a scatter alongside the vendor's store ping.
//   const orderLocationPoints = useMemo(
//     () => buildOrderLocationPoints(orders),
//     [orders],
//   );

//   // What actually renders on the map after the "Live Deliveries" filter
//   const mapVisibleCities = useMemo(
//     () =>
//       showLiveDeliveries
//         ? activeCities.filter((c) => liveCityKeys.has(c.cityKey))
//         : activeCities,
//     [activeCities, liveCityKeys, showLiveDeliveries],
//   );

//   // Demand Density legend thresholds — derived from the same ratio logic as
//   // getStatus(), so the legend numbers always match what's actually on the map
//   const densityThresholds = useMemo(() => {
//     const high = Math.max(1, Math.ceil(maxCityOrders * 0.7));
//     const mediumMin = Math.max(1, Math.ceil(maxCityOrders * 0.35));
//     return {
//       high,
//       mediumMin,
//       mediumMax: Math.max(mediumMin, high - 1),
//       lowMax: Math.max(mediumMin - 1, 0),
//     };
//   }, [maxCityOrders]);

//   return (
//     <div className="">
//       {/* Header */}
//       {/* <div className="mb-6">
//         <h2 className="text-2xl font-bold text-slate-800">
//           Geographic Insights
//         </h2>
//         <p className="text-slate-500 mt-1">
//           Real-time demand mapping &amp; vendor distribution
//         </p>
//       </div> */}

//       {/* Top Performing Zones */}
//       {/* Zone Performance — all store cities as cards, with real order
//           sub-areas (captured at checkout) listed underneath each */}
//       <div className="mt-0">
//         {allZones.length === 0 ? (
//           <div className="text-center py-10 text-slate-400 text-sm border rounded-2xl bg-slate-50">
//             {/* <span className="text-2xl block mb-1">📦</span> */}
//             No order data available yet
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
//             {allZones.map((zone) => (
//               <div
//                 key={zone.cityKey || zone.name}
//                 className="border-2 rounded-xl p-3.5 border-[#E5E7EB] bg-gradient-to-br from-[#F8FAFC] to-[#FFFFFF] shadow-sm hover:shadow-lg transition-all duration-200"
//               >
//                 <div className="flex justify-between items-start">
//                   <div className="flex items-center gap-2 min-w-0">
//                     <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
//                       {zone.rank}
//                     </div>
//                     <h4 className="font-bold text-base leading-tight truncate">
//                       {zone.name}
//                     </h4>
//                   </div>
//                   <div
//                     className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${getDotColor(zone.status)}`}
//                     title={getStatusLabel(zone.status)}
//                   />
//                 </div>

//                 <div className="mt-3 flex items-start justify-between">
//                   {zone.vendors > 0 && (
//                     <div>
//                       <p className="text-slate-500 text-sm">Vendors</p>
//                       <h3 className="text-xl font-bold text-slate-800">
//                         {zone.vendors}
//                       </h3>
//                     </div>
//                   )}

//                   <div className="text-right">
//                     <p className="text-slate-500 text-sm">Active Orders</p>
//                     <h3 className="text-xl font-bold text-slate-800">
//                       {zone.orders}
//                     </h3>
//                   </div>
//                 </div>
//                 {zone.areas.length > 0 && (
//                   <div className="mt-3 pt-3 border-t border-slate-200">
//                     <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-1">
//                       Order Areas
//                     </p>
//                     <div className=" max-h-[110px] overflow-y-auto scrollbar-hide">
//                       {/* <div className="space-y-1 max-h-[22px] overflow-y-auto scrollbar-hide"> */}
//                       {zone.areas.map(([areaName, count]) => (
//                         <div
//                           key={areaName}
//                           className="flex items-center justify-between text-sm pr-1"
//                         >
//                           <span className="text-slate-600 truncate">
//                             {areaName}
//                           </span>
//                           <span className="font-semibold text-slate-800 shrink-0 ml-2">
//                             {count}
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Store, TrendingUp, Warehouse, Truck } from 'lucide-react';
import {
  apiGetAllOrders,
  apiGetAllAdminProducts,
  apiGetAdminStores,
} from '@/service/api';
// ── Leaflet dynamic imports (SSR-safe) ────────────────────────────────────────
const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false },
);
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), {
  ssr: false,
});
const Tooltip = dynamic(() => import('react-leaflet').then((m) => m.Tooltip), {
  ssr: false,
});
const CircleMarker = dynamic(
  () => import('react-leaflet').then((m) => m.CircleMarker),
  { ssr: false },
);

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://backend.delicod.com/api';
const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('adminToken') || '' : '';

// ── Map recenter helper ───────────────────────────────────────────────────────
function MapRecenter({ center, zoom }) {
  const { useMap } = require('react-leaflet');
  const map = useMap();
  const lastCenterRef = useRef(null);

  useEffect(() => {
    map.invalidateSize();

    const last = lastCenterRef.current;
    const unchanged =
      last &&
      Math.abs(last[0] - center[0]) < 0.0001 &&
      Math.abs(last[1] - center[1]) < 0.0001 &&
      last[2] === zoom;

    // Skip setView if nothing actually changed — calling it on every
    // render is what fights the user's own drag/zoom.
    if (!unchanged) {
      map.setView(center, zoom, { animate: true });
      lastCenterRef.current = [center[0], center[1], zoom];
    }
  }, [center, zoom, map]);

  useEffect(() => {
    const id = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(id);
  }, [map]);

  return null;
}
const MapRecenterDynamic = dynamic(() => Promise.resolve(MapRecenter), {
  ssr: false,
});

// ── Ping icon factory ─────────────────────────────────────────────────────────
function makePingIcon(L, status) {
  const color =
    status === 'high' ? '#EF4444' : status === 'medium' ? '#F97316' : '#3B82F6';

  const html = `
    <div style="position:relative;width:24px;height:24px;">
      <div style="
        position:absolute;inset:0;border-radius:50%;
        background:${color};opacity:0.25;
        animation:ping 1.8s cubic-bezier(0,0,0.2,1) infinite;
      "></div>
      <div style="
        position:absolute;top:5px;left:5px;width:14px;height:14px;
        border-radius:50%;background:${color};
        border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);
      "></div>
    </div>`;

  return L.divIcon({
    html,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

// ── Order count helpers (same logic as LiveOrderActivitySection) ──────────────
function buildCityOrderCounts(orders, products, stores) {
  const productStoreMap = new Map();
  (products || []).forEach((p) => {
    productStoreMap.set(String(p._id), String(p.storeId || ''));
  });

  const storeCityMap = new Map();
  (stores || []).forEach((s) => {
    if (!s?.storeId) return;
    storeCityMap.set(String(s.storeId), {
      city: String(s.city || '')
        .trim()
        .toLowerCase(),
      active: s.status !== 'disabled',
    });
  });
  const vendorCityMap = new Map();
  (stores || []).forEach((s) => {
    if (!s?.vendorObjectId) return;
    const vendorKey = String(s.vendorObjectId);
    const isStoreActive = s.status !== 'disabled';
    const existing = vendorCityMap.get(vendorKey);
    // Prefer the vendor's ACTIVE store's city. Only fall back to an
    // inactive store's city if this vendor has no active store at all.
    if (!existing || (!existing.active && isStoreActive)) {
      vendorCityMap.set(vendorKey, {
        city: String(s.city || '')
          .trim()
          .toLowerCase(),
        active: isStoreActive,
      });
    }
  });

  const counts = new Map();
  (orders || []).forEach((order) => {
    (order.products || []).forEach((line) => {
      const productId = String(line?.product?._id || line?._id || '');
      const storeKey = productStoreMap.get(productId);
      if (!storeKey) return;
      const storeEntry = storeCityMap.get(storeKey);
      if (!storeEntry || !storeEntry.active) return;
      const cityKey = storeEntry.city;
      if (!cityKey) return;
      counts.set(cityKey, (counts.get(cityKey) || 0) + 1);
    });
  });

  return counts;
}

function buildOrderLocationPoints(orders) {
  const points = [];
  (orders || []).forEach((order) => {
    const lat = Number(order?.orderLocation?.lat);
    const lng = Number(order?.orderLocation?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    points.push({
      id: order._id,
      lat,
      lng,
      label: order?.orderLocation?.label || '',
    });
  });
  return points;
}

function buildCityAreaBreakdown(orders, products, stores) {
  const productStoreMap = new Map();
  (products || []).forEach((p) => {
    productStoreMap.set(String(p._id), String(p.storeId || ''));
  });

  const storeCityMap = new Map();
  (stores || []).forEach((s) => {
    if (!s?.storeId) return;
    storeCityMap.set(String(s.storeId), {
      city: String(s.city || '')
        .trim()
        .toLowerCase(),
      active: s.status !== 'disabled',
    });
  });
  const vendorCityMap = new Map();
  (stores || []).forEach((s) => {
    if (!s?.vendorObjectId) return;
    const vendorKey = String(s.vendorObjectId);
    const isStoreActive = s.status !== 'disabled';
    const existing = vendorCityMap.get(vendorKey);
    // Prefer the vendor's ACTIVE store's city. Only fall back to an
    // inactive store's city if this vendor has no active store at all.
    if (!existing || (!existing.active && isStoreActive)) {
      vendorCityMap.set(vendorKey, {
        city: String(s.city || '')
          .trim()
          .toLowerCase(),
        active: isStoreActive,
      });
    }
  });

  // cityKey -> Map(areaName -> count)
  const breakdown = new Map();
  (orders || []).forEach((order) => {
    const resolvedArea = String(order?.orderLocation?.area || '').trim();
    const label = String(order?.orderLocation?.label || '').trim();
    if (!resolvedArea && !label) {
      console.log(
        '[ZoneDebug] order',
        order._id,
        'SKIPPED: no orderLocation.area or label',
      );
      return;
    }
    // Prefer the backend-resolved locality (real area, never a society
    // name). Falls back to the old label-split heuristic only for orders
    // placed before this field existed.
    const areaName = resolvedArea || label.split(',')[0].trim();
    if (!areaName) return;

    (order.products || []).forEach((line) => {
      const productId = String(line?.product?._id || line?._id || '');
      const storeKey = productStoreMap.get(productId);
      if (!storeKey) {
        console.log(
          '[ZoneDebug] order',
          order._id,
          'product',
          productId,
          'SKIPPED: productStoreMap has no storeId for this product (product missing from fetched list, or product.storeId is empty)',
        );
        return;
      }
      const storeEntry = storeCityMap.get(storeKey);
      if (!storeEntry) {
        console.log(
          '[ZoneDebug] order',
          order._id,
          'product',
          productId,
          'storeId',
          storeKey,
          'SKIPPED: storeCityMap has no matching store (storeId not found in stores list)',
        );
        return;
      }
      if (!storeEntry.active) {
        console.log(
          '[ZoneDebug] order',
          order._id,
          'product',
          productId,
          'storeId',
          storeKey,
          'SKIPPED: store is disabled',
        );
        return;
      }
      const cityKey = storeEntry.city;
      if (!cityKey) {
        console.log(
          '[ZoneDebug] order',
          order._id,
          'product',
          productId,
          'storeId',
          storeKey,
          'SKIPPED: store has empty city field',
        );
        return;
      }

      console.log(
        '[ZoneDebug] order',
        order._id,
        'product',
        productId,
        'city',
        cityKey,
        'area',
        areaName,
        '-> COUNTED',
      );

      if (!breakdown.has(cityKey)) breakdown.set(cityKey, new Map());
      const areaMap = breakdown.get(cityKey);
      areaMap.set(areaName, (areaMap.get(areaName) || 0) + 1);
    });
  });

  return breakdown;
}

function getStatus(orders, maxOrders) {
  if (maxOrders === 0) return 'low';
  const ratio = orders / maxOrders;
  if (ratio >= 0.7) return 'high';
  if (ratio >= 0.35) return 'medium';
  return 'low';
}

// ── Live delivery helpers (for "Live Deliveries" map filter) ─────────────────
function isLiveOrderStatus(status) {
  const s = String(status || '').toLowerCase();
  return Boolean(s) && !['delivered', 'cancelled', 'completed'].includes(s);
}

function buildLiveCityKeys(orders, products, stores) {
  const productStoreMap = new Map();
  (products || []).forEach((p) => {
    productStoreMap.set(String(p._id), String(p.storeId || ''));
  });

  const storeCityMap = new Map();
  (stores || []).forEach((s) => {
    if (!s?.storeId) return;
    storeCityMap.set(String(s.storeId), {
      city: String(s.city || '')
        .trim()
        .toLowerCase(),
      active: s.status !== 'disabled',
    });
  });
  const vendorCityMap = new Map();
  (stores || []).forEach((s) => {
    if (!s?.vendorObjectId) return;
    const vendorKey = String(s.vendorObjectId);
    const isStoreActive = s.status !== 'disabled';
    const existing = vendorCityMap.get(vendorKey);
    // Prefer the vendor's ACTIVE store's city. Only fall back to an
    // inactive store's city if this vendor has no active store at all.
    if (!existing || (!existing.active && isStoreActive)) {
      vendorCityMap.set(vendorKey, {
        city: String(s.city || '')
          .trim()
          .toLowerCase(),
        active: isStoreActive,
      });
    }
  });

  const liveKeys = new Set();
  (orders || []).forEach((order) => {
    if (!isLiveOrderStatus(order.status)) return;
    (order.products || []).forEach((line) => {
      const productId = String(line?.product?._id || line?._id || '');
      const storeKey = productStoreMap.get(productId);
      if (!storeKey) return;
      const storeEntry = storeCityMap.get(storeKey);
      if (!storeEntry || !storeEntry.active) return;
      const cityKey = storeEntry.city;
      if (!cityKey) return;
      liveKeys.add(cityKey);
    });
  });
  return liveKeys;
}

// ── Component ─────────────────────────────────────────────────────────────────
const EMPTY_ARRAY = [];

export default function ZonePerformance({
  orders: ordersProp,
  products: productsProp,
  stores: storesProp,
}) {
  // ordersPropSafe etc. fall back to ONE stable module-level EMPTY_ARRAY,
  // not a fresh `[]` literal — a new [] every render was the actual cause
  // of the map fighting your drag/zoom (see EMPTY_ARRAY below the imports).
  const ordersPropSafe = ordersProp || EMPTY_ARRAY;
  const productsPropSafe = productsProp || EMPTY_ARRAY;
  const storesPropSafe = storesProp || EMPTY_ARRAY;

  const [mapReady, setMapReady] = useState(false);
  const [leaflet, setLeaflet] = useState(null);
  const [cities, setCities] = useState([]);

  const [fetchedOrders, setFetchedOrders] = useState(EMPTY_ARRAY);
  const [fetchedProducts, setFetchedProducts] = useState(EMPTY_ARRAY);
  const [fetchedStores, setFetchedStores] = useState(EMPTY_ARRAY);

  const orders = ordersPropSafe.length ? ordersPropSafe : fetchedOrders;
  const products = productsPropSafe.length ? productsPropSafe : fetchedProducts;
  const stores = storesPropSafe.length ? storesPropSafe : fetchedStores;

  // Filters UI state (cosmetic toggles, matching the original design)
  const [showVendors, setShowVendors] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showLiveDeliveries, setShowLiveDeliveries] = useState(false);

  // Load Leaflet + CSS client-side only
  useEffect(() => {
    Promise.all([import('leaflet/dist/leaflet.css'), import('leaflet')])
      .then(([, L]) => {
        setLeaflet(L.default || L);
        setMapReady(true);
      })
      .catch(() => setMapReady(true));
  }, []);

  // Inject ping keyframe once
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('zone-ping-style')) return;
    const style = document.createElement('style');
    style.id = 'zone-ping-style';
    style.textContent = `
      @keyframes ping {
        75%, 100% { transform: scale(2.2); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  // Fetch cities (real lat/lng from vendor store mapLat/mapLng)
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API_BASE}/admin/cities`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => setCities(json.cities ?? []))
      .catch(() => {});
  }, []);

  // Self-fetch orders/products/stores when nothing was passed in as props
  // Self-fetch orders/products/stores when nothing was passed in as props.
  // Runs ONCE on mount — not on [ordersProp, productsProp, storesProp],
  // since those were new array references every render and caused an
  // infinite fetch → re-render → re-center loop that blocked map dragging.
  useEffect(() => {
    if (
      ordersPropSafe.length ||
      productsPropSafe.length ||
      storesPropSafe.length
    )
      return;
    const token = getToken();
    if (!token) return;

    Promise.all([
      apiGetAllOrders(token)
        .then((r) => r.data || [])
        .catch(() => []),
      apiGetAllAdminProducts(token, 'limit=300')
        .then((r) => r.data.products || [])
        .catch(() => []),
      apiGetAdminStores(token)
        .then((r) => r.data?.stores || [])
        .catch(() => []),
    ]).then(([ordersData, productsData, storesData]) => {
      console.log('[ZoneDebug] fetched orders count:', ordersData.length);
      console.log('[ZoneDebug] fetched products count:', productsData.length);
      console.log('[ZoneDebug] fetched stores count:', storesData.length);
      console.log(
        '[ZoneDebug] Test watch product entry:',
        productsData.find((p) => p._id === '6a834f5fd1353ee2bc2a3276'),
      );
      setFetchedOrders(ordersData);
      setFetchedProducts(productsData);
      setFetchedStores(storesData);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build order counts per city
  const orderCounts = useMemo(
    () => buildCityOrderCounts(orders, products, stores),
    [orders, products, stores],
  );

  // Active cities with valid coords + order count
  const activeCities = useMemo(() => {
    console.log('[ZoneDebug] raw /admin/cities response:', cities);
    const seen = new Map();
    cities
      .filter(
        (c) =>
          c.hasActiveStore &&
          Number.isFinite(Number(c.latitude)) &&
          Number.isFinite(Number(c.longitude)),
      )
      .forEach((c) => {
        const normalizedKey = String(c.cityKey || c.city || '')
          .trim()
          .toLowerCase();
        const entry = {
          ...c,
          cityKey: normalizedKey,
          lat: Number(c.latitude),
          lng: Number(c.longitude),
          count: orderCounts.get(normalizedKey) || 0,
        };
        const existing = seen.get(normalizedKey);
        if (!existing || entry.count > existing.count) {
          seen.set(normalizedKey, entry);
        }
      });
    return [...seen.values()];
  }, [cities, orderCounts]);

  // Top 3 cities by order count (only those with orders)
  const top3Zones = useMemo(() => {
    const withOrders = activeCities
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const max = withOrders[0]?.count || 0;

    return withOrders.map((c, i) => ({
      rank: i + 1,
      name: c.city,
      orders: c.count,
      vendors: c.vendorCount || 0,
      status: getStatus(c.count, max),
      cityKey: c.cityKey,
    }));
  }, [activeCities]);

  // Map center: average of all active cities
  const mapCenter = useMemo(() => {
    if (!activeCities.length) return [20.5937, 78.9629];
    const avgLat =
      activeCities.reduce((s, c) => s + c.lat, 0) / activeCities.length;
    const avgLng =
      activeCities.reduce((s, c) => s + c.lng, 0) / activeCities.length;
    return [avgLat, avgLng];
  }, [activeCities]);

  const mapZoom = activeCities.length === 1 ? 11 : 6;

  const getDotColor = (status) => {
    switch (status) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-orange-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'high':
        return 'High Demand';
      case 'medium':
        return 'Medium Demand';
      default:
        return 'Low Demand';
    }
  };

  // Vendor count per city (from stores)
  const vendorCountPerCity = useMemo(() => {
    const map = new Map();
    (stores || []).forEach((s) => {
      const city = String(s.city || '').toLowerCase();
      if (!city) return;
      map.set(city, (map.get(city) || 0) + 1);
    });
    return map;
  }, [stores]);

  // Enrich top3Zones with real vendor counts
  const enrichedTop3 = useMemo(
    () =>
      top3Zones.map((z) => ({
        ...z,
        vendors: vendorCountPerCity.get(z.cityKey) || z.vendors,
      })),
    [top3Zones, vendorCountPerCity],
  );

  // Per-city breakdown of real customer order sub-areas (from orderLocation
  // captured at checkout), so each store-city card can show e.g.
  // "Tirur - 4", "Ramanattukara - 2" underneath the city total.
  const cityAreaBreakdown = useMemo(
    () => buildCityAreaBreakdown(orders, products, stores),
    [orders, products, stores],
  );

  // ALL cities with at least one order (not just top 3), used to render a
  // full grid of city cards instead of the map.
  const allZones = useMemo(() => {
    const withOrders = activeCities
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count);
    const max = withOrders[0]?.count || 0;

    return withOrders.map((c, i) => ({
      rank: i + 1,
      name: c.city,
      orders: c.count,
      vendors: vendorCountPerCity.get(c.cityKey) || c.vendorCount || 0,
      status: getStatus(c.count, max),
      cityKey: c.cityKey,
      areas: Array.from(cityAreaBreakdown.get(c.cityKey)?.entries() || []).sort(
        (a, b) => b[1] - a[1],
      ),
    }));
  }, [activeCities, vendorCountPerCity, cityAreaBreakdown]);
  const maxCityOrders = useMemo(
    () => activeCities.reduce((m, c) => Math.max(m, c.count), 0) || 1,
    [activeCities],
  );

  // Cities with counted orders that have NO matching entry in /admin/cities
  // (e.g. a store's `city` field doesn't match any cityKey). Shown separately
  // so orders are never silently dropped from the UI.
  const orphanZones = useMemo(() => {
    const knownKeys = new Set(activeCities.map((c) => c.cityKey));
    const orphans = [];
    orderCounts.forEach((count, cityKey) => {
      if (!knownKeys.has(cityKey) && count > 0) {
        orphans.push({
          cityKey,
          name: cityKey,
          orders: count,
          vendors: vendorCountPerCity.get(cityKey) || 0,
          status: getStatus(count, maxCityOrders),
          areas: Array.from(
            cityAreaBreakdown.get(cityKey)?.entries() || [],
          ).sort((a, b) => b[1] - a[1]),
        });
      }
    });
    return orphans
      .sort((a, b) => b.orders - a.orders)
      .map((z, i) => ({ ...z, rank: allZones.length + i + 1 }));
  }, [
    orderCounts,
    activeCities,
    cityAreaBreakdown,
    maxCityOrders,
    vendorCountPerCity,
    allZones,
  ]);

  // Cities with at least one currently active (non-delivered/cancelled) order
  const liveCityKeys = useMemo(
    () => buildLiveCityKeys(orders, products, stores),
    [orders, products, stores],
  );

  // Real per-order customer locations (from navbar snapshot at checkout),
  // shown as a scatter alongside the vendor's store ping.
  const orderLocationPoints = useMemo(
    () => buildOrderLocationPoints(orders),
    [orders],
  );

  // What actually renders on the map after the "Live Deliveries" filter
  const mapVisibleCities = useMemo(
    () =>
      showLiveDeliveries
        ? activeCities.filter((c) => liveCityKeys.has(c.cityKey))
        : activeCities,
    [activeCities, liveCityKeys, showLiveDeliveries],
  );

  // Demand Density legend thresholds — derived from the same ratio logic as
  // getStatus(), so the legend numbers always match what's actually on the map
  const densityThresholds = useMemo(() => {
    const high = Math.max(1, Math.ceil(maxCityOrders * 0.7));
    const mediumMin = Math.max(1, Math.ceil(maxCityOrders * 0.35));
    return {
      high,
      mediumMin,
      mediumMax: Math.max(mediumMin, high - 1),
      lowMax: Math.max(mediumMin - 1, 0),
    };
  }, [maxCityOrders]);

  return (
    <div className="">
      {/* Header */}
      {/* <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          Geographic Insights
        </h2>
        <p className="text-slate-500 mt-1">
          Real-time demand mapping &amp; vendor distribution
        </p>
      </div> */}

      {/* Top Performing Zones */}
      {/* Zone Performance — all store cities as cards, with real order
          sub-areas (captured at checkout) listed underneath each */}
      <div className="mt-0">
        {allZones.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm border rounded-2xl bg-slate-50">
            {/* <span className="text-2xl block mb-1">📦</span> */}
            No order data available yet
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[...allZones, ...orphanZones].map((zone) => (
              <div
                key={zone.cityKey || zone.name}
                className="border-2 rounded-xl p-3.5 border-[#E5E7EB] bg-gradient-to-br from-[#F8FAFC] to-[#FFFFFF] shadow-sm hover:shadow-lg transition-all duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {zone.rank}
                    </div>
                    <h4 className="font-bold text-base leading-tight truncate">
                      {zone.name}
                    </h4>
                  </div>
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${getDotColor(zone.status)}`}
                    title={getStatusLabel(zone.status)}
                  />
                </div>

                <div className="mt-3 flex items-start justify-between">
                  {zone.vendors > 0 && (
                    <div>
                      <p className="text-slate-500 text-sm">Vendors</p>
                      <h3 className="text-xl font-bold text-slate-800">
                        {zone.vendors}
                      </h3>
                    </div>
                  )}

                  <div className="text-right">
                    <p className="text-slate-500 text-sm">Active Orders</p>
                    <h3 className="text-xl font-bold text-slate-800">
                      {zone.orders}
                    </h3>
                  </div>
                </div>
                {zone.areas.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-1">
                      Order Areas
                    </p>
                    <div className=" max-h-[110px] overflow-y-auto scrollbar-hide">
                      {/* <div className="space-y-1 max-h-[22px] overflow-y-auto scrollbar-hide"> */}
                      {zone.areas.map(([areaName, count]) => (
                        <div
                          key={areaName}
                          className="flex items-center justify-between text-sm pr-1"
                        >
                          <span className="text-slate-600 truncate">
                            {areaName}
                          </span>
                          <span className="font-semibold text-slate-800 shrink-0 ml-2">
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
