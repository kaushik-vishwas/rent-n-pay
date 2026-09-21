// 'use client';
// import React from 'react';
// import Link from 'next/link';
// import { apiGetActiveBanners } from '@/lib/api';

// const HomeMain = () => {
//   const [banners, setBanners] = React.useState([]);
//   const [currentIndex, setCurrentIndex] = React.useState(0);
//   const [loaded, setLoaded] = React.useState(false);

//   React.useEffect(() => {
//     apiGetActiveBanners()
//       .then((res) => {
//         if (res.data?.banners?.length) setBanners(res.data.banners);
//       })
//       .catch(() => {})
//       .finally(() => setLoaded(true));
//   }, []);

//   React.useEffect(() => {
//     if (banners.length <= 1) return;
//     const t = setInterval(
//       () => setCurrentIndex((i) => (i + 1) % banners.length),
//       5000,
//     );
//     return () => clearInterval(t);
//   }, [banners, currentIndex]);

//   const banner = banners.length > 0 ? banners[currentIndex] : null;

//   const touchStartX = React.useRef(null);
//   const touchEndX = React.useRef(null);

//   const handleTouchStart = (e) => {
//     touchStartX.current = e.touches[0].clientX;
//   };

//   const handleTouchMove = (e) => {
//     touchEndX.current = e.touches[0].clientX;
//   };

//   const handleTouchEnd = () => {
//     if (touchStartX.current === null || touchEndX.current === null) return;
//     const diff = touchStartX.current - touchEndX.current;
//     const SWIPE_THRESHOLD = 40;

//     if (banners.length > 1) {
//       if (diff > SWIPE_THRESHOLD) {
//         setCurrentIndex((i) => (i + 1) % banners.length);
//       } else if (diff < -SWIPE_THRESHOLD) {
//         setCurrentIndex((i) => (i - 1 + banners.length) % banners.length);
//       }
//     }

//     touchStartX.current = null;
//     touchEndX.current = null;
//   };

//   return (
//     <section className="w-full pt-1 pb-4 md:pt-4 md:pb-6">
//       {/* <div className="mx-auto max-w-[1600px] px-4 sm:px-5 lg:px-6"> */}
//       {/* <div className="mx-auto w-full px-4 relative  ">
//         <Link
//           href={banner?.clickableUrl || '#'}
//           className={`w-full overflow-hidden rounded-xl sm:rounded-2xl md:rounded-2xl shadow-lg relative group block banner-ratio ${
//             !banner?.clickableUrl ? 'pointer-events-none' : ''
//           }`}
//           style={{ aspectRatio: '21/8.5' }}
//           onTouchStart={handleTouchStart}
//           onTouchMove={handleTouchMove}
//           onTouchEnd={handleTouchEnd}
//         > */}
//       <div
//         className="mx-auto w-full px-4 relative"
//         onTouchStart={handleTouchStart}
//         onTouchMove={handleTouchMove}
//         onTouchEnd={handleTouchEnd}
//       >
//         <Link
//           href={banner?.clickableUrl || '#'}
//           className={`w-full overflow-hidden rounded-xl sm:rounded-2xl md:rounded-2xl shadow-lg relative group block banner-ratio ${
//             !banner?.clickableUrl ? 'pointer-events-none' : ''
//           }`}
//           style={{ aspectRatio: '1920/650' }}
//         >
//           <style>{`
//             @media (max-width: 1024px) {
//               .banner-ratio { aspect-ratio: 1920/650 !important; }
//             }
//             @media (max-width: 768px) {
//               .banner-ratio { aspect-ratio: 16/10 !important; }
//             }
//             @media (max-width: 480px) {
//               .banner-ratio { aspect-ratio: 16/10 !important; }
//             }
//           `}</style>

//           {loaded && banner?.image && (
//             <img
//               src={banner.image}
//               alt={banner?.title || 'banner'}
//               className="w-full h-full object-cover transition-opacity duration-500"
//             />
//           )}

//           {/* Overlay text */}
//           {banner?.title && (
//             <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 bg-black/20">
//               <h1 className="text-white text-2xl md:text-4xl lg:text-5xl font-semibold leading-tight drop-shadow-md">
//                 {banner.title}
//               </h1>
//               {banner?.subtitle && (
//                 <p className="text-white/90 text-sm md:text-base mt-3 max-w-lg drop-shadow">
//                   {banner.subtitle}
//                 </p>
//               )}
//             </div>
//           )}
//         </Link>

//         {/* Dots */}
//         {banners.length > 1 && (
//           <div className="pointer-events-none absolute bottom-3 sm:bottom-6 left-0 right-0 z-10 flex justify-center gap-2">
//             {banners.map((_, i) => (
//               <button
//                 key={i}
//                 type="button"
//                 onClick={(e) => {
//                   e.preventDefault();
//                   e.stopPropagation();
//                   setCurrentIndex(i);
//                 }}
//                 className={`pointer-events-auto rounded-full transition-colors duration-300 w-2.5 h-2.5 ${
//                   i === currentIndex
//                     ? 'bg-orange-500'
//                     : 'bg-white/60 hover:bg-orange-300'
//                 }`}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };

// export default HomeMain;

'use client';
import React from 'react';
import Link from 'next/link';
import { apiGetActiveBanners } from '@/lib/api';

const HomeMain = () => {
  const [banners, setBanners] = React.useState([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    apiGetActiveBanners()
      .then((res) => {
        if (res.data?.banners?.length) setBanners(res.data.banners);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  React.useEffect(() => {
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
    <section className="w-full pt-1 pb-4 md:pt-4 md:pb-6">
      {/* <div className="mx-auto max-w-[1600px] px-4 sm:px-5 lg:px-6"> */}
      {/* <div className="mx-auto w-full px-4 relative  ">
        <Link
          href={banner?.clickableUrl || '#'}
          className={`w-full overflow-hidden rounded-xl sm:rounded-2xl md:rounded-2xl shadow-lg relative group block banner-ratio ${
            !banner?.clickableUrl ? 'pointer-events-none' : ''
          }`}
          style={{ aspectRatio: '21/8.5' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        > */}
      <div
        className="mx-auto w-full px-4 relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Link
          href={banner?.clickableUrl || '#'}
          className={`w-full overflow-hidden rounded-xl sm:rounded-2xl md:rounded-2xl shadow-lg relative group block banner-ratio ${
            !banner?.clickableUrl ? 'pointer-events-none' : ''
          }`}
          style={{ aspectRatio: '21/9' }}
        >
          {/* {loaded && banner?.image && (
            <img
              src={banner.image}
              alt={banner?.title || 'banner'}
              className="w-full h-full object-cover transition-opacity duration-500"
            />
          )} */}
          {loaded && banner?.image && (
            <img
              src={banner.image}
              alt={banner?.title || 'banner'}
              className="w-full h-full object-cover object-center transition-opacity duration-500"
            />
          )}
          {/* Overlay text */}
          {banner?.title && (
            <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 bg-black/20">
              <h1 className="text-white text-2xl md:text-4xl lg:text-5xl font-semibold leading-tight drop-shadow-md">
                {banner.title}
              </h1>
              {banner?.subtitle && (
                <p className="text-white/90 text-sm md:text-base mt-3 max-w-lg drop-shadow">
                  {banner.subtitle}
                </p>
              )}
            </div>
          )}
        </Link>

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
    </section>
  );
};

export default HomeMain;
