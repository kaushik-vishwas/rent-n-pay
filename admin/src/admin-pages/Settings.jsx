// 'use client';

// import { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { getAdminSettings } from '../redux/slices/adminSlice';
// import { Mail, Lock } from 'lucide-react';

// export default function AdminSettingsPage() {
//   const dispatch = useDispatch();
//   const { user, settings, settingsLoading } = useSelector((s) => s.admin);
//   const role = user?.role;

//   useEffect(() => {
//     if (role === 'admin') {
//       dispatch(getAdminSettings());
//     }
//   }, [role, dispatch]);

//   if (role !== 'admin') {
//     return (
//       <div className="p-6 text-gray-600">
//         You don&apos;t have permission to view this page.
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 max-w-lg">
//       <h1 className="text-xl font-semibold text-gray-900 mb-6">
//         Account Settings
//       </h1>
//       <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
//         <div>
//           <p className="text-xs text-gray-500 mb-1">Current Email</p>
//           <div className="flex items-center gap-2 text-gray-800 font-medium">
//             <Mail className="w-4 h-4 text-orange-500" />
//             {settingsLoading ? 'Loading...' : settings?.email || '—'}
//           </div>
//         </div>
//         <div>
//           <p className="text-xs text-gray-500 mb-1">Current Password</p>
//           <div className="flex items-center gap-2 text-gray-800 font-medium">
//             <Lock className="w-4 h-4 text-orange-500" />
//             {settingsLoading ? 'Loading...' : settings?.password || '—'}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAdminSettings,
  sendEmailChangeOtp,
  verifyEmailChangeOtp,
  changeAdminSettingsPassword,
} from '../redux/slices/adminSlice';
import { Mail, Lock, Pencil, X, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function AdminSettingsPage() {
  const dispatch = useDispatch();
  const { user, settings, settingsLoading } = useSelector((s) => s.admin);
  const role = user?.role;

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);

  const resetPasswordForm = () => {
    setShowPasswordForm(false);
    setNewPassword('');
    setPasswordMsg('');
    setPasswordErr('');
    setPasswordBusy(false);
    setShowNewPassword(false);
  };

  const handleChangePassword = async () => {
    setPasswordErr('');
    setPasswordMsg('');
    if (!newPassword || newPassword.length < 6) {
      setPasswordErr('Password must be at least 6 characters');
      return;
    }
    setPasswordBusy(true);
    try {
      const res = await dispatch(
        changeAdminSettingsPassword({ newPassword }),
      ).unwrap();
      setPasswordMsg(res.message || 'Password updated successfully');
      dispatch(getAdminSettings()); // refresh displayed password
      setTimeout(() => resetPasswordForm(), 2000);
    } catch (err) {
      setPasswordErr(err || 'Failed to update password');
    } finally {
      setPasswordBusy(false);
    }
  };

  // Email change flow
  const [emailStep, setEmailStep] = useState('idle'); // 'idle' | 'input' | 'otp' | 'done'
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [emailMsg, setEmailMsg] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [emailBusy, setEmailBusy] = useState(false);

  useEffect(() => {
    if (role === 'admin') {
      dispatch(getAdminSettings());
    }
  }, [role, dispatch]);

  const resetEmailFlow = () => {
    setEmailStep('idle');
    setNewEmail('');
    setOtp('');
    setEmailMsg('');
    setEmailErr('');
    setEmailBusy(false);
  };

  const handleSendEmailOtp = async () => {
    setEmailErr('');
    setEmailMsg('');
    if (!newEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setEmailErr('Please enter a valid email address');
      return;
    }
    setEmailBusy(true);
    try {
      const res = await dispatch(
        sendEmailChangeOtp({ newEmail: newEmail.trim() }),
      ).unwrap();
      setEmailMsg(res.message || 'OTP sent to your new email');
      setEmailStep('otp');
    } catch (err) {
      setEmailErr(err || 'Failed to send OTP');
    } finally {
      setEmailBusy(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    setEmailErr('');
    if (!otp.trim()) {
      setEmailErr('Please enter the OTP');
      return;
    }
    setEmailBusy(true);
    try {
      await dispatch(
        verifyEmailChangeOtp({ newEmail: newEmail.trim(), otp: otp.trim() }),
      ).unwrap();
      setEmailStep('done');
      setEmailMsg('Email changed successfully!');
      dispatch(getAdminSettings()); // refresh displayed email
    } catch (err) {
      setEmailErr(err || 'Invalid or expired OTP');
    } finally {
      setEmailBusy(false);
    }
  };

  if (role !== 'admin') {
    return (
      <div className="p-6 text-gray-600">
        You don&apos;t have permission to view this page.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg">
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
        {/* Current Email */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Current Email</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-800 font-medium">
              <Mail className="w-4 h-4 text-orange-500" />
              {settingsLoading ? 'Loading...' : settings?.email || '—'}
            </div>
            {emailStep === 'idle' && (
              <button
                onClick={() => setEmailStep('input')}
                className="flex items-center gap-1 text-xs text-orange-600 hover:underline font-medium"
              >
                <Pencil className="w-3 h-3" />
                Change Email
              </button>
            )}
          </div>

          {/* Step: enter new email */}
          {emailStep === 'input' && (
            <div className="mt-3 space-y-2">
              <input
                type="email"
                placeholder="Enter new email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={emailBusy}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {emailErr && <p className="text-red-600 text-xs">{emailErr}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleSendEmailOtp}
                  disabled={emailBusy}
                  className="flex-1 bg-orange-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {emailBusy ? 'Sending...' : 'Continue'}
                </button>
                <button
                  onClick={resetEmailFlow}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step: enter OTP */}
          {emailStep === 'otp' && (
            <div className="mt-3 space-y-2">
              {emailMsg && <p className="text-green-700 text-xs">{emailMsg}</p>}
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={emailBusy}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {emailErr && <p className="text-red-600 text-xs">{emailErr}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleVerifyEmailOtp}
                  disabled={emailBusy}
                  className="flex-1 bg-orange-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {emailBusy ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button
                  onClick={resetEmailFlow}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step: done */}
          {emailStep === 'done' && (
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                {emailMsg}
              </div>
              <button
                onClick={resetEmailFlow}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Current Password */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Current Password</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-800 font-medium">
              <Lock className="w-4 h-4 text-orange-500" />
              {settingsLoading ? 'Loading...' : settings?.password || '—'}
            </div>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="flex items-center gap-1 text-xs text-orange-600 hover:underline font-medium"
              >
                <Pencil className="w-3 h-3" />
                Change Password
              </button>
            )}
          </div>

          {showPasswordForm && (
            <div className="mt-3 space-y-2">
              {passwordMsg && (
                <div className="flex items-center gap-2 text-green-700 text-xs font-medium">
                  <CheckCircle className="w-4 h-4" />
                  {passwordMsg}
                </div>
              )}
              {!passwordMsg && (
                <>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Enter new password (min 6 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={passwordBusy}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showNewPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                  {passwordErr && (
                    <p className="text-red-600 text-xs">{passwordErr}</p>
                  )}
                  {/* <p className="text-xs text-gray-400">
                    Your old password stays valid for 24 hours after change.
                  </p> */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleChangePassword}
                      disabled={passwordBusy}
                      className="flex-1 bg-orange-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                    >
                      {passwordBusy ? 'Updating...' : 'Update Password'}
                    </button>
                    <button
                      onClick={resetPasswordForm}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
