// 'use client';

// import React, { useState } from 'react';
// import { ChevronUp, ChevronDown } from 'lucide-react';

// const prettifyKey = (key = '') =>
//   String(key)
//     .replace(/([a-z])([A-Z])/g, '$1 $2')
//     .replace(/[_-]/g, ' ')
//     .replace(/\b\w/g, (c) => c.toUpperCase());

// // const toSpecPairs = (product) => {
// //   const rows = [];
// //   const v0 =
// //     Array.isArray(product?.variants) && product.variants.length
// //       ? product.variants[0]
// //       : null;

// //   if (v0?.color) rows.push({ label: 'Color', value: v0.color });
// //   if (v0?.storage) rows.push({ label: 'Storage', value: v0.storage });
// //   if (v0?.ram) rows.push({ label: 'RAM', value: v0.ram });

// //   const specObj = product?.specifications || {};
// //   Object.entries(specObj).forEach(([key, value]) => {
// //     if (value == null || String(value).trim() === '') return;
// //     rows.push({ label: prettifyKey(key), value: String(value) });
// //   });

// //   if (!rows.length) {
// //     rows.push({ label: 'Model', value: product?.productName || '—' });
// //   }

// //   const pairs = [];
// //   for (let i = 0; i < rows.length; i += 2) {
// //     pairs.push([rows[i], rows[i + 1] || null]);
// //   }
// //   return pairs;
// // };

// // const toSpecPairs = (product, selectedVariantIdx = 0) => {
// //   const rows = [];
// //   const variants = Array.isArray(product?.variants) ? product.variants : [];
// //   const selectedVariant = variants[selectedVariantIdx] || null;

// //   if (selectedVariant && Array.isArray(selectedVariant.variantSpecs)) {
// //     selectedVariant.variantSpecs.forEach(({ label, value }) => {
// //       const l = String(label || '').trim();
// //       const v = String(value ?? '').trim();
// //       if (l && v) rows.push({ label: prettifyKey(l), value: v });
// //     });
// //   }

// //   const hasVariantSpecs = variants.some(
// //     (v) => Array.isArray(v.variantSpecs) && v.variantSpecs.length > 0,
// //   );

// //   if (!hasVariantSpecs) {
// //     const specObj = product?.specifications || {};
// //     Object.entries(specObj).forEach(([key, value]) => {
// //       if (value == null || String(value).trim() === '') return;
// //       rows.push({ label: prettifyKey(key), value: String(value) });
// //     });
// //   }

// //   if (!rows.length) {
// //     rows.push({ label: 'Model', value: product?.productName || '—' });
// //   }

// //   const pairs = [];
// //   for (let i = 0; i < rows.length; i += 2) {
// //     pairs.push([rows[i], rows[i + 1] || null]);
// //   }
// //   return pairs;
// // };

// const toSpecPairs = (product, selectedVariantIdx = 0) => {
//   const rows = [];
//   const variants = Array.isArray(product?.variants) ? product.variants : [];
//   const selectedVariant = variants[selectedVariantIdx] || null;

//   // 1. variantSpecs label/value rows (vendor custom listings)
//   if (
//     selectedVariant &&
//     Array.isArray(selectedVariant.variantSpecs) &&
//     selectedVariant.variantSpecs.length > 0
//   ) {
//     selectedVariant.variantSpecs.forEach(({ label, value }) => {
//       const l = String(label || '').trim();
//       const v = String(value ?? '').trim();
//       if (l && v) rows.push({ label: prettifyKey(l), value: v });
//     });
//   }

//   // 2. Direct variant fields — color/storage/ram stored on the variant object
//   //    (automatic/template-based products use these instead of variantSpecs)
//   if (selectedVariant) {
//     if (String(selectedVariant.color || '').trim())
//       rows.push({
//         label: 'Color',
//         value: String(selectedVariant.color).trim(),
//       });
//     if (String(selectedVariant.storage || '').trim())
//       rows.push({
//         label: 'Storage',
//         value: String(selectedVariant.storage).trim(),
//       });
//     if (String(selectedVariant.ram || '').trim())
//       rows.push({ label: 'RAM', value: String(selectedVariant.ram).trim() });
//   }

//   // 3. Top-level specifications — only if nothing variant-specific was found
//   if (rows.length === 0) {
//     const specObj = product?.specifications || {};
//     Object.entries(specObj).forEach(([key, value]) => {
//       if (value == null || String(value).trim() === '') return;
//       rows.push({ label: prettifyKey(key), value: String(value) });
//     });
//   }

//   if (!rows.length) {
//     rows.push({ label: 'Model', value: product?.productName || '—' });
//   }

//   const pairs = [];
//   for (let i = 0; i < rows.length; i += 2) {
//     pairs.push([rows[i], rows[i + 1] || null]);
//   }
//   return pairs;
// };

// const BuyPrdctDesc = ({ product, selectedVariantIdx = 0 }) => {
//   const [descOpen, setDescOpen] = useState(true);
//   // const pairs = toSpecPairs(product);
//   const pairs = toSpecPairs(product, selectedVariantIdx);
//   const seller = product?.seller || {};

//   const productName = product?.productName || 'Product';
//   const description =
//     product?.description ||
//     'Detailed product description will be available soon for this listing.';

//   return (
//     <section className="w-full bg-white py-6 sm:py-10 px-3 sm:px-4">
//       <div className="w-full mx-auto space-y-8">
//         {/* ── Product Description ── */}
//         <div>
//           <h2 className="text-xl font-bold text-black mb-4">
//             Product Description
//           </h2>
//           <div className="border border-gray-200 bg-[#F8F9FA] rounded-xl overflow-hidden">
//             {/* Accordion header */}
//             <button
//               onClick={() => setDescOpen((o) => !o)}
//               className="w-full flex items-center justify-between px-5 py-4 text-left"
//             >
//               <span className="text-base font-bold text-black">
//                 {productName}
//               </span>
//               {descOpen ? (
//                 <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
//               ) : (
//                 <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
//               )}
//             </button>

//             {/* Accordion body */}
//             {descOpen && (
//               <div className="px-5 pb-6 space-y-3">
//                 <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">
//                   {description}
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* ── Product Specifications ── */}
//         <div>
//           <h2 className="text-xl font-bold text-black mb-4">
//             Product Specifications
//           </h2>
//           <div className="border border-gray-200 bg-[#F8F9FA] rounded-xl overflow-hidden">
//             <table className="w-full table-fixed border-collapse text-sm">
//               <colgroup>
//                 <col className="w-1/4" />
//                 <col className="w-1/4" />
//                 <col className="w-1/4" />
//                 <col className="w-1/4" />
//               </colgroup>
//               <tbody>
//                 {pairs.map(([left, right], idx) => (
//                   <tr
//                     key={`row-${idx}`}
//                     className={
//                       idx < pairs.length - 1 ? 'border-b border-gray-300' : ''
//                     }
//                   >
//                     <td className="px-5 py-4 font-bold text-[#364153]">
//                       {left.label}
//                     </td>
//                     <td className="px-5 py-4 font-medium text-black text-right border-r border-gray-300">
//                       {left.value}
//                     </td>
//                     <td className="px-5 py-4 font-bold text-[#364153]">
//                       {right?.label || ''}
//                     </td>
//                     <td className="px-5 py-4 font-medium text-black text-right">
//                       {right?.value || ''}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Seller card */}
//           {seller?.name && (
//             <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3.5 mt-3">
//               <img
//                 src={seller.avatar || '/placeholder-avatar.png'}
//                 alt={seller.name}
//                 className="w-11 h-11 rounded-full object-cover shrink-0"
//               />
//               <div>
//                 <div className="flex items-center gap-1.5">
//                   <span className="text-sm font-semibold text-gray-900">
//                     {seller.name}
//                   </span>
//                   {seller.verified && (
//                     <span className="text-blue-500 text-sm">✓</span>
//                   )}
//                 </div>
//                 {seller.location && (
//                   <p className="text-xs text-gray-500 mt-0.5">
//                     📍 {seller.location}
//                   </p>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default BuyPrdctDesc;

'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const prettifyKey = (key = '') =>
  String(key)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

// const toSpecPairs = (product) => {
//   const rows = [];
//   const v0 =
//     Array.isArray(product?.variants) && product.variants.length
//       ? product.variants[0]
//       : null;

//   if (v0?.color) rows.push({ label: 'Color', value: v0.color });
//   if (v0?.storage) rows.push({ label: 'Storage', value: v0.storage });
//   if (v0?.ram) rows.push({ label: 'RAM', value: v0.ram });

//   const specObj = product?.specifications || {};
//   Object.entries(specObj).forEach(([key, value]) => {
//     if (value == null || String(value).trim() === '') return;
//     rows.push({ label: prettifyKey(key), value: String(value) });
//   });

//   if (!rows.length) {
//     rows.push({ label: 'Model', value: product?.productName || '—' });
//   }

//   const pairs = [];
//   for (let i = 0; i < rows.length; i += 2) {
//     pairs.push([rows[i], rows[i + 1] || null]);
//   }
//   return pairs;
// };

// const toSpecPairs = (product, selectedVariantIdx = 0) => {
//   const rows = [];
//   const variants = Array.isArray(product?.variants) ? product.variants : [];
//   const selectedVariant = variants[selectedVariantIdx] || null;

//   if (selectedVariant && Array.isArray(selectedVariant.variantSpecs)) {
//     selectedVariant.variantSpecs.forEach(({ label, value }) => {
//       const l = String(label || '').trim();
//       const v = String(value ?? '').trim();
//       if (l && v) rows.push({ label: prettifyKey(l), value: v });
//     });
//   }

//   const hasVariantSpecs = variants.some(
//     (v) => Array.isArray(v.variantSpecs) && v.variantSpecs.length > 0,
//   );

//   if (!hasVariantSpecs) {
//     const specObj = product?.specifications || {};
//     Object.entries(specObj).forEach(([key, value]) => {
//       if (value == null || String(value).trim() === '') return;
//       rows.push({ label: prettifyKey(key), value: String(value) });
//     });
//   }

//   if (!rows.length) {
//     rows.push({ label: 'Model', value: product?.productName || '—' });
//   }

//   const pairs = [];
//   for (let i = 0; i < rows.length; i += 2) {
//     pairs.push([rows[i], rows[i + 1] || null]);
//   }
//   return pairs;
// };

const toSpecPairs = (product, selectedVariantIdx = 0) => {
  const rows = [];
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const selectedVariant = variants[selectedVariantIdx] || null;

  // 1. variantSpecs label/value rows (vendor custom listings)
  if (
    selectedVariant &&
    Array.isArray(selectedVariant.variantSpecs) &&
    selectedVariant.variantSpecs.length > 0
  ) {
    selectedVariant.variantSpecs.forEach(({ label, value }) => {
      const l = String(label || '').trim();
      const v = String(value ?? '').trim();
      if (l && v) rows.push({ label: prettifyKey(l), value: v });
    });
  }

  // 2. Direct variant fields — color/storage/ram stored on the variant object
  //    (automatic/template-based products use these instead of variantSpecs)
  if (selectedVariant) {
    if (String(selectedVariant.color || '').trim())
      rows.push({
        label: 'Color',
        value: String(selectedVariant.color).trim(),
      });
    if (String(selectedVariant.storage || '').trim())
      rows.push({
        label: 'Storage',
        value: String(selectedVariant.storage).trim(),
      });
    if (String(selectedVariant.ram || '').trim())
      rows.push({ label: 'RAM', value: String(selectedVariant.ram).trim() });
  }

  // 3. Top-level specifications — only if nothing variant-specific was found
  if (rows.length === 0) {
    const specObj = product?.specifications || {};
    Object.entries(specObj).forEach(([key, value]) => {
      if (value == null || String(value).trim() === '') return;
      rows.push({ label: prettifyKey(key), value: String(value) });
    });
  }

  if (!rows.length) {
    rows.push({ label: 'Model', value: product?.productName || '—' });
  }

  const pairs = [];
  for (let i = 0; i < rows.length; i += 2) {
    pairs.push([rows[i], rows[i + 1] || null]);
  }
  return pairs;
};

const AccordionBox = ({
  title,
  children,
  mobileChildren,
  defaultOpen = false,
  staticOnMobile = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  if (staticOnMobile) {
    return (
      <div>
        {/* Mobile: always visible, no toggle */}
        <div className="sm:hidden">
          <div className="w-full flex items-center justify-between px-5 pt-4 pb-0 text-left">
            <span className="text-base font-bold text-black">{title}</span>
          </div>
          <div className="px-5 pt-1 pb-6">{mobileChildren ?? children}</div>
        </div>

        {/* sm and up: normal accordion with chevron toggle */}
        <div className="hidden sm:block">
          <button
            onClick={() => setOpen(!open)}
            className="w-full flex items-center justify-between px-5 py-4 text-left"
          >
            <span className="text-base font-bold text-black">{title}</span>

            {open ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {open && <div className="px-5 pb-6">{children}</div>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-base font-bold text-black">{title}</span>

        {open ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {open && <div className="px-5 pb-6">{children}</div>}
    </div>
  );
};

const TruncatedText = ({ text = '', charLimit = 261 }) => {
  const [expanded, setExpanded] = useState(false);

  const fullText = String(text);
  const isLong = fullText.length > charLimit;
  const preview = fullText.slice(0, charLimit);

  return (
    <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">
      {expanded || !isLong ? fullText : `${preview}  `}
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm font-semibold text-[#F97316] whitespace-nowrap"
        >
          {expanded ? ' See less' : 'See more'}
        </button>
      )}
    </p>
  );
};

const BuyPrdctDesc = ({ product, selectedVariantIdx = 0 }) => {
  const [descOpen, setDescOpen] = useState(true);
  // const pairs = toSpecPairs(product);
  const pairs = toSpecPairs(product, selectedVariantIdx);
  const seller = product?.seller || {};

  const productName = product?.productName || 'Product';
  const description =
    product?.description ||
    'Detailed product description will be available soon for this listing.';

  return (
    // <section className="w-full bg-white py-6 sm:py-10 px-3 sm:px-4">
    <section className="w-full bg-white pt-3 md:pt-6 pb-4 md:pb-6 px-3 sm:px-4">
      <div className="w-full mx-auto space-y-8">
        {/* ── Product Description ── */}
        <div>
          <h1 className="text-lg sm:text-2xl md:text-3xl mb-2 md:mb-3">
            <span className="font-semibold text-black">Product </span>
            <span className="font-bold text-[#F97316]">Description</span>
          </h1>
          <div className="border border-gray-200 bg-[#F8F9FA] rounded-xl overflow-hidden">
            <AccordionBox
              title={productName}
              defaultOpen={true}
              staticOnMobile={true}
              mobileChildren={<TruncatedText text={description} />}
            >
              <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">
                {description}
              </p>
            </AccordionBox>
          </div>
        </div>

        {/* ── Product Specifications ── */}
        <div>
          <h1 className="text-lg sm:text-2xl md:text-3xl mb-2 md:mb-3">
            <span className="font-semibold text-black">Product </span>
            <span className="font-bold text-[#F97316]">Specifications</span>
          </h1>
          <div className="border border-gray-200 bg-[#F8F9FA] rounded-xl overflow-hidden">
            <table className="w-full table-fixed border-collapse text-sm">
              <colgroup>
                <col className="w-1/4" />
                <col className="w-1/4" />
                <col className="w-1/4" />
                <col className="w-1/4" />
              </colgroup>
              <tbody>
                {pairs.map(([left, right], idx) => (
                  <tr
                    key={`row-${idx}`}
                    className={
                      idx < pairs.length - 1 ? 'border-b border-gray-300' : ''
                    }
                  >
                    <td className="px-5 py-4 font-bold text-[#364153]">
                      {left.label}
                    </td>
                    <td className="px-5 py-4 font-medium text-black text-right border-r border-gray-300">
                      {left.value}
                    </td>
                    <td className="px-5 py-4 font-bold text-[#364153]">
                      {right?.label || ''}
                    </td>
                    <td className="px-5 py-4 font-medium text-black text-right">
                      {right?.value || ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Seller card */}
          {seller?.name && (
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3.5 mt-3">
              <img
                src={seller.avatar || '/placeholder-avatar.png'}
                alt={seller.name}
                className="w-11 h-11 rounded-full object-cover shrink-0"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-gray-900">
                    {seller.name}
                  </span>
                  {seller.verified && (
                    <span className="text-blue-500 text-sm">✓</span>
                  )}
                </div>
                {seller.location && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    📍 {seller.location}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BuyPrdctDesc;
