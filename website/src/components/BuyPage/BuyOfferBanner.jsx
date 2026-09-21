'use client';
import React from 'react';
import Link from 'next/link';
import { apiGetActiveBuyAdvertisements } from '@/lib/api';

const BuyOfferBanner = () => {
  const [buyAdvertisements, setBuyAdvertisements] = React.useState([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    apiGetActiveBuyAdvertisements()
      .then((res) => {
        console.log('buy advertisement response:', res.data);
        if (res.data?.buyAdvertisements?.length)
          setBuyAdvertisements(res.data.buyAdvertisements);
      })
      .catch((err) => {
        console.error('buy advertisement fetch failed:', err);
      })
      .finally(() => setLoaded(true));
  }, []);

  React.useEffect(() => {
    if (buyAdvertisements.length <= 1) return;
    const t = setInterval(
      () => setCurrentIndex((i) => (i + 1) % buyAdvertisements.length),
      5000,
    );
    return () => clearInterval(t);
  }, [buyAdvertisements, currentIndex]);

  const buyAdvertisement =
    buyAdvertisements.length > 0 ? buyAdvertisements[currentIndex] : null;

  if (loaded && buyAdvertisements.length === 0) return null;

  return (
    <section className="w-full pt-3 pb-4 md:pt-6 md:pb-6">
      <div className="mx-auto w-full relative">
        <Link
          href={buyAdvertisement?.clickableUrl || '#'}
          className={`w-full overflow-hidden shadow-lg relative group block buy-advertisement-ratio ${
            !buyAdvertisement?.clickableUrl ? 'pointer-events-none' : ''
          }`}
          style={{ aspectRatio: '21/9' }}
        >
          <style>{`
            @media (max-width: 1024px) {
              .buy-advertisement-ratio { aspect-ratio: 21/9 !important; }
            }
            @media (max-width: 768px) {
              .buy-advertisement-ratio { aspect-ratio: 21/9 !important; }
            }
            @media (max-width: 480px) {
              .buy-advertisement-ratio { aspect-ratio: 21/9 !important; }
            }
          `}</style>

          {loaded && buyAdvertisement?.image && (
            <img
              src={buyAdvertisement.image}
              alt={buyAdvertisement?.title || 'buy advertisement'}
              className="w-full h-full object-cover transition-opacity duration-500"
            />
          )}

          {/* Overlay text */}
          {buyAdvertisement?.title && (
            <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 bg-black/20">
              <h1 className="text-white text-2xl md:text-4xl lg:text-5xl font-semibold leading-tight drop-shadow-md">
                {buyAdvertisement.title}
              </h1>
              {buyAdvertisement?.subtitle && (
                <p className="text-white/90 text-sm md:text-base mt-3 max-w-lg drop-shadow">
                  {buyAdvertisement.subtitle}
                </p>
              )}
            </div>
          )}
        </Link>

        {/* Dots */}
        {buyAdvertisements.length > 1 && (
          <div className="pointer-events-none absolute bottom-3 sm:bottom-6 left-0 right-0 z-10 flex justify-center gap-2">
            {buyAdvertisements.map((_, i) => (
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

export default BuyOfferBanner;
