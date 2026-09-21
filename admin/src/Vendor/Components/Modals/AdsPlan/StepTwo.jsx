// 'use client';

// import React, { useState, useEffect } from 'react';
// import { X, ChevronLeft, Calendar, Clock, Eye, Heart } from 'lucide-react';
// import { StepDots } from './StepOne';

// const DURATIONS = ['24 hrs'];
// export const BOOST_PRICE = 299;

// function ScheduleCard({ product, schedule, onChange, rank }) {
//   return (
//     <div className="grid grid-cols-1 gap-3 rounded-xl border border-gray-100 p-3.5 sm:grid-cols-2 sm:p-4">
//       {/* Left: form */}
//       <div>
//         <div className="flex items-center gap-2.5">
//           <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
//             {rank}
//           </span>
//           <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-gray-100">
//             <img
//               src={product.image}
//               alt=""
//               className="h-full w-full object-cover"
//               onError={(e) => (e.currentTarget.style.opacity = 0)}
//             />
//           </div>
//           <div>
//             <p className="text-sm font-bold text-slate-900">{product.name}</p>
//             <p className="text-xs text-gray-400">{product.category}</p>
//             <p className="text-xs font-medium text-orange-500">
//               {product.price}
//             </p>
//             <p className="text-[11px] text-gray-400">
//               Currently ranked #{product.currentRank || '—'}
//             </p>
//           </div>
//         </div>

//         <div className="mt-2.5">
//           <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-600">
//             <Calendar size={13} /> Start Date
//           </label>
//           <input
//             type="date"
//             value={schedule.startDate}
//             placeholder="Get Notified"
//             onChange={(e) =>
//               onChange({ ...schedule, startDate: e.target.value })
//             }
//             className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-slate-500 outline-none focus:border-blue-400"
//           />
//         </div>

//         <div className="mt-2">
//           <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-600">
//             <Clock size={13} /> Duration
//           </label>
//           <select
//             value={schedule.duration}
//             onChange={(e) =>
//               onChange({ ...schedule, duration: e.target.value })
//             }
//             className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-slate-500 outline-none focus:border-blue-400"
//           >
//             {DURATIONS.map((d) => (
//               <option key={d} value={d}>
//                 {d}
//               </option>
//             ))}
//           </select>
//         </div>

//         <p className="mt-2 text-[11px] text-gray-400">
//           Featured in top position with 'Bestseller' badge
//         </p>
//       </div>

//       {/* Right: preview */}
//       <div>
//         <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-600">
//           <Eye size={13} /> How It Will Look
//         </p>
//         <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-2.5">
//           <span className="absolute left-2 top-2 z-10 rounded bg-orange-500 px-1.5 py-0.5 text-[9px] font-semibold text-white">
//             Bestseller
//           </span>
//           {product.discountPercent > 0 && (
//             <span className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
//               {Math.round(product.discountPercent)}%
//             </span>
//           )}
//           <div className="relative h-32 w-full overflow-hidden rounded-lg bg-gray-200">
//             <img
//               src={product.image}
//               alt=""
//               className="h-full w-full object-cover"
//               onError={(e) => (e.currentTarget.style.opacity = 0)}
//             />
//             {/* {product.deliveryEta && (
//               <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white">
//                 {product.deliveryEta}
//               </span>
//             )} */}
//             <Heart
//               size={14}
//               className="absolute bottom-1.5 right-1.5 text-white/90"
//             />
//           </div>
//           <div className="mt-2">
//             <p className="truncate text-xs font-semibold text-slate-800">
//               {product.name}
//             </p>
//             <div className="mt-1 flex items-center gap-1.5">
//               <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
//                 {product.condition}
//               </span>
//               {product.numReviews > 0 && (
//                 <span className="inline-block rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
//                   {product.averageRating.toFixed(1)} ★
//                 </span>
//               )}
//             </div>
//             <p className="mt-1 text-sm font-bold text-slate-900">
//               {product.price}
//             </p>
//             <button className="mt-2 flex w-full items-center justify-center gap-1 rounded-md bg-orange-500 py-1.5 text-[11px] font-semibold text-white">
//               Buy Now
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /**
//  * StepTwo — "Schedule Your Boost" modal.
//  *
//  * Props:
//  *  - open: boolean
//  *  - products: Array of the 2 products chosen in StepOne
//  *  - onBack: () => void, go back to StepOne
//  *  - onClose: () => void, close entirely
//  *  - onNext: (schedules) => void, called with { [productId]: { startDate, duration } }
//  *            when "Next: Payment →" is clicked
//  */
// export default function StepTwo({ open, products, onBack, onClose, onNext }) {
//   const [schedules, setSchedules] = useState({});

//   // seed default schedule whenever the product list changes
//   useEffect(() => {
//     if (!products) return;
//     setSchedules((prev) => {
//       const next = { ...prev };
//       products.forEach((p) => {
//         if (!next[p.id]) next[p.id] = { startDate: '', duration: DURATIONS[1] };
//       });
//       return next;
//     });
//   }, [products]);

//   if (!open || !products || products.length === 0) return null;

//   const total = products.length * BOOST_PRICE;

//   const updateSchedule = (id, value) =>
//     setSchedules((s) => ({ ...s, [id]: value }));

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm sm:p-6">
//       <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
//         {/* Header */}
//         <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4 sm:px-7 sm:py-5">
//           <div className="flex items-start gap-3">
//             <button
//               onClick={onBack}
//               className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-gray-100 hover:text-slate-800"
//               aria-label="Back"
//             >
//               <ChevronLeft size={18} />
//             </button>
//             <div>
//               <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
//                 Category Hero Boost
//               </h2>
//               <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
//                 Get your products featured at #1 position
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center gap-4">
//             <StepDots step={2} />
//             <button
//               onClick={onClose}
//               className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-gray-100 hover:text-slate-700"
//               aria-label="Close"
//             >
//               <X size={18} />
//             </button>
//           </div>
//         </div>

//         {/* Body */}
//         <div className="hide-scrollbar flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
//           <h3 className="text-base font-bold text-slate-900 sm:text-[17px]">
//             Step 2: Schedule Your Boost
//           </h3>
//           <p className="mt-1 text-xs text-gray-500 sm:text-sm">
//             Choose when each product should be featured at #1 position
//           </p>

//           <div className="mt-4 flex flex-col gap-3">
//             {products.map((p, index) => (
//               <ScheduleCard
//                 key={p.id}
//                 product={p}
//                 rank={index + 1}
//                 schedule={
//                   schedules[p.id] || { startDate: '', duration: DURATIONS[1] }
//                 }
//                 onChange={(s) => updateSchedule(p.id, s)}
//               />
//             ))}
//           </div>

//           <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
//             <div>
//               <p className="text-xs text-gray-400">Total Cost</p>
//               <p className="text-lg font-bold text-slate-900">₹{total}</p>
//             </div>
//             <div className="flex gap-2">
//               <button
//                 onClick={onBack}
//                 className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-gray-50"
//               >
//                 Back
//               </button>
//               <button
//                 onClick={() => onNext(schedules)}
//                 className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
//               >
//                 Next: Payment →
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  Calendar,
  Clock,
  TrendingUp,
  Heart,
  Truck,
  ShoppingCart,
  Sparkles,
} from 'lucide-react';

const DURATIONS = ['24 hrs'];
import { StepDots } from './StepOne';

export const BOOST_PRICE = 299;

// Static example used inside the "How It Will Look" preview.
// This is intentionally the same for every product — it's a template
// preview showing what the Bestseller/boosted card style looks like,
// not the user's actual product data.
const PREVIEW_EXAMPLE = {
  rating: 4.3,
  discountPercent: 30,
  deliveryEta: '2-4 days',
};

function DateField({ icon, label, value, onChange }) {
  return (
    <div className="mt-3">
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600">
        {icon} {label}
      </label>
      {/* <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-400"
      /> */}
      <input
        type="date"
        value={value}
        min={new Date().toISOString().split('T')[0]}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-400"
      />
    </div>
  );
}

function DurationField({ icon, label, value, onChange }) {
  return (
    <div className="mt-3">
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600">
        {icon} {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-400"
      >
        {DURATIONS.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
    </div>
  );
}

function PreviewCard({ product }) {
  const p = { ...PREVIEW_EXAMPLE, ...product };
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-600">
        <TrendingUp size={14} /> How It Will Look
      </p>
      <div className="rounded-2xl bg-indigo-50/60 p-3">
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="relative h-64 w-full overflow-hidden bg-gray-200 sm:h-72">
            <img
              src={product.image}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => (e.currentTarget.style.opacity = 0)}
            />

            <span className="absolute left-2.5 top-2.5 z-10 rounded bg-orange-500 px-2 py-1 text-[10px] font-semibold text-white">
              Bestseller
            </span>

            {p.discountPercent > 0 && (
              <span className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white">
                {p.discountPercent}%
              </span>
            )}

            {/* {p.deliveryEta && (
              <span className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1 rounded bg-white/90 px-2 py-1 text-[10px] font-medium text-slate-700 shadow-sm">
                <Truck size={11} /> {p.deliveryEta}
              </span>
            )} */}

            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1">
              <span className="h-1.5 w-4 rounded-full bg-white" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
            </div>

            <button
              type="button"
              className="absolute bottom-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm"
              aria-label="Save"
            >
              <Heart size={14} />
            </button>
          </div>

          <div className="p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold text-slate-800">
                {product.name}
              </p>
              <span className="flex shrink-0 items-center gap-0.5 rounded bg-green-100 px-1.5 py-0.5 text-[11px] font-semibold text-green-700">
                {(product.averageRating || p.rating).toFixed(1)} ★
              </span>
            </div>

            <div className="mt-1.5">
              <span className="inline-block rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-semibold text-orange-600">
                {product.condition}
              </span>
            </div>

            <p className="mt-1.5 text-base font-bold text-slate-900">
              {product.price}
            </p>

            <button
              type="button"
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-orange-500 py-2.5 text-xs font-semibold text-white transition hover:bg-orange-600"
            >
              <ShoppingCart size={13} /> Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScheduleCard({ product, rank, schedule, onChange }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_1.15fr] sm:gap-8">
        {/* Left: product + locked fields */}
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[11px] font-bold text-white">
              {rank}
            </span>
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-gray-100">
              <img
                src={product.image}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => (e.currentTarget.style.opacity = 0)}
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-slate-900">
                {product.name}
              </p>
              <p className="text-xs text-gray-400">{product.category}</p>
            </div>
          </div>

          <p className="mt-2 text-sm font-medium text-orange-500">
            {product.price}
          </p>
          {/* <p className="mt-0.5 text-xs text-gray-400">
            Currently ranked #{product.currentRank ?? '—'}
          </p> */}

          <DateField
            icon={<Calendar size={13} />}
            label="Start Date"
            value={schedule.startDate}
            onChange={(val) => onChange({ ...schedule, startDate: val })}
          />
          <DurationField
            icon={<Clock size={13} />}
            label="Duration"
            value={schedule.duration}
            onChange={(val) => onChange({ ...schedule, duration: val })}
          />

          <p className="mt-4 flex items-center gap-1.5 text-[11px] text-gray-400">
            <Sparkles size={12} className="text-orange-400" />
            Featured in top position with &apos;Bestseller&apos; badge
          </p>
        </div>

        {/* Right: static example preview */}
        <PreviewCard product={product} />
      </div>
    </div>
  );
}

/**
 * StepTwo — "Schedule Your Boost" modal.
 *
 * Props:
 *  - open: boolean
 *  - products: Array of the products chosen in StepOne
 *  - onBack: () => void, go back to StepOne
 *  - onClose: () => void, close entirely
 *  - onNext: () => void, called when "Next: Payment →" is clicked
 *
 * Note: per Figma, Start Date and Duration are shown as a locked
 * "Get Notified" state in this step (feature not yet self-serve),
 * so no schedule values are collected here.
 */
export default function StepTwo({ open, products, onBack, onClose, onNext }) {
  const [schedules, setSchedules] = useState({});

  useEffect(() => {
    if (!products) return;
    setSchedules((prev) => {
      const next = { ...prev };
      products.forEach((p) => {
        if (!next[p.id]) next[p.id] = { startDate: '', duration: DURATIONS[0] };
      });
      return next;
    });
  }, [products]);

  if (!open || !products || products.length === 0) return null;

  const total = products.length * BOOST_PRICE;

  const updateSchedule = (id, value) =>
    setSchedules((s) => ({ ...s, [id]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm sm:p-6">
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4 sm:px-7 sm:py-5">
          <div className="flex items-start gap-3">
            <button
              onClick={onBack}
              className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-gray-100 hover:text-slate-800"
              aria-label="Back"
            >
              <ChevronLeft size={18} />
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                Category Hero Boost
              </h2>
              <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                Get your products featured at #1 position
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <StepDots step={2} />
            <button
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-gray-100 hover:text-slate-700"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="hide-scrollbar flex-1 overflow-y-auto bg-gray-50/60 px-5 py-5 sm:px-7 sm:py-6">
          <h3 className="text-base font-bold text-slate-900 sm:text-[17px]">
            Step 2: Schedule Your Boost
          </h3>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            Choose when each product should be featured at #1 position
          </p>

          <div className="mt-5 flex flex-col gap-5">
            {products.map((p, index) => (
              <ScheduleCard
                key={p.id}
                product={p}
                rank={index + 1}
                schedule={
                  schedules[p.id] || { startDate: '', duration: DURATIONS[0] }
                }
                onChange={(s) => updateSchedule(p.id, s)}
              />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-gray-50/60 pt-4">
            <div>
              <p className="text-xs text-gray-400">Total Cost</p>
              <p className="text-lg font-bold text-slate-900">₹{total}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onBack}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => onNext(schedules)}
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
              >
                Next: Payment →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
