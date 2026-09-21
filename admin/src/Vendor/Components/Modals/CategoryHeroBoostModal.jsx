'use client';

import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  Search,
  Filter as FilterIcon,
  Upload,
  Plus,
  Calendar,
  Clock,
  Eye,
  Wallet,
  Smartphone,
  CreditCard,
  ShieldCheck,
  Heart,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Mock data — swap with real API data                               */
/* ------------------------------------------------------------------ */

const PRODUCTS = [
  {
    id: 'p1',
    name: 'Fabric Sofa 3-Seater',
    price: '₹1499/month',
    type: 'Rental',
    category: 'Furniture',
    subCategory: 'Sofa',
    stock: '12 Units',
    stockColor: 'text-slate-700',
    image:
      'https://images.unsplash.com/photo-1550254478-ead40cc54513?w=100&q=60',
  },
  {
    id: 'p2',
    name: 'Study Table (Wooden)',
    price: '₹899/month',
    type: 'Rental',
    category: 'Furniture',
    subCategory: 'Table',
    stock: '2 Units',
    stockColor: 'text-orange-500',
    image:
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=100&q=60',
  },
  {
    id: 'p3',
    name: 'Washing Machine (7kg)',
    price: '₹24,999',
    type: 'Sell',
    category: 'Appliances',
    subCategory: 'Washing Machine',
    stock: '-',
    stockColor: 'text-slate-400',
    image: 'https://images.unsplash.com/photo-1washer-placeholder?w=100&q=60',
  },
  {
    id: 'p4',
    name: 'Office Chair (Ergonomic)',
    price: '₹699/month',
    type: 'Rental',
    category: 'Furniture',
    subCategory: 'Chair',
    stock: '8 Units',
    stockColor: 'text-slate-700',
    image:
      'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=100&q=60',
  },
  {
    id: 'p5',
    name: 'Double Bed (King Size)',
    price: '₹1899/month',
    type: 'Sell',
    category: 'Furniture',
    subCategory: 'Bed',
    stock: '5 Units',
    stockColor: 'text-slate-700',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=100&q=60',
  },
  {
    id: 'p6',
    name: 'LED TV 43"',
    price: '₹1999/month',
    type: 'Rental',
    category: 'Electronics',
    subCategory: 'TV',
    stock: '3 Units',
    stockColor: 'text-orange-500',
    image:
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=100&q=60',
  },
  {
    id: 'p7',
    name: 'Refrigerator (Double Door)',
    price: '₹3499/month',
    type: 'Rental',
    category: 'Appliances',
    subCategory: 'Refrigerator',
    stock: '0 Units',
    stockColor: 'text-red-500',
    image:
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=100&q=60',
  },
  {
    id: 'p8',
    name: 'Dining Table (6-Seater)',
    price: '₹2199/month',
    type: 'Sell',
    category: 'Furniture',
    subCategory: 'Table',
    stock: '1 Units',
    stockColor: 'text-orange-500',
    image:
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=100&q=60',
  },
];

const DURATIONS = ['24 hrs', '48 hrs', '72 hrs', '7 days'];

const BOOST_PRICE = 299;

/* ------------------------------------------------------------------ */
/*  Shared modal shell                                                */
/* ------------------------------------------------------------------ */

function ModalShell({ onClose, onBack, step, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm sm:p-6">
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4 sm:px-7 sm:py-5">
          <div className="flex items-start gap-3">
            {step > 1 && (
              <button
                onClick={onBack}
                className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-gray-100 hover:text-slate-800"
                aria-label="Back"
              >
                <ChevronLeft size={18} />
              </button>
            )}
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
            <StepIndicator step={step} />
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
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ step }) {
  return (
    <div className="hidden items-center gap-1.5 sm:flex">
      {[1, 2, 3].map((n) => (
        <React.Fragment key={n}>
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
              n < step
                ? 'bg-blue-500 text-white'
                : n === step
                  ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                  : 'bg-gray-100 text-gray-400'
            }`}
          >
            {n}
          </div>
          {n < 3 && (
            <div
              className={`h-0.5 w-6 rounded ${
                n < step ? 'bg-blue-400' : 'bg-gray-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  STEP 1 — Choose 2 products                                        */
/* ------------------------------------------------------------------ */

function StepOne({ selected, onToggle, onNext, onClose }) {
  const [query, setQuery] = useState('');

  const filtered = PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div>
      <h3 className="text-base font-bold text-slate-900 sm:text-[17px]">
        Step 1: Choose 2 Products for Category Hero Boost
      </h3>
      <p className="mt-1 text-xs text-gray-500 sm:text-sm">
        Select exactly 2 products to feature at the #1 position in their
        category
      </p>

      {/* Toolbar */}
      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2.5 sm:flex-row">
          <div className="relative flex-1 sm:max-w-xs">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Product Name or SKU..."
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none placeholder:text-gray-400 focus:border-blue-400"
            />
          </div>
          <button className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-gray-50">
            <FilterIcon size={14} /> Filter
          </button>
          <button className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-gray-50">
            <Upload size={14} /> Bulk Update
          </button>
        </div>

        <button className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600">
          <Plus size={15} /> Add New Product
        </button>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60 text-[11px] uppercase tracking-wide text-gray-400">
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Sub-Category</th>
              <th className="px-4 py-3 font-semibold">Stock Level</th>
              <th className="px-4 py-3 text-right font-semibold">Select</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const isSelected = selected.some((s) => s.id === p.id);
              const disabled = !isSelected && selected.length >= 2;
              return (
                <tr
                  key={p.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                >
                  <td className="flex items-center gap-3 px-4 py-3">
                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={p.image}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => (e.currentTarget.style.opacity = 0)}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.price}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.type}</td>
                  <td className="px-4 py-3 text-slate-600">{p.category}</td>
                  <td className="px-4 py-3 text-slate-600">{p.subCategory}</td>
                  <td className={`px-4 py-3 font-medium ${p.stockColor}`}>
                    {p.stock}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      disabled={disabled}
                      onClick={() => onToggle(p)}
                      className={`rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition ${
                        isSelected
                          ? 'border-green-300 bg-green-50 text-green-600'
                          : disabled
                            ? 'cursor-not-allowed border-gray-100 text-gray-300'
                            : 'border-gray-200 text-slate-600 hover:bg-gray-50'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {selected.length}/2 products selected
        </p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            disabled={selected.length !== 2}
            onClick={onNext}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
              selected.length === 2
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'cursor-not-allowed bg-gray-300'
            }`}
          >
            Next: Set Duration →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  STEP 2 — Schedule                                                  */
/* ------------------------------------------------------------------ */

function ScheduleCard({ product, schedule, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-100 p-4 sm:grid-cols-2 sm:p-5">
      {/* Left: form */}
      <div>
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-gray-100">
            <img
              src={product.image}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => (e.currentTarget.style.opacity = 0)}
            />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{product.name}</p>
            <p className="text-xs text-gray-400">{product.category}</p>
            <p className="text-xs text-gray-400">{product.price}</p>
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <Calendar size={13} /> Start Date
          </label>
          <input
            type="date"
            value={schedule.startDate}
            onChange={(e) =>
              onChange({ ...schedule, startDate: e.target.value })
            }
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
          />
        </div>

        <div className="mt-3">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <Clock size={13} /> Duration
          </label>
          <select
            value={schedule.duration}
            onChange={(e) =>
              onChange({ ...schedule, duration: e.target.value })
            }
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
          >
            {DURATIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <p className="mt-3 text-[11px] text-gray-400">
          Featured in top position with &apos;Bestseller&apos; badge
        </p>
      </div>

      {/* Right: preview */}
      <div>
        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <Eye size={13} /> How It Will Look
        </p>
        <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-3">
          <span className="absolute left-2 top-2 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            30%
          </span>
          <Heart size={16} className="absolute right-2 top-2 text-gray-300" />
          <div className="h-24 w-full overflow-hidden rounded-lg bg-gray-200">
            <img
              src={product.image}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => (e.currentTarget.style.opacity = 0)}
            />
          </div>
          <span className="absolute left-2 top-[92px] rounded bg-orange-500 px-1.5 py-0.5 text-[9px] font-semibold text-white">
            Bestseller
          </span>
          <div className="mt-2">
            <p className="truncate text-xs font-semibold text-slate-800">
              {product.name}
            </p>
            <span className="mt-0.5 inline-block rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
              4.3 ★
            </span>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {product.price}
            </p>
            <button className="mt-2 flex w-full items-center justify-center gap-1 rounded-md bg-orange-500 py-1.5 text-[11px] font-semibold text-white">
              🛒 Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepTwo({ selected, schedules, onScheduleChange, onNext, onBack }) {
  const total = selected.length * BOOST_PRICE;

  return (
    <div>
      <h3 className="text-base font-bold text-slate-900 sm:text-[17px]">
        Step 2: Schedule Your Boost
      </h3>
      <p className="mt-1 text-xs text-gray-500 sm:text-sm">
        Choose when each product should be featured at #1 position
      </p>

      <div className="mt-5 space-y-4">
        {selected.map((p) => (
          <ScheduleCard
            key={p.id}
            product={p}
            schedule={schedules[p.id]}
            onChange={(s) => onScheduleChange(p.id, s)}
          />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
        <div>
          <p className="text-xs text-gray-400">Total Cost</p>
          <p className="text-lg font-bold text-slate-900">₹{total}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={onNext}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            Next: Payment →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  STEP 3 — Payment & Order Summary                                  */
/* ------------------------------------------------------------------ */

const PAYMENT_METHODS = [
  {
    id: 'wallet',
    label: 'Wallet Balance',
    sub: 'Available: ₹12,450',
    icon: Wallet,
  },
  {
    id: 'upi',
    label: 'UPI Payment',
    sub: 'PhonePe, GPay, Paytm',
    icon: Smartphone,
  },
  {
    id: 'card',
    label: 'Saved Card',
    sub: '•••• •••• •••• 4532',
    icon: CreditCard,
  },
];

function StepThree({ selected, schedules, onBack, onConfirm }) {
  const [method, setMethod] = useState('wallet');
  const subtotal = selected.length * BOOST_PRICE;
  const discount = Math.round(subtotal * 0.02);
  const total = subtotal - discount;

  return (
    <div>
      <h3 className="text-base font-bold text-slate-900 sm:text-[17px]">
        Step 3: Payment & Order Summary
      </h3>
      <p className="mt-1 text-xs text-gray-500 sm:text-sm">
        Review your order and complete payment
      </p>

      {/* Order Summary */}
      <div className="mt-5 rounded-xl border border-gray-100 p-4 sm:p-5">
        <p className="mb-3 text-sm font-semibold text-slate-800">
          Order Summary
        </p>
        <div className="divide-y divide-gray-50">
          {selected.map((p) => {
            const s = schedules[p.id];
            return (
              <div key={p.id} className="flex items-center gap-3 py-3">
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={p.image}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(e) => (e.currentTarget.style.opacity = 0)}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {p.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    Category Hero • {p.category}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Starts: {s.startDate || 'Not set'} • {s.duration}
                  </p>
                </div>
                <p className="text-sm font-bold text-slate-900">
                  ₹{BOOST_PRICE}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>
              Subtotal ({selected.length} products × ₹{BOOST_PRICE})
            </span>
            <span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>Gold Partner Discount (2%)</span>
            <span>-₹{discount}</span>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold text-slate-900">
            <span>Total Amount</span>
            <span>₹{total}</span>
          </div>
        </div>
      </div>

      {/* Payment method */}
      <div className="mt-5">
        <p className="mb-3 text-sm font-semibold text-slate-800">
          Select Payment Method
        </p>
        <div className="space-y-2.5">
          {PAYMENT_METHODS.map((m) => {
            const Icon = m.icon;
            const active = method === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                  active
                    ? 'border-blue-400 bg-blue-50/60'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    active
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <Icon size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {m.label}
                  </p>
                  <p className="text-xs text-gray-400">{m.sub}</p>
                </div>
                <span
                  className={`flex h-4.5 w-4.5 items-center justify-center rounded-full border-2 ${
                    active ? 'border-blue-500' : 'border-gray-300'
                  }`}
                >
                  {active && (
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => onConfirm(total, method)}
        className="mt-6 w-full rounded-xl bg-blue-500 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
      >
        Confirm & Pay ₹{total}
      </button>
      <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
        <ShieldCheck size={12} /> Secure payment • Your boost will be scheduled
        immediately
      </p>

      <button
        onClick={onBack}
        className="mt-3 w-full text-center text-xs font-medium text-slate-500 hover:text-slate-700"
      >
        ← Back to Schedule
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Root modal — controls step state                                  */
/* ------------------------------------------------------------------ */

export default function CategoryHeroBoostModal({ open, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState([]);
  const [schedules, setSchedules] = useState({});

  if (!open) return null;

  const toggleProduct = (product) => {
    setSelected((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) return prev.filter((p) => p.id !== product.id);
      if (prev.length >= 2) return prev;
      const next = [...prev, product];
      setSchedules((s) => ({
        ...s,
        [product.id]: s[product.id] || {
          startDate: '',
          duration: DURATIONS[1],
        },
      }));
      return next;
    });
  };

  const updateSchedule = (id, value) =>
    setSchedules((s) => ({ ...s, [id]: value }));

  const reset = () => {
    setStep(1);
    setSelected([]);
    setSchedules({});
  };

  const handleClose = () => {
    reset();
    onClose?.();
  };

  const handleConfirm = (total, method) => {
    onComplete?.({ selected, schedules, total, method });
    reset();
    onClose?.();
  };

  return (
    <ModalShell
      step={step}
      onClose={handleClose}
      onBack={() => setStep((s) => Math.max(1, s - 1))}
    >
      {step === 1 && (
        <StepOne
          selected={selected}
          onToggle={toggleProduct}
          onNext={() => setStep(2)}
          onClose={handleClose}
        />
      )}
      {step === 2 && (
        <StepTwo
          selected={selected}
          schedules={schedules}
          onScheduleChange={updateSchedule}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <StepThree
          selected={selected}
          schedules={schedules}
          onBack={() => setStep(2)}
          onConfirm={handleConfirm}
        />
      )}
    </ModalShell>
  );
}
