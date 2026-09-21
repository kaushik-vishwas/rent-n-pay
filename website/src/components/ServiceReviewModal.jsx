// 'use client';

// import { useState, useEffect } from 'react';
// import { Star, X, CheckCircle2 } from 'lucide-react';
// import { apiCreateServiceReview } from '@/lib/api';

// const TAGS = [
//   'Punctual',
//   'Skilled',
//   'Polite',
//   'Cleaned Up',
//   'Professional',
//   'Explained Well',
// ];

// function StarPicker({ value, onChange }) {
//   const [hovered, setHovered] = useState(0);
//   const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent!'];
//   const display = hovered || value;

//   return (
//     <div>
//       <div className="flex gap-1 justify-center mt-2">
//         {[1, 2, 3, 4, 5].map((i) => (
//           <button
//             key={i}
//             type="button"
//             onMouseEnter={() => setHovered(i)}
//             onMouseLeave={() => setHovered(0)}
//             onClick={() => onChange(i)}
//           >
//             <Star
//               stroke="none"
//               className={`w-9 h-9 ${
//                 i <= display
//                   ? 'fill-[#FFB900] text-[#FFB900]'
//                   : 'fill-gray-200 text-gray-200'
//               }`}
//             />
//           </button>
//         ))}
//       </div>

//       {display > 0 && (
//         <p className="text-center text-sm font-semibold text-black mt-1">
//           {labels[display]}
//         </p>
//       )}
//     </div>
//   );
// }

// export default function ServiceReviewModal({
//   open,
//   serviceProductId,
//   bookingId,
//   serviceName,
//   image,
//   vendorName,
//   existingReview,
//   onClose,
//   onSuccess,
// }) {
//   const [rating, setRating] = useState(0);
//   const [selectedTags, setSelectedTags] = useState([]);
//   const [comment, setComment] = useState('');
//   const [submitting, setSubmitting] = useState(false);
//   const [submitted, setSubmitted] = useState(false);
//   const [error, setError] = useState('');

//   //  UNIFIED IMAGE STATE (FIXED BUG)
//   const [imageList, setImageList] = useState([]);

//   useEffect(() => {
//     if (open) {
//       setRating(existingReview?.rating || 0);
//       setComment(existingReview?.comment || '');
//       setSelectedTags(existingReview?.tags || []);
//       setSubmitted(false);
//       setError('');

//       // IMPORTANT: preserve OLD images properly
//       setImageList(
//         (existingReview?.images || []).map((url) => ({
//           kind: 'old',
//           url,
//         })),
//       );
//     }
//   }, [open, existingReview]);

//   const toggleTag = (tag) => {
//     setSelectedTags((prev) =>
//       prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
//     );
//   };

//   //  ADD IMAGES FIXED (no overwrite bug)
//   const handleImageChange = (e) => {
//     const files = Array.from(e.target.files || []);
//     const remaining = 5 - imageList.length;

//     if (remaining <= 0) return;

//     const toAdd = files.slice(0, remaining).map((file) => ({
//       kind: 'new',
//       file,
//       previewUrl: URL.createObjectURL(file),
//     }));

//     setImageList((prev) => [...prev, ...toAdd]);
//     e.target.value = '';
//   };

//   //  REMOVE IMAGE FIXED
//   const removeImage = (index) => {
//     setImageList((prev) => {
//       const item = prev[index];

//       if (item.kind === 'new') {
//         URL.revokeObjectURL(item.previewUrl);
//       }

//       return prev.filter((_, i) => i !== index);
//     });
//   };

//   const handleSubmit = async () => {
//     if (!rating) {
//       setError('Please select a rating.');
//       return;
//     }

//     setSubmitting(true);
//     setError('');

//     try {
//       const formData = new FormData();
//       formData.append('rating', rating);
//       formData.append('comment', comment);
//       formData.append('tags', JSON.stringify(selectedTags));
//       // formData.append('bookingId', bookingId);

//       //  keep old images
//       const keepImages = imageList
//         .filter((i) => i.kind === 'old')
//         .map((i) => i.url);

//       formData.append('keepImages', JSON.stringify(keepImages));

//       //  new images only
//       imageList
//         .filter((i) => i.kind === 'new')
//         .forEach((i) => formData.append('images', i.file));

//       // console.log('serviceProductId:', serviceProductId);
//       // console.log('rating:', rating);
//       // console.log('comment:', comment);
//       // console.log('selectedTags:', selectedTags);
//       // console.log('imageList:', imageList);
//       // console.log('serviceProductId:', serviceProductId);

//       await apiCreateServiceReview(serviceProductId, formData);

//       setSubmitted(true);
//       onSuccess?.();
//     } catch (err) {
//       setError(err?.response?.data?.message || 'Failed to submit review.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (!open) return null;

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
//       onClick={onClose}
//     >
//       <div
//         className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/*  SUCCESS SCREEN */}
//         {submitted ? (
//           <div className="px-5 py-10 text-center">
//             <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
//             <p className="text-lg font-bold text-gray-900">
//               Thank you for your review!
//             </p>
//             <p className="text-sm text-gray-500 mt-1">
//               Your feedback helps improve our services.
//             </p>

//             {/* <button
//               onClick={onClose}
//               className="mt-6 px-6 py-2.5 bg-[#FF6F00] text-white rounded-xl"
//             >
//               Close
//             </button> */}
//           </div>
//         ) : (
//           <>
//             {/* HEADER */}
//             <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
//               <div>
//                 <h2 className="text-lg font-bold text-gray-900 mt-0.5">
//                   How was your service?
//                 </h2>
//                 <p className="text-sm text-[#008236] font-semibold flex items-center gap-1">
//                   <CheckCircle2 className="w-3.5 h-3.5" />
//                   Job #{String(bookingId).slice(-4).toUpperCase()} completed
//                   successfully!
//                 </p>
//               </div>

//               <button onClick={onClose}>
//                 <X className="w-5 h-5 text-gray-500" />
//               </button>
//             </div>

//             {/* FORM */}
//             <div className="px-5 py-4 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-hide">
//               {/* Vendor */}
//               <div className="flex items-center gap-3">
//                 {/* <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
//                   {image ? (
//                     <img src={image} className="w-full h-full object-cover" />
//                   ) : (
//                     <div className="flex items-center justify-center h-full text-gray-400 font-bold">
//                       {vendorName?.charAt(0)}
//                     </div>
//                   )}
//                 </div> */}
//                 <div className="w-10 h-10 rounded-full bg-[#FF6F00] flex items-center justify-center text-white font-bold text-lg uppercase">
//                   {vendorName?.trim()?.charAt(0) || '?'}
//                 </div>

//                 <div>
//                   <p className="font-semibold">Rate Technician {vendorName}</p>
//                   <p className="text-xs text-gray-500">
//                     How did {vendorName} perform?
//                   </p>
//                 </div>
//               </div>

//               {/* Stars */}
//               <StarPicker value={rating} onChange={setRating} />

//               {/* Tags */}
//               {rating > 0 && (
//                 <div>
//                   <p className="text-sm font-medium text-black mb-2">
//                     What did you like?{' '}
//                     <span className="text-gray-400">(Optional)</span>
//                   </p>

//                   <div className="flex flex-wrap gap-2">
//                     {TAGS.map((tag) => (
//                       <button
//                         key={tag}
//                         type="button"
//                         onClick={() => toggleTag(tag)}
//                         className={`px-3 py-1.5 rounded-full text-sm border ${
//                           selectedTags.includes(tag)
//                             ? 'bg-[#FF6F00] text-white border-[#FF6F00]'
//                             : 'border-gray-300'
//                         }`}
//                       >
//                         {tag}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* COMMENT */}
//               <div>
//                 <p className="text-sm font-medium text-black mb-2">
//                   Any additional feedback?{' '}
//                   <span className="text-gray-400">(Optional)</span>
//                 </p>

//                 <textarea
//                   value={comment}
//                   onChange={(e) => setComment(e.target.value)}
//                   rows={3}
//                   placeholder="Share your experience to help us improve our services..."
//                   className="w-full border rounded-xl px-3 py-2 placeholder:text-sm"
//                 />
//               </div>

//               {/* ERROR */}
//               {error && <p className="text-sm text-red-500">{error}</p>}

//               {/*  IMAGE SECTION FIXED */}
//               <div>
//                 <p className="text-sm font-medium text-black mb-2">
//                   Photos? <span className="text-gray-400">(Optional)</span>
//                 </p>

//                 <div className="flex flex-wrap gap-2">
//                   {imageList.map((item, i) => (
//                     <div key={i} className="relative w-16 h-16">
//                       <img
//                         src={item.kind === 'old' ? item.url : item.previewUrl}
//                         className="w-full h-full object-cover rounded-lg"
//                       />

//                       <button
//                         onClick={() => removeImage(i)}
//                         className="absolute -top-1 -right-1 bg-black/60 text-white text-xs w-5 h-5 rounded-full"
//                       >
//                         ✕
//                       </button>
//                     </div>
//                   ))}
//                 </div>

//                 {imageList.length < 5 && (
//                   <label className="inline-block mt-2 px-3 py-2 border rounded-lg cursor-pointer">
//                     Add Images
//                     <input
//                       type="file"
//                       multiple
//                       accept="image/*"
//                       hidden
//                       onChange={handleImageChange}
//                     />
//                   </label>
//                 )}
//               </div>

//               {/* SUBMIT */}
//               <button
//                 disabled={!rating || submitting}
//                 onClick={handleSubmit}
//                 className="w-full py-3 bg-[#FF6F00] text-white rounded-xl flex items-center justify-center gap-2"
//               >
//                 <CheckCircle2 className="w-4 h-4" />

//                 {submitting ? 'Submitting...' : 'Submit Review'}
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Star, X, CheckCircle2 } from 'lucide-react';
import { apiCreateServiceReview } from '@/lib/api';

const TAGS = [
  'Punctual',
  'Skilled',
  'Polite',
  'Cleaned Up',
  'Professional',
  'Explained Well',
];

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent!'];
  const display = hovered || value;

  return (
    <div>
      <div className="flex gap-1 justify-center mt-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(i)}
          >
            <Star
              stroke="none"
              className={`w-9 h-9 ${
                i <= display
                  ? 'fill-[#FFB900] text-[#FFB900]'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          </button>
        ))}
      </div>

      {display > 0 && (
        <p className="text-center text-sm font-semibold text-black mt-1">
          {labels[display]}
        </p>
      )}
    </div>
  );
}

export default function ServiceReviewModal({
  open,
  serviceProductId,
  bookingId,
  serviceName,
  image,
  vendorName,
  existingReview,
  onClose,
  onSuccess,
}) {
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  //  UNIFIED IMAGE STATE (FIXED BUG)
  const [imageList, setImageList] = useState([]);

  useEffect(() => {
    if (open) {
      setRating(existingReview?.rating || 0);
      setComment(existingReview?.comment || '');
      setSelectedTags(existingReview?.tags || []);
      setSubmitted(false);
      setError('');

      // IMPORTANT: preserve OLD images properly
      setImageList(
        (existingReview?.images || []).map((url) => ({
          kind: 'old',
          url,
        })),
      );
    }
  }, [open, existingReview]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  //  ADD IMAGES FIXED (no overwrite bug)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - imageList.length;

    if (remaining <= 0) return;

    const toAdd = files.slice(0, remaining).map((file) => ({
      kind: 'new',
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImageList((prev) => [...prev, ...toAdd]);
    e.target.value = '';
  };

  //  REMOVE IMAGE FIXED
  const removeImage = (index) => {
    setImageList((prev) => {
      const item = prev[index];

      if (item.kind === 'new') {
        URL.revokeObjectURL(item.previewUrl);
      }

      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    if (!rating) {
      setError('Please select a rating.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('rating', rating);
      formData.append('comment', comment);
      formData.append('tags', JSON.stringify(selectedTags));
      // formData.append('bookingId', bookingId);

      //  keep old images
      const keepImages = imageList
        .filter((i) => i.kind === 'old')
        .map((i) => i.url);

      formData.append('keepImages', JSON.stringify(keepImages));

      //  new images only
      imageList
        .filter((i) => i.kind === 'new')
        .forEach((i) => formData.append('images', i.file));

      // console.log('serviceProductId:', serviceProductId);
      // console.log('rating:', rating);
      // console.log('comment:', comment);
      // console.log('selectedTags:', selectedTags);
      // console.log('imageList:', imageList);
      // console.log('serviceProductId:', serviceProductId);

      await apiCreateServiceReview(serviceProductId, formData);

      setSubmitted(true);
      onSuccess?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/*  SUCCESS SCREEN */}
        {submitted ? (
          <div className="px-5 py-10 text-center">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
            <p className="text-lg font-bold text-gray-900">
              Thank you for your review!
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Your feedback helps improve our services.
            </p>

            {/* <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 bg-[#FF6F00] text-white rounded-xl"
            >
              Close
            </button> */}
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mt-0.5">
                  How was your service?
                </h2>
                {/* <p className="text-sm text-[#008236] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Job #{String(bookingId).slice(-4).toUpperCase()} completed
                  successfully!
                </p> */}
              </div>

              <button onClick={onClose}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* FORM */}
            <div className="px-5 py-4 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-hide">
              {/* Vendor */}
              <div className="flex items-center gap-3">
                {/* <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                  {image ? (
                    <img src={image} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 font-bold">
                      {vendorName?.charAt(0)}
                    </div>
                  )}
                </div> */}
                <div className="w-10 h-10 rounded-full bg-[#FF6F00] flex items-center justify-center text-white font-bold text-lg uppercase">
                  {vendorName?.trim()?.charAt(0) || '?'}
                </div>

                <div>
                  <p className="font-semibold">Rate Technician {vendorName}</p>
                  <p className="text-xs text-gray-500">
                    How did {vendorName} perform?
                  </p>
                </div>
              </div>

              {/* Stars */}
              <StarPicker value={rating} onChange={setRating} />

              {/* Tags */}
              {rating > 0 && (
                <div>
                  <p className="text-sm font-medium text-black mb-2">
                    What did you like?{' '}
                    <span className="text-gray-400">(Optional)</span>
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-sm border ${
                          selectedTags.includes(tag)
                            ? 'bg-[#FF6F00] text-white border-[#FF6F00]'
                            : 'border-gray-300'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* COMMENT */}
              <div>
                <p className="text-sm font-medium text-black mb-2">
                  Any additional feedback?{' '}
                  <span className="text-gray-400">(Optional)</span>
                </p>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Share your experience to help us improve our services..."
                  className="w-full border rounded-xl px-3 py-2 placeholder:text-sm"
                />
              </div>

              {/* ERROR */}
              {error && <p className="text-sm text-red-500">{error}</p>}

              {/*  IMAGE SECTION FIXED */}
              <div>
                <p className="text-sm font-medium text-black mb-2">
                  Photos? <span className="text-gray-400">(Optional)</span>
                </p>

                <div className="flex flex-wrap gap-2">
                  {imageList.map((item, i) => (
                    <div key={i} className="relative w-16 h-16">
                      <img
                        src={item.kind === 'old' ? item.url : item.previewUrl}
                        className="w-full h-full object-cover rounded-lg"
                      />

                      <button
                        onClick={() => removeImage(i)}
                        className="absolute -top-1 -right-1 bg-black/60 text-white text-xs w-5 h-5 rounded-full"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {imageList.length < 5 && (
                  <label className="inline-block mt-2 px-3 py-2 border rounded-lg cursor-pointer">
                    Add Images
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      hidden
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>

              {/* SUBMIT */}
              <button
                disabled={!rating || submitting}
                onClick={handleSubmit}
                className="w-full py-3 bg-[#FF6F00] text-white rounded-xl flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />

                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
