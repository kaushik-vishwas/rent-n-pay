'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Building2,
  Copy,
  Gift,
  Loader2,
  Share2,
  X,
  Link,
  CheckCheck,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  fetchReferralDashboard,
  saveBankDetails,
  requestWithdraw,
} from '@/lib/api';

// ─── WhatsApp Share Modal ──────────────────────────────────────────────
function ShareModal({ data, onClose }) {
  const [linkCopied, setLinkCopied] = useState(false);

  // Build the referral signup URL — adjust base URL to your domain
  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://yourapp.com'}/signup?ref=${data?.referralCode}`;

  const whatsappMessage = encodeURIComponent(
    `Hey! 👋 This is my *Rentnpay* Referral Card!\n\nYou can sign up using my referral code: *${data?.referralCode}*\n\n🎁 You'll get exclusive rewards when you complete your first transaction!\n\n👉 Sign up here: ${referralLink}\n\nLet's earn together! 🚀`,
  );

  const whatsappURL = `https://wa.me/?text=${whatsappMessage}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setLinkCopied(true);
    toast.success('Referral link copied!', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'light',
    });
    setTimeout(() => setLinkCopied(false), 3000);
  };

  const handleWhatsAppShare = () => {
    window.open(whatsappURL, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-bold text-base">Share Your Referral Card</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Card Preview */}
        <div className="px-5 pt-5">
          <p className="text-xs text-gray-400 uppercase font-semibold mb-3 tracking-wide">
            Card Preview
          </p>
          <div className="bg-gradient-to-br from-gray-800 to-gray-950 text-white rounded-xl p-5 space-y-4 shadow-lg">
            {/* Top badge */}
            <div className="flex items-center gap-2 bg-white/15 w-fit px-3 py-1.5 rounded-lg">
              <Gift className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-semibold text-orange-300">
                Rentnpay Referral
              </span>
            </div>

            {/* Name */}
            <div>
              <p className="text-[10px] text-white/50 uppercase tracking-widest mb-0.5">
                Member
              </p>
              <p className="text-base font-bold">
                {data?.fullName || 'Your Name'}
              </p>
            </div>

            {/* Referral Code */}
            <div>
              <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">
                Referral Code
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold tracking-[0.2em] text-orange-400">
                  {data?.referralCode || '——'}
                </span>
              </div>
            </div>

            {/* Reward badge */}
            <div className="border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70">
              🎁 Earn rewards on every successful referral
            </div>
          </div>
        </div>

        {/* Referral Link */}
        <div className="px-5 pt-4">
          <p className="text-xs text-gray-400 uppercase font-semibold mb-2 tracking-wide">
            Your Referral Link
          </p>
          <div className="flex items-center gap-2 bg-gray-50 border rounded-lg px-3 py-2">
            <Link size={14} className="text-gray-400 flex-shrink-0" />
            <p className="text-xs text-gray-600 truncate flex-1">
              {referralLink}
            </p>
            <button
              onClick={handleCopyLink}
              className="flex-shrink-0 text-orange-500 hover:text-orange-600"
            >
              {linkCopied ? <CheckCheck size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        {/* Share Message Preview */}
        <div className="px-5 pt-4">
          <p className="text-xs text-gray-400 uppercase font-semibold mb-2 tracking-wide">
            Message Preview
          </p>
          <div className="bg-[#e9fbe5] border border-[#c3f0b2] rounded-xl px-4 py-3 text-xs text-gray-700 leading-relaxed whitespace-pre-line font-sans">
            {`Hey! 👋 This is my Rentnpay Referral Card!\n\nSign up using my code: ${data?.referralCode}\n\n🎁 Get rewards on your first transaction!\n\n👉 ${referralLink}`}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-5 py-5 flex flex-col gap-3">
          {/* WhatsApp CTA */}
          <button
            onClick={handleWhatsAppShare}
            className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1ebe5d] active:scale-[0.98] transition-all text-white font-bold py-3 rounded-xl text-sm shadow-sm"
          >
            {/* WhatsApp SVG icon */}
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Share on WhatsApp
          </button>

          {/* Copy Link secondary */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition-all text-gray-700 font-semibold py-3 rounded-xl text-sm"
          >
            {linkCopied ? (
              <CheckCheck size={16} className="text-green-500" />
            ) : (
              <Copy size={16} />
            )}
            {linkCopied ? 'Link Copied!' : 'Copy Referral Link'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────
export default function ReferralPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // const [showShareModal, setShowShareModal] = useState(false);

  const [editingBank, setEditingBank] = useState(false);
  const [bank, setBank] = useState({
    accountName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
  });

  const [withdrawing, setWithdrawing] = useState(false);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [bankErrors, setBankErrors] = useState({});

  const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

  const validateBankDetails = (values) => {
    const errs = {};

    if (!values.accountName.trim()) {
      errs.accountName = 'Account holder name is required';
    } else if (!/^[A-Za-z\s.]{3,50}$/.test(values.accountName.trim())) {
      errs.accountName = 'Enter a valid name (letters only, 3–50 characters)';
    }

    if (!values.accountNumber.trim()) {
      errs.accountNumber = 'Account number is required';
    } else if (!/^\d{9,18}$/.test(values.accountNumber.trim())) {
      errs.accountNumber = 'Account number must be 9–18 digits, numbers only';
    }

    if (!values.ifscCode.trim()) {
      errs.ifscCode = 'IFSC code is required';
    } else if (!IFSC_REGEX.test(values.ifscCode.trim().toUpperCase())) {
      errs.ifscCode = 'Enter a valid IFSC code (e.g. SBIN0001234)';
    }

    if (!values.bankName.trim()) {
      errs.bankName = 'Bank name is required';
    } else if (!/^[A-Za-z\s.&-]{2,60}$/.test(values.bankName.trim())) {
      errs.bankName = 'Enter a valid bank name';
    }

    return errs;
  };

  const load = async () => {
    try {
      const res = await fetchReferralDashboard();
      setData(res.data);
      if (res.data.bankDetails?.accountNumber) {
        setBank({
          accountName: res.data.bankDetails.accountName || '',
          accountNumber: res.data.bankDetails.accountNumber || '',
          ifscCode: res.data.bankDetails.ifscCode || '',
          bankName: res.data.bankDetails.bankName || '',
        });
      }
    } catch (err) {
      setError('Failed to load referral data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const copyToClipboard = () => {
    if (!data?.referralCode) return;
    navigator.clipboard.writeText(data.referralCode);
    toast.success('Referral code copied!', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'light',
    });
  };

  const handleSaveBankDetails = async () => {
    const errs = validateBankDetails(bank);
    setBankErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error('Please fix the highlighted fields', {
        position: 'top-right',
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
      return;
    }

    try {
      await saveBankDetails({ ...bank, ifscCode: bank.ifscCode.toUpperCase() });
      setEditingBank(false);
      setBankErrors({});
      await load();
      toast.success('Bank details saved successfully!', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to save bank details',
        {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'light',
        },
      );
    }
  };

  const handleShareReferralCard = () => {
    const websiteUrl = 'https://rentnpay-website.vercel.app/';
    const message =
      `Hey! 👋 *${data?.fullName}* has invited you to *Rentnpay*!\n\n` +
      `🎁 Referral code: *${data?.referralCode}* \n\n` +
      `👉 Visit: ${websiteUrl}\n\n` +
      `Sign up and enter my referral code in the **Referral Code** field. Let's earn rewards together!
`;

    navigator.clipboard.writeText(message);
    setShareLinkCopied(true);
    toast.success('Referral message copied! Paste it on WhatsApp', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'light',
    });
    setTimeout(() => setShareLinkCopied(false), 3000);
  };

  const handleWithdraw = async () => {
    if (!data?.availableBalance || data.availableBalance <= 0) {
      toast.warning('No balance available to withdraw.', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
      return;
    }
    if (!data?.bankDetails?.accountNumber) {
      toast.warning('Please add your bank details first.', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
      setEditingBank(true);
      return;
    }
    setWithdrawing(true);
    try {
      const res = await requestWithdraw(data.availableBalance);
      toast.success(res.data.message || 'Withdrawal request submitted!', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Withdrawal failed.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
    } finally {
      setWithdrawing(false);
    }
  };

  const maskAccount = (acc) => {
    if (!acc) return '--';
    return (
      acc.slice(0, 4) + 'X'.repeat(Math.max(0, acc.length - 7)) + acc.slice(-3)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div>
      <ToastContainer />

      {/* Share Modal */}
      {/* {showShareModal && (
        <ShareModal data={data} onClose={() => setShowShareModal(false)} />
      )} */}

      {/* Header Banner */}
      <div className="bg-white max-w-5xl mx-auto rounded-2xl shadow-sm p-4 flex items-center justify-between border">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center justify-center">
            <Gift className="w-6 h-6 text-[#FC6001]" />
          </div>
          <div>
            <h2 className="text-lg font-bold">
              Share the Love, Get{' '}
              <span className="text-[#FC6001]">Rewarded</span>
            </h2>
            <p className="text-sm font-semibold text-[#64748B] mt-1">
              Earn 10% commission when your friend completes their first
              transaction
            </p>
          </div>
        </div>
      </div>

      {/* Main Heading */}
      <div className="text-center mt-8">
        <h1 className="text-lg md:text-2xl font-semibold">
          Earn up to <span className="text-[#FC6001]">₹1,000</span> for every
          successful referral
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          No limit on referrals. The more you share, the more you earn!
        </p>
      </div>

      {/* Earnings Card */}
      {/* <div className="max-w-4xl mx-auto mt-6 bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col md:flex-row justify-center items-start gap-48">
        <div>
          <p className="text-xs text-center font-bold text-[#64748B]">
            TOTAL EARNINGS
          </p>
          <h2 className="text-3xl text-center mt-1 font-bold">
            ₹{data?.totalEarnings ?? 0}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Available Balance: ₹{data?.availableBalance ?? 0}
          </p>
          <button
            onClick={handleWithdraw}
            disabled={withdrawing || !data?.availableBalance}
            className="mt-4 bg-[#FC6001] text-white px-4 py-2 rounded-lg font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {withdrawing ? 'Processing...' : 'Withdraw Now'}
          </button>
        </div>

    
        <div className="text-sm text-center text-[#64748B] uppercase space-y-1">
          {!editingBank ? (
            <>
              {data?.bankDetails?.accountNumber ? (
                <>
                  <p>
                    <b>Account Name:</b> <b>{data.bankDetails.accountName}</b>
                  </p>
                  <p>
                    <b>IFSC Code:</b> <b>{data.bankDetails.ifscCode}</b>
                  </p>
                  <p>
                    <b>Account No:</b>{' '}
                    <b>{maskAccount(data.bankDetails.accountNumber)}</b>
                  </p>
                </>
              ) : (
                <p className="text-gray-400 italic">
                  No bank details added yet.
                </p>
              )}
              <button
                onClick={() => setEditingBank(true)}
                className="mt-4 border border-[#D1D5DC] font-bold text-black uppercase bg-white px-12 py-1 rounded-md text-base"
              >
                {data?.bankDetails?.accountNumber
                  ? 'Edit Bank Details'
                  : 'Add Bank Details'}
              </button>
            </>
          ) : (
            <div className="space-y-2 w-72">
              <input
                className="w-full border px-2 py-1 rounded text-xs"
                placeholder="Account Name"
                value={bank.accountName}
                onChange={(e) =>
                  setBank({ ...bank, accountName: e.target.value })
                }
              />
              <input
                className="w-full border px-2 py-1 rounded text-xs"
                placeholder="Account Number"
                value={bank.accountNumber}
                onChange={(e) =>
                  setBank({ ...bank, accountNumber: e.target.value })
                }
              />
              <input
                className="w-full border px-2 py-1 rounded text-xs uppercase"
                placeholder="IFSC Code"
                value={bank.ifscCode}
                onChange={(e) =>
                  setBank({ ...bank, ifscCode: e.target.value.toUpperCase() })
                }
              />
              <input
                className="w-full border px-2 py-1 rounded text-xs"
                placeholder="Bank Name (e.g. HDFC Bank)"
                value={bank.bankName}
                onChange={(e) => setBank({ ...bank, bankName: e.target.value })}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveBankDetails}
                  className="bg-orange-500 text-white px-3 py-1 rounded text-xs"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingBank(false)}
                  className="border px-3 py-1 rounded text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div> */}

      <div className="max-w-4xl mx-auto mt-6 bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col md:flex-row justify-center items-center md:items-start gap-8 md:gap-48">
        {/* Earnings */}
        <div className="text-center">
          <p className="text-sm font-bold text-[#64748B]">TOTAL EARNINGS</p>

          <h2 className="text-3xl mt-1 font-bold">
            ₹{data?.totalEarnings ?? 0}
          </h2>

          <p className="text-xs font-semibold text-[#64748B] mt-1">
            Available to Withdraw: ₹{data?.availableBalance ?? 0}
          </p>

          <button
            onClick={handleWithdraw}
            disabled={withdrawing || !data?.availableBalance}
            className="mt-4 bg-[#FC6001] text-white px-4 py-2 rounded-lg font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {withdrawing ? 'Processing...' : 'Withdraw Now'}
          </button>
        </div>

        {/* Bank Details */}
        <div className="text-sm text-center text-[#64748B] uppercase space-y-1 w-full md:w-auto">
          {!editingBank ? (
            <>
              {data?.bankDetails?.accountNumber ? (
                <>
                  <p>
                    <b>Account Name:</b> <b>{data.bankDetails.accountName}</b>
                  </p>

                  <p>
                    <b>IFSC Code:</b> <b>{data.bankDetails.ifscCode}</b>
                  </p>

                  <p>
                    <b>Account No:</b>{' '}
                    <b>{maskAccount(data.bankDetails.accountNumber)}</b>
                  </p>
                </>
              ) : (
                <p className="text-gray-400 italic">
                  No bank details added yet.
                </p>
              )}

              <button
                onClick={() => setEditingBank(true)}
                className="mt-4 w-full sm:w-auto border border-[#D1D5DC] font-bold text-black uppercase bg-white px-6 md:px-12 py-1 rounded-md text-base"
              >
                {data?.bankDetails?.accountNumber
                  ? 'Edit Bank Details'
                  : 'Add Bank Details'}
              </button>
            </>
          ) : (
            <div className="space-y-2 w-full max-w-xs mx-auto text-left normal-case">
              <div>
                <input
                  className={`w-full border px-2 py-1 rounded text-xs ${
                    bankErrors.accountName ? 'border-red-400' : ''
                  }`}
                  placeholder="Account Name"
                  value={bank.accountName}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^A-Za-z\s.]/g, '');
                    setBank({ ...bank, accountName: val });
                  }}
                />
                {bankErrors.accountName && (
                  <p className="text-[10px] text-red-500 mt-0.5">
                    {bankErrors.accountName}
                  </p>
                )}
              </div>

              <div>
                <input
                  className={`w-full border px-2 py-1 rounded text-xs ${
                    bankErrors.accountNumber ? 'border-red-400' : ''
                  }`}
                  placeholder="Account Number"
                  inputMode="numeric"
                  maxLength={18}
                  value={bank.accountNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setBank({ ...bank, accountNumber: val });
                  }}
                />
                {bankErrors.accountNumber && (
                  <p className="text-[10px] text-red-500 mt-0.5">
                    {bankErrors.accountNumber}
                  </p>
                )}
              </div>

              <div>
                <input
                  className={`w-full border px-2 py-1 rounded text-xs uppercase ${
                    bankErrors.ifscCode ? 'border-red-400' : ''
                  }`}
                  placeholder="IFSC Code"
                  maxLength={11}
                  value={bank.ifscCode}
                  onChange={(e) => {
                    const val = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, '');
                    setBank({ ...bank, ifscCode: val });
                  }}
                />
                {bankErrors.ifscCode && (
                  <p className="text-[10px] text-red-500 mt-0.5">
                    {bankErrors.ifscCode}
                  </p>
                )}
              </div>

              <div>
                <input
                  className={`w-full border px-2 py-1 rounded text-xs ${
                    bankErrors.bankName ? 'border-red-400' : ''
                  }`}
                  placeholder="Bank Name (e.g. HDFC Bank)"
                  value={bank.bankName}
                  onChange={(e) =>
                    setBank({ ...bank, bankName: e.target.value })
                  }
                />
                {bankErrors.bankName && (
                  <p className="text-[10px] text-red-500 mt-0.5">
                    {bankErrors.bankName}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleSaveBankDetails}
                  className="bg-orange-500 text-white px-3 py-2 rounded text-xs flex-1"
                >
                  Save
                </button>

                <button
                  onClick={() => {
                    setEditingBank(false);
                    setBankErrors({});
                  }}
                  className="border px-3 py-2 rounded text-xs flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Referral Card */}
      <div className="mt-8 max-w-4xl mx-auto bg-white border rounded-xl p-6">
        <h3 className="text-base font-bold mb-4 flex items-center justify-center gap-2">
          <Building2 className="w-5 h-5 text-[#F97316]" />
          Your Member Card
        </h3>
        <div className="bg-gradient-to-r max-w-md mx-auto from-gray-800 to-gray-900 text-white p-5 rounded-xl space-y-5">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg">
            <Building2 className="w-4 h-4 text-white" />
            <p className="text-xs font-bold text-white">Referral Card</p>
          </div>
          <div>
            <p className="text-xs text-white/70 mb-2">Your Referral Code</p>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold tracking-widest">
                {data?.referralCode || '—'}
              </h2>
              <button onClick={copyToClipboard}>
                <Copy size={18} />
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs text-white/70 mb-1">Your Name</p>
            <p className="text-base font-bold">{data?.fullName}</p>
          </div>
        </div>

        {/* ── Share Referral Card Button ── */}
        {/* ── Share Referral Card Button ── */}
        <button
          onClick={handleShareReferralCard}
          className="w-full lg:w-[450px] mx-auto mt-4 flex items-center justify-center gap-2 border-2 border-gray-300 py-3 px-4 rounded-lg text-sm font-semibold text-[#F97316] transition-colors"
        >
          {shareLinkCopied ? (
            <>
              <CheckCheck size={16} className="text-green-500" />
              <span className="text-green-500">Copied! Paste on WhatsApp</span>
            </>
          ) : (
            <>
              <Share2 size={16} />
              Share Referral Code
            </>
          )}
        </button>
      </div>

      {/* How It Works */}
      <div className="mt-10 max-w-4xl mx-auto bg-white border rounded-xl p-6">
        <h3 className="text-base text-center font-bold">How It Works</h3>

        <p className="text-sm text-center text-[#64748B] mt-1 mb-6">
          Three simple steps to start earning
        </p>

        <div className="space-y-5 w-full max-w-lg mx-auto md:pl-12 lg:pl-10">
          {[
            {
              icon: <Share2 className="w-4 h-4 text-white" />,
              title: 'Share your code',
              desc: 'Invite friends using your referral code',
            },
            {
              icon: <ShoppingBag className="w-4 h-4 text-white" />,
              title: 'Friend transacts',
              desc: 'They complete their first order',
            },
            {
              icon: <TrendingUp className="w-4 h-4  text-white" />,
              title: 'Get rewarded',
              desc: 'Earn commission automatically',
            },
          ].map(({ icon, title, desc }, index) => (
            <div key={index} className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F97316] border-2 border-white flex items-center justify-center flex-shrink-0">
                {icon}
              </div>

              <div>
                <p className="font-bold text-base">{title}</p>
                <p className="text-xs font-semibold text-[#64748B]">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
