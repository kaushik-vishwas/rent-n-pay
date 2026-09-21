// 'use client';
// import { useState, useEffect } from 'react';
// import { Star, ImagePlus, X } from 'lucide-react';
// import { toast } from 'react-toastify';
// import { apiCreateReview } from '@/lib/api';

// export default function ReviewModal({
//   open,
//   onClose,
//   onSuccess,
//   productId,
//   orderId,
//   productName,
//   image,
//   existingReview,
// }) {
//   const [rating, setRating] = useState(existingReview?.rating || 5);
//   const [comment, setComment] = useState(existingReview?.comment || '');
//   const [commentError, setCommentError] = useState('');
//   const [loading, setLoading] = useState(false);

//   // unified image list — each item is either
//   // { kind: 'old', url: string } or { kind: 'new', file: File, previewUrl: string }
//   const [imageList, setImageList] = useState([]);

//   useEffect(() => {
//     if (existingReview) {
//       setRating(existingReview.rating);
//       setComment(existingReview.comment || '');
//       // seed old images
//       setImageList(
//         (existingReview.images || []).map((url) => ({ kind: 'old', url })),
//       );
//     } else {
//       setRating(5);
//       setComment('');
//       setImageList([]);
//     }
//     setCommentError('');
//   }, [existingReview, open]);

//   // revoke blob URLs when list changes or modal closes
//   useEffect(() => {
//     return () => {
//       imageList.forEach((item) => {
//         if (item.kind === 'new') URL.revokeObjectURL(item.previewUrl);
//       });
//     };
//   }, [imageList]);

//   if (!open) return null;

//   const totalImages = imageList.length;

//   const handleCommentChange = (e) => {
//     const val = e.target.value;
//     setComment(val);
//     if (val.trim().length === 0) {
//       setCommentError('Review is required.');
//     } else if (val.trim().length < 10) {
//       setCommentError('Review must be at least 10 characters.');
//     } else {
//       setCommentError('');
//     }
//   };

//   const handleImageChange = (e) => {
//     const incoming = Array.from(e.target.files || []);
//     const slots = 5 - totalImages; // how many more we can add
//     if (slots <= 0) {
//       toast.error('Maximum 5 photos allowed.', { autoClose: 2000 });
//       e.target.value = '';
//       return;
//     }
//     const toAdd = incoming.slice(0, slots).map((file) => ({
//       kind: 'new',
//       file,
//       previewUrl: URL.createObjectURL(file),
//     }));
//     setImageList((prev) => [...prev, ...toAdd]);
//     e.target.value = '';
//   };

//   const removeImage = (idx) => {
//     setImageList((prev) => {
//       const item = prev[idx];
//       if (item.kind === 'new') URL.revokeObjectURL(item.previewUrl);
//       return prev.filter((_, i) => i !== idx);
//     });
//   };

//   const submitReview = async () => {
//     if (!comment.trim()) {
//       setCommentError('Review is required.');
//       return;
//     }
//     if (comment.trim().length < 10) {
//       setCommentError('Review must be at least 10 characters.');
//       return;
//     }

//     try {
//       setLoading(true);

//       const formData = new FormData();
//       formData.append('orderId', orderId);
//       formData.append('rating', rating);
//       formData.append('comment', comment);

//       // tell backend which old URLs to keep
//       const keepUrls = imageList
//         .filter((item) => item.kind === 'old')
//         .map((item) => item.url);
//       formData.append('keepImages', JSON.stringify(keepUrls));

//       // append new files
//       imageList
//         .filter((item) => item.kind === 'new')
//         .forEach((item) => formData.append('images', item.file));

//       const res = await apiCreateReview(productId, formData);

//       toast.success(res.data.message, {
//         position: 'top-right',
//         autoClose: 2000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         theme: 'light',
//       });

//       await onSuccess?.();
//       setRating(5);
//       setComment('');
//       setCommentError('');
//       setImageList([]);
//       onClose();
//     } catch (err) {
//       console.log(err);
//       toast.error(err.response?.data?.message || 'Failed to submit review', {
//         position: 'top-right',
//         autoClose: 3000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         theme: 'light',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
//         <h2 className="text-xl font-bold mb-4">Rate &amp; Review</h2>

//         {/* Product info */}
//         <div className="flex items-center gap-3 mb-5">
//           <img
//             src={image}
//             alt={productName}
//             className="w-16 h-16 rounded-lg object-cover border border-gray-200 shrink-0"
//           />
//           <p className="font-medium text-gray-800 leading-snug">
//             {productName}
//           </p>
//         </div>

//         {/* Star rating */}
//         <p className="text-sm font-medium text-gray-700 mb-1">Your Rating</p>
//         <div className="flex gap-1">
//           {[1, 2, 3, 4, 5].map((star) => (
//             <button
//               key={star}
//               type="button"
//               onClick={() => setRating(star)}
//               className="focus:outline-none"
//             >
//               <Star
//                 size={28}
//                 className={
//                   star <= rating
//                     ? 'text-yellow-400 fill-yellow-400'
//                     : 'text-gray-300 fill-gray-100'
//                 }
//               />
//             </button>
//           ))}
//         </div>
//         <p className="text-[11px] text-gray-400 mt-1 mb-5">
//           You can select your stars above
//         </p>

//         {/* Comment */}
//         <p className="text-sm font-medium text-gray-700 mb-1">
//           Review <span className="text-red-500">*</span>
//           <span className="text-gray-400 font-normal text-xs ml-1">
//             (min. 10 characters)
//           </span>
//         </p>
//         <textarea
//           value={comment}
//           onChange={handleCommentChange}
//           placeholder="Share your experience..."
//           rows={3}
//           className={`w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 ${
//             commentError
//               ? 'border-red-400 focus:ring-red-300'
//               : 'border-gray-300 focus:ring-orange-400'
//           }`}
//         />
//         <div className="flex items-center justify-between mt-1 mb-4">
//           {commentError ? (
//             <p className="text-xs text-red-500">{commentError}</p>
//           ) : (
//             <span />
//           )}
//           <p
//             className={`text-xs ml-auto ${
//               comment.trim().length < 10 ? 'text-gray-400' : 'text-emerald-500'
//             }`}
//           >
//             {comment.trim().length}/10 min
//           </p>
//         </div>

//         {/* Photos */}
//         <p className="text-sm font-medium text-gray-700 mb-2">
//           Photos{' '}
//           <span className="text-gray-400 font-normal text-xs">
//             (optional, max 5)
//           </span>
//         </p>

//         {/* unified image grid — old + new together */}
//         {imageList.length > 0 && (
//           <div className="flex gap-2 flex-wrap mb-3">
//             {imageList.map((item, idx) => (
//               <div key={idx} className="relative">
//                 <img
//                   src={item.kind === 'old' ? item.url : item.previewUrl}
//                   alt=""
//                   className="w-16 h-16 rounded-lg object-cover border border-gray-200"
//                 />
//                 {/* small badge so user knows old vs new */}
//                 <span
//                   className={`absolute bottom-0.5 left-0.5 text-[8px] font-bold px-1 rounded ${
//                     item.kind === 'old'
//                       ? 'bg-blue-500 text-white'
//                       : 'bg-emerald-500 text-white'
//                   }`}
//                 >
//                   {item.kind === 'old' ? 'saved' : 'new'}
//                 </span>
//                 <button
//                   type="button"
//                   onClick={() => removeImage(idx)}
//                   className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
//                 >
//                   <X size={11} />
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* add more button — hidden when at 5 */}
//         {totalImages < 5 && (
//           <label className="inline-flex items-center gap-2 cursor-pointer border border-dashed border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 mb-4">
//             <ImagePlus size={16} className="text-gray-500" />
//             {totalImages === 0 ? 'Add photos' : `Add more (${totalImages}/5)`}
//             <input
//               type="file"
//               accept="image/*"
//               multiple
//               className="hidden"
//               onChange={handleImageChange}
//             />
//           </label>
//         )}
//         {totalImages >= 5 && (
//           <p className="text-xs text-gray-400 mb-4">
//             Maximum 5 photos reached. Remove one to add another.
//           </p>
//         )}

//         {/* Actions */}
//         <div className="flex gap-3">
//           <button
//             type="button"
//             onClick={onClose}
//             className="flex-1 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
//           >
//             Cancel
//           </button>
//           <button
//             type="button"
//             onClick={submitReview}
//             disabled={loading}
//             className="flex-1 bg-orange-500 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-orange-600 disabled:opacity-60"
//           >
//             {loading
//               ? 'Saving...'
//               : existingReview
//                 ? 'Update Review'
//                 : 'Submit'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Star, ImagePlus, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiCreateReview } from '@/lib/api';

export default function ReviewModal({
  open,
  onClose,
  onSuccess,
  productId,
  orderId,
  productName,
  image,
  existingReview,
}) {
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [commentError, setCommentError] = useState('');
  const [loading, setLoading] = useState(false);

  // unified image list — each item is either
  // { kind: 'old', url: string } or { kind: 'new', file: File, previewUrl: string }
  const [imageList, setImageList] = useState([]);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || '');
      // seed old images
      setImageList(
        (existingReview.images || []).map((url) => ({ kind: 'old', url })),
      );
    } else {
      setRating(5);
      setComment('');
      setImageList([]);
    }
    setCommentError('');
  }, [existingReview, open]);

  // revoke blob URLs when list changes or modal closes
  useEffect(() => {
    return () => {
      imageList.forEach((item) => {
        if (item.kind === 'new') URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, [imageList]);
  if (!open) return null;
  if (typeof document === 'undefined') return null;

  const totalImages = imageList.length;

  const handleCommentChange = (e) => {
    const val = e.target.value;
    setComment(val);
    if (val.trim().length === 0) {
      setCommentError('Review is required.');
    } else if (val.trim().length < 10) {
      setCommentError('Review must be at least 10 characters.');
    } else {
      setCommentError('');
    }
  };

  const handleImageChange = (e) => {
    const incoming = Array.from(e.target.files || []);
    const slots = 5 - totalImages; // how many more we can add
    if (slots <= 0) {
      toast.error('Maximum 5 photos allowed.', { autoClose: 2000 });
      e.target.value = '';
      return;
    }
    const toAdd = incoming.slice(0, slots).map((file) => ({
      kind: 'new',
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setImageList((prev) => [...prev, ...toAdd]);
    e.target.value = '';
  };

  const removeImage = (idx) => {
    setImageList((prev) => {
      const item = prev[idx];
      if (item.kind === 'new') URL.revokeObjectURL(item.previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const submitReview = async () => {
    if (!comment.trim()) {
      setCommentError('Review is required.');
      return;
    }
    if (comment.trim().length < 10) {
      setCommentError('Review must be at least 10 characters.');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('rating', rating);
      formData.append('comment', comment);

      // tell backend which old URLs to keep
      const keepUrls = imageList
        .filter((item) => item.kind === 'old')
        .map((item) => item.url);
      formData.append('keepImages', JSON.stringify(keepUrls));

      // append new files
      imageList
        .filter((item) => item.kind === 'new')
        .forEach((item) => formData.append('images', item.file));

      const res = await apiCreateReview(productId, formData);

      toast.success(res.data.message, {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });

      await onSuccess?.();
      setRating(5);
      setComment('');
      setCommentError('');
      setImageList([]);
      onClose();
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || 'Failed to submit review', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <h2 className="text-xl font-bold mb-4">Rate &amp; Review</h2>

        {/* Product info */}
        <div className="flex items-center gap-3 mb-5">
          <img
            src={image}
            alt={productName}
            className="w-16 h-16 rounded-lg object-cover border border-gray-200 shrink-0"
          />
          <p className="font-medium text-gray-800 leading-snug">
            {productName}
          </p>
        </div>

        {/* Star rating */}
        <p className="text-sm font-medium text-gray-700 mb-1">Your Rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none"
            >
              <Star
                size={28}
                className={
                  star <= rating
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300 fill-gray-100'
                }
              />
            </button>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 mt-1 mb-5">
          You can select your stars above
        </p>

        {/* Comment */}
        <p className="text-sm font-medium text-gray-700 mb-1">
          Review <span className="text-red-500">*</span>
          <span className="text-gray-400 font-normal text-xs ml-1">
            (min. 10 characters)
          </span>
        </p>
        <textarea
          value={comment}
          onChange={handleCommentChange}
          placeholder="Share your experience..."
          rows={3}
          className={`w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 ${
            commentError
              ? 'border-red-400 focus:ring-red-300'
              : 'border-gray-300 focus:ring-orange-400'
          }`}
        />
        <div className="flex items-center justify-between mt-1 mb-4">
          {commentError ? (
            <p className="text-xs text-red-500">{commentError}</p>
          ) : (
            <span />
          )}
          <p
            className={`text-xs ml-auto ${
              comment.trim().length < 10 ? 'text-gray-400' : 'text-emerald-500'
            }`}
          >
            {comment.trim().length}/10 min
          </p>
        </div>

        {/* Photos */}
        <p className="text-sm font-medium text-gray-700 mb-2">
          Photos{' '}
          <span className="text-gray-400 font-normal text-xs">
            (optional, max 5)
          </span>
        </p>

        {/* unified image grid — old + new together */}
        {imageList.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {imageList.map((item, idx) => (
              <div key={idx} className="relative">
                <img
                  src={item.kind === 'old' ? item.url : item.previewUrl}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                />
                {/* small badge so user knows old vs new */}
                <span
                  className={`absolute bottom-0.5 left-0.5 text-[8px] font-bold px-1 rounded ${
                    item.kind === 'old'
                      ? 'bg-blue-500 text-white'
                      : 'bg-emerald-500 text-white'
                  }`}
                >
                  {item.kind === 'old' ? 'saved' : 'new'}
                </span>
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* add more button — hidden when at 5 */}
        {totalImages < 5 && (
          <label className="inline-flex items-center gap-2 cursor-pointer border border-dashed border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 mb-4">
            <ImagePlus size={16} className="text-gray-500" />
            {totalImages === 0 ? 'Add photos' : `Add more (${totalImages}/5)`}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        )}
        {totalImages >= 5 && (
          <p className="text-xs text-gray-400 mb-4">
            Maximum 5 photos reached. Remove one to add another.
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submitReview}
            disabled={loading}
            className="flex-1 bg-orange-500 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-orange-600 disabled:opacity-60"
          >
            {loading
              ? 'Saving...'
              : existingReview
                ? 'Update Review'
                : 'Submit'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
