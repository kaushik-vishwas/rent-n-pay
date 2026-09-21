'use client';
import React from 'react';
import Link from 'next/link';
import { apiGetActiveServiceAdvertisements } from '@/lib/api';

const ServiceOffer = () => {
  const [serviceAdvertisements, setServiceAdvertisements] = React.useState([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    apiGetActiveServiceAdvertisements()
      .then((res) => {
        console.log('service advertisement response:', res.data);
        if (res.data?.serviceAdvertisements?.length)
          setServiceAdvertisements(res.data.serviceAdvertisements);
      })
      .catch((err) => {
        console.error('service advertisement fetch failed:', err);
      })
      .finally(() => setLoaded(true));
  }, []);

  React.useEffect(() => {
    if (serviceAdvertisements.length <= 1) return;
    const t = setInterval(
      () => setCurrentIndex((i) => (i + 1) % serviceAdvertisements.length),
      5000,
    );
    return () => clearInterval(t);
  }, [serviceAdvertisements, currentIndex]);

  const serviceAdvertisement =
    serviceAdvertisements.length > 0
      ? serviceAdvertisements[currentIndex]
      : null;

  if (loaded && serviceAdvertisements.length === 0) return null;

  return (
    <section className="w-full pt-3 pb-4 md:pt-6 md:pb-6">
      <div className="mx-auto w-full relative">
        <Link
          href={serviceAdvertisement?.clickableUrl || '#'}
          className={`w-full overflow-hidden shadow-lg relative group block service-advertisement-ratio ${
            !serviceAdvertisement?.clickableUrl ? 'pointer-events-none' : ''
          }`}
          style={{ aspectRatio: '21/9' }}
        >
          <style>{`
            @media (max-width: 1024px) {
              .service-advertisement-ratio { aspect-ratio: 21/9 !important; }
            }
            @media (max-width: 768px) {
              .service-advertisement-ratio { aspect-ratio: 21/9 !important; }
            }
            @media (max-width: 480px) {
              .service-advertisement-ratio { aspect-ratio: 21/9 !important; }
            }
          `}</style>

          {loaded && serviceAdvertisement?.image && (
            <img
              src={serviceAdvertisement.image}
              alt={serviceAdvertisement?.title || 'service advertisement'}
              className="w-full h-full object-cover transition-opacity duration-500"
            />
          )}

          {/* Overlay text */}
          {serviceAdvertisement?.title && (
            <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 bg-black/20">
              <h1 className="text-white text-2xl md:text-4xl lg:text-5xl font-semibold leading-tight drop-shadow-md">
                {serviceAdvertisement.title}
              </h1>
              {serviceAdvertisement?.subtitle && (
                <p className="text-white/90 text-sm md:text-base mt-3 max-w-lg drop-shadow">
                  {serviceAdvertisement.subtitle}
                </p>
              )}
            </div>
          )}
        </Link>

        {/* Dots */}
        {serviceAdvertisements.length > 1 && (
          <div className="pointer-events-none absolute bottom-3 sm:bottom-6 left-0 right-0 z-10 flex justify-center gap-2">
            {serviceAdvertisements.map((_, i) => (
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
    </section>
  );
};

export default ServiceOffer;
