'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';

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

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://backend.delicod.com/api';
const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('adminToken') || '' : '';

// ── Ping icon factory (Leaflet DivIcon) ───────────────────────────────────────
function makePingIcon(L, hasOrders) {
  const color = hasOrders ? '#3B82F6' : '#10B981';
  const html = `
    <div style="position:relative;width:20px;height:20px;">
      <div style="
        position:absolute;inset:0;border-radius:50%;
        background:${color};opacity:0.25;
        animation:ping 1.8s cubic-bezier(0,0,0.2,1) infinite;
      "></div>
      <div style="
        position:absolute;top:4px;left:4px;width:12px;height:12px;
        border-radius:50%;background:${color};
        border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.25);
      "></div>
    </div>`;
  return L.divIcon({
    html,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

// ── Order counts ──────────────────────────────────────────────────────────────
function buildCityOrderCounts(orders, products, stores) {
  const productVendorMap = new Map();
  (products || []).forEach((p) => {
    productVendorMap.set(
      String(p._id),
      String(p.vendorId?._id || p.vendorId || ''),
    );
  });
  const vendorCityMap = new Map();
  (stores || []).forEach((s) => {
    if (s?.vendorObjectId && !vendorCityMap.has(String(s.vendorObjectId))) {
      vendorCityMap.set(
        String(s.vendorObjectId),
        String(s.city || '').toLowerCase(),
      );
    }
  });
  const counts = new Map();
  (orders || []).forEach((order) => {
    (order.products || []).forEach((line) => {
      const productId = String(line?.product?._id || line?._id || '');
      const vendorId = productVendorMap.get(productId);
      if (!vendorId) return;
      const cityKey = vendorCityMap.get(vendorId);
      if (!cityKey) return;
      counts.set(cityKey, (counts.get(cityKey) || 0) + 1);
    });
  });
  return counts;
}

// ── Map recenter hook ─────────────────────────────────────────────────────────
function MapRecenter({ center, zoom }) {
  const { useMap } = require('react-leaflet');
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom]);
  return null;
}
const MapRecenterDynamic = dynamic(() => Promise.resolve(MapRecenter), {
  ssr: false,
});

// ── Component ─────────────────────────────────────────────────────────────────
export default function LiveOrderActivitySection({
  orders = [],
  products = [],
  stores = [],
}) {
  const [mapReady, setMapReady] = useState(false);
  const [leaflet, setLeaflet] = useState(null);
  const [selectedState, setSelectedState] = useState('');
  const [cities, setCities] = useState([]);

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
    if (document.getElementById('ping-style')) return;
    const style = document.createElement('style');
    style.id = 'ping-style';
    style.textContent = `
      @keyframes ping {
        75%, 100% { transform: scale(2.2); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  // Fetch cities from /admin/cities (has real lat/lng from vendor store mapLat/mapLng)
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

  const orderCounts = useMemo(
    () => buildCityOrderCounts(orders, products, stores),
    [orders, products, stores],
  );

  // Active cities with valid coords
  const activeCities = useMemo(
    () =>
      cities
        .filter(
          (c) =>
            c.hasActiveStore &&
            Number.isFinite(Number(c.latitude)) &&
            Number.isFinite(Number(c.longitude)),
        )
        .map((c) => ({
          ...c,
          lat: Number(c.latitude),
          lng: Number(c.longitude),
          count: orderCounts.get(c.cityKey) || 0,
        })),
    [cities, orderCounts],
  );

  // State groups for dropdown
  const stateGroups = useMemo(() => {
    const map = new Map();
    activeCities.forEach((c) => {
      const s = c.state || 'Unknown';
      if (!map.has(s)) map.set(s, []);
      map.get(s).push(c);
    });
    return [...map.entries()]
      .map(([state, cs]) => ({ state, cities: cs }))
      .sort((a, b) => a.state.localeCompare(b.state));
  }, [activeCities]);

  useEffect(() => {
    if (stateGroups.length > 0 && !selectedState)
      setSelectedState(stateGroups[0].state);
  }, [stateGroups, selectedState]);

  const visibleCities = useMemo(
    () =>
      !selectedState
        ? activeCities
        : activeCities.filter((c) => c.state === selectedState),
    [activeCities, selectedState],
  );

  const mapCenter = useMemo(() => {
    if (!visibleCities.length) return [20.5937, 78.9629];
    const avgLat =
      visibleCities.reduce((s, c) => s + c.lat, 0) / visibleCities.length;
    const avgLng =
      visibleCities.reduce((s, c) => s + c.lng, 0) / visibleCities.length;
    return [avgLat, avgLng];
  }, [visibleCities]);

  const mapZoom = visibleCities.length === 1 ? 11 : 7;

  const topCity = useMemo(
    () => [...activeCities].sort((a, b) => b.count - a.count)[0] ?? null,
    [activeCities],
  );

  return (
    <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 min-h-[300px]">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Live Order Activity{selectedState ? ` — ${selectedState}` : ''}
          </h2>
          <p className="text-xs text-gray-500">
            Geographic distribution &amp; hotspots
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {stateGroups.length > 0 && (
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="text-xs rounded-lg border border-gray-200 bg-white px-2 py-1.5 outline-none focus:border-blue-400 text-gray-700"
            >
              {stateGroups.map((g) => (
                <option key={g.state} value={g.state}>
                  {g.state} ({g.cities.length})
                </option>
              ))}
            </select>
          )}
          {/* {topCity && topCity.count > 0 && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-50 font-semibold text-blue-700 border border-blue-200 whitespace-nowrap">
              Top: {topCity.city} ({topCity.count} orders)
            </span>
          )} */}
          {topCity && topCity.count > 0 && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-50 font-semibold text-blue-700 border border-blue-200 whitespace-nowrap">
              <MapPin className="w-3 h-3 font-semibold" />
              Top: {topCity.city} ({topCity.count} orders)
            </span>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="h-[240px] sm:h-[300px] rounded-xl border border-gray-200 overflow-hidden relative">
        {!mapReady ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : visibleCities.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-sm text-gray-400 gap-2">
            <span className="text-2xl">🗺️</span>
            <span>
              No active cities{selectedState ? ` in ${selectedState}` : ''}
            </span>
          </div>
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Recenter when state changes */}
            <MapRecenterDynamic center={mapCenter} zoom={mapZoom} />

            {leaflet &&
              visibleCities.map((city) => (
                <Marker
                  key={city.cityKey}
                  position={[city.lat, city.lng]}
                  icon={makePingIcon(leaflet, city.count > 0)}
                >
                  <Tooltip
                    direction="top"
                    offset={[0, -14]}
                    opacity={1}
                    permanent={false}
                  >
                    <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                      <p style={{ fontWeight: 600, margin: 0 }}>{city.city}</p>
                      <p style={{ color: '#6b7280', margin: 0 }}>
                        {city.state}
                      </p>
                      <p style={{ color: '#3b82f6', margin: 0 }}>
                        {city.count} orders
                      </p>
                    </div>
                  </Tooltip>
                </Marker>
              ))}
          </MapContainer>
        )}

        {/* Legend */}
        {/* {mapReady && visibleCities.length > 0 && (
          <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 border border-gray-200 rounded-lg px-2.5 py-1.5 text-[10px] text-gray-500 space-y-1 pointer-events-none">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              City with orders
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              Active (no orders yet)
            </div>
          </div>
        )} */}
      </div>

      {/* City pills */}
      {/* {visibleCities.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {visibleCities.map((c) => (
            <span
              key={c.cityKey}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-600"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              {c.city}
              {c.count > 0 && (
                <span className="text-blue-600 font-medium ml-0.5">
                  {c.count}
                </span>
              )}
            </span>
          ))}
        </div>
      )} */}
    </div>
  );
}
