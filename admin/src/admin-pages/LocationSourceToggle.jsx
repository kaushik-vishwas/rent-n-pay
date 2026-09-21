'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { CircleAlert } from 'lucide-react';
import {
  apiGetLocationSettings,
  apiPatchLocationSettings,
} from '@/service/api';

const SOURCES = [
  { key: 'rentEnabled', label: 'Rent' },
  { key: 'buyEnabled', label: 'Buy' },
  { key: 'serviceEnabled', label: 'Service' },
];

const LocationSourceToggle = () => {
  const adminUser = useSelector((s) => s.admin.user);
  const isSubAdmin = adminUser?.role === 'subadmin' && !!adminUser?.location;

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingKey, setTogglingKey] = useState('');

  useEffect(() => {
    if (!isSubAdmin) {
      setLoading(false);
      return;
    }
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (!token) {
      setError('Please login again to continue.');
      setLoading(false);
      return;
    }
    let mounted = true;
    apiGetLocationSettings(token)
      .then((res) => {
        if (!mounted) return;
        setSettings(res.data);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(
          err.response?.data?.message || 'Failed to load location settings.',
        );
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [isSubAdmin]);

  if (!isSubAdmin) return null;

  const toggleSource = async (key) => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (!token || !settings) return;

    const nextValue = !settings[key];
    setTogglingKey(key);
    setError('');

    // Optimistic UI update.
    setSettings((prev) => ({ ...prev, [key]: nextValue }));

    try {
      const res = await apiPatchLocationSettings({ [key]: nextValue }, token);
      setSettings({
        state: res.data.state,
        rentEnabled: res.data.rentEnabled,
        buyEnabled: res.data.buyEnabled,
        serviceEnabled: res.data.serviceEnabled,
      });
    } catch (err) {
      // Revert on failure.
      setSettings((prev) => ({ ...prev, [key]: !nextValue }));
      setError(
        err.response?.data?.message || 'Failed to update location settings.',
      );
    } finally {
      setTogglingKey('');
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:rounded-3xl sm:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Storefront Visibility — {adminUser?.location}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Turn a source off to hide all {adminUser?.location} listings of that
            type from the public website.
          </p>
        </div>
      </div>

      {error ? (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-center gap-1.5">
          <CircleAlert size={14} className="shrink-0" />
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-6">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SOURCES.map(({ key, label }) => {
            const on = !!settings?.[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleSource(key)}
                disabled={togglingKey === key}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 text-left disabled:opacity-60"
              >
                <span className="text-sm font-medium text-gray-800">
                  {label}
                </span>
                <span
                  className={`inline-flex w-11 h-6 rounded-full border transition-colors ${
                    on
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'bg-gray-200 border-gray-200'
                  }`}
                  aria-hidden
                >
                  <span
                    className={`m-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform ${
                      on ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LocationSourceToggle;
