'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  apiGetStorefrontVendorProducts,
  apiGetActiveBuyBanners,
} from '@/lib/api';

const BuyBannerSection = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeFilter, setActiveFilterState] = useState(
    searchParams.get('filter') || 'all',
  );

  const setActiveFilter = (filter) => {
    setActiveFilterState(filter);
    const params = new URLSearchParams(searchParams.toString());
    params.set('filter', filter);
    router.push(`?${params.toString()}`, { scroll: false });
  };
  const [stats, setStats] = useState({
    all: 0,
    brandNew: 0,
    refurbished: 0,
    mintCondition: 0,
  });

  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bannersLoaded, setBannersLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    apiGetStorefrontVendorProducts('limit=200')
      .then((res) => {
        if (!mounted) return;
        const all = Array.isArray(res?.data?.products) ? res.data.products : [];
        const sellProducts = all.filter((p) => String(p?.type) === 'Sell');

        const brandNewCount = sellProducts.filter((p) =>
          String(p?.condition || 'Brand New')
            .trim()
            .toLowerCase()
            .includes('brand new'),
        ).length;

        const mintConditionCount = sellProducts.filter((p) =>
          String(p?.condition || '')
            .trim()
            .toLowerCase()
            .includes('mint condition'),
        ).length;

        const refurbishedCount =
          sellProducts.length - brandNewCount - mintConditionCount;

        setStats({
          all: sellProducts.length,
          brandNew: brandNewCount,
          refurbished: refurbishedCount,
          mintCondition: mintConditionCount,
        });
      })
      .catch(() => {
        if (!mounted) return;
        setStats({ all: 0, brandNew: 0, refurbished: 0, mintCondition: 0 });
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    apiGetActiveBuyBanners()
      .then((res) => {
        if (!mounted) return;
        if (res.data?.buyBanners?.length) setBanners(res.data.buyBanners);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setBannersLoaded(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(
      () => setCurrentIndex((i) => (i + 1) % banners.length),
      5000,
    );
    return () => clearInterval(t);
  }, [banners, currentIndex]);

  const banner = banners.length > 0 ? banners[currentIndex] : null;

  const touchStartX = React.useRef(null);
  const touchEndX = React.useRef(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    const SWIPE_THRESHOLD = 40;

    if (banners.length > 1) {
      if (diff > SWIPE_THRESHOLD) {
        setCurrentIndex((i) => (i + 1) % banners.length);
      } else if (diff < -SWIPE_THRESHOLD) {
        setCurrentIndex((i) => (i - 1 + banners.length) % banners.length);
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section className="w-full bg-white pt-1 pb-4 md:pt-4 md:pb-6">
      <div className="mx-auto w-full px-4">
        {/* Top banner image */}
        <div
          className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl md:rounded-2xl shadow-lg buy-banner-ratio"
          style={{ aspectRatio: '21/9' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {bannersLoaded && banner?.image && (
            <img
              src={banner.image}
              alt={banner?.title || 'Summer sale banner'}
              className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500"
            />
          )}

          {/* Dots */}
          {banners.length > 1 && (
            <div className="pointer-events-none absolute bottom-3 sm:bottom-6 left-0 right-0 z-10 flex justify-center gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentIndex(i);
                  }}
                  className={`pointer-events-auto rounded-full transition-colors duration-300 w-2.5 h-2.5 ${
                    i === currentIndex
                      ? 'bg-orange-500'
                      : 'bg-white/60 hover:bg-orange-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        {/* Text + buttons under banner */}
        <div className="mt-6 sm:mt-10 text-center">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-black">
            Your Choice. Your Price.{' '}
            <span className="text-orange-500">Your Rentnpay</span>
          </h2>

          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-semibold text-gray-500 px-1">
            Brand New with Warranty, Refurbished, or Mint Condition
          </p>

          {/* <div className="mt-4 sm:mt-6 flex flex-row flex-nowrap items-center justify-center gap-1.5 sm:gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 sm:px-6 md:px-8 py-1.5 sm:py-2.5 rounded-full text-[10px] sm:text-sm font-medium whitespace-nowrap shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-orange-500 text-white shadow-[0_8px_18px_rgba(251,146,60,0.45)]'
                  : 'bg-[#f7f7f7] text-gray-800 border border-gray-200'
              }`}
            >
              All Products ({stats.all})
            </button>
            <button
              onClick={() => setActiveFilter('brandNew')}
              className={`px-2.5 sm:px-6 md:px-8 py-1.5 sm:py-2.5 rounded-full text-[10px] sm:text-sm whitespace-nowrap shrink-0 ${
                activeFilter === 'brandNew'
                  ? 'bg-orange-500 text-white shadow-[0_8px_18px_rgba(251,146,60,0.45)]'
                  : 'bg-[#f7f7f7] text-gray-800 border border-gray-200'
              }`}
            >
              Brand New ({stats.brandNew})
            </button>
            <button
              onClick={() => setActiveFilter('preOwned')}
              className={`px-2.5 sm:px-6 md:px-8 py-1.5 sm:py-2.5 rounded-full text-[10px] sm:text-sm whitespace-nowrap shrink-0 ${
                activeFilter === 'preOwned'
                  ? 'bg-orange-500 text-white shadow-[0_8px_18px_rgba(251,146,60,0.45)]'
                  : 'bg-[#f7f7f7] text-gray-800 border border-gray-200'
              }`}
            >
              Refurbished ({stats.refurbished})
            </button>
            <button
              onClick={() => setActiveFilter('mintCondition')}
              className={`px-2.5 sm:px-6 md:px-8 py-1.5 sm:py-2.5 rounded-full text-[10px] sm:text-sm whitespace-nowrap shrink-0 ${
                activeFilter === 'mintCondition'
                  ? 'bg-orange-500 text-white shadow-[0_8px_18px_rgba(251,146,60,0.45)]'
                  : 'bg-[#f7f7f7] text-gray-800 border border-gray-200'
              }`}
            >
              Mint Condition ({stats.mintCondition})
            </button>
          </div> */}
          <div className="mt-4 sm:mt-6 flex flex-row flex-nowrap items-center justify-center gap-1 sm:gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-xs md:text-sm font-medium whitespace-nowrap shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-orange-500 text-white shadow-[0_8px_18px_rgba(251,146,60,0.45)]'
                  : 'bg-[#f7f7f7] text-gray-800 border border-gray-200'
              }`}
            >
              All Products ({stats.all})
            </button>
            <button
              onClick={() => setActiveFilter('brandNew')}
              className={`px-2 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-xs md:text-sm whitespace-nowrap shrink-0 ${
                activeFilter === 'brandNew'
                  ? 'bg-orange-500 text-white shadow-[0_8px_18px_rgba(251,146,60,0.45)]'
                  : 'bg-[#f7f7f7] text-gray-800 border border-gray-200'
              }`}
            >
              Brand New ({stats.brandNew})
            </button>
            <button
              onClick={() => setActiveFilter('preOwned')}
              className={`px-2 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-xs md:text-sm whitespace-nowrap shrink-0 ${
                activeFilter === 'preOwned'
                  ? 'bg-orange-500 text-white shadow-[0_8px_18px_rgba(251,146,60,0.45)]'
                  : 'bg-[#f7f7f7] text-gray-800 border border-gray-200'
              }`}
            >
              Refurbished ({stats.refurbished})
            </button>
            <button
              onClick={() => setActiveFilter('mintCondition')}
              className={`px-2 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-xs md:text-sm whitespace-nowrap shrink-0 ${
                activeFilter === 'mintCondition'
                  ? 'bg-orange-500 text-white shadow-[0_8px_18px_rgba(251,146,60,0.45)]'
                  : 'bg-[#f7f7f7] text-gray-800 border border-gray-200'
              }`}
            >
              Mint Condition ({stats.mintCondition})
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuyBannerSection;
