// 'use client';

// import React, { useState } from 'react';
// import { ChevronUp, ChevronDown } from 'lucide-react';

// const prettifyKey = (key = '') =>
//   String(key)
//     .replace(/([a-z])([A-Z])/g, '$1 $2')
//     .replace(/[_-]/g, ' ')
//     .replace(/\b\w/g, (c) => c.toUpperCase());

// // const toSpecPairs = (product, selectedVariantIdx = 0) => {
// //   const rows = [];

// //   const variants = Array.isArray(product?.variants) ? product.variants : [];
// //   const selectedVariant = variants[selectedVariantIdx] || variants[0] || null;

// //   // Pull from the selected variant (only if values are non-empty)
// //   if (selectedVariant?.color && String(selectedVariant.color).trim())
// //     rows.push({ label: 'Color', value: selectedVariant.color });
// //   if (selectedVariant?.storage && String(selectedVariant.storage).trim())
// //     rows.push({ label: 'Storage', value: selectedVariant.storage });
// //   if (selectedVariant?.ram && String(selectedVariant.ram).trim())
// //     rows.push({ label: 'RAM', value: selectedVariant.ram });
// //   if (
// //     selectedVariant?.variantName &&
// //     String(selectedVariant.variantName).trim()
// //   )
// //     rows.push({ label: 'Variant', value: selectedVariant.variantName });
// //   if (selectedVariant?.condition && String(selectedVariant.condition).trim())
// //     rows.push({ label: 'Condition', value: selectedVariant.condition });

// //   // Common specs from product.specifications (same for all variants)
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

// const toSpecPairs = (product, selectedVariantIdx = 0) => {
//   const rows = [];
//   const variants = Array.isArray(product?.variants) ? product.variants : [];
//   const selectedVariant = variants[selectedVariantIdx] || null;

//   if (selectedVariant) {
//     const storageVal =
//       (selectedVariant.storage && String(selectedVariant.storage).trim()) ||
//       (selectedVariant.variantName &&
//         String(selectedVariant.variantName).trim());
//     // if (storageVal)
//     //   rows.push({ label: 'Storage / Variant', value: storageVal });

//     // if (selectedVariant.color && String(selectedVariant.color).trim())
//     //   rows.push({ label: 'Color', value: selectedVariant.color });

//     // if (selectedVariant.ram && String(selectedVariant.ram).trim())
//     //   rows.push({ label: 'RAM', value: selectedVariant.ram });

//     // if (selectedVariant.condition && String(selectedVariant.condition).trim())
//     //   rows.push({ label: 'Condition', value: selectedVariant.condition });

//     if (Array.isArray(selectedVariant.variantSpecs)) {
//       selectedVariant.variantSpecs.forEach(({ label, value }) => {
//         const l = String(label || '').trim();
//         const v = String(value ?? '').trim();
//         if (l && v) rows.push({ label: prettifyKey(l), value: v });
//       });
//     }
//   }

//   // ── KEY FIX: skip product.specifications completely when any variant
//   // has variantSpecs — it contains polluted/mixed variant data ──────────
//   const hasVariantSpecs = variants.some(
//     (v) => Array.isArray(v.variantSpecs) && v.variantSpecs.length > 0,
//   );

//   if (!hasVariantSpecs) {
//     const VARIANT_KEYS = new Set([
//       'strorage',
//       'storage',
//       'price',
//       'pirce',
//       'prce',
//       'colour',
//       'color',
//       'ram',
//       'variant',
//       'variantname',
//       'size',
//       'condition',
//     ]);
//     const specObj = product?.specifications || {};
//     Object.entries(specObj).forEach(([key, value]) => {
//       if (value == null || String(value).trim() === '') return;
//       if (VARIANT_KEYS.has(key.toLowerCase().trim())) return;
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

// const AccordionBox = ({ title, children, defaultOpen = false }) => {
//   const [open, setOpen] = useState(defaultOpen);

//   return (
//     <div>
//       <button
//         onClick={() => setOpen(!open)}
//         className="w-full flex items-center justify-between px-5 py-4 text-left"
//       >
//         <span className="text-base font-bold text-black">{title}</span>

//         {open ? (
//           <ChevronUp className="w-5 h-5 text-gray-400" />
//         ) : (
//           <ChevronDown className="w-5 h-5 text-gray-400" />
//         )}
//       </button>

//       {open && <div className="px-5 pb-6">{children}</div>}
//     </div>
//   );
// };

// const RentPrdctDesc = ({ product, selectedVariantIdx = 0 }) => {
//   const pairs = toSpecPairs(product, selectedVariantIdx);

//   const variants = Array.isArray(product?.variants) ? product.variants : [];
//   const selectedVariant = variants[selectedVariantIdx] || null;

//   // Use selected variant's name as accordion title if available
//   // const variantLabel = selectedVariant?.variantName
//   //   ? ` — ${selectedVariant.variantName}`
//   //   : '';

//   // const productName = (product?.productName || 'Product') + variantLabel;
//   const variantLabel =
//     selectedVariant?.variantName &&
//     String(selectedVariant.variantName).trim() &&
//     String(selectedVariant.variantName).trim().toLowerCase() !==
//       String(product?.productName || '')
//         .trim()
//         .toLowerCase()
//       ? ` — ${selectedVariant.variantName}`
//       : '';

//   const productName = (product?.productName || 'Product') + variantLabel;

//   // description is common for all variants
//   const description =
//     product?.description ||
//     product?.shortDescription ||
//     'Detailed product description will be available soon for this listing.';

//   const rentalTerms = {
//     cancellation:
//       'Free cancellation before delivery. If cancelled after dispatch, a 10% processing fee may be deducted.',

//     damage:
//       'Normal wear and tear is covered. Major accidental or intentional damage may result in repair charges.',

//     returns:
//       'Return pickup will be arranged once your rental term ends. Please keep the item ready for inspection.',
//   };

//   return (
//     <section className="w-full bg-white py-6 sm:py-10 px-3 sm:px-4">
//       <div className="w-full mx-auto space-y-8">
//         {/* Product Description */}
//         <div>
//           <h2 className="text-xl font-bold text-black mb-4">
//             Product Description
//           </h2>

//           <div className="border border-gray-200 bg-[#F8F9FA] rounded-xl overflow-hidden">
//             <AccordionBox title={productName} defaultOpen={true}>
//               <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">
//                 {description}
//               </p>
//             </AccordionBox>
//           </div>
//         </div>
//         {/* Product Specifications */}
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
//                     key={idx}
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
//         </div>

//         {/* Rental Terms */}
//         <div>
//           <h2 className="text-xl font-bold text-black mb-4">
//             Rental Terms & Policies
//           </h2>

//           <div className="border border-gray-200 bg-[#F8F9FA] rounded-xl overflow-hidden">
//             <AccordionBox title="Cancellation Policy" defaultOpen={true}>
//               <p className="text-sm leading-relaxed text-gray-600">
//                 {rentalTerms.cancellation}
//               </p>
//             </AccordionBox>

//             <div className="border-t border-gray-200">
//               <AccordionBox title="Damage Policy">
//                 <p className="text-sm leading-relaxed text-gray-600">
//                   {rentalTerms.damage}
//                 </p>
//               </AccordionBox>
//             </div>

//             <div className="border-t border-gray-200">
//               <AccordionBox title="Return Process">
//                 <p className="text-sm leading-relaxed text-gray-600">
//                   {rentalTerms.returns}
//                 </p>
//               </AccordionBox>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default RentPrdctDesc;

'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const prettifyKey = (key = '') =>
  String(key)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

// const toSpecPairs = (product, selectedVariantIdx = 0) => {
//   const rows = [];

//   const variants = Array.isArray(product?.variants) ? product.variants : [];
//   const selectedVariant = variants[selectedVariantIdx] || variants[0] || null;

//   // Pull from the selected variant (only if values are non-empty)
//   if (selectedVariant?.color && String(selectedVariant.color).trim())
//     rows.push({ label: 'Color', value: selectedVariant.color });
//   if (selectedVariant?.storage && String(selectedVariant.storage).trim())
//     rows.push({ label: 'Storage', value: selectedVariant.storage });
//   if (selectedVariant?.ram && String(selectedVariant.ram).trim())
//     rows.push({ label: 'RAM', value: selectedVariant.ram });
//   if (
//     selectedVariant?.variantName &&
//     String(selectedVariant.variantName).trim()
//   )
//     rows.push({ label: 'Variant', value: selectedVariant.variantName });
//   if (selectedVariant?.condition && String(selectedVariant.condition).trim())
//     rows.push({ label: 'Condition', value: selectedVariant.condition });

//   // Common specs from product.specifications (same for all variants)
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

const toSpecPairs = (product, selectedVariantIdx = 0) => {
  const rows = [];
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const selectedVariant = variants[selectedVariantIdx] || null;

  if (selectedVariant) {
    const storageVal =
      (selectedVariant.storage && String(selectedVariant.storage).trim()) ||
      (selectedVariant.variantName &&
        String(selectedVariant.variantName).trim());
    // if (storageVal)
    //   rows.push({ label: 'Storage / Variant', value: storageVal });

    // if (selectedVariant.color && String(selectedVariant.color).trim())
    //   rows.push({ label: 'Color', value: selectedVariant.color });

    // if (selectedVariant.ram && String(selectedVariant.ram).trim())
    //   rows.push({ label: 'RAM', value: selectedVariant.ram });

    // if (selectedVariant.condition && String(selectedVariant.condition).trim())
    //   rows.push({ label: 'Condition', value: selectedVariant.condition });

    if (Array.isArray(selectedVariant.variantSpecs)) {
      selectedVariant.variantSpecs.forEach(({ label, value }) => {
        const l = String(label || '').trim();
        const v = String(value ?? '').trim();
        if (l && v) rows.push({ label: prettifyKey(l), value: v });
      });
    }
  }

  // ── KEY FIX: skip product.specifications completely when any variant
  // has variantSpecs — it contains polluted/mixed variant data ──────────
  const hasVariantSpecs = variants.some(
    (v) => Array.isArray(v.variantSpecs) && v.variantSpecs.length > 0,
  );

  if (!hasVariantSpecs) {
    const VARIANT_KEYS = new Set([
      'strorage',
      'storage',
      'price',
      'pirce',
      'prce',
      'colour',
      'color',
      'ram',
      'variant',
      'variantname',
      'size',
      'condition',
    ]);
    const specObj = product?.specifications || {};
    Object.entries(specObj).forEach(([key, value]) => {
      if (value == null || String(value).trim() === '') return;
      if (VARIANT_KEYS.has(key.toLowerCase().trim())) return;
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

const RentPrdctDesc = ({ product, selectedVariantIdx = 0 }) => {
  const pairs = toSpecPairs(product, selectedVariantIdx);

  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const selectedVariant = variants[selectedVariantIdx] || null;

  // Use selected variant's name as accordion title if available
  // const variantLabel = selectedVariant?.variantName
  //   ? ` — ${selectedVariant.variantName}`
  //   : '';

  // const productName = (product?.productName || 'Product') + variantLabel;
  const variantLabel =
    selectedVariant?.variantName &&
    String(selectedVariant.variantName).trim() &&
    String(selectedVariant.variantName).trim().toLowerCase() !==
      String(product?.productName || '')
        .trim()
        .toLowerCase()
      ? ` — ${selectedVariant.variantName}`
      : '';

  const productName = (product?.productName || 'Product') + variantLabel;

  // description is common for all variants
  const description =
    product?.description ||
    product?.shortDescription ||
    'Detailed product description will be available soon for this listing.';

  const rentalTerms = {
    cancellation:
      'Free cancellation before delivery. If cancelled after dispatch, a 10% processing fee may be deducted.',

    damage:
      'Normal wear and tear is covered. Major accidental or intentional damage may result in repair charges.',

    returns:
      'Return pickup will be arranged once your rental term ends. Please keep the item ready for inspection.',
  };

  return (
    <section className="w-full bg-white pt-3 md:pt-6 pb-4 md:pb-6 px-3 sm:px-4">
      <div className="w-full mx-auto space-y-8">
        {/* Product Description */}
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
              mobileChildren={
                <TruncatedText text={description} wordLimit={43} />
              }
            >
              <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">
                {description}
              </p>
            </AccordionBox>
          </div>
        </div>
        {/* Product Specifications */}
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
                    key={idx}
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
        </div>

        {/* Rental Terms */}
        <div>
          <h1 className="text-lg sm:text-2xl md:text-3xl mb-2 md:mb-3">
            <span className="font-semibold text-black">Rental Terms & </span>
            <span className="font-bold text-[#F97316]">Policies</span>
          </h1>

          <div className="border border-gray-200 bg-[#F8F9FA] rounded-xl overflow-hidden">
            <AccordionBox title="Cancellation Policy" defaultOpen={true}>
              <p className="text-sm leading-relaxed text-gray-600">
                {rentalTerms.cancellation}
              </p>
            </AccordionBox>

            <div className="border-t border-gray-200">
              <AccordionBox title="Damage Policy">
                <p className="text-sm leading-relaxed text-gray-600">
                  {rentalTerms.damage}
                </p>
              </AccordionBox>
            </div>

            <div className="border-t border-gray-200">
              <AccordionBox title="Return Process">
                <p className="text-sm leading-relaxed text-gray-600">
                  {rentalTerms.returns}
                </p>
              </AccordionBox>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RentPrdctDesc;
