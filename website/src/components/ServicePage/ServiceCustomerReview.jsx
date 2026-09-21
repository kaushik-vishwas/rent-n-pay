'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  Star,
  CircleCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Tag,
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function resolveImage(src = '') {
  if (!src) return '';
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  return `${BACKEND_URL}${src}`;
}

function getInitial(name = '') {
  return String(name).trim().charAt(0).toUpperCase() || '?';
}

function getAvatarColor(name = '') {
  const colors = [
    'bg-orange-500',
    'bg-blue-500',
    'bg-emerald-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-amber-500',
    'bg-teal-500',
    'bg-rose-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash += name.charCodeAt(i);
  }
  return colors[hash % colors.length];
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function StarRow({ rating, size = 13 }) {
  const filled = Math.round(Number(rating) || 0);
  return (
    <div className="flex mt-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= filled
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-300 fill-gray-200'
          }
        />
      ))}
    </div>
  );
}

const REVIEWS_PER_PAGE = 10;

const ServiceCustomerReview = ({ product }) => {
  const reviews = product?.reviews || [];
  const averageRating = Number(product?.averageRating || 0);
  const numReviews = product?.numReviews || 0;

  const [currentPage, setCurrentPage] = useState(1);
  const [previewImages, setPreviewImages] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 5));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 1));

  useEffect(() => {
    document.body.style.overflow = isPreviewOpen ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isPreviewOpen]);

  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);

  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * REVIEWS_PER_PAGE;
    return reviews.slice(start, start + REVIEWS_PER_PAGE);
  }, [reviews, currentPage]);

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(Number(r.rating)) === star).length,
  }));
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  const openPreview = (images, index) => {
    setPreviewImages(images);
    setPreviewIndex(index);
    setZoom(1);
    setIsPreviewOpen(true);
  };

  if (!reviews.length) {
    return (
      <section className="bg-gray-50 py-8 px-4">
        {/* <div className="w-full mx-auto">
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold mb-4">
            Customer Reviews
          </h2>
          <p className="text-gray-500 text-sm">
            No reviews yet for this service.
          </p>
        </div> */}
        <div className="w-full mx-auto">
          <h2 className="text-lg sm:text-2xl lg:text-3xl mb-4">
            <span className="font-semibold text-black">Customer </span>
            <span className="font-bold text-[#F97316]">Reviews</span>
          </h2>
          <p className="text-gray-500 text-sm">
            No reviews yet for this service.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 py-8 px-4 mt-6 sm:mt-8">
      <div className="w-full mx-auto">
        <h2 className="text-lg sm:text-2xl lg:text-3xl mb-8">
          <span className="font-semibold text-black">Customer </span>
          <span className="font-bold text-[#F97316]">Reviews</span>
        </h2>

        {/* Top Cards */}
        <div className="flex flex-row gap-3 sm:gap-6 mb-6 sm:mb-8">
          {/* Average Rating */}
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 text-center shadow-sm w-[40%] min-w-0 shrink-0">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">
              {averageRating.toFixed(1)}
            </h3>
            <div className="flex justify-center mb-1 sm:mb-2">
              <StarRow rating={averageRating} size={16} />
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              {numReviews} Rating{numReviews !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Distribution */}
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-6 shadow-sm w-[60%] min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-medium mb-2 sm:mb-4">
              Rating Distribution
            </h4>
            {distribution.map((item) => (
              <div key={item.star} className="flex items-center mb-1.5 sm:mb-3">
                <span className="text-xs sm:text-sm w-5 sm:w-6 shrink-0">
                  {item.star}★
                </span>
                <div className="flex-1 mx-2 sm:mx-3 bg-gray-200 h-1.5 sm:h-2 rounded min-w-0">
                  <div
                    className="bg-green-500 h-1.5 sm:h-2 rounded transition-all"
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] sm:text-xs text-gray-500 w-4 sm:w-6 shrink-0 text-right">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
          {paginatedReviews.map((review) => (
            <div
              key={String(review._id)}
              className="bg-white rounded-xl p-4 flex gap-3 items-start shadow-sm"
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${getAvatarColor(review.name)}`}
              >
                {getInitial(review.name)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-base">{review.name}</h4>
                      {/* Verified Booking badge — uses bookingId for services */}
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CircleCheck size={11} className="stroke-[2.5]" />
                        Verified Booking
                      </span>
                    </div>
                    <StarRow rating={review.rating} size={13} />
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {formatDate(review.createdAt)}
                  </span>
                </div>

                {/* Service-specific: show tags if present */}
                {Array.isArray(review.tags) && review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {review.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-700 border border-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {review.comment && (
                  <p className="text-sm text-gray-500 mt-2">{review.comment}</p>
                )}

                {/* Images (if any) */}
                {review.images?.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {review.images.map((img, i) => (
                      <div
                        key={i}
                        className="relative group w-16 h-16 rounded-lg overflow-hidden border border-gray-200"
                      >
                        <img
                          src={resolveImage(img)}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <button
                            onClick={() => openPreview(review.images, i)}
                            className="text-white"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-full border border-gray-300 bg-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="text-sm font-medium text-gray-700 min-w-[40px] text-center">
              {currentPage}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-9 h-9 rounded-full border border-gray-300 bg-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={() => setIsPreviewOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X size={30} />
          </button>
          {previewImages.length > 1 && (
            <button
              onClick={() => {
                setPreviewIndex((p) =>
                  p === 0 ? previewImages.length - 1 : p - 1,
                );
                setZoom(1);
              }}
              className="absolute left-4 text-white bg-black/40 hover:bg-black/60 p-2 rounded-full"
            >
              <ChevronLeft size={30} />
            </button>
          )}
          <div className="fixed top-4 right-16 z-[60] flex items-center gap-2">
            <button
              onClick={zoomOut}
              className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white text-xl backdrop-blur-sm"
            >
              −
            </button>
            <button
              onClick={zoomIn}
              className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white text-xl backdrop-blur-sm"
            >
              +
            </button>
          </div>
          <div
            className="overflow-auto max-w-full max-h-[85vh]"
            onWheel={(e) => {
              if (e.deltaY < 0) zoomIn();
              else zoomOut();
            }}
          >
            <img
              src={resolveImage(previewImages[previewIndex])}
              alt=""
              className="rounded-xl object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoom})`,
                maxWidth: '100%',
                maxHeight: '85vh',
              }}
            />
          </div>
          {previewImages.length > 1 && (
            <button
              onClick={() => {
                setPreviewIndex((p) =>
                  p === previewImages.length - 1 ? 0 : p + 1,
                );
                setZoom(1);
              }}
              className="absolute right-4 text-white bg-black/40 hover:bg-black/60 p-2 rounded-full"
            >
              <ChevronRight size={30} />
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default ServiceCustomerReview;
