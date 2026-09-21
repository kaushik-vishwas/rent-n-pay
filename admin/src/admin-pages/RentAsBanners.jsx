'use client';

import { useEffect, useRef, useState } from 'react';
import {
  apiGetAllRentAsBanners,
  apiCreateRentAsBanner,
  apiUpdateRentAsBanner,
  apiDeleteRentAsBanner,
  apiToggleRentAsBannerStatus,
} from '@/service/api';

const emptyForm = {
  title: '',
  subtitle: '',
  clickableUrl: '',
  isActive: true,
  image: null,
};

const RentAsBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [togglingId, setTogglingId] = useState('');
  const fileRef = useRef();
  const [search, setSearch] = useState('');

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';

  const filteredBanners = banners.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.title?.toLowerCase().includes(q) ||
      b.subtitle?.toLowerCase().includes(q) ||
      b.clickableUrl?.toLowerCase().includes(q)
    );
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiGetAllRentAsBanners(token);
      setBanners(res.data?.banners || []);
    } catch {
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setPreview('');
    setFormOpen(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    setForm({
      title: b.title || '',
      subtitle: b.subtitle || '',
      clickableUrl: b.clickableUrl || '',
      isActive: b.isActive,
      image: null,
    });
    setPreview(b.image || '');
    setFormOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((p) => ({ ...p, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.image && !editing) {
      alert('Please select an image');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('subtitle', form.subtitle);
      fd.append('clickableUrl', form.clickableUrl);
      fd.append('isActive', form.isActive);
      if (form.image) fd.append('image', form.image);

      if (editing) {
        await apiUpdateRentAsBanner(editing._id, fd, token);
      } else {
        await apiCreateRentAsBanner(fd, token);
      }
      setFormOpen(false);
      load();
    } catch {
      alert('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this banner?')) return;
    setDeletingId(id);
    try {
      await apiDeleteRentAsBanner(id, token);
      setBanners((p) => p.filter((b) => b._id !== id));
    } catch {
      alert('Delete failed');
    } finally {
      setDeletingId('');
    }
  };

  const handleToggle = async (id) => {
    setTogglingId(id);
    try {
      const res = await apiToggleRentAsBannerStatus(id, token);
      setBanners((p) => p.map((b) => (b._id === id ? res.data.banner : b)));
    } catch {
      alert('Toggle failed');
    } finally {
      setTogglingId('');
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="border border-gray-200 rounded-xl p-4">
        {/* Header */}
        <div className="flex items-center gap-3 justify-between mb-6">
          <div className="flex flex-1 border border-gray-200 rounded-lg overflow-hidden focus-within:border-orange-400">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search RentAs banners..."
                className="w-full pl-9 pr-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <button
              onClick={openCreate}
              className="bg-[#FF7020] text-white px-4 py-2 text-sm font-medium hover:bg-orange-600 transition shrink-0"
            >
              + Add Banner
            </button>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#FF7020] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredBanners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-gray-400 text-lg">
              {search ? 'No matching banners' : 'No RentAs banners yet'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {search
                ? 'Try a different search term'
                : 'Click "Add Banner" to create your first banner'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredBanners.map((b) => (
              <div
                key={b._id}
                className="flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden"
              >
                <img
                  src={b.image}
                  alt={b.title}
                  className="w-full h-36 object-cover"
                />
                {/* <div className="p-3 flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate text-sm">
                    {b.title || 'No title'}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {b.subtitle || 'No subtitle'}
                  </p>
                  {b.clickableUrl && (
                    <p className="text-xs text-blue-500 truncate mt-0.5">
                      {b.clickableUrl}
                    </p>
                  )}
                </div> */}
                <div className="px-3 pb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={b.isActive}
                        onChange={() => handleToggle(b._id)}
                        disabled={togglingId === b._id}
                      />
                      <div className="w-9 h-5 bg-gray-300 peer-checked:bg-[#FF7020] rounded-full transition-colors" />
                      <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                    </label>
                    <span
                      className={`text-xs font-medium ${
                        b.isActive ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {b.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(b)}
                      className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(b._id)}
                      disabled={deletingId === b._id}
                      className="px-3 py-1.5 text-xs border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                    >
                      {deletingId === b._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 pb-4 shrink-0 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editing ? 'Edit Banner' : 'Add Banner'}
              </h2>
            </div>

            {/* Scrollable body */}
            <div
              className="overflow-y-auto flex-1 px-6 py-4 space-y-4"
              style={{ scrollbarWidth: 'none' }}
            >
              {/* Image upload */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Banner Image
                </p>
                {preview && (
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-40 object-cover rounded-xl mb-2 border border-gray-200"
                  />
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <button
                  onClick={() => fileRef.current.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 hover:border-orange-400 hover:text-orange-500 transition"
                >
                  {preview ? 'Change Image' : 'Click to upload image'}
                </button>
              </div>

              {/* Clickable URL */}
              {/* <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Clickable URL
                </p>
                <input
                  type="text"
                  value={form.clickableUrl}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, clickableUrl: e.target.value }))
                  }
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
                />
                <p className="text-xs text-gray-400 mt-1">
                  When set, clicking the banner image will redirect to this URL
                </p>
              </div> */}

              {/* isActive */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">
                  Active (show on RentAs page)
                </p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, isActive: e.target.checked }))
                    }
                  />
                  <div className="w-10 h-5 bg-gray-300 peer-checked:bg-[#FF7020] rounded-full transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 pt-4 border-t border-gray-100 shrink-0">
              <button
                onClick={() => setFormOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-[#FF7020] text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentAsBanners;
