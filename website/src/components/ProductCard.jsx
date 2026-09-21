// 'use client';

// import Link from 'next/link';
// import { Heart, Star, Truck, Package, ShoppingCart } from 'lucide-react';
// import {
//   getRentalListingAmount,
//   getRentalListingSuffix,
//   getProductDeliveryEtaLabel,
// } from '@/lib/rentalPriceDisplay';

// const parsePrice = (raw) => {
//   const n = parseInt(String(raw || '').replace(/[^0-9]/g, ''), 10);
//   return Number.isFinite(n) ? n : 0;
// };

// const PLATFORM_FEE_PERCENT = 15;
// // Admin offers store a % of the platform fee removed; convert that into a
// // plain % of product price so it can be used exactly like a vendor offer's
// // discountPercent everywhere below.
// function resolveDiscountPercent(offer) {
//   if (!offer) return 0;
//   if (offer.source === 'admin') {
//     return Math.min(
//       PLATFORM_FEE_PERCENT,
//       Number(offer.platformFeeReductionPercent || 0),
//     );
//   }
//   return Number(offer.discountPercent || 0);
// }

// const ProductCard = ({
//   product,
//   offer,
//   isAuthenticated = false,
//   isWishlisted = false,
//   toggling = false,
//   onToggleWishlist,
//   onAddToCart,
//   onNotifyMe,
//   isNotifying = false,
//   isNotified = false,
// }) => {
//   const { _id, productName, image, price, type, category, subCategory, stock } =
//     product;

//   // const isServiceProduct = String(type || '').toLowerCase() === 'service';

//   // if (isServiceProduct) {
//   //   const serviceTitle = productName || product.title || product.name || '';
//   //   const serviceImage =
//   //     image || product.imageUrl || 'https://placehold.co/600x400';
//   //   const rawServicePrice = price ?? product.startingPrice ?? '—';
//   //   const servicePrice = (() => {
//   //     const s = String(rawServicePrice).trim();
//   //     if (s === '—' || s === '') return '—';
//   //     return /[₹]|rs\.?/i.test(s) ? s : `₹${s}`;
//   //   })();
//   //   const serviceRating = Number(
//   //     product.averageRating || product.rating || 0,
//   //   ).toFixed(1);
//   //   const serviceReviews = Number(
//   //     product.numReviews || product.reviewCount || 0,
//   //   );
//   //   const serviceHref = `/service/${_id}`;

//   //   const serviceDiscount = Number(offer?.discountPercent || 0);
//   //   const hasServiceOffer = !!offer && serviceDiscount > 0;
//   //   const serviceBasePrice = Number(
//   //     String(servicePrice ?? '').replace(/[^0-9.]/g, ''),
//   //   );
//   //   const serviceFinalPrice =
//   //     hasServiceOffer &&
//   //     Number.isFinite(serviceBasePrice) &&
//   //     serviceBasePrice > 0
//   //       ? Math.max(
//   //           0,
//   //           Math.round(
//   //             serviceBasePrice - (serviceBasePrice * serviceDiscount) / 100,
//   //           ),
//   //         )
//   //       : null;
//   //   const serviceTag = offer?.sticker || '';

//   //   return (
//   //     <Link
//   //       href={serviceHref}
//   //       className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md hover:scale-[1.03] transition-all duration-300 cursor-pointer block"
//   //     >

//   //       <div className="relative overflow-hidden">
//   //         {serviceTag && (
//   //           <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10">
//   //             {serviceTag}
//   //           </span>
//   //         )}
//   //         <img
//   //           src={serviceImage}
//   //           alt={serviceTitle}
//   //           className="w-full aspect-square max-h-64 sm:max-h-72 object-cover"
//   //         />
//   //       </div>
//   //       <div className="px-2 sm:px-4 pb-2.5 sm:pb-4">
//   //         <div className="flex justify-between items-start mb-1 pt-3">
//   //           <h3 className="text-sm sm:text-xl font-bold truncate">
//   //             {serviceTitle}
//   //           </h3>
//   //           {serviceReviews > 0 && (
//   //             <div className="flex items-center gap-1 text-white text-[9px] sm:text-[11px] bg-emerald-500 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 mt-1">
//   //               <Star size={12} fill="white" />
//   //               {serviceRating}
//   //             </div>
//   //           )}
//   //         </div>
//   //         <div className="flex items-end justify-between gap-2 mb-3">
//   //           <div>
//   //             <span className="font-bold text-sm sm:text-xl leading-none">
//   //               {hasServiceOffer && serviceFinalPrice != null
//   //                 ? `₹${serviceFinalPrice.toLocaleString('en-IN')}`
//   //                 : servicePrice}
//   //             </span>
//   //             {hasServiceOffer && serviceFinalPrice != null ? (
//   //               <span className="ml-2 text-gray-400 text-xs line-through">
//   //                 {servicePrice}
//   //               </span>
//   //             ) : null}
//   //           </div>
//   //           {hasServiceOffer ? (
//   //             <span className="inline-flex items-center px-1 sm:px-1.5 py-0.5 rounded-full border text-[7px] sm:text-[9px] font-medium text-orange-500 border-orange-500 bg-orange-50 whitespace-nowrap self-end">
//   //               {serviceDiscount}% Off
//   //             </span>
//   //           ) : null}
//   //         </div>
//   //         <Link
//   //           href={serviceHref}
//   //           className="flex items-center justify-center gap-2 w-full text-center py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition bg-orange-500 text-white hover:bg-orange-600"
//   //         >
//   //           Add Service
//   //         </Link>
//   //       </div>
//   //     </Link>
//   //   );
//   // }

//   const isSellProduct = String(type || '').toLowerCase() === 'sell';

//   const productHref = isSellProduct
//     ? `/buy-product-details/${_id}`
//     : `/rent-product-details/${_id}`;

//   // const rawBase =
//   //   type === 'Rental' ? getRentalListingAmount(product) : parsePrice(price);
//   const rawBase =
//     type === 'Rental'
//       ? getRentalListingAmount(product)
//       : parsePrice(price) ||
//         Number(product?.salesConfiguration?.salePrice || 0) ||
//         Number(product?.variants?.[0]?.sellPrice || 0);

//   // const lowestConfig =
//   //   type === 'Rental' && Array.isArray(product.rentalConfigurations)
//   //     ? product.rentalConfigurations
//   //         .filter(
//   //           (cfg) => Number(cfg?.customerRent || cfg?.pricePerDay || 0) > 0,
//   //         )
//   //         .sort((a, b) => Number(a.months || 0) - Number(b.months || 0))[0]
//   //     : null;

//   const allConfigsForCard =
//     type === 'Rental'
//       ? [
//           ...(Array.isArray(product.rentalConfigurations)
//             ? product.rentalConfigurations
//             : []),
//           ...(Array.isArray(product.variants)
//             ? product.variants.flatMap((v) =>
//                 Array.isArray(v?.rentalConfigurations)
//                   ? v.rentalConfigurations
//                   : [],
//               )
//             : []),
//         ]
//       : [];

//   const lowestConfig = allConfigsForCard
//     .filter((cfg) => Number(cfg?.customerRent || cfg?.pricePerDay || 0) > 0)
//     .sort((a, b) => {
//       // For month-based configs, customerRent is already the per-month
//       // rate — don't divide it by months.
//       const perUnitA =
//         a.periodUnit === 'day' && Number(a.days) > 0
//           ? Number(a.customerRent || a.pricePerDay) / Number(a.days)
//           : Number(a.customerRent || a.pricePerDay);
//       const perUnitB =
//         b.periodUnit === 'day' && Number(b.days) > 0
//           ? Number(b.customerRent || b.pricePerDay) / Number(b.days)
//           : Number(b.customerRent || b.pricePerDay);
//       return perUnitA - perUnitB;
//     })[0];

//   const base = lowestConfig
//     ? lowestConfig.periodUnit === 'day' && Number(lowestConfig.days) > 0
//       ? Math.round(
//           Number(lowestConfig.customerRent || lowestConfig.pricePerDay) /
//             Number(lowestConfig.days),
//         )
//       : // customerRent is already the per-month rate for month-based
//         // configs — use it directly instead of dividing by months.
//         Math.round(
//           Number(lowestConfig.customerRent || lowestConfig.pricePerDay),
//         )
//     : rawBase;

//   const priceSuffix =
//     type === 'Rental'
//       ? lowestConfig?.periodUnit === 'day'
//         ? '/day'
//         : '/month'
//       : '';

//   const discount = resolveDiscountPercent(offer);
//   const hasOffer = discount > 0;

//   const finalPrice = hasOffer
//     ? Math.max(0, Math.round(base - (base * discount) / 100))
//     : base;

//   const inStock = Number(stock || 0) > 0;

//   const deliveryEta = getProductDeliveryEtaLabel(product);

//   const status = inStock ? deliveryEta || 'Varies' : 'Out of Stock';

//   const rating = Number(product?.averageRating || 0).toFixed(1);

//   const totalRatings = Number(product?.numReviews || 0);

//   // const tag = offer?.sticker || 'Bestseller';
//   const tag = offer?.sticker || '';

//   // const isDaily =
//   //   Array.isArray(product.rentalConfigurations) &&
//   //   product.rentalConfigurations.some((cfg) => cfg?.periodUnit === 'day');
//   const isDaily = allConfigsForCard.some((cfg) => cfg?.periodUnit === 'day');
//   return (
//     <Link
//       href={productHref}
//       className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md hover:scale-[1.03] transition-all duration-300 cursor-pointer block"
//     >
//       {/* IMAGE SECTION */}
//       {/* <div className="relative p-1 overflow-hidden">
//         <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10">
//           {tag}
//         </span>

//         <Link href={productHref}> */}
//       <div className="relative p-1 overflow-hidden">
//         {tag && (
//           <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10">
//             {tag}
//           </span>
//         )}
//         {/*
//         <Link href={productHref}>
//           <img
//             src={image || 'https://placehold.co/600x400'}
//             alt={productName}
//             className="w-full aspect-square object-cover rounded-xl"
//           />
//         </Link> */}

//         <Link href={productHref}>
//           <img
//             src={image || 'https://placehold.co/600x400'}
//             alt={productName}
//             className="w-full aspect-square max-h-64 sm:max-h-72 object-cover rounded-xl"
//           />
//         </Link>

//         {/* bottom-left status */}
//         <div className="absolute bottom-3 left-3">
//           {inStock ? (
//             <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
//               <Truck size={12} />
//               {status}
//             </span>
//           ) : (
//             <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
//               <Package size={12} />
//               {status}
//             </span>
//           )}
//         </div>

//         {/* wishlist */}
//         <button
//           type="button"
//           onClick={(e) => {
//             e.preventDefault();
//             onToggleWishlist?.(_id);
//           }}
//           disabled={toggling}
//           className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:scale-105 transition disabled:opacity-60"
//         >
//           <Heart
//             size={16}
//             className={
//               isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-700'
//             }
//           />
//         </button>

//         {/* rating badge - bottom right, same row as delivery status */}
//         {totalRatings > 0 && (
//           <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white text-[11px] bg-[#F97316] px-2 py-0.5 rounded-full">
//             <Star size={12} fill="white" />
//             {rating}
//           </div>
//         )}
//       </div>

//       {/* CONTENT */}
//       <div className="px-2 sm:px-4 pb-2.5 sm:pb-4">
//         {/* title + condition badge */}
//         <div className="flex justify-between items-center gap-2 mb-1">
//           <h3 className="text-sm sm:text-xl font-bold truncate">
//             {productName}
//           </h3>
//           <span className="inline-block text-[9px] sm:text-[11px] text-gray-500 border border-gray-300 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 whitespace-nowrap shrink-0">
//             {product.condition?.trim() ||
//               (type === 'Rental' ? 'For Rent' : 'Brand New')}
//           </span>
//         </div>

//         {/* price */}
//         <div className="flex items-end justify-between gap-1 sm:gap-2 mb-1.5 sm:mb-3">
//           <div>
//             {/* <span className="font-bold text-sm sm:text-xl leading-none">
//               ₹{finalPrice}
//             </span> */}
//             <span className="font-bold text-sm sm:text-xl leading-none">
//               ₹{finalPrice.toLocaleString('en-IN')}
//             </span>
//             <span className="text-xs sm:text-base font-bold">
//               {priceSuffix}
//             </span>
//             {/*
//             {hasOffer && (
//               <span className="ml-2 text-gray-400 text-xs line-through">
//                 ₹{base}
//               </span>
//             )} */}
//             {hasOffer && (
//               <span className="ml-2 text-gray-400 text-xs line-through">
//                 ₹{base.toLocaleString('en-IN')}
//               </span>
//             )}
//           </div>

//           {hasOffer && (
//             <span className="inline-flex items-center px-1 sm:px-1.5 py-0.5 rounded-full border text-[7px] sm:text-[9px] font-medium text-orange-500 border-orange-500 bg-orange-50 whitespace-nowrap">
//               {discount}% Off
//             </span>
//           )}
//         </div>

//         {/* BUTTON */}
//         {!inStock ? (
//           // Out of stock → Details + Notify Me
//           <div className="flex gap-2">
//             <Link
//               href={productHref}
//               className="flex items-center justify-center gap-1 flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-orange-400 text-orange-500 hover:bg-orange-50 transition"
//             >
//               View
//             </Link>
//             <button
//               type="button"
//               onClick={(e) => {
//                 e.preventDefault();
//                 onNotifyMe?.(_id);
//               }}
//               disabled={isNotifying}
//               className={`flex items-center justify-center gap-1 flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition ${
//                 isNotified
//                   ? 'bg-orange-500 text-white hover:bg-orange-600 cursor-default'
//                   : 'border-orange-300 text-orange-500  hover:bg-orange-50 disabled:opacity-60 disabled:cursor-not-allowed'
//               }`}
//             >
//               {isNotifying ? '...' : isNotified ? ' Waitlisted' : 'Notify Me'}
//             </button>
//           </div>
//         ) : isDaily ? (
//           // Daily rental → single button to detail page (user picks dates there)
//           <Link
//             href={productHref}
//             className="flex items-center justify-center gap-2 w-full text-center py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition bg-orange-500 text-white hover:bg-orange-600"
//           >
//             {isSellProduct ? 'Buy Now' : 'View'}
//           </Link>
//         ) : (
//           // In stock monthly/sell → View + Cart
//           <div className="flex gap-2">
//             <Link
//               href={productHref}
//               className="flex items-center justify-center gap-1 flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-orange-400 text-orange-500 hover:bg-orange-50 transition"
//             >
//               View
//             </Link>
//             {/* <button
//               type="button"
//               onClick={(e) => {
//                 e.preventDefault();
//                 onAddToCart?.(_id);
//               }}
//               className="flex items-center justify-center gap-1 flex-1 py-2.5 rounded-xl text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition"
//             >
//               {isSellProduct ? 'Buy' : 'Cart'}
//             </button> */}

//             <button
//               type="button"
//               onClick={(e) => {
//                 e.preventDefault();
//                 onAddToCart?.(_id, offer);
//               }}
//               className="flex items-center justify-center gap-1 flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition"
//             >
//               {isSellProduct ? 'Cart' : 'Cart'}
//             </button>
//           </div>
//         )}
//       </div>
//     </Link>
//   );
// };

// export default ProductCard;

'use client';

import Link from 'next/link';
import { Heart, Star, Truck, Package, ShoppingCart } from 'lucide-react';
import {
  getRentalListingAmount,
  getRentalListingSuffix,
  getProductDeliveryEtaLabel,
} from '@/lib/rentalPriceDisplay';

const parsePrice = (raw) => {
  const n = parseInt(String(raw || '').replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
};

const PLATFORM_FEE_PERCENT = 15;
// Admin offers store a % of the platform fee removed; convert that into a
// plain % of product price so it can be used exactly like a vendor offer's
// discountPercent everywhere below.
function resolveDiscountPercent(offer) {
  if (!offer) return 0;
  if (offer.source === 'admin') {
    return Math.min(
      PLATFORM_FEE_PERCENT,
      Number(offer.platformFeeReductionPercent || 0),
    );
  }
  return Number(offer.discountPercent || 0);
}

const ProductCard = ({
  product,
  offer,
  isAuthenticated = false,
  isWishlisted = false,
  toggling = false,
  onToggleWishlist,
  onAddToCart,
  onNotifyMe,
  isNotifying = false,
  isNotified = false,
}) => {
  const { _id, productName, image, price, type, category, subCategory, stock } =
    product;

  // const isServiceProduct = String(type || '').toLowerCase() === 'service';

  // if (isServiceProduct) {
  //   const serviceTitle = productName || product.title || product.name || '';
  //   const serviceImage =
  //     image || product.imageUrl || 'https://placehold.co/600x400';
  //   const rawServicePrice = price ?? product.startingPrice ?? '—';
  //   const servicePrice = (() => {
  //     const s = String(rawServicePrice).trim();
  //     if (s === '—' || s === '') return '—';
  //     return /[₹]|rs\.?/i.test(s) ? s : `₹${s}`;
  //   })();
  //   const serviceRating = Number(
  //     product.averageRating || product.rating || 0,
  //   ).toFixed(1);
  //   const serviceReviews = Number(
  //     product.numReviews || product.reviewCount || 0,
  //   );
  //   const serviceHref = `/service/${_id}`;

  //   const serviceDiscount = Number(offer?.discountPercent || 0);
  //   const hasServiceOffer = !!offer && serviceDiscount > 0;
  //   const serviceBasePrice = Number(
  //     String(servicePrice ?? '').replace(/[^0-9.]/g, ''),
  //   );
  //   const serviceFinalPrice =
  //     hasServiceOffer &&
  //     Number.isFinite(serviceBasePrice) &&
  //     serviceBasePrice > 0
  //       ? Math.max(
  //           0,
  //           Math.round(
  //             serviceBasePrice - (serviceBasePrice * serviceDiscount) / 100,
  //           ),
  //         )
  //       : null;
  //   const serviceTag = offer?.sticker || '';

  //   return (
  //     <Link
  //       href={serviceHref}
  //       className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md hover:scale-[1.03] transition-all duration-300 cursor-pointer block"
  //     >

  //       <div className="relative overflow-hidden">
  //         {serviceTag && (
  //           <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10">
  //             {serviceTag}
  //           </span>
  //         )}
  //         <img
  //           src={serviceImage}
  //           alt={serviceTitle}
  //           className="w-full aspect-square max-h-64 sm:max-h-72 object-cover"
  //         />
  //       </div>
  //       <div className="px-2 sm:px-4 pb-2.5 sm:pb-4">
  //         <div className="flex justify-between items-start mb-1 pt-3">
  //           <h3 className="text-sm sm:text-xl font-bold truncate">
  //             {serviceTitle}
  //           </h3>
  //           {serviceReviews > 0 && (
  //             <div className="flex items-center gap-1 text-white text-[9px] sm:text-[11px] bg-emerald-500 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 mt-1">
  //               <Star size={12} fill="white" />
  //               {serviceRating}
  //             </div>
  //           )}
  //         </div>
  //         <div className="flex items-end justify-between gap-2 mb-3">
  //           <div>
  //             <span className="font-bold text-sm sm:text-xl leading-none">
  //               {hasServiceOffer && serviceFinalPrice != null
  //                 ? `₹${serviceFinalPrice.toLocaleString('en-IN')}`
  //                 : servicePrice}
  //             </span>
  //             {hasServiceOffer && serviceFinalPrice != null ? (
  //               <span className="ml-2 text-gray-400 text-xs line-through">
  //                 {servicePrice}
  //               </span>
  //             ) : null}
  //           </div>
  //           {hasServiceOffer ? (
  //             <span className="inline-flex items-center px-1 sm:px-1.5 py-0.5 rounded-full border text-[7px] sm:text-[9px] font-medium text-orange-500 border-orange-500 bg-orange-50 whitespace-nowrap self-end">
  //               {serviceDiscount}% Off
  //             </span>
  //           ) : null}
  //         </div>
  //         <Link
  //           href={serviceHref}
  //           className="flex items-center justify-center gap-2 w-full text-center py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition bg-orange-500 text-white hover:bg-orange-600"
  //         >
  //           Add Service
  //         </Link>
  //       </div>
  //     </Link>
  //   );
  // }

  const isSellProduct = String(type || '').toLowerCase() === 'sell';

  const productHref = isSellProduct
    ? `/buy-product-details/${_id}`
    : `/rent-product-details/${_id}`;

  // const rawBase =
  //   type === 'Rental' ? getRentalListingAmount(product) : parsePrice(price);
  const rawBase =
    type === 'Rental'
      ? getRentalListingAmount(product)
      : parsePrice(price) ||
        Number(product?.salesConfiguration?.salePrice || 0) ||
        Number(product?.variants?.[0]?.sellPrice || 0);

  // const lowestConfig =
  //   type === 'Rental' && Array.isArray(product.rentalConfigurations)
  //     ? product.rentalConfigurations
  //         .filter(
  //           (cfg) => Number(cfg?.customerRent || cfg?.pricePerDay || 0) > 0,
  //         )
  //         .sort((a, b) => Number(a.months || 0) - Number(b.months || 0))[0]
  //     : null;

  const allConfigsForCard =
    type === 'Rental'
      ? [
          ...(Array.isArray(product.rentalConfigurations)
            ? product.rentalConfigurations
            : []),
          ...(Array.isArray(product.variants)
            ? product.variants.flatMap((v) =>
                Array.isArray(v?.rentalConfigurations)
                  ? v.rentalConfigurations
                  : [],
              )
            : []),
        ]
      : [];

  const lowestConfig = allConfigsForCard
    .filter((cfg) => Number(cfg?.customerRent || cfg?.pricePerDay || 0) > 0)
    .sort((a, b) => {
      // For month-based configs, customerRent is already the per-month
      // rate — don't divide it by months.
      const perUnitA =
        a.periodUnit === 'day' && Number(a.days) > 0
          ? Number(a.customerRent || a.pricePerDay) / Number(a.days)
          : Number(a.customerRent || a.pricePerDay);
      const perUnitB =
        b.periodUnit === 'day' && Number(b.days) > 0
          ? Number(b.customerRent || b.pricePerDay) / Number(b.days)
          : Number(b.customerRent || b.pricePerDay);
      return perUnitA - perUnitB;
    })[0];

  const base = lowestConfig
    ? lowestConfig.periodUnit === 'day' && Number(lowestConfig.days) > 0
      ? Math.round(
          Number(lowestConfig.customerRent || lowestConfig.pricePerDay) /
            Number(lowestConfig.days),
        )
      : // customerRent is already the per-month rate for month-based
        // configs — use it directly instead of dividing by months.
        Math.round(
          Number(lowestConfig.customerRent || lowestConfig.pricePerDay),
        )
    : rawBase;

  const priceSuffix =
    type === 'Rental'
      ? lowestConfig?.periodUnit === 'day'
        ? '/day'
        : '/month'
      : '';

  const discount = resolveDiscountPercent(offer);
  const hasOffer = discount > 0;

  const finalPrice = hasOffer
    ? Math.max(0, Math.round(base - (base * discount) / 100))
    : base;

  const inStock = Number(stock || 0) > 0;

  const deliveryEta = getProductDeliveryEtaLabel(product);

  const status = inStock ? deliveryEta || 'Varies' : 'Out of Stock';

  const rating = Number(product?.averageRating || 0).toFixed(1);

  const totalRatings = Number(product?.numReviews || 0);

  // const tag = offer?.sticker || 'Bestseller';
  const tag = offer?.sticker || '';

  // const isDaily =
  //   Array.isArray(product.rentalConfigurations) &&
  //   product.rentalConfigurations.some((cfg) => cfg?.periodUnit === 'day');
  const isDaily = allConfigsForCard.some((cfg) => cfg?.periodUnit === 'day');
  return (
    <Link
      href={productHref}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md hover:scale-[1.03] transition-all duration-300 cursor-pointer block"
    >
      {/* IMAGE SECTION */}
      {/* <div className="relative p-1 overflow-hidden">
        <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10">
          {tag}
        </span>

        <Link href={productHref}> */}
      <div className="relative p-1 overflow-hidden">
        {product?.featured?.enabled && product?.featured?.status === 'live' ? (
          <span className="absolute top-3 left-3 flex items-center gap-1 bg-[#F97316] text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10 shadow-sm">
            {/* <Star size={10} fill="white" /> */}
            Featured
          </span>
        ) : (
          tag && (
            <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10">
              {tag}
            </span>
          )
        )}
        {/* 
        <Link href={productHref}>
          <img
            src={image || 'https://placehold.co/600x400'}
            alt={productName}
            className="w-full aspect-square object-cover rounded-xl"
          />
        </Link> */}

        <Link href={productHref}>
          <img
            src={image || 'https://placehold.co/600x400'}
            alt={productName}
            className="w-full aspect-square max-h-64 sm:max-h-72 object-cover rounded-xl"
          />
        </Link>

        {/* bottom-left status */}
        <div className="absolute bottom-3 left-3">
          {inStock ? (
            <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
              <Truck size={12} />
              {status}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              <Package size={12} />
              {status}
            </span>
          )}
        </div>

        {/* wishlist */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onToggleWishlist?.(_id);
          }}
          disabled={toggling}
          className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:scale-105 transition disabled:opacity-60"
        >
          <Heart
            size={16}
            className={
              isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-700'
            }
          />
        </button>

        {/* rating badge - bottom right, same row as delivery status */}
        {totalRatings > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white text-[11px] bg-[#F97316] px-2 py-0.5 rounded-full">
            <Star size={12} fill="white" />
            {rating}
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="px-2 sm:px-4 pb-2.5 sm:pb-4">
        {/* title + condition badge */}
        <div className="flex justify-between items-center gap-2 mb-1">
          <h3 className="text-sm sm:text-xl font-bold truncate">
            {productName}
          </h3>
          <span className="inline-block text-[9px] sm:text-[11px] text-gray-500 border border-gray-300 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 whitespace-nowrap shrink-0">
            {product.condition?.trim() ||
              (type === 'Rental' ? 'For Rent' : 'Brand New')}
          </span>
        </div>

        {/* price */}
        <div className="flex items-end justify-between gap-1 sm:gap-2 mb-1.5 sm:mb-3">
          <div>
            {/* <span className="font-bold text-sm sm:text-xl leading-none">
              ₹{finalPrice}
            </span> */}
            <span className="font-bold text-sm sm:text-xl leading-none">
              ₹{finalPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-xs sm:text-base font-bold">
              {priceSuffix}
            </span>
            {/* 
            {hasOffer && (
              <span className="ml-2 text-gray-400 text-xs line-through">
                ₹{base}
              </span>
            )} */}
            {hasOffer && (
              <span className="ml-2 text-gray-400 text-xs line-through">
                ₹{base.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {hasOffer && (
            <span className="inline-flex items-center px-1 sm:px-1.5 py-0.5 rounded-full border text-[7px] sm:text-[9px] font-medium text-orange-500 border-orange-500 bg-orange-50 whitespace-nowrap">
              {discount}% Off
            </span>
          )}
        </div>

        {/* BUTTON */}
        {!inStock ? (
          // Out of stock → Details + Notify Me
          <div className="flex gap-2">
            <Link
              href={productHref}
              className="flex items-center justify-center gap-1 flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-orange-400 text-orange-500 hover:bg-orange-50 transition"
            >
              View
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onNotifyMe?.(_id);
              }}
              disabled={isNotifying}
              className={`flex items-center justify-center gap-1 flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition ${
                isNotified
                  ? 'bg-orange-500 text-white hover:bg-orange-600 cursor-default'
                  : 'border-orange-300 text-orange-500  hover:bg-orange-50 disabled:opacity-60 disabled:cursor-not-allowed'
              }`}
            >
              {isNotifying ? '...' : isNotified ? ' Waitlisted' : 'Notify Me'}
            </button>
          </div>
        ) : isDaily ? (
          // Daily rental → single button to detail page (user picks dates there)
          <Link
            href={productHref}
            className="flex items-center justify-center gap-2 w-full text-center py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition bg-orange-500 text-white hover:bg-orange-600"
          >
            {isSellProduct ? 'Buy Now' : 'View'}
          </Link>
        ) : (
          // In stock monthly/sell → View + Cart
          <div className="flex gap-2">
            <Link
              href={productHref}
              className="flex items-center justify-center gap-1 flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-orange-400 text-orange-500 hover:bg-orange-50 transition"
            >
              View
            </Link>
            {/* <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onAddToCart?.(_id);
              }}
              className="flex items-center justify-center gap-1 flex-1 py-2.5 rounded-xl text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition"
            >
              {isSellProduct ? 'Buy' : 'Cart'}
            </button> */}

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onAddToCart?.(_id, offer);
              }}
              className="flex items-center justify-center gap-1 flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition"
            >
              {isSellProduct ? 'Cart' : 'Cart'}
            </button>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
