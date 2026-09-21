'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  DollarSign,
  Eye,
  Wallet,
  LineChart,
  TrendingUp,
  Calculator,
  FileText,
  Check,
  Shield,
  Activity,
} from 'lucide-react';
import investmentMain from '@/assets/images/ivestment-main.png';

const ANNUAL_RATE = 0.12;
const MIN_INVEST = 10_000;
const MAX_INVEST = 15_00_000;
const TENURES = [3, 6, 12, 24];

function parseAmount(raw) {
  if (raw == null || raw === '') return NaN;
  const n = Number(String(raw).replace(/[,\s₹]/g, ''));
  return Number.isFinite(n) ? n : NaN;
}

function formatINR(n) {
  if (!Number.isFinite(n)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

export default function InvestMainPage() {
  const [monthlyRevenueStr, setMonthlyRevenueStr] = useState('₹1,00,000');
  const [principalStr, setPrincipalStr] = useState('50000');
  const [tenureMonths, setTenureMonths] = useState(12);

  const monthlyRevenue = useMemo(() => {
    const n = parseAmount(monthlyRevenueStr);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }, [monthlyRevenueStr]);

  const vendorOps = monthlyRevenue * 0.6;
  const investmentPool = monthlyRevenue * 0.4;

  const principalRaw = parseAmount(principalStr);
  const principal = useMemo(() => {
    if (!Number.isFinite(principalRaw) || principalRaw < 0) return 0;
    return Math.min(MAX_INVEST, Math.max(MIN_INVEST, principalRaw));
  }, [principalRaw]);

  const interestEarned = principal * ANNUAL_RATE * (tenureMonths / 12);
  const totalAtMaturity = principal + interestEarned;
  const monthlyInterest = tenureMonths > 0 ? interestEarned / tenureMonths : 0;

  const principalInRange =
    Number.isFinite(principalRaw) &&
    principalRaw >= MIN_INVEST &&
    principalRaw <= MAX_INVEST;

  return (
    <div className="bg-white text-black">
      {/* Hero */}
      <section className="border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <div className="mb-4 inline-flex items-center gap-1.5 border border-[#BEDBFF] rounded-full bg-[#EFF6FF] px-3 py-2 text-xs font-semibold text-[#2563EB]">
                <Shield className="h-3.5 w-3.5" />
                Verified Investment Platform
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl lg:text-[2.65rem] lg:leading-tight">
                Fuel Local Growth, Earn Monthly Returns
              </h1>
              <p className="mt-4 max-w-xl text-base text-black">
                Fund verified local vendors and earn a share of their real-world
                rental revenue.
              </p>
              <Link
                href="#investment-calculator"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#F97316] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-orange-600"
              >
                View Investment Opportunities
                <ArrowRight className="h-4 w-4" />
              </Link>

              {/* <div className="mt-10 grid grid-cols-3 gap-4  pt-8 sm:gap-8">
                {[
                  ['15%+', 'Avg. Returns'],
                  ['350+', 'Active Investors'],
                  ['₹8Cr+', 'Funded'],
                ].map(([n, l]) => (
                  <div key={l}>
                    <p className="text-xl font-bold text-[#F97316] sm:text-2xl">
                      {n}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                      {l}
                    </p>
                  </div>
                ))}
              </div> */}
              <div className="mt-10 grid grid-cols-3 gap-4 border-t-2 border-[#E5E7EB] pt-8 sm:gap-8">
                {[
                  ['15%+', 'Avg. Returns'],
                  ['350+', 'Active Investors'],
                  ['₹8Cr+', 'Funded'],
                ].map(([n, l]) => (
                  <div key={l}>
                    <p className="text-xl font-bold text-[#F97316] sm:text-2xl">
                      {n}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                      {l}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="relative overflow-visible rounded-2xl shadow-lg ring-1 ring-slate-200/60">
                <Image
                  src={investmentMain}
                  alt="Investment"
                  width={900}
                  height={600}
                  className="h-auto w-full rounded-2xl border-4 border-white object-cover"
                  priority
                />

                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                <div className="absolute -bottom-6 -left-6 w-[450px] rounded-xl bg-white p-5 shadow-xl ring-1 ring-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F97316] text-white">
                      <TrendingUp className="h-5 w-5" />
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-semibold uppercase tracking-wide text-[#64748B]">
                        Portfolio Growth
                      </p>
                      <p className="text-2xl font-bold text-[#F97316]">
                        +22.8% This Quarter
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Investment mechanism */}
      <section className="mx-auto max-w-6xl px-4 py-12  lg:py-12">
        <div className="text-center">
          <div className="mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] border border-[#BEDBFF] px-3 py-2 text-xs font-semibold text-[#2563EB]">
            <DollarSign className="h-3.5 w-3.5 text-[#2563EB]" />
            Investment Mechanism
          </div>
          <h2 className="text-2xl font-bold text-black sm:text-3xl">
            Smart Capital for Smart Vendors
          </h2>
          <p className="mx-auto mt-3 text-sm max-w-2xl text-[#64748B]">
            We empower vendors to scale by unlocking{' '}
            <span className="font-semibold text-[#2563EB]">
              40% of their total revenue
            </span>{' '}
            as investment-backed loans.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-8 lg:p-10">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <h3 className="text-lg font-bold text-black">
                Revenue Allocation Model
              </h3>
              <div className="mt-5 rounded-xl border border-[#E5E7EB] bg-gradient-to-r from-[#EFF6FF] to-[#F9FAFB] p-4">
                <label
                  htmlFor="monthly-revenue"
                  className="text-[11px] font-bold uppercase tracking-wide text-[#64748B]"
                >
                  Total Monthly Revenue
                </label>
                <input
                  id="monthly-revenue"
                  inputMode="decimal"
                  value={monthlyRevenueStr}
                  onChange={(e) => setMonthlyRevenueStr(e.target.value)}
                  className="mt-2 w-full border-0 bg-transparent text-2xl font-bold text-black outline-none placeholder:text-slate-400"
                  placeholder="100000"
                />
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-md bg-[#64748B]" />
                      <span className="font-semibold text-black">
                        Vendor Operations
                      </span>
                    </div>

                    <span className="font-semibold text-[#6A7282]">60%</span>
                  </div>

                  <div className="relative h-10 w-full overflow-hidden rounded-lg border-2 border-[#F3F4F6] bg-gradient-to-r from-[#EFF6FF] to-[#F9FAFB]">
                    <div
                      className="flex h-full items-center justify-center rounded-lg  bg-gradient-to-r from-[#99A1AF] to-[#6A7282] text-xs font-medium text-white transition-all duration-300"
                      style={{ width: '60%' }}
                    >
                      ₹60,000 / Business Growth
                    </div>
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-md bg-[#F97316]" />
                      <span className="font-semibold text-black">
                        Investment Pool
                      </span>
                    </div>

                    <span className="font-semibold text-[#2563EB]">40%</span>
                  </div>

                  <div className="relative h-10 w-full overflow-hidden rounded-lg border-2 border-[#8EC5FF] bg-[#EFF6FF]">
                    <div
                      className="flex h-full items-center justify-center rounded-lg bg-[#F97316] text-xs font-medium text-white transition-all duration-300"
                      style={{ width: '40%' }}
                    >
                      ₹40,000 / Investor Returns
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-black">
                Why This Model Works
              </h3>
              <ul className="mt-6 space-y-5">
                {[
                  {
                    t: 'Proven Revenue Stream',
                    d: 'Only vendors with 6+ months of consistent rental income.',
                  },
                  {
                    t: 'Physical Asset Backing',
                    d: 'All inventory is verified and insured for your protection.',
                  },
                  {
                    t: 'Transparent Allocation',
                    d: 'Real-time tracking of how your capital is deployed.',
                  },
                  {
                    t: 'Fixed Returns',
                    d: '12% annual returns with monthly interest payouts.',
                  },
                ].map(({ t, d }) => (
                  <li key={t} className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white border-2 border-[#F97316] text-[#F97316]">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                    <div>
                      <p className="font-bold text-base text-black">{t}</p>
                      <p className="mt-0.5 text-sm text-[#64748B]">{d}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section
        id="investment-calculator"
        className="scroll-mt-24 border-t border-slate-100 bg-slate-50/60 py-12 lg:py-12"
      >
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <div className="mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#F97316] bg-[#F0FDF4] px-3 py-2 text-xs font-semibold text-[#F97316]">
              <Calculator className="h-3.5 w-3.5" />
              Investment Calculator
            </div>
            <h2 className="text-2xl font-bold text-black sm:text-3xl">
              Calculate Your Returns
            </h2>
            <p className="mx-auto text-sm mt-3 max-w-xl text-[#64748B]">
              See exactly how much you can earn with fixed 12% annual returns.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-4xl rounded-2xl border-2 border-[#F97316] bg-white p-5 shadow-xl shadow-orange-100/50 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
              <div>
                <div className="flex items-center gap-2 text-black">
                  <Wallet className="h-4 w-4 text-[#2563EB]" />
                  <h3 className="font-bold">Investment Details</h3>
                </div>
                <label
                  htmlFor="principal"
                  className="mt-6 block text-[11px] font-bold uppercase tracking-wide text-slate-500"
                >
                  Investment Amount
                </label>
                <div className="mt-2 flex rounded-xl border-2 border-[#D0D4DC] bg-[#F9FAFB] focus-within:border-[#F97316] focus-within:ring-2 focus-within:ring-orange-100">
                  <span className="flex items-center pl-3 pr-2 text-[#2563EB]">
                    ₹
                  </span>

                  <input
                    id="principal"
                    inputMode="numeric"
                    value={principalStr}
                    onChange={(e) => setPrincipalStr(e.target.value)}
                    className="w-full border-0 text-[#64748B] bg-transparent py-3 pr-3 text-lg font-semibold outline-none"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Minimum: {formatINR(MIN_INVEST)} — Maximum:{' '}
                  {formatINR(MAX_INVEST)}
                </p>
                {!principalInRange &&
                principalStr !== '' &&
                Number.isFinite(principalRaw) ? (
                  <p className="mt-1 text-xs text-red-600">
                    Amount is adjusted to the allowed range for the estimate
                    below.
                  </p>
                ) : null}

                <p className="mt-6 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Select Tenure (Months)
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {TENURES.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTenureMonths(m)}
                      className={`rounded-lg border-2 px-4 py-2 text-sm font-semibold transition ${
                        tenureMonths === m
                          ? 'border-[#F97316] bg-[#F97316] text-white'
                          : 'border-[#D1D5DC] bg-white text-[#64748B] hover:border-slate-300'
                      }`}
                    >
                      {m} Months
                    </button>
                  ))}
                </div>
              </div>

              <div className="-m-5 rounded-r-2xl bg-[#EFF5FF] p-5 sm:-m-8 sm:p-8">
                <div className="flex items-center gap-2 text-black">
                  <TrendingUp className="h-4 w-4 text-[#F97316]" />
                  <h3 className="font-bold">Your Returns</h3>
                </div>
                <div className="mt-6 rounded-xl border-2 border-[#F97316] bg-white px-4 py-4 text-start">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    Fixed Interest Rate
                  </p>
                  <p className="mt-1 text-3xl font-bold text-[#F97316]">
                    12% p.a.
                  </p>
                </div>
                <ul className="mt-6 space-y-3 text-sm">
                  <li className="flex justify-between  pb-2">
                    <span className="text-[#64748B]">Principal Amount</span>
                    <span className="font-semibold text-black">
                      {formatINR(principal)}
                    </span>
                  </li>
                  <li className="flex justify-between  pb-2">
                    <span className="text-[#64748B]">Interest Earned</span>
                    <span className="font-semibold text-[#F97316]">
                      +{formatINR(interestEarned)}
                    </span>
                  </li>
                  <li className="flex justify-between pb-2">
                    <span className="text-[#64748B]">Tenure</span>
                    <span className="font-semibold text-black">
                      {tenureMonths} Months
                    </span>
                  </li>
                </ul>
                {/* <p className="text-xs text-slate-500">
                  Est. monthly payout:{' '}
                  <span className="font-semibold text-slate-700">
                    {formatINR(monthlyInterest)}
                  </span>
                </p> */}
                <div className="mt-5 rounded-xl bg-[#F97316] px-4 py-5 text-start text-white">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/90">
                    Total Returns at Maturity
                  </p>
                  <p className="mt-1 text-2xl font-bold sm:text-3xl">
                    {formatINR(totalAtMaturity)}
                  </p>
                </div>
                <p className="mt-4 text-center text-xs text-[#64748B]">
                  Monthly interest payouts • Capital protected by verified
                  inventory
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-12 lg:py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black sm:text-3xl">
            How It Works
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-slate-600">
            Four simple steps from investment to returns.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              Icon: Eye,
              title: 'Discover Vendors',
              text: 'Browse verified local shops with proven revenue.',
            },
            {
              Icon: Wallet,
              title: 'Deploy Capital',
              text: 'Fund the 40% growth pool for your chosen vendor.',
            },
            {
              Icon: Activity,
              title: 'Track Performance',
              text: 'Monitor real-time rental earnings via your dashboard.',
            },
            {
              Icon: TrendingUp,
              title: 'Receive Payouts',
              text: 'Monthly returns delivered directly to your wallet.',
            },
          ].map(({ Icon, title, text }) => (
            <div
              key={title}
              className="min-h-[220px] flex flex-col justify-end rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-lg shadow-slate-200/60 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F97316] text-white">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-extrabold text-black">{title}</h3>
              <p className="mt-2 text-sm font-semibold text-[#64748B]">
                {text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center gap-3">
          <Link
            href="/invest-with-us"
            className="inline-flex items-center gap-2 rounded-xl bg-[#F97316] px-8 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-orange-600"
          >
            Contact Us
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-center font-semibold text-xs text-[#64748B]">
            Join 350+ investors earning monthly returns • Minimum investment:{' '}
            {formatINR(MIN_INVEST)}
          </p>
        </div>
      </section>
    </div>
  );
}
