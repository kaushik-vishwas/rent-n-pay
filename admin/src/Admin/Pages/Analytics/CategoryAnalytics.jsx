'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiGetAllOrders, apiGetMasterCategories } from '@/service/api';

const MASTER_PLATFORMS = ['rent', 'buy', 'services'];

function orderGmv(o) {
  return (o.products || []).reduce(
    (s, i) =>
      s +
      Number(i.pricePerDay || 0) *
        Number(i.quantity || 0) *
        Number(o.rentalDuration || 0),
    0,
  );
}

function isCancelled(o) {
  return String(o.status || '').toLowerCase() === 'cancelled';
}

const slugify = (text) =>
  String(text || '')
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * Maps an order line to a Master Category name from admin Master Categories, or null
 * if the line is skipped in Category Performance (unmapped / legacy data).
 */
function resolveToMasterCategoryName(item, labelByKey, subKeyToParent) {
  const p = item?.product;
  if (!p || typeof p !== 'object') return null;

  const allowed = new Set(labelByKey.values());

  const matchMain = (raw) => {
    const s = String(raw || '').trim();
    if (!s) return null;
    const key = slugify(s);
    if (labelByKey.has(key)) return labelByKey.get(key);
    for (const label of labelByKey.values()) {
      if (label.toLowerCase() === s.toLowerCase()) return label;
    }
    if (allowed.has(s)) return s;
    return null;
  };

  const fromMain = matchMain(p.category);
  if (fromMain) return fromMain;

  const subRaw = String(p.subCategory || '').trim();
  if (subRaw) {
    const sk = slugify(subRaw);
    if (subKeyToParent.has(sk)) {
      const parent = subKeyToParent.get(sk);
      if (parent && allowed.has(parent)) return parent;
    }
  }

  return null;
}

/**
 * Maps an order line to a Master Sub-Category name, or null if unmapped.
 */
function resolveToMasterSubCategoryName(item, subLabelByKey) {
  const p = item?.product;
  if (!p || typeof p !== 'object') return null;
  const subRaw = String(p.subCategory || '').trim();
  if (!subRaw) return null;
  const sk = slugify(subRaw);
  if (subLabelByKey.has(sk)) return subLabelByKey.get(sk);
  for (const label of subLabelByKey.values()) {
    if (label.toLowerCase() === subRaw.toLowerCase()) return label;
  }
  return null;
}
const DONUT_COLORS = [
  '#1e3a8a', // dark blue
  '#3b82f6', // blue
  '#9333ea', // purple
  '#f97316', // orange
  '#16a34a', // green
  '#dc2626', // red
  '#0891b2', // teal
  '#64748b', // gray (kept last for "Others")
];

const SUB_DONUT_COLORS = [
  '#be185d', // pink
  '#059669', // emerald
  '#d97706', // amber
  '#4f46e5', // indigo
  '#0d9488', // teal-dark
  '#b91c1c', // red-dark
  '#7c3aed', // violet
  '#475569', // slate (kept last for "Others")
];

// function buildDonutSegments(categoryTotals) {
//   const entries = Object.entries(categoryTotals).filter(([, v]) => v > 0);
//   entries.sort((a, b) => b[1] - a[1]);
//   const top = entries.slice(0, 4);
//   const rest = entries.slice(4).reduce((s, [, v]) => s + v, 0);
//   if (rest > 0) top.push(['Others', rest]);
function buildDonutSegments(categoryTotals, palette = DONUT_COLORS) {
  const entries = Object.entries(categoryTotals).filter(([, v]) => v > 0);
  entries.sort((a, b) => b[1] - a[1]);
  // const top = entries.slice(0, 7);
  // const rest = entries.slice(7).reduce((s, [, v]) => s + v, 0);
  const top = entries.slice(0, 5);
  const rest = entries.slice(5).reduce((s, [, v]) => s + v, 0);
  if (rest > 0) top.push(['Others', rest]);

  const total = top.reduce((s, [, v]) => s + v, 0) || 1;
  const rows = top.map(([name, value], i) => ({
    name,
    value,
    pct: Math.round((value / total) * 100),
    color: palette[i % palette.length],
  }));

  const sumPct = rows.reduce((s, r) => s + r.pct, 0);
  if (rows.length && sumPct !== 100) {
    let diff = 100 - sumPct;
    // Apply the rounding correction to the largest segment (by value) so
    // small segments (e.g. "Others") never get pushed below 0%.
    let idx = 0;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i].value > rows[idx].value) idx = i;
    }
    rows[idx].pct = Math.max(0, rows[idx].pct + diff);
  }
  return rows;
}

function DonutChart({ segments, centerTitle, centerSubtitle }) {
  const size = 200;
  const stroke = 28;
  const r = (size - stroke) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const total = segments.reduce((s, x) => s + x.pct, 0) || 1;

  const arcs = segments.map((seg) => {
    const frac = seg.pct / total;
    const len = frac * circ;
    const dash = `${len} ${circ - len}`;
    const arc = (
      <circle
        key={seg.name}
        cx={c}
        cy={c}
        r={r}
        fill="none"
        stroke={seg.color}
        strokeWidth={stroke}
        strokeDasharray={dash}
        strokeDashoffset={-offset}
        transform={`rotate(-90 ${c} ${c})`}
        className="transition-opacity hover:opacity-90"
      />
    );
    offset += len;
    return arc;
  });

  return (
    <div className="flex flex-col items-center">
      <svg
        width="min(100%, 220px)"
        viewBox={`0 0 ${size} ${size}`}
        className="max-w-[220px]"
        aria-hidden
      >
        {arcs}
        <text
          x={c}
          y={c - 6}
          textAnchor="middle"
          className="fill-gray-400 text-[10px] font-medium"
        >
          {centerTitle}
        </text>
        <text
          x={c}
          y={c + 14}
          textAnchor="middle"
          className="fill-gray-900 text-sm font-semibold"
        >
          {centerSubtitle}
        </text>
      </svg>
    </div>
  );
}

async function fetchMasterCategoryMaps(token) {
  const labelByKey = new Map();
  const subKeyToParent = new Map();
  const subLabelByKey = new Map();
  const results = await Promise.all(
    MASTER_PLATFORMS.map((platform) =>
      apiGetMasterCategories(token, platform).catch(() => ({
        data: { tree: [] },
      })),
    ),
  );
  for (const res of results) {
    const tree = res.data?.tree || [];
    for (const c of tree) {
      const name = String(c.name || '').trim();
      if (!name) continue;
      const key = slugify(name);
      if (!labelByKey.has(key)) labelByKey.set(key, name);
      const subs = c.subCategories || [];
      for (const s of subs) {
        const subName = String(s.name || '').trim();
        if (!subName) continue;
        const sk = slugify(subName);
        if (!subKeyToParent.has(sk)) subKeyToParent.set(sk, name);
        if (!subLabelByKey.has(sk)) subLabelByKey.set(sk, subName);
      }
    }
  }
  return { labelByKey, subKeyToParent, subLabelByKey };
}

function CategoryPerformanceCard({ title, subtitle, segments, emptyHint }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="text-xs sm:text-sm text-gray-500 mt-0.5 mb-4">{subtitle}</p>
      {segments.length ? (
        <DonutChart
          segments={segments}
          centerTitle={
            title.includes('Sub') ? 'Top Sub-Category' : 'Top Category'
          }
          centerSubtitle={segments[0]?.name || '—'}
        />
      ) : (
        <div
          className="mx-auto flex h-[200px] max-w-[220px] flex-col items-center justify-center rounded-full border-2 border-dashed border-gray-200 bg-gray-50/80 text-center px-6"
          aria-hidden
        >
          <p className="text-xs font-medium text-gray-500">No chart data</p>
          <p className="mt-1 text-[11px] text-gray-400 leading-snug">
            {emptyHint}
          </p>
        </div>
      )}
      <ul className="mt-4 space-y-2.5">
        {segments.map((s) => (
          <li
            key={s.name}
            className="flex items-center justify-between text-sm"
          >
            <span className="flex items-center gap-2 text-gray-700 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: s.color }}
              />
              <span className="truncate">{s.name}</span>
            </span>
            <span className="font-medium text-slate-900 shrink-0 ml-2">
              {s.pct}%
            </span>
          </li>
        ))}
        {!segments.length ? (
          <li className="text-sm text-gray-400">{emptyHint}</li>
        ) : null}
      </ul>
    </div>
  );
}

const CategoryAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [masterMaps, setMasterMaps] = useState(() => ({
    labelByKey: new Map(),
    subKeyToParent: new Map(),
    subLabelByKey: new Map(),
  }));

  useEffect(() => {
    let mounted = true;
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (!token) {
      setError('Please login again to continue.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    Promise.all([apiGetAllOrders(token), fetchMasterCategoryMaps(token)])
      .then(([ordersRes, maps]) => {
        if (!mounted) return;
        setOrders(ordersRes.data || []);
        setMasterMaps(maps);
      })
      .catch((err) => {
        if (!mounted) return;
        setOrders([]);
        setMasterMaps({
          labelByKey: new Map(),
          subKeyToParent: new Map(),
          subLabelByKey: new Map(),
        });
        setError(err.response?.data?.message || 'Failed to load analytics.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const { segments, subSegments } = useMemo(() => {
    const activeOrders = (orders || []).filter((o) => !isCancelled(o));
    const { labelByKey, subKeyToParent, subLabelByKey } = masterMaps;

    const categoryTotals = {};
    const subCategoryTotals = {};

    activeOrders.forEach((o) => {
      const items = o.products || [];
      if (!items.length) return;
      items.forEach((it) => {
        console.log(it.product?.category, '->', it.product?.subCategory);
        const line = orderGmv({ ...o, products: [it] });
        const cat = resolveToMasterCategoryName(it, labelByKey, subKeyToParent);
        if (cat) {
          categoryTotals[cat] = (categoryTotals[cat] || 0) + line;
        }
        const subCat = resolveToMasterSubCategoryName(it, subLabelByKey);
        if (subCat) {
          subCategoryTotals[subCat] = (subCategoryTotals[subCat] || 0) + line;
        }
      });
    });
    console.log('categoryTotals →', categoryTotals);
    console.log('subCategoryTotals →', subCategoryTotals);

    return {
      segments: buildDonutSegments(categoryTotals, DONUT_COLORS),
      subSegments: buildDonutSegments(subCategoryTotals, SUB_DONUT_COLORS),
    };
  }, [orders, masterMaps]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* <div>
        <h2 className="text-xl font-bold text-gray-900">Category Analytics</h2>
        <p className="text-sm text-gray-500">
          Live revenue distribution by category & sub-category
        </p>
      </div> */}

      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        <CategoryPerformanceCard
          title="Category Performance"
          subtitle="Revenue distribution by category"
          segments={segments}
          emptyHint="Map products to Master Categories to see the split here."
        />
        <CategoryPerformanceCard
          title="Sub-Category Performance"
          subtitle="Revenue distribution by sub-category"
          segments={subSegments}
          emptyHint="Map products to Master Sub-Categories to see the split here."
        />
      </div>
    </div>
  );
};

export default CategoryAnalytics;
