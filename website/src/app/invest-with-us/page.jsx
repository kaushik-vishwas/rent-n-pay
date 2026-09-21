'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Phone,
  User,
  Building2,
  Send,
  ArrowLeft,
  Briefcase,
  FileText,
} from 'lucide-react';
import { apiCreateInvestorEnquiry } from '@/lib/api';

function cls(...parts) {
  return parts.filter(Boolean).join(' ');
}

function formatSubmitError(e) {
  return (
    e?.response?.data?.message ||
    e?.message ||
    'Could not submit your enquiry. Please try again.'
  );
}

export default function InvestWithUsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('investor');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState({ type: '', message: '' });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    subject: '',
    fullName: '',
    emailAddress: '',
    phoneNumber: '',
    companyName: '',
    investmentRange: '',
    message: '',
  });
  const validateForm = () => {
    const errors = {};

    if (!form.subject.trim()) errors.subject = 'Subject is required';
    if (!form.fullName.trim()) errors.fullName = 'Full name is required';

    if (!form.emailAddress.trim()) {
      errors.emailAddress = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailAddress.trim())) {
      errors.emailAddress = 'Enter a valid email address';
    }

    if (!form.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(form.phoneNumber.trim())) {
      errors.phoneNumber = 'Phone number must be exactly 10 digits';
    }
    if (!form.companyName.trim())
      errors.companyName = 'Company name is required';
    if (!form.investmentRange.trim())
      errors.investmentRange = 'Investment range is required';
    if (!form.message.trim()) errors.message = 'Message is required';

    return errors;
  };

  const isValid = useMemo(() => {
    return String(form.fullName || '').trim().length > 1;
  }, [form.fullName]);

  // const onChange = (key) => (e) => {
  //   setForm((p) => ({ ...p, [key]: e.target.value }));
  // };

  const showToast = (type, message) => {
    setToast({ type, message });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const onChange = (key) => (e) => {
    let value = e.target.value;

    if (key === 'phoneNumber') {
      value = value.replace(/\D/g, '').slice(0, 10); // only digits + max 10
    }

    setForm((p) => ({ ...p, [key]: value }));
  };

  // const submit = async (e) => {
  //   e.preventDefault();
  //   setNotice({ type: '', message: '' });

  //   const validationErrors = validateForm();
  //   setErrors(validationErrors);

  //   if (Object.keys(validationErrors).length > 0) {
  //     setNotice({
  //       type: 'error',
  //       message: 'Please fill all required fields.',
  //     });
  //     return;
  //   }

  //   setSubmitting(true);

  //   try {
  //     await apiCreateInvestorEnquiry({
  //       ...form,
  //       subject: String(form.subject || '').trim() || 'Investment enquiry',
  //     });

  //     // setNotice({
  //     //   type: 'success',
  //     //   message: 'Thanks! Your enquiry has been submitted.',
  //     // });
  //     showToast('success', 'Enquiry submitted successfully!');

  //     setTimeout(() => {
  //       router.push('/');
  //     }, 1200);

  //     setForm({
  //       subject: '',
  //       fullName: '',
  //       emailAddress: '',
  //       phoneNumber: '',
  //       companyName: '',
  //       investmentRange: '',
  //       message: '',
  //     });

  //     setErrors({});
  //     setTimeout(() => router.push('/'), 800);
  //   } catch (err) {
  //     // setNotice({ type: 'error', message: formatSubmitError(err) });
  //     showToast('error', formatSubmitError(err));
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  const submit = async (e) => {
    e.preventDefault();
    setNotice({ type: '', message: '' });

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      showToast('error', 'Please fill all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      await apiCreateInvestorEnquiry({
        ...form,
        subject: String(form.subject || '').trim() || 'Investment enquiry',
      });

      showToast('success', 'Enquiry submitted successfully!');

      // reset form
      setForm({
        subject: '',
        fullName: '',
        emailAddress: '',
        phoneNumber: '',
        companyName: '',
        investmentRange: '',
        message: '',
      });

      setErrors({});

      //  ONLY ONE redirect (after toast visible)
      setTimeout(() => {
        router.push('/');
      }, 3000); // match toast duration
    } catch (err) {
      showToast('error', formatSubmitError(err));
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F7F8FB] py-10">
      {toast && (
        <div className="fixed right-4 top-4 z-50">
          <div
            className={cls(
              'min-w-[250px] rounded-xl px-4 py-3 text-sm shadow-lg text-white',
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500',
            )}
          >
            {toast.message}
          </div>
        </div>
      )}
      <div className="mx-auto max-w-5xl px-4">
        <div className="mt-10 text-center">
          <h1 className="text-3xl font-bold text-black">
            How Can We Help You?
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-500">
            Whether you&apos;re a customer, vendor, or investor, we&apos;re here
            to support your journey with Rent&apos;n Pay.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <button
            type="button"
            onClick={() => setActiveTab('investor')}
            className={cls(
              'w-full rounded-xl border-2 px-4 py-4 text-left transition',
              activeTab === 'investor'
                ? 'border-[#00C950] '
                : 'border-slate-200 hover:border-slate-300',
            )}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#00A63E]">
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-black">Investor Relations</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Partner with us to scale the future of renting
                </p>
              </div>
            </div>
          </button>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F3E8FF] text-[#9810FA]">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-black">Submit Your Inquiry</p>
                <p className="text-xs text-slate-500">
                  Share your investment proposal
                </p>
              </div>
            </div>

            {notice.message ? (
              <div
                className={cls(
                  'mt-4 rounded-xl border px-4 py-3 text-sm',
                  notice.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-rose-200 bg-rose-50 text-rose-800',
                )}
              >
                {notice.message}
              </div>
            ) : null}

            <form onSubmit={submit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  value={form.subject}
                  onChange={onChange('subject')}
                  placeholder="e.g. Vendor Growth Fund"
                  className="mt-1 w-full rounded-xl border-2 border-[#D1D5DC] px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                />
                {errors.subject && (
                  <p className="mt-1 text-xs text-red-500">{errors.subject}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={form.fullName}
                      onChange={onChange('fullName')}
                      placeholder="Enter your full name"
                      className="w-full rounded-xl border-2 border-[#D1D5DC]  py-2.5 pl-9 pr-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.fullName}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={form.emailAddress}
                      onChange={onChange('emailAddress')}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border-2 border-[#D1D5DC] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                    />
                  </div>
                  {errors.emailAddress && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.emailAddress}
                    </p>
                  )}
                </div>
              </div>

              <div className=" w-full  gap-4 sm:grid-cols-2">
                {/* Phone Number */}
                <div className="w-full">
                  <label className="text-xs font-semibold text-slate-700">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    {/* <input
                      value={form.phoneNumber}
                      onChange={onChange('phoneNumber')}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border-2 border-[#D1D5DC]  py-2.5 pl-9 pr-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                    /> */}
                    <input
                      value={form.phoneNumber}
                      onChange={onChange('phoneNumber')}
                      placeholder="9876543210"
                      inputMode="numeric"
                      maxLength={10}
                      className="w-full rounded-xl border-2 border-[#D1D5DC] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>
              {/* Investment Proposal Details */}
              <div className="w-full rounded-2xl border-2 border-[#B9F8CF] bg-[#F0FDF4] p-3">
                <label className="text-xs font-bold text-[#00A63E]">
                  Investment Proposal Details
                </label>

                <div className="mt-2 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Company/Firm Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative mt-1">
                      <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                      <input
                        value={form.companyName}
                        onChange={onChange('companyName')}
                        placeholder="Company/Firm Name"
                        className="w-full rounded-xl border border-[#D1D5DC] bg-[#F0FDF4] py-2.5 pl-9 pr-3 text-sm outline-none "
                      />
                    </div>
                    {errors.companyName && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.companyName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Investment Range <span className="text-rose-500">*</span>
                    </label>
                    <input
                      value={form.investmentRange}
                      onChange={onChange('investmentRange')}
                      placeholder="Investment Range (e.g. 50L - 1Cr)"
                      className="mt-1 w-full rounded-xl border border-[#D1D5DC] bg-[#F0FDF4]  px-3 py-2.5 text-sm outline-none "
                    />
                    {errors.investmentRange && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.investmentRange}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={form.message}
                  onChange={onChange('message')}
                  rows={5}
                  placeholder="Share your investment thesis and partnership goals..."
                  className="mt-1 w-full resize-none rounded-xl border-2 border-[#D1D5DC] px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-red-500">{errors.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {submitting ? 'Submitting...' : 'Submit Inquiry'}
              </button>
            </form>
          </div>
        </div>

        {/* <p className="mt-10 text-center text-xs text-slate-400">
          © 2026 Rent&apos;n Pay Private Limited. All rights reserved.
        </p> */}
      </div>
    </div>
  );
}
