'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { IMG_SERVICE_BANNER as serviceBanner } from '@/lib/assetPlaceholders';
import serviceMainImg from '@/assets/images/service-main.png';
import serviceMainImg1 from '@/assets/images/service-main1.png';

const ServiceBannerSection = () => {
  const bannerImages = [serviceMainImg, serviceMainImg1];
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImgIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full bg-white pt-6 sm:pt-14 pb-3 md:pb-6 px-3 sm:px-4">
      <div className="max-w-sm sm:max-w-6xl mx-auto grid grid-cols-[40%_60%] sm:grid-cols-2 items-center gap-2 sm:gap-10">
        {/* Left text */}
        <div className="space-y-1.5 sm:space-y-5 md:space-y-6 text-left">
          <h1 className="text-base sm:text-3xl md:text-4xl lg:text-5xl  text-gray-900 leading-snug">
            <span className="block font-semibold mb-0.5 sm:mb-2">
              Expert Services
            </span>
            <span className="block font-semibold mb-0.5 sm:mb-2">
              Verified Pros
            </span>
            <span className="block font-bold text-orange-500">At Doorstep</span>
          </h1>

          <p className="text-[9px] sm:text-sm md:text-base font-bold text-gray-600 max-w-md mx-0">
            Book trusted local professionals from shops near you🧡
          </p>
        </div>

        {/* Right image + pill button */}
        <div className="relative flex flex-col items-center leading-none w-full">
          <Image
            src={bannerImages[currentImgIndex]}
            alt="Service professional"
            className="block w-full max-w-[380px] sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl object-contain rounded-xl sm:rounded-[2rem] md:rounded-[2.5rem] mx-auto h-auto"
            priority
          />

          <button className="absolute -bottom-4 sm:-bottom-5 md:-bottom-6 lg:-bottom-8 left-1/2 -translate-x-1/2 px-2 sm:px-6 md:px-7 py-1 sm:py-2 rounded-full bg-[#F97316] text-white text-[8px] sm:text-sm md:text-base font-medium whitespace-nowrap z-10 shadow-md">
            “ We Are At Your Service ”
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServiceBannerSection;
