'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { IMG_SUB as mainimg } from '@/lib/assetPlaceholders';
import {
  apiGetStorefrontVendorProducts,
  apiGetActiveRentBanners,
} from '@/lib/api';
import { getLowestMonthlyEquivalentAmongProducts } from '@/lib/rentalPriceDisplay';
import { Wallet, Wrench, Car, IndianRupee } from 'lucide-react';
import mobilityIcon from '@/assets/icons/mobiliity.png';

const FALLBACK_HEADLINE_MO = 1299;

const RentMain = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bannersLoaded, setBannersLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    apiGetStorefrontVendorProducts('limit=500')
      .then((res) => {
        if (!mounted) return;
        const all = res.data?.products || [];
        setProducts(all.filter((p) => p.type === 'Rental'));
      })
      .catch(() => {
        if (!mounted) return;
        setProducts([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    apiGetActiveRentBanners()
      .then((res) => {
        if (!mounted) return;
        if (res.data?.rentBanners?.length) setBanners(res.data.rentBanners);
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

  const lowestMonthly = useMemo(
    () => getLowestMonthlyEquivalentAmongProducts(products),
    [products],
  );

  const headlineAmount = useMemo(() => {
    if (typeof lowestMonthly === 'number' && lowestMonthly > 0) {
      return lowestMonthly;
    }
    return FALLBACK_HEADLINE_MO;
  }, [lowestMonthly]);

  const headlineLabel = useMemo(() => {
    if (loading) return '…';
    return `₹${headlineAmount.toLocaleString('en-IN')}/Mo`;
  }, [loading, headlineAmount]);

  return (
    <div className="w-full bg-white font-manrope">
      <div className="max-full mx-auto px-4 pt-1 pb-4 md:pt-4 md:pb-6">
        {/* Hero Banner */}
        <div
          className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl md:rounded-2xl  mb-6 sm:mb-8 rent-banner-ratio"
          style={{ aspectRatio: '21/9' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {bannersLoaded && banner?.image && (
            <img
              src={banner.image}
              alt={banner?.title || 'Rent The Set'}
              className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500"
            />
          )}

          {/* <div className="relative z-10 flex h-full flex-col justify-center px-4 py-3 sm:px-6 sm:py-5 md:px-10 md:py-10 lg:px-16 lg:py-14">
            {banner?.title ? (
              <>
                <h1s className="text-white text-lg sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-1">
                  {banner.title}
                </h1s>
                {banner?.subtitle && (
                  <p className="text-white/90 text-sm sm:text-base md:text-lg lg:text-xl mb-2 max-w-lg">
                    {banner.subtitle}
                  </p>
                )}
              </>
            ) : (
              <>
                <h1 className="text-white text-lg sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-1">
                  Your Perfect Rental
                </h1>
                <h1 className="text-white text-lg sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-1">
                  Starts At
                </h1>

                <h2 className="text-white text-xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-2 tabular-nums">
                  {headlineLabel}
                </h2>
              </>
            )}

            <Link
              href={banner?.clickableUrl || '/products'}
              className="inline-flex w-fit items-center justify-center rounded-full bg-[#FF8D28] px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg transition-transform hover:scale-105 sm:px-6 sm:py-3 sm:text-sm md:px-10 md:py-4 md:text-lg"
            >
              Rent Now
            </Link>
          </div> */}

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

        {/* Tagline */}
        <div className="text-center mb-3">
          <p className="text-black text-xl font-semibold">
            Don&apos;t Just Rent.{' '}
            <span style={{ color: '#F97316' }} className="font-bold">
              Rent A Lifestyle!
            </span>
          </p>
        </div>

        {/* Feature Pills */}
        {
          [
            { icon: IndianRupee, label: 'Financial Freedom' },
            { icon: Wrench, label: 'Zero Repairs' },
            { image: mobilityIcon, label: 'Total Mobility' },
          ].map(
            ({ icon: Icon, image, label }) => null,
          ) /* keep original block below unchanged */
        }
        <div className="flex flex-nowrap justify-center gap-1.5 sm:gap-4 mb-1 sm:mb-2">
          {[
            { icon: IndianRupee, label: 'Financial Freedom' },
            { icon: Wrench, label: 'Zero Repairs' },
            { image: mobilityIcon, label: 'Total Mobility' },
          ].map(({ icon: Icon, image, label }) => (
            <div
              key={label}
              className="group flex items-center gap-1 sm:gap-2 px-2 sm:px-5 py-1 sm:py-2 rounded-full bg-[#F7F7F8] shadow-md border text-[10px] sm:text-sm font-medium text-black whitespace-nowrap transition-all duration-300 hover:bg-orange-50 hover:border-orange-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
            >
              <span
                className="w-7 h-7 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: '#F97316' }}
              >
                {image ? (
                  <img
                    src={image.src}
                    alt={label}
                    className="w-4 h-4 object-contain"
                  />
                ) : (
                  <Icon size={14} color="white" strokeWidth={2.5} />
                )}
              </span>

              <span className="transition-colors duration-300 group-hover:text-orange-600">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RentMain;
