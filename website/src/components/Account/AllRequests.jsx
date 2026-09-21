'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { apiGetMyOrders } from '@/lib/api';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function statusBadge(status) {
  if (status === 'resolved' || status === 'closed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3" /> Resolved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
      <Clock className="w-3 h-3" /> Pending
    </span>
  );
}

function issueTypeLabel(type) {
  const map = {
    structural_damage: 'Structural Damage',
    fabric_stain: 'Fabric Tear / Stain',
    functionality_issue: 'Functionality Issue',
    other: 'Other',
  };
  return map[type] || type;
}

export default function AllRequests() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    setLoading(true);
    apiGetMyOrders()
      .then((res) => setOrders(res.data || []))
      .catch((err) =>
        setError(err?.response?.data?.message || 'Failed to load requests.'),
      )
      .finally(() => setLoading(false));
  }, []);

  const allRequests = useMemo(() => {
    const rows = [];
    for (const order of orders) {
      for (const line of order.products || []) {
        const productName =
          line.product?.productName || line.product?.title || 'Rental Product';
        // for (const issue of line.issueReports || []) {
        //   rows.push({
        //     issueId: String(issue._id),
        //     orderId: String(order._id),
        //     queryCode: issue.queryCode,
        //     productName,
        //     issueType: issue.issueType,
        //     description: issue.description,
        //     photos: issue.photos || [],
        //     status: issue.status || 'open',
        //     createdAt: issue.createdAt,
        //   });
        // }
        for (const issue of line.issueReports || []) {
          rows.push({
            issueId: String(issue._id),
            orderId: String(order._id),
            queryCode: issue.queryCode,
            productName,
            issueType: issue.issueType,
            description: issue.description,
            photos: issue.photos || [],
            status: issue.status || 'open',
            createdAt: issue.createdAt,
            resolutionNote: issue.resolutionNote || '',
            resolvedAt: issue.resolvedAt || null,
          });
        }
      }
    }
    return rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold text-black">
          <span> {allRequests.length}</span> Requests
        </h2>
        {/* <span className="ml-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
          {allRequests.length}
        </span> */}
      </div>

      {allRequests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
          <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500 font-medium">
            No issue requests yet
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Reports you submit from your active rentals will appear here.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {allRequests.map((req) => {
            const isExpanded = expandedId === req.issueId;
            return (
              <li
                key={req.issueId}
                className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-transform duration-200 hover:scale-[1.03] hover:shadow-md"
              >
                <div className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {req.productName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        QRY-{String(req.queryCode).padStart(4, '0')} ·{' '}
                        {formatDate(req.createdAt)}
                      </p>
                    </div>
                    {statusBadge(req.status)}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 items-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs font-medium">
                      {issueTypeLabel(req.issueType)}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                    {req.description}
                  </p>

                  {req.photos.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : req.issueId)
                      }
                      className="mt-3 inline-flex items-center gap-1.5 text-xs text-blue-600 font-medium hover:underline"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      {isExpanded ? 'Hide' : 'View'} {req.photos.length} photo
                      {req.photos.length > 1 ? 's' : ''}
                    </button>
                  )}

                  {isExpanded && req.photos.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {req.photos.map((photo, i) => {
                        const photoKey = String(i);
                        const photoUrl = photo.url || '';
                        const photoAlt = photo.name || 'Issue photo';
                        return (
                          <a
                            key={photoKey}
                            href={photoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-lg overflow-hidden border border-gray-200"
                          >
                            <img
                              src={photoUrl}
                              alt={photoAlt}
                              className="w-full h-28 object-cover hover:opacity-90 transition-opacity"
                            />
                          </a>
                        );
                      })}
                    </div>
                  )}

                  {(req.status === 'resolved' || req.status === 'closed') &&
                  req.resolutionNote ? (
                    <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                      <p className="text-xs font-medium text-emerald-700">
                        Resolution
                      </p>
                      <p className="mt-0.5 text-sm text-emerald-900 whitespace-pre-wrap">
                        {req.resolutionNote}
                      </p>
                      {req.resolvedAt ? (
                        <p className="mt-1 text-[11px] text-emerald-600">
                          Resolved on {formatDate(req.resolvedAt)}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
