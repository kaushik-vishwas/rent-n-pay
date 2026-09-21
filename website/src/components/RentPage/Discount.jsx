'use client';
import React from 'react';
import Link from 'next/link';
import { apiGetActiveRentOffers } from '@/lib/api';

const Discount = () => {
  const [rentOffers, setRentOffers] = React.useState([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    apiGetActiveRentOffers()
      .then((res) => {
        console.log('rent offer response:', res.data);
        if (res.data?.rentOffers?.length) setRentOffers(res.data.rentOffers);
      })
      .catch((err) => {
        console.error('rent offer fetch failed:', err);
      })
      .finally(() => setLoaded(true));
  }, []);

  if (loaded && rentOffers.length === 0) return null;

  return (
    <section className="w-full pt-1 md:pt-6 pb-4 md:pb-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 gap-2 sm:gap-6">
          {rentOffers.slice(0, 2).map((offer) => (
            <Link
              key={offer._id}
              href={offer.clickableUrl || '#'}
              className={`overflow-hidden rounded-xl block w-full aspect-[4/3] sm:aspect-[16/9] ${
                !offer.clickableUrl ? 'pointer-events-none' : ''
              }`}
            >
              <img
                src={offer.image}
                alt={offer.title || 'rent offer'}
                className="w-full h-full object-cover object-center"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Discount;
