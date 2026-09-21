const cache = new Map(); // key: "lat,lng" rounded, value: { state, ts }
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

export async function resolveCityFromCoords(lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const key = `city:${lat.toFixed(2)},${lng.toFixed(2)}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.state;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=10`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'RentnpayApp/1.0 (contact@rentnpay.com)' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const city =
      data?.address?.city ||
      data?.address?.town ||
      data?.address?.county ||
      data?.address?.state_district ||
      null;
    cache.set(key, { state: city, ts: Date.now() });
    return city;
  } catch (error) {
    console.error('Reverse geocode (city) failed:', error.message);
    return cached?.state || null;
  }
}

export async function resolveStateFromCoords(lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.state;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=5`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'RentnpayApp/1.0 (contact@rentnpay.com)' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const state = data?.address?.state || null;
    cache.set(key, { state, ts: Date.now() });
    return state;
  } catch (error) {
    console.error('Reverse geocode failed:', error.message);
    return cached?.state || null;
  }
}
