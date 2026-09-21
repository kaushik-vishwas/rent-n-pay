'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  Settings,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { apiDeleteAccount } from '@/lib/api';
import { logout as logoutAction } from '@/store/slices/authSlice';
import { clearCart } from '@/store/slices/cartSlice';

const SettingsPage = () => {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  // Step 1 modal — "Are you sure?"
  const [showWarningModal, setShowWarningModal] = useState(false);
  // Step 2 modal — "Type your email to confirm"
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [confirmEmail, setConfirmEmail] = useState('');
  const [deleting, setDeleting] = useState(false);

  const userEmail = user?.email || user?.emailAddress || '';

  const fields = [
    {
      icon: <User className="w-4 h-4 text-gray-400" />,
      label: 'Your Name',
      value: user?.fullName || user?.name || 'Not provided',
    },
    {
      icon: <Mail className="w-4 h-4 text-gray-400" />,
      label: 'Your Email Address',
      value: userEmail || 'Not provided',
    },
    {
      icon: <Phone className="w-4 h-4 text-gray-400" />,
      label: 'Your Mobile',
      value:
        user?.mobileNumber ||
        user?.phone ||
        user?.mobile ||
        user?.contactNumber ||
        'Not provided',
    },
  ];

  const openWarning = () => {
    setShowWarningModal(true);
    setShowConfirmModal(false);
    setConfirmEmail('');
  };

  const goToConfirm = () => {
    setShowWarningModal(false);
    setShowConfirmModal(true);
    setConfirmEmail('');
  };

  const closeAll = () => {
    setShowWarningModal(false);
    setShowConfirmModal(false);
    setConfirmEmail('');
  };
  const emailMatches =
    confirmEmail.trim().toLowerCase() === userEmail.trim().toLowerCase();

  const handleDeleteAccount = async () => {
    if (!emailMatches) {
      toast.error('Email does not match. Please try again.', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
      closeAll();
      router.push('/');
      return;
    }
    setDeleting(true);
    try {
      await apiDeleteAccount(confirmEmail.trim());
      dispatch(logoutAction());
      dispatch(clearCart());
      closeAll();
      router.push('/');
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          'Failed to delete account. Please try again.',
        {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'light',
        },
      );
    } finally {
      setDeleting(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Settings</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              All your profile settings are listed here including few basic
              details about you.
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          {fields.map((field, idx) => (
            <div
              key={field.label}
              className={`px-6 py-5 ${idx !== fields.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                {field.label}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {field.icon}
                <p className="text-sm font-semibold text-gray-900 break-all">
                  {field.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-red-100 bg-red-50">
            <p className="text-sm font-semibold text-red-700">Danger Zone</p>
          </div>
          <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Delete this account
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Once deleted, your account and all data will be permanently
                removed.
              </p>
            </div>
            <button
              type="button"
              onClick={openWarning}
              className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              Delete account
            </button>
          </div>
        </div>
      </div>

      {/* ── Step 1: Warning modal ── */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">
                Delete Account
              </p>
              <button
                type="button"
                onClick={closeAll}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <p className="text-base font-semibold text-gray-900">
                Are you absolutely sure?
              </p>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                This action{' '}
                <span className="font-semibold text-gray-800">
                  cannot be undone
                </span>
                . This will permanently delete your Rentnpay account and remove
                all your data from our servers.
              </p>
            </div>
            <div className="flex gap-3 px-5 pb-5">
              <button
                type="button"
                onClick={closeAll}
                className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={goToConfirm}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                I want to delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Email confirm modal ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">
                Confirm Account Deletion
              </p>
              <button
                type="button"
                onClick={closeAll}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-5">
              <p className="text-sm text-gray-600 leading-relaxed">
                To confirm, type{' '}
                <span className="font-semibold text-gray-900 break-all">
                  {userEmail}
                </span>{' '}
                in the box below
              </p>
              <input
                type="email"
                autoComplete="off"
                value={confirmEmail}
                onChange={(e) => {
                  setConfirmEmail(e.target.value);
                }}
                placeholder="Enter your email address"
                className="mt-3 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div className="px-5 pb-5">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="w-full rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting account…' : 'Delete this account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
