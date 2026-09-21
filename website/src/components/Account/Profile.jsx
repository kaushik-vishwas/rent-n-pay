// 'use client';
// import { useState, useEffect, useRef, useCallback } from 'react';
// import { createPortal } from 'react-dom';
// import { useSearchParams } from 'next/navigation';
// import { useSelector } from 'react-redux';
// import {
//   CheckCircle2,
//   Clock3,
//   FileText,
//   ShieldCheck,
//   Upload,
//   X,
//   Eye,
//   Camera,
//   Shield,
// } from 'lucide-react';
// import { apiGetMyUserKyc, apiSubmitMyUserKyc } from '@/lib/api';

// const KYC_STATUS_MAP = {
//   approved: {
//     label: 'Approved',
//     className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
//   },
//   pending: {
//     label: 'Pending',
//     className: 'border-amber-200 bg-amber-50 text-amber-700',
//   },
//   //review
//   in_review: {
//     label: 'In Review',
//     className: 'border-indigo-200 bg-indigo-50 text-indigo-700',
//   },
//   rejected: {
//     label: 'Rejected',
//     className: 'border-red-200 bg-red-50 text-red-700',
//   },
//   not_submitted: {
//     label: 'Not Submitted',
//     className: 'border-gray-200 bg-gray-50 text-gray-700',
//   },
// };

// function formatDateOnly(value) {
//   if (!value) return 'Not provided';
//   const d = new Date(value);
//   if (Number.isNaN(d.getTime())) return 'Not provided';
//   return d.toLocaleDateString('en-IN', {
//     day: '2-digit',
//     month: 'short',
//     year: 'numeric',
//   });
// }

// function fileNameFromUrl(url) {
//   if (!url) return '';
//   try {
//     const clean = String(url).split('?')[0];
//     const parts = clean.split('/');
//     return decodeURIComponent(parts[parts.length - 1] || 'Document');
//   } catch {
//     return 'Document';
//   }
// }

// function isPdfDoc(url) {
//   if (!url) return false;
//   const clean = String(url).split('?')[0].toLowerCase();
//   return clean.endsWith('.pdf');
// }

// const Profile = () => {
//   const { user } = useSelector((s) => s.auth);
//   const searchParams = useSearchParams();
//   const [kycLoading, setKycLoading] = useState(true);
//   const [kycState, setKycState] = useState({
//     status: 'not_submitted',
//     aadhaarFront: '',
//     aadhaarBack: '',
//     panCard: '',
//     panCardNumber: '',
//     dateOfBirth: '',
//     permanentAddress: '',
//     contactNumber: '',
//     rejectionReason: '',
//   });
//   const [showKycModal, setShowKycModal] = useState(false);
//   const [previewDoc, setPreviewDoc] = useState(null);
//   const [kycSubmitting, setKycSubmitting] = useState(false);
//   const [kycSubmitError, setKycSubmitError] = useState('');
//   const [editForm, setEditForm] = useState({
//     dateOfBirth: '',
//     permanentAddress: '',
//     contactNumber: '',
//     panCardNumber: '',
//   });
//   const [files, setFiles] = useState({
//     aadhaarFront: null,
//     aadhaarBack: null,
//     panCard: null,
//   });
//   const [filePreviews, setFilePreviews] = useState({
//     aadhaarFront: '',
//     aadhaarBack: '',
//     panCard: '',
//   });
//   const [kycModalError, setKycModalError] = useState('');

//   const videoRef = useRef(null);
//   const streamRef = useRef(null);
//   const [selfiePhase, setSelfiePhase] = useState('idle'); // idle | live | preview
//   const [selfiePreviewUrl, setSelfiePreviewUrl] = useState('');
//   const [selfieError, setSelfieError] = useState('');

//   const stopSelfieStream = useCallback(() => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((t) => t.stop());
//       streamRef.current = null;
//     }
//     if (videoRef.current) {
//       videoRef.current.srcObject = null;
//     }
//   }, []);

//   const startSelfieCamera = useCallback(async () => {
//     setSelfieError('');
//     if (
//       typeof navigator === 'undefined' ||
//       !navigator.mediaDevices?.getUserMedia
//     ) {
//       setSelfieError('Camera is not available in this browser.');
//       return;
//     }
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: 'user' },
//         audio: false,
//       });
//       stopSelfieStream();
//       streamRef.current = stream;
//       setSelfiePhase('live');
//       requestAnimationFrame(() => {
//         const el = videoRef.current;
//         if (el) {
//           el.srcObject = stream;
//           el.play().catch(() => {});
//         }
//       });
//     } catch (e) {
//       setSelfieError(
//         e?.name === 'NotAllowedError'
//           ? 'Camera access was denied. Please allow the camera to take a selfie.'
//           : 'Could not start the camera.',
//       );
//       setSelfiePhase('idle');
//     }
//   }, [stopSelfieStream]);

//   const captureSelfie = useCallback(() => {
//     const video = videoRef.current;
//     if (!video || video.readyState < 2) return;
//     const w = video.videoWidth;
//     const h = video.videoHeight;
//     if (!w || !h) return;
//     const canvas = document.createElement('canvas');
//     canvas.width = w;
//     canvas.height = h;
//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;
//     ctx.drawImage(video, 0, 0, w, h);
//     canvas.toBlob(
//       (blob) => {
//         if (!blob) return;
//         stopSelfieStream();
//         setSelfiePreviewUrl((prev) => {
//           if (prev) URL.revokeObjectURL(prev);
//           return URL.createObjectURL(blob);
//         });
//         setSelfiePhase('preview');
//       },
//       'image/jpeg',
//       0.92,
//     );
//   }, [stopSelfieStream]);

//   const retakeSelfie = useCallback(async () => {
//     setSelfiePreviewUrl((prev) => {
//       if (prev) URL.revokeObjectURL(prev);
//       return '';
//     });
//     stopSelfieStream();
//     await startSelfieCamera();
//   }, [startSelfieCamera, stopSelfieStream]);

//   const makePreviewUrl = useCallback((key, file) => {
//     setFilePreviews((prev) => {
//       if (prev[key]) URL.revokeObjectURL(prev[key]);
//       return {
//         ...prev,
//         [key]:
//           file && file.type?.startsWith('image/')
//             ? URL.createObjectURL(file)
//             : '',
//       };
//     });
//   }, []);

//   useEffect(() => {
//     setKycLoading(true);
//     apiGetMyUserKyc()
//       .then((res) => {
//         const kyc = res.data?.kyc || {};
//         const next = {
//           status: String(kyc.status || 'not_submitted'),
//           aadhaarFront: kyc.aadhaarFront || '',
//           aadhaarBack: kyc.aadhaarBack || '',
//           panCard: kyc.panCard || '',
//           panCardNumber: kyc.panCardNumber || '',
//           dateOfBirth: kyc.dateOfBirth || '',
//           permanentAddress: kyc.permanentAddress || '',
//           contactNumber: kyc.contactNumber || '',
//           rejectionReason: kyc.rejectionReason || '',
//         };
//         setKycState(next);
//         setEditForm({
//           dateOfBirth: next.dateOfBirth
//             ? String(next.dateOfBirth).slice(0, 10)
//             : '',
//           permanentAddress: next.permanentAddress || '',
//           contactNumber: next.contactNumber || '',
//           panCardNumber: next.panCardNumber || '',
//         });
//       })
//       .catch(() => {
//         setKycState({
//           status: 'not_submitted',
//           aadhaarFront: '',
//           aadhaarBack: '',
//           panCard: '',
//           panCardNumber: '',
//           dateOfBirth: '',
//           permanentAddress: '',
//           contactNumber: '',
//           rejectionReason: '',
//         });
//       })
//       .finally(() => setKycLoading(false));
//   }, []);

//   useEffect(() => {
//     const shouldOpen = searchParams?.get('kyc') === 'update';
//     if (shouldOpen) setShowKycModal(true);
//   }, [searchParams]);

//   const clearKycQueryParam = () => {
//     if (typeof window === 'undefined') return;
//     const url = new URL(window.location.href);
//     url.searchParams.delete('kyc');
//     window.history.replaceState({}, '', url.toString());
//   };

//   const openKycModal = () => {
//     setKycSubmitError('');
//     setKycModalError('');
//     setFiles({ aadhaarFront: null, aadhaarBack: null, panCard: null });
//     setFilePreviews({ aadhaarFront: '', aadhaarBack: '', panCard: '' });
//     setEditForm({
//       dateOfBirth: kycState.dateOfBirth
//         ? String(kycState.dateOfBirth).slice(0, 10)
//         : '',
//       permanentAddress: kycState.permanentAddress || '',
//       contactNumber: kycState.contactNumber || '',
//       panCardNumber: kycState.panCardNumber || '',
//     });
//     setShowKycModal(true);
//   };

//   const closeKycModal = () => {
//     setShowKycModal(false);
//     stopSelfieStream();
//     setSelfiePhase('idle');
//     setSelfieError('');
//     setSelfiePreviewUrl((prev) => {
//       if (prev) URL.revokeObjectURL(prev);
//       return '';
//     });
//     clearKycQueryParam();
//   };

//   useEffect(() => {
//     if (!showKycModal) {
//       stopSelfieStream();
//       setSelfiePhase('idle');
//       setSelfieError('');
//       setSelfiePreviewUrl((prev) => {
//         if (prev) URL.revokeObjectURL(prev);
//         return '';
//       });
//     }
//   }, [showKycModal, stopSelfieStream]);

//   useEffect(
//     () => () => {
//       Object.values(filePreviews).forEach((url) => {
//         if (url) URL.revokeObjectURL(url);
//       });
//     },
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     [],
//   );

//   // const editContactDigits = String(editForm.contactNumber || '').replace(
//   //   /\D/g,
//   //   '',
//   // );
//   const editPanCardNumberValue = String(editForm.panCardNumber || '')
//     .trim()
//     .toUpperCase();
//   const editPanCardNumberValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(
//     editPanCardNumberValue,
//   );
//   const editDobValue = editForm.dateOfBirth?.trim() || '';
//   const editDobDate = editDobValue ? new Date(editDobValue) : null;
//   const editDobValidDate = Boolean(
//     editDobDate && !Number.isNaN(editDobDate.getTime()),
//   );
//   const editDobNotFuture = editDobValidDate && editDobDate <= new Date();
//   const editDobAdult =
//     editDobValidDate &&
//     editDobDate <=
//       new Date(
//         new Date().getFullYear() - 18,
//         new Date().getMonth(),
//         new Date().getDate(),
//       );
//   const editDobOk = editDobValidDate && editDobNotFuture && editDobAdult;
//   // const editPersonalOk =
//   //   editDobOk &&
//   //   editForm.permanentAddress.trim().length >= 5 &&
//   //   editContactDigits.length === 10 &&
//   //   editPanCardNumberValid;
//   const editPersonalOk =
//     editDobOk &&
//     editForm.permanentAddress.trim().length >= 5 &&
//     editPanCardNumberValid;

//   const submitKycUpdate = async (e) => {
//     e.preventDefault();
//     setKycSubmitError('');
//     setKycModalError('');

//     if (!editPersonalOk) {
//       if (!editDobValue) {
//         setKycModalError('Please enter your date of birth.');
//       } else if (!editDobValidDate) {
//         setKycModalError('Please enter a valid date of birth.');
//       } else if (!editDobNotFuture) {
//         setKycModalError('Date of birth cannot be in the future.');
//       } else if (!editDobAdult) {
//         setKycModalError('You must be at least 18 years old.');
//       } else if (editForm.permanentAddress.trim().length < 5) {
//         setKycModalError('Please enter a valid permanent address.');
//         // } else if (editContactDigits.length !== 10) {
//         //   setKycModalError('Please enter a valid 10-digit contact number.');
//         // } else if (!editPanCardNumberValid) {
//       } else if (!editPanCardNumberValid) {
//         setKycModalError(
//           'Please enter a valid 10-character PAN number (e.g. ABCDE1234F).',
//         );
//       } else {
//         setKycModalError('Please fill in all required fields correctly.');
//       }
//       return;
//     }

//     setKycSubmitting(true);
//     try {
//       // const formData = new FormData();
//       // formData.append('dateOfBirth', editForm.dateOfBirth);
//       // formData.append('permanentAddress', editForm.permanentAddress);
//       // formData.append('contactNumber', editForm.contactNumber);
//       // formData.append('panCardNumber', editPanCardNumberValue);
//       const formData = new FormData();
//       formData.append('dateOfBirth', editForm.dateOfBirth);
//       formData.append('permanentAddress', editForm.permanentAddress);
//       formData.append('panCardNumber', editPanCardNumberValue);
//       if (files.aadhaarFront)
//         formData.append('aadhaarFront', files.aadhaarFront);
//       if (files.aadhaarBack) formData.append('aadhaarBack', files.aadhaarBack);
//       if (files.panCard) formData.append('panCard', files.panCard);

//       const res = await apiSubmitMyUserKyc(formData);
//       const kyc = res.data?.kyc || {};
//       const next = {
//         status: String(kyc.status || 'pending'),
//         aadhaarFront: kyc.aadhaarFront || '',
//         aadhaarBack: kyc.aadhaarBack || '',
//         panCard: kyc.panCard || '',
//         panCardNumber: kyc.panCardNumber || editPanCardNumberValue || '',
//         dateOfBirth: kyc.dateOfBirth || editForm.dateOfBirth || '',
//         permanentAddress:
//           kyc.permanentAddress || editForm.permanentAddress || '',
//         contactNumber: kyc.contactNumber || editForm.contactNumber || '',
//         rejectionReason: kyc.rejectionReason || '',
//       };
//       setKycState(next);
//       closeKycModal();
//     } catch (err) {
//       setKycSubmitError(
//         err?.response?.data?.message ||
//           'Failed to update KYC. Please try again.',
//       );
//     } finally {
//       setKycSubmitting(false);
//     }
//   };

//   const normalizedStatus = String(
//     kycState.status || 'not_submitted',
//   ).toLowerCase();
//   const statusMeta =
//     KYC_STATUS_MAP[normalizedStatus] || KYC_STATUS_MAP.not_submitted;
//   const docs = [
//     { key: 'aadhaarFront', label: 'Aadhaar Front', url: kycState.aadhaarFront },
//     { key: 'aadhaarBack', label: 'Aadhaar Back', url: kycState.aadhaarBack },
//     { key: 'panCard', label: 'PAN Card', url: kycState.panCard },
//   ];

//   return (
//     <div>
//       {/* <div className="mb-6 flex items-center justify-between gap-3">
//         <h1 className="text-2xl font-bold text-gray-900">My Profile & KYC</h1>
//         <button
//           type="button"
//           onClick={openKycModal}
//           className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3.5 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-100"
//         >

//           Update KYC
//         </button>
//       </div> */}

//       <div className="mb-4 md:mb-6 flex items-center justify-between gap-2 md:gap-3">
//         <h1 className="text-base md:text-xl font-bold text-black leading-snug">
//           My Profile & KYC
//         </h1>
//         {normalizedStatus === 'approved' ? (
//           <span
//             className={`inline-flex items-center gap-1 rounded-full border px-2.5 md:px-3 py-1 md:py-1.5 text-[11px] md:text-xs font-semibold shrink-0 whitespace-nowrap ${KYC_STATUS_MAP.approved.className}`}
//           >
//             <CheckCircle2 className="w-3.5 h-3.5" />
//             {KYC_STATUS_MAP.approved.label}
//           </span>
//         ) : (
//           <button
//             type="button"
//             onClick={openKycModal}
//             className="inline-flex items-center gap-1.5 rounded-xl bg-[#F97316] hover:bg-orange-600 active:scale-[0.98] px-3 md:px-4 py-1.5 md:py-2 text-[11px] md:text-xs font-bold text-white shadow-[0_6px_14px_rgba(249,115,22,0.35)] transition-all shrink-0 whitespace-nowrap"
//           >
//             <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4" />
//             Update KYC Now
//           </button>
//         )}
//       </div>

//       <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 shadow-sm">
//         {/* <h2 className="text-base font-semibold text-gray-900 mb-4">Details</h2> */}
//         <div className="mb-5 md:mb-6">
//           <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2.5 md:mb-3">
//             Account Details
//           </h3>
//           {/* <div className="grid grid-cols-2 gap-2 sm:gap-2.5 md:gap-4">
//             <div className="rounded-xl border border-gray-100 bg-gray-50 p-2 sm:p-3 md:p-4">
//               <p className="text-[8px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wide text-gray-500">
//                 Full Name
//               </p>
//               <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900 truncate">
//                 {user?.name || user?.fullName || 'Not provided'}
//               </p>
//             </div>
//             <div className="rounded-xl border border-gray-100 bg-gray-50 p-2 sm:p-3 md:p-4">
//               <p className="text-[8px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wide text-gray-500">
//                 Email
//               </p>
//               <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900 break-all">
//                 {user?.email || user?.emailAddress || 'Not provided'}
//               </p>
//             </div>
//             <div className="rounded-xl border border-gray-100 bg-gray-50 p-2 sm:p-3 md:p-4">
//               <p className="text-[8px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wide text-gray-500">
//                 Contact Number
//               </p>
//               <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900">
//                 {user?.mobileNumber || 'Not provided'}
//               </p>
//             </div>
//           </div> */}
//           <div className="grid grid-cols-3 gap-2 sm:gap-2.5 md:gap-4">
//             <div className="rounded-xl border border-gray-100 bg-gray-50 p-2 sm:p-3 md:p-4">
//               <p className="text-[8px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wide text-gray-500">
//                 Full Name
//               </p>
//               <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900 truncate">
//                 {user?.name || user?.fullName || 'Not provided'}
//               </p>
//             </div>
//             <div className="rounded-xl border border-gray-100 bg-gray-50 p-2 sm:p-3 md:p-4">
//               <p className="text-[8px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wide text-gray-500">
//                 Email
//               </p>
//               <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900 break-all">
//                 {user?.email || user?.emailAddress || 'Not provided'}
//               </p>
//             </div>
//             <div className="rounded-xl border border-gray-100 bg-gray-50 p-2 sm:p-3 md:p-4">
//               <p className="text-[8px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wide text-gray-500">
//                 Contact Number
//               </p>
//               <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900">
//                 {user?.mobileNumber || 'Not provided'}
//               </p>
//             </div>
//           </div>
//         </div>

//         <div>
//           <div className="flex flex-wrap items-center justify-between gap-3 mb-3 md:mb-4">
//             <div className="flex items-center gap-2">
//               {/* <ShieldCheck className="w-5 h-5 text-orange-500" /> */}
//               <h2 className="text-sm md:text-base font-semibold text-gray-900">
//                 KYC Details
//               </h2>
//             </div>
//             {/* {kycLoading ? (
//               <span className="text-xs text-gray-500">Loading...</span>
//             ) : (
//               <span
//                 className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.className}`}
//               >
//                 {normalizedStatus === 'approved' ? (
//                   <CheckCircle2 className="w-3.5 h-3.5" />
//                 ) : (
//                   <Clock3 className="w-3.5 h-3.5" />
//                 )}
//                 {statusMeta.label}
//               </span>
//             )} */}
//           </div>

//           {normalizedStatus === 'rejected' ? (
//             <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 md:px-4 py-2.5 md:py-3">
//               <p className="text-xs md:text-sm font-semibold text-red-700 leading-snug">
//                 KYC rejected by admin
//               </p>
//               <p className="text-[11px] md:text-xs text-red-600 mt-1 leading-relaxed">
//                 {kycState.rejectionReason ||
//                   'Please update your documents and resubmit KYC.'}
//               </p>
//             </div>
//           ) : null}

//           {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
//             <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
//               <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
//                 Date of Birth
//               </p>
//               <p className="mt-1 text-sm font-semibold text-gray-900">
//                 {formatDateOnly(kycState.dateOfBirth)}
//               </p>
//             </div>
//             <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
//               <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
//                 Contact Number
//               </p>
//               <p className="mt-1 text-sm font-semibold text-gray-900">
//                 {kycState.contactNumber || 'Not provided'}
//               </p>
//             </div>
//             <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 md:col-span-2">
//               <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
//                 Permanent Address
//               </p>
//               <p className="mt-1 text-sm font-semibold text-gray-900 whitespace-pre-wrap break-words">
//                 {kycState.permanentAddress || 'Not provided'}
//               </p>
//             </div>
//           </div> */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 md:gap-4 mb-4 md:mb-5">
//             <div className="rounded-xl border border-gray-100 bg-gray-50 p-2 sm:p-3 md:p-4">
//               <p className="text-[8px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wide text-gray-500">
//                 Date of Birth
//               </p>
//               <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900">
//                 {formatDateOnly(kycState.dateOfBirth)}
//               </p>
//             </div>
//             {/* <div className="rounded-xl border border-gray-100 bg-gray-50 p-2 sm:p-3 md:p-4">
//               <p className="text-[8px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wide text-gray-500">
//                 Contact Number
//               </p>
//               <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900">
//                 {kycState.contactNumber || 'Not provided'}
//               </p>
//             </div> */}
//             <div className="rounded-xl border border-gray-100 bg-gray-50 p-2 sm:p-3 md:p-4">
//               <p className="text-[8px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wide text-gray-500">
//                 PAN Card Number
//               </p>
//               <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900 uppercase">
//                 {kycState.panCardNumber || 'Not provided'}
//               </p>
//             </div>
//             <div className="rounded-xl border border-gray-100 bg-gray-50 p-2 sm:p-3 md:p-4">
//               <p className="text-[8px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wide text-gray-500">
//                 Permanent Address
//               </p>
//               <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900 whitespace-pre-wrap break-words leading-relaxed">
//                 {kycState.permanentAddress || 'Not provided'}
//               </p>
//             </div>
//           </div>

//           <div>
//             <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-2.5 md:mb-3">
//               Uploaded Documents
//             </h3>
//             {/* <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 md:gap-3">
//               {docs.map((doc) => (
//                 <article
//                   key={doc.key}
//                   className="rounded-xl border border-gray-200 bg-gray-50 p-2.5 md:p-3"
//                 >
//                   <div className="flex items-start justify-between gap-2 mb-1.5 md:mb-2">
//                     <p className="text-[11px] md:text-xs font-semibold text-gray-800 leading-snug">
//                       {doc.label}
//                     </p>
//                     <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 shrink-0" />
//                   </div>
//                   {doc.url ? (
//                     <>
//                       <div className="h-28 sm:h-40 rounded-lg border border-gray-200 bg-white overflow-hidden">
//                         {isPdfDoc(doc.url) ? (
//                           <iframe
//                             src={doc.url}
//                             title={`${doc.label} preview`}
//                             className="w-full h-full"
//                           />
//                         ) : (
//                           <img
//                             src={doc.url}
//                             alt={`${doc.label} document`}
//                             className="w-full h-full object-cover"
//                           />
//                         )}
//                       </div>
//                       <p className="mt-1.5 md:mt-2 text-[10px] md:text-[11px] text-gray-500 truncate">
//                         {fileNameFromUrl(doc.url)}
//                       </p>
//                     </>
//                   ) : (
//                     <div className="h-28 sm:h-40 rounded-lg border border-dashed border-gray-300 bg-white flex items-center justify-center">
//                       <p className="text-[11px] md:text-xs text-gray-500">
//                         Not uploaded
//                       </p>
//                     </div>
//                   )}
//                 </article>
//               ))}
//             </div> */}
//             <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 md:gap-3">
//               {docs.map((doc) => (
//                 <article
//                   key={doc.key}
//                   className="rounded-xl border border-gray-200 bg-gray-50 p-1.5 sm:p-2.5 md:p-3"
//                 >
//                   <div className="flex items-start justify-between gap-1 sm:gap-2 mb-1 sm:mb-1.5 md:mb-2">
//                     <p className="text-[9px] sm:text-[11px] md:text-xs font-semibold text-gray-800 leading-snug truncate">
//                       {doc.label}
//                     </p>
//                     <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-gray-400 shrink-0" />
//                   </div>
//                   {doc.url ? (
//                     <>
//                       <button
//                         type="button"
//                         onClick={() => setPreviewDoc(doc)}
//                         className="group relative block w-full h-16 sm:h-28 md:h-40 rounded-lg border border-gray-200 bg-white overflow-hidden"
//                       >
//                         {isPdfDoc(doc.url) ? (
//                           <iframe
//                             src={doc.url}
//                             title={`${doc.label} preview`}
//                             className="w-full h-full pointer-events-none"
//                           />
//                         ) : (
//                           <img
//                             src={doc.url}
//                             alt={`${doc.label} document`}
//                             className="w-full h-full object-cover"
//                           />
//                         )}
//                         <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors opacity-0 group-hover:opacity-100">
//                           <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
//                         </span>
//                       </button>
//                       <p className="mt-1 sm:mt-1.5 md:mt-2 text-[8px] sm:text-[10px] md:text-[11px] text-gray-500 truncate">
//                         {fileNameFromUrl(doc.url)}
//                       </p>
//                     </>
//                   ) : (
//                     <div className="h-16 sm:h-28 md:h-40 rounded-lg border border-dashed border-gray-300 bg-white flex items-center justify-center">
//                       <p className="text-[9px] sm:text-[11px] md:text-xs text-gray-500">
//                         Not uploaded
//                       </p>
//                     </div>
//                   )}
//                 </article>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {previewDoc && typeof document !== 'undefined'
//         ? createPortal(
//             <div
//               className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 px-4 py-8"
//               onClick={() => setPreviewDoc(null)}
//             >
//               <div
//                 className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl overflow-hidden"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
//                   <p className="text-sm font-semibold text-gray-900">
//                     {previewDoc.label}
//                   </p>
//                   <button
//                     type="button"
//                     onClick={() => setPreviewDoc(null)}
//                     className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
//                     aria-label="Close preview"
//                   >
//                     <X className="w-4 h-4" />
//                   </button>
//                 </div>
//                 <div className="max-h-[calc(85vh-52px)] overflow-auto bg-gray-50 flex items-center justify-center">
//                   {isPdfDoc(previewDoc.url) ? (
//                     <iframe
//                       src={previewDoc.url}
//                       title={`${previewDoc.label} full preview`}
//                       className="w-full h-[75vh]"
//                     />
//                   ) : (
//                     <img
//                       src={previewDoc.url}
//                       alt={`${previewDoc.label} full document`}
//                       className="w-full h-auto object-contain"
//                     />
//                   )}
//                 </div>
//               </div>
//             </div>,
//             document.body,
//           )
//         : null}

//       {showKycModal && typeof document !== 'undefined'
//         ? createPortal(
//             <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-3 md:px-4 py-6">
//               <div className="w-full max-w-lg max-h-[90vh] rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden">
//                 <div className="max-h-[90vh] overflow-y-auto rounded-2xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
//                   <div className="flex items-center justify-between px-4 md:px-5 py-3.5 md:py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
//                     <div className="min-w-0">
//                       <p className="text-sm font-semibold text-gray-900">
//                         Update KYC
//                       </p>
//                       <p className="text-[11px] md:text-xs text-gray-500 mt-0.5">
//                         Submit corrected documents for re-verification
//                       </p>
//                     </div>
//                     <button
//                       type="button"
//                       onClick={closeKycModal}
//                       className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 shrink-0"
//                       aria-label="Close"
//                     >
//                       <X className="w-4 h-4" />
//                     </button>
//                   </div>

//                   <form
//                     onSubmit={submitKycUpdate}
//                     className="p-4 md:p-5 space-y-3.5 md:space-y-4"
//                   >
//                     <label className="block text-xs font-medium text-gray-700">
//                       Date of birth
//                       <input
//                         type="date"
//                         required
//                         value={editForm.dateOfBirth}
//                         onChange={(e) =>
//                           setEditForm((s) => ({
//                             ...s,
//                             dateOfBirth: e.target.value,
//                           }))
//                         }
//                         className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
//                       />
//                     </label>

//                     <label className="block text-xs font-medium text-gray-700">
//                       Permanent address
//                       <textarea
//                         required
//                         value={editForm.permanentAddress}
//                         onChange={(e) =>
//                           setEditForm((s) => ({
//                             ...s,
//                             permanentAddress: e.target.value,
//                           }))
//                         }
//                         rows={3}
//                         className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-y"
//                       />
//                     </label>
//                     {/*
//                     <label className="block text-xs font-medium text-gray-700">
//                       Contact number
//                       <input
//                         type="tel"
//                         inputMode="numeric"
//                         required
//                         maxLength={10}
//                         value={editForm.contactNumber}
//                         onChange={(e) =>
//                           setEditForm((s) => ({
//                             ...s,
//                             contactNumber: e.target.value
//                               .replace(/\D/g, '')
//                               .slice(0, 10),
//                           }))
//                         }
//                         placeholder="10-digit mobile number"
//                         className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
//                       />
//                     </label> */}

//                     <label className="block text-xs font-medium text-gray-700">
//                       PAN card number
//                       <input
//                         type="text"
//                         inputMode="text"
//                         autoCapitalize="characters"
//                         required
//                         maxLength={10}
//                         value={editForm.panCardNumber}
//                         onChange={(e) =>
//                           setEditForm((s) => ({
//                             ...s,
//                             panCardNumber: e.target.value.toUpperCase(),
//                           }))
//                         }
//                         placeholder="e.g. ABCDE1234F"
//                         className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase"
//                       />
//                     </label>

//                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 md:gap-3">
//                       {[
//                         [
//                           'aadhaarFront',
//                           'Aadhaar Front',
//                           kycState.aadhaarFront,
//                         ],
//                         ['aadhaarBack', 'Aadhaar Back', kycState.aadhaarBack],
//                         ['panCard', 'PAN Card', kycState.panCard],
//                       ].map(([key, label, existing]) => {
//                         const hasDoc = Boolean(files[key]?.name || existing);
//                         const actionLabel = hasDoc
//                           ? `Re-upload ${label}`
//                           : 'Click to upload';
//                         const imagePreviewSrc =
//                           filePreviews[key] ||
//                           (existing && /\.(png|jpe?g|webp|gif)$/i.test(existing)
//                             ? existing
//                             : '');
//                         return (
//                           <label
//                             key={key}
//                             className={`rounded-xl border border-gray-200 p-2.5 md:p-3 text-center bg-gray-50 hover:bg-gray-100 cursor-pointer ${
//                               key === 'panCard'
//                                 ? 'col-span-2 sm:col-span-1'
//                                 : ''
//                             }`}
//                           >
//                             <input
//                               type="file"
//                               accept="image/*,.pdf"
//                               className="hidden"
//                               onChange={(e) => {
//                                 const file = e.target.files?.[0] || null;
//                                 setFiles((s) => ({ ...s, [key]: file }));
//                                 makePreviewUrl(key, file);
//                               }}
//                             />
//                             {imagePreviewSrc ? (
//                               <img
//                                 src={imagePreviewSrc}
//                                 alt={label}
//                                 className="h-16 w-full object-cover rounded-lg border border-gray-200 mx-auto"
//                               />
//                             ) : (
//                               <Upload className="w-4 h-4 mx-auto text-gray-400" />
//                             )}
//                             <p className="text-xs font-semibold text-gray-800 mt-1">
//                               {label}
//                             </p>
//                             <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 text-center">
//                               {actionLabel}
//                             </p>
//                             {hasDoc && !imagePreviewSrc && (
//                               <p className="text-[10px] text-green-600 mt-1 font-medium truncate max-w-full">
//                                 {files[key]?.name || existing?.split('/').pop()}
//                               </p>
//                             )}
//                           </label>
//                         );
//                       })}
//                     </div>

//                     <div className="mt-3 flex gap-2 bg-[#EFF6FF] border border-[#BEDBFF] text-[#1C398E] text-xs rounded-lg p-3">
//                       <p>
//                         <span className="font-semibold">Tips:</span> Ensure
//                         documents are clear, unblurred, and all corners are
//                         visible. Accepted formats: JPG, PNG, PDF (Max 5MB).
//                       </p>
//                     </div>

//                     <div className="space-y-3">
//                       <p className="text-sm font-semibold text-black">
//                         Live Photo Check
//                       </p>

//                       <div className="rounded-xl border border-gray-200 bg-slate-50/60 min-h-[260px] flex flex-col overflow-hidden">
//                         {selfiePhase === 'idle' ? (
//                           <div className="flex flex-col items-center justify-center flex-1 px-4 py-10 gap-3">
//                             <div className="w-24 h-24 rounded-full border border-[#CBD5E1] bg-white flex items-center justify-center">
//                               <Camera
//                                 className="w-9 h-9 text-gray-400"
//                                 aria-hidden
//                               />
//                             </div>
//                             <p className="text-xs text-gray-500 text-center max-w-[220px]">
//                               Please ensure your face is clearly visible
//                             </p>
//                             <button
//                               type="button"
//                               onClick={startSelfieCamera}
//                               className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-[#F37021] bg-white text-[#F37021] text-xs font-medium hover:bg-orange-50 transition-colors"
//                             >
//                               <Camera className="w-4 h-4" aria-hidden />
//                               Take Selfie
//                             </button>
//                           </div>
//                         ) : null}

//                         {selfiePhase === 'live' ? (
//                           <div className="flex flex-col flex-1 p-3 gap-3 min-h-[260px]">
//                             <video
//                               ref={videoRef}
//                               playsInline
//                               muted
//                               className="w-full flex-1 min-h-[200px] max-h-[280px] rounded-lg object-cover bg-black"
//                             />
//                             <button
//                               type="button"
//                               onClick={captureSelfie}
//                               className="w-full py-2.5 rounded-lg bg-[#F37021] hover:bg-orange-600 text-white text-sm font-medium transition-colors"
//                             >
//                               Capture photo
//                             </button>
//                           </div>
//                         ) : null}

//                         {selfiePhase === 'preview' ? (
//                           <div className="flex flex-col flex-1 p-3 gap-3 min-h-[260px]">
//                             <img
//                               src={selfiePreviewUrl}
//                               alt="Selfie preview"
//                               className="w-full flex-1 min-h-[200px] max-h-[280px] rounded-lg object-cover bg-black"
//                             />
//                             <button
//                               type="button"
//                               onClick={retakeSelfie}
//                               className="text-sm font-medium text-[#F37021] hover:underline py-1"
//                             >
//                               Re-take selfie
//                             </button>
//                           </div>
//                         ) : null}
//                       </div>

//                       {selfieError ? (
//                         <p className="text-xs text-red-600">{selfieError}</p>
//                       ) : null}
//                     </div>

//                     {kycModalError ? (
//                       <p className="text-xs text-red-600">{kycModalError}</p>
//                     ) : null}
//                     {kycSubmitError ? (
//                       <p className="text-xs text-red-600">{kycSubmitError}</p>
//                     ) : null}

//                     <button
//                       type="submit"
//                       disabled={kycSubmitting}
//                       className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2.5 disabled:opacity-60"
//                     >
//                       {kycSubmitting
//                         ? 'Submitting KYC...'
//                         : 'Submit KYC Update'}
//                     </button>

//                     <div className="flex items-start gap-2 text-xs text-gray-500 leading-relaxed">
//                       <Shield
//                         className="w-4 h-4 text-[#00A63E] shrink-0 mt-0.5"
//                         aria-hidden
//                       />
//                       <p>
//                         Your data is{' '}
//                         <span className="font-semibold text-gray-700">
//                           encrypted and safe
//                         </span>
//                         . Verification status will be updated here once
//                         reviewed.
//                       </p>
//                     </div>
//                   </form>
//                 </div>
//               </div>
//             </div>,
//             document.body,
//           )
//         : null}
//     </div>
//   );
// };

// export default Profile;

'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
  CheckCircle2,
  Clock3,
  FileText,
  ShieldCheck,
  Upload,
  X,
  Eye,
  Camera,
  Shield,
} from 'lucide-react';
import { apiGetMyUserKyc, apiSubmitMyUserKyc } from '@/lib/api';

const KYC_STATUS_MAP = {
  approved: {
    label: 'Approved',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  pending: {
    label: 'Pending',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  //review
  in_review: {
    label: 'In Review',
    className: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  },
  rejected: {
    label: 'Rejected',
    className: 'border-red-200 bg-red-50 text-red-700',
  },
  not_submitted: {
    label: 'Not Submitted',
    className: 'border-gray-200 bg-gray-50 text-gray-700',
  },
};

function formatDateOnly(value) {
  if (!value) return 'Not provided';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Not provided';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function fileNameFromUrl(url) {
  if (!url) return '';
  try {
    const clean = String(url).split('?')[0];
    const parts = clean.split('/');
    return decodeURIComponent(parts[parts.length - 1] || 'Document');
  } catch {
    return 'Document';
  }
}

function isPdfDoc(url) {
  if (!url) return false;
  const clean = String(url).split('?')[0].toLowerCase();
  return clean.endsWith('.pdf');
}

const Profile = () => {
  const { user } = useSelector((s) => s.auth);
  const searchParams = useSearchParams();
  const [kycLoading, setKycLoading] = useState(true);
  const [kycState, setKycState] = useState({
    status: 'not_submitted',
    aadhaarFront: '',
    aadhaarBack: '',
    panCard: '',
    selfie: '',
    panCardNumber: '',
    dateOfBirth: '',
    permanentAddress: '',
    contactNumber: '',
    rejectionReason: '',
  });
  const [showKycModal, setShowKycModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [kycSubmitError, setKycSubmitError] = useState('');
  const [editForm, setEditForm] = useState({
    dateOfBirth: '',
    permanentAddress: '',
    contactNumber: '',
    panCardNumber: '',
  });
  const [files, setFiles] = useState({
    aadhaarFront: null,
    aadhaarBack: null,
    panCard: null,
  });
  const [filePreviews, setFilePreviews] = useState({
    aadhaarFront: '',
    aadhaarBack: '',
    panCard: '',
  });
  const [kycModalError, setKycModalError] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const selfieBlobRef = useRef(null);
  const [selfiePhase, setSelfiePhase] = useState('idle'); // idle | live | preview
  const [selfiePreviewUrl, setSelfiePreviewUrl] = useState('');
  const [selfieError, setSelfieError] = useState('');

  const stopSelfieStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startSelfieCamera = useCallback(async () => {
    setSelfieError('');
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setSelfieError('Camera is not available in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      stopSelfieStream();
      streamRef.current = stream;
      setSelfiePhase('live');
      requestAnimationFrame(() => {
        const el = videoRef.current;
        if (el) {
          el.srcObject = stream;
          el.play().catch(() => {});
        }
      });
    } catch (e) {
      setSelfieError(
        e?.name === 'NotAllowedError'
          ? 'Camera access was denied. Please allow the camera to take a selfie.'
          : 'Could not start the camera.',
      );
      setSelfiePhase('idle');
    }
  }, [stopSelfieStream]);

  const captureSelfie = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        stopSelfieStream();
        selfieBlobRef.current = blob;
        setSelfiePreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(blob);
        });
        setSelfiePhase('preview');
      },
      'image/jpeg',
      0.92,
    );
  }, [stopSelfieStream]);

  const retakeSelfie = useCallback(async () => {
    selfieBlobRef.current = null;
    setSelfiePreviewUrl((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return '';
    });
    stopSelfieStream();
    await startSelfieCamera();
  }, [startSelfieCamera, stopSelfieStream]);

  const makePreviewUrl = useCallback((key, file) => {
    setFilePreviews((prev) => {
      if (prev[key]) URL.revokeObjectURL(prev[key]);
      return {
        ...prev,
        [key]:
          file && file.type?.startsWith('image/')
            ? URL.createObjectURL(file)
            : '',
      };
    });
  }, []);

  useEffect(() => {
    setKycLoading(true);
    apiGetMyUserKyc()
      .then((res) => {
        const kyc = res.data?.kyc || {};
        const next = {
          status: String(kyc.status || 'not_submitted'),
          aadhaarFront: kyc.aadhaarFront || '',
          aadhaarBack: kyc.aadhaarBack || '',
          panCard: kyc.panCard || '',
          selfie: kyc.selfie || '',
          panCardNumber: kyc.panCardNumber || '',
          dateOfBirth: kyc.dateOfBirth || '',
          permanentAddress: kyc.permanentAddress || '',
          contactNumber: kyc.contactNumber || '',
          rejectionReason: kyc.rejectionReason || '',
        };
        setKycState(next);
        setEditForm({
          dateOfBirth: next.dateOfBirth
            ? String(next.dateOfBirth).slice(0, 10)
            : '',
          permanentAddress: next.permanentAddress || '',
          contactNumber: next.contactNumber || '',
          panCardNumber: next.panCardNumber || '',
        });
      })
      .catch(() => {
        setKycState({
          status: 'not_submitted',
          aadhaarFront: '',
          aadhaarBack: '',
          panCard: '',
          selfie: '',
          panCardNumber: '',
          dateOfBirth: '',
          permanentAddress: '',
          contactNumber: '',
          rejectionReason: '',
        });
      })
      .finally(() => setKycLoading(false));
  }, []);

  useEffect(() => {
    const shouldOpen = searchParams?.get('kyc') === 'update';
    if (shouldOpen) setShowKycModal(true);
  }, [searchParams]);

  const clearKycQueryParam = () => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.delete('kyc');
    window.history.replaceState({}, '', url.toString());
  };

  const openKycModal = () => {
    setKycSubmitError('');
    setKycModalError('');
    selfieBlobRef.current = null;
    setFiles({ aadhaarFront: null, aadhaarBack: null, panCard: null });
    setFilePreviews({ aadhaarFront: '', aadhaarBack: '', panCard: '' });
    setEditForm({
      dateOfBirth: kycState.dateOfBirth
        ? String(kycState.dateOfBirth).slice(0, 10)
        : '',
      permanentAddress: kycState.permanentAddress || '',
      contactNumber: kycState.contactNumber || '',
      panCardNumber: kycState.panCardNumber || '',
    });
    if (kycState.selfie) {
      setSelfiePhase('preview');
      setSelfiePreviewUrl(kycState.selfie);
    } else {
      setSelfiePhase('idle');
      setSelfiePreviewUrl('');
    }
    setShowKycModal(true);
  };

  const closeKycModal = () => {
    setShowKycModal(false);
    stopSelfieStream();
    setSelfiePhase('idle');
    setSelfieError('');
    selfieBlobRef.current = null;
    setSelfiePreviewUrl((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return '';
    });
    clearKycQueryParam();
  };

  useEffect(() => {
    if (!showKycModal) {
      stopSelfieStream();
      setSelfiePhase('idle');
      setSelfieError('');
      setSelfiePreviewUrl((prev) => {
        if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
        return '';
      });
    }
  }, [showKycModal, stopSelfieStream]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (showKycModal) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [showKycModal]);

  useEffect(
    () => () => {
      Object.values(filePreviews).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // const editContactDigits = String(editForm.contactNumber || '').replace(
  //   /\D/g,
  //   '',
  // );
  const editPanCardNumberValue = String(editForm.panCardNumber || '')
    .trim()
    .toUpperCase();
  const editPanCardNumberValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(
    editPanCardNumberValue,
  );
  const editDobValue = editForm.dateOfBirth?.trim() || '';
  const editDobDate = editDobValue ? new Date(editDobValue) : null;
  const editDobValidDate = Boolean(
    editDobDate && !Number.isNaN(editDobDate.getTime()),
  );
  const editDobNotFuture = editDobValidDate && editDobDate <= new Date();
  const editDobAdult =
    editDobValidDate &&
    editDobDate <=
      new Date(
        new Date().getFullYear() - 18,
        new Date().getMonth(),
        new Date().getDate(),
      );
  const editDobOk = editDobValidDate && editDobNotFuture && editDobAdult;
  // const editPersonalOk =
  //   editDobOk &&
  //   editForm.permanentAddress.trim().length >= 5 &&
  //   editContactDigits.length === 10 &&
  //   editPanCardNumberValid;
  const editPersonalOk =
    editDobOk &&
    editForm.permanentAddress.trim().length >= 5 &&
    editPanCardNumberValid;

  const submitKycUpdate = async (e) => {
    e.preventDefault();
    setKycSubmitError('');
    setKycModalError('');
    if (!editPersonalOk) {
      if (!editDobValue) {
        setKycModalError('Please enter your date of birth.');
      } else if (!editDobValidDate) {
        setKycModalError('Please enter a valid date of birth.');
      } else if (!editDobNotFuture) {
        setKycModalError('Date of birth cannot be in the future.');
      } else if (!editDobAdult) {
        setKycModalError('You must be at least 18 years old.');
      } else if (editForm.permanentAddress.trim().length < 5) {
        setKycModalError('Please enter a valid permanent address.');
        // } else if (editContactDigits.length !== 10) {
        //   setKycModalError('Please enter a valid 10-digit contact number.');
        // } else if (!editPanCardNumberValid) {
      } else if (!editPanCardNumberValid) {
        setKycModalError(
          'Please enter a valid 10-character PAN number (e.g. ABCDE1234F).',
        );
      } else {
        setKycModalError('Please fill in all required fields correctly.');
      }
      return;
    }

    if (!selfieBlobRef.current && !kycState.selfie) {
      setKycModalError('Please take a live selfie to continue.');
      return;
    }

    setKycSubmitting(true);
    try {
      // const formData = new FormData();
      // formData.append('dateOfBirth', editForm.dateOfBirth);
      // formData.append('permanentAddress', editForm.permanentAddress);
      // formData.append('contactNumber', editForm.contactNumber);
      // formData.append('panCardNumber', editPanCardNumberValue);
      const formData = new FormData();
      formData.append('dateOfBirth', editForm.dateOfBirth);
      formData.append('permanentAddress', editForm.permanentAddress);
      formData.append('panCardNumber', editPanCardNumberValue);
      if (files.aadhaarFront)
        formData.append('aadhaarFront', files.aadhaarFront);
      if (files.aadhaarBack) formData.append('aadhaarBack', files.aadhaarBack);
      if (files.panCard) formData.append('panCard', files.panCard);
      if (selfieBlobRef.current)
        formData.append('selfie', selfieBlobRef.current, 'selfie.jpg');

      const res = await apiSubmitMyUserKyc(formData);
      const kyc = res.data?.kyc || {};
      const next = {
        status: String(kyc.status || 'pending'),
        aadhaarFront: kyc.aadhaarFront || '',
        aadhaarBack: kyc.aadhaarBack || '',
        panCard: kyc.panCard || '',
        selfie: kyc.selfie || '',
        panCardNumber: kyc.panCardNumber || editPanCardNumberValue || '',
        dateOfBirth: kyc.dateOfBirth || editForm.dateOfBirth || '',
        permanentAddress:
          kyc.permanentAddress || editForm.permanentAddress || '',
        contactNumber: kyc.contactNumber || editForm.contactNumber || '',
        rejectionReason: kyc.rejectionReason || '',
      };
      setKycState(next);
      closeKycModal();
    } catch (err) {
      setKycSubmitError(
        err?.response?.data?.message ||
          'Failed to update KYC. Please try again.',
      );
    } finally {
      setKycSubmitting(false);
    }
  };

  const normalizedStatus = String(
    kycState.status || 'not_submitted',
  ).toLowerCase();
  const statusMeta =
    KYC_STATUS_MAP[normalizedStatus] || KYC_STATUS_MAP.not_submitted;
  const docs = [
    { key: 'aadhaarFront', label: 'Aadhaar Front', url: kycState.aadhaarFront },
    { key: 'aadhaarBack', label: 'Aadhaar Back', url: kycState.aadhaarBack },
    { key: 'panCard', label: 'PAN Card', url: kycState.panCard },
    { key: 'selfie', label: 'Live Photo', url: kycState.selfie },
  ];

  return (
    <div>
      {/* <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">My Profile & KYC</h1>
        <button
          type="button"
          onClick={openKycModal}
          className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3.5 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-100"
        >
        
          Update KYC
        </button>
      </div> */}

      <div className="mb-4 md:mb-6 flex items-center justify-between gap-2 md:gap-3">
        <h1 className="text-base md:text-xl font-bold text-black leading-snug">
          My Profile & KYC
        </h1>
        {normalizedStatus === 'approved' ? (
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 md:px-3 py-1 md:py-1.5 text-[11px] md:text-xs font-semibold shrink-0 whitespace-nowrap ${KYC_STATUS_MAP.approved.className}`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {KYC_STATUS_MAP.approved.label}
          </span>
        ) : (
          <button
            type="button"
            onClick={openKycModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#F97316] hover:bg-orange-600 active:scale-[0.98] px-3 md:px-4 py-1.5 md:py-2 text-[11px] md:text-xs font-bold text-white shadow-[0_6px_14px_rgba(249,115,22,0.35)] transition-all shrink-0 whitespace-nowrap"
          >
            <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4" />
            Update KYC Now
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 shadow-sm">
        {/* <h2 className="text-base font-semibold text-gray-900 mb-4">Details</h2> */}
        <div className="mb-5 md:mb-6">
          <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2.5 md:mb-3">
            Account Details
          </h3>
          {/* <div className="grid grid-cols-2 gap-2 sm:gap-2.5 md:gap-4">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-2 sm:p-3 md:p-4">
              <p className="text-[8px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wide text-gray-500">
                Full Name
              </p>
              <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900 truncate">
                {user?.name || user?.fullName || 'Not provided'}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-2 sm:p-3 md:p-4">
              <p className="text-[8px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wide text-gray-500">
                Email
              </p>
              <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900 break-all">
                {user?.email || user?.emailAddress || 'Not provided'}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-2 sm:p-3 md:p-4">
              <p className="text-[8px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wide text-gray-500">
                Contact Number
              </p>
              <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900">
                {user?.mobileNumber || 'Not provided'}
              </p>
            </div>
          </div> */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 md:gap-4">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-2 sm:p-3 md:p-4">
              <p className="text-[8px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wide text-gray-500">
                Full Name
              </p>
              <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900 truncate">
                {user?.name || user?.fullName || 'Not provided'}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-2 sm:p-3 md:p-4">
              <p className="text-[8px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wide text-gray-500">
                Email
              </p>
              <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900 break-all">
                {user?.email || user?.emailAddress || 'Not provided'}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-2 sm:p-3 md:p-4">
              <p className="text-[8px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wide text-gray-500">
                Contact Number
              </p>
              <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900">
                {user?.mobileNumber || 'Not provided'}
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3 md:mb-4">
            <div className="flex items-center gap-2">
              {/* <ShieldCheck className="w-5 h-5 text-orange-500" /> */}
              <h2 className="text-sm md:text-base font-semibold text-gray-900">
                KYC Details
              </h2>
            </div>
            {/* {kycLoading ? (
              <span className="text-xs text-gray-500">Loading...</span>
            ) : (
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.className}`}
              >
                {normalizedStatus === 'approved' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Clock3 className="w-3.5 h-3.5" />
                )}
                {statusMeta.label}
              </span>
            )} */}
          </div>

          {normalizedStatus === 'rejected' ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 md:px-4 py-2.5 md:py-3">
              <p className="text-xs md:text-sm font-semibold text-red-700 leading-snug">
                KYC rejected by admin
              </p>
              <p className="text-[11px] md:text-xs text-red-600 mt-1 leading-relaxed">
                {kycState.rejectionReason ||
                  'Please update your documents and resubmit KYC.'}
              </p>
            </div>
          ) : null}

          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Date of Birth
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {formatDateOnly(kycState.dateOfBirth)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Contact Number
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {kycState.contactNumber || 'Not provided'}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 md:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Permanent Address
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900 whitespace-pre-wrap break-words">
                {kycState.permanentAddress || 'Not provided'}
              </p>
            </div>
          </div> */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 md:gap-4 mb-4 md:mb-5">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-2 sm:p-3 md:p-4">
              <p className="text-[8px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wide text-gray-500">
                Date of Birth
              </p>
              <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900">
                {formatDateOnly(kycState.dateOfBirth)}
              </p>
            </div>
            {/* <div className="rounded-xl border border-gray-100 bg-gray-50 p-2 sm:p-3 md:p-4">
              <p className="text-[8px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wide text-gray-500">
                Contact Number
              </p>
              <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900">
                {kycState.contactNumber || 'Not provided'}
              </p>
            </div> */}
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-2 sm:p-3 md:p-4">
              <p className="text-[8px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wide text-gray-500">
                PAN Card Number
              </p>
              <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900 uppercase">
                {kycState.panCardNumber || 'Not provided'}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-2 sm:p-3 md:p-4">
              <p className="text-[8px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wide text-gray-500">
                Permanent Address
              </p>
              <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900 whitespace-pre-wrap break-words leading-relaxed">
                {kycState.permanentAddress || 'Not provided'}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-2.5 md:mb-3">
              Uploaded Documents
            </h3>
            {/* <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 md:gap-3">
              {docs.map((doc) => (
                <article
                  key={doc.key}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-2.5 md:p-3"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5 md:mb-2">
                    <p className="text-[11px] md:text-xs font-semibold text-gray-800 leading-snug">
                      {doc.label}
                    </p>
                    <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 shrink-0" />
                  </div>
                  {doc.url ? (
                    <>
                      <div className="h-28 sm:h-40 rounded-lg border border-gray-200 bg-white overflow-hidden">
                        {isPdfDoc(doc.url) ? (
                          <iframe
                            src={doc.url}
                            title={`${doc.label} preview`}
                            className="w-full h-full"
                          />
                        ) : (
                          <img
                            src={doc.url}
                            alt={`${doc.label} document`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <p className="mt-1.5 md:mt-2 text-[10px] md:text-[11px] text-gray-500 truncate">
                        {fileNameFromUrl(doc.url)}
                      </p>
                    </>
                  ) : (
                    <div className="h-28 sm:h-40 rounded-lg border border-dashed border-gray-300 bg-white flex items-center justify-center">
                      <p className="text-[11px] md:text-xs text-gray-500">
                        Not uploaded
                      </p>
                    </div>
                  )}
                </article>
              ))}
            </div> */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2.5 md:gap-3">
              {docs.map((doc) => (
                <article
                  key={doc.key}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-1.5 sm:p-2.5 md:p-3"
                >
                  <div className="flex items-start justify-between gap-1 sm:gap-2 mb-1 sm:mb-1.5 md:mb-2">
                    <p className="text-[9px] sm:text-[11px] md:text-xs font-semibold text-gray-800 leading-snug truncate">
                      {doc.label}
                    </p>
                    <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-gray-400 shrink-0" />
                  </div>
                  {doc.url ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="group relative block w-full h-16 sm:h-28 md:h-40 rounded-lg border border-gray-200 bg-white overflow-hidden"
                      >
                        {isPdfDoc(doc.url) ? (
                          <iframe
                            src={doc.url}
                            title={`${doc.label} preview`}
                            className="w-full h-full pointer-events-none"
                          />
                        ) : (
                          <img
                            src={doc.url}
                            alt={`${doc.label} document`}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors opacity-0 group-hover:opacity-100">
                          <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </span>
                      </button>
                      <p className="mt-1 sm:mt-1.5 md:mt-2 text-[8px] sm:text-[10px] md:text-[11px] text-gray-500 truncate">
                        {fileNameFromUrl(doc.url)}
                      </p>
                    </>
                  ) : (
                    <div className="h-16 sm:h-28 md:h-40 rounded-lg border border-dashed border-gray-300 bg-white flex items-center justify-center">
                      <p className="text-[9px] sm:text-[11px] md:text-xs text-gray-500">
                        Not uploaded
                      </p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      {previewDoc && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 px-4 py-8"
              onClick={() => setPreviewDoc(null)}
            >
              <div
                className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">
                    {previewDoc.label}
                  </p>
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(null)}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
                    aria-label="Close preview"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-[calc(85vh-52px)] overflow-auto bg-gray-50 flex items-center justify-center">
                  {isPdfDoc(previewDoc.url) ? (
                    <iframe
                      src={previewDoc.url}
                      title={`${previewDoc.label} full preview`}
                      className="w-full h-[75vh]"
                    />
                  ) : (
                    <img
                      src={previewDoc.url}
                      alt={`${previewDoc.label} full document`}
                      className="w-full h-auto object-contain"
                    />
                  )}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {showKycModal && typeof document !== 'undefined'
        ? createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-3 md:px-4 py-6">
              <div className="w-full max-w-lg max-h-[90vh] rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden">
                <div className="max-h-[90vh] overflow-y-auto rounded-2xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <div className="flex items-center justify-between px-4 md:px-5 py-3.5 md:py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        Update KYC
                      </p>
                      <p className="text-[11px] md:text-xs text-gray-500 mt-0.5">
                        Submit corrected documents for re-verification
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={closeKycModal}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 shrink-0"
                      aria-label="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form
                    onSubmit={submitKycUpdate}
                    className="p-4 md:p-5 space-y-3.5 md:space-y-4"
                  >
                    <label className="block text-xs font-medium text-gray-700">
                      Date of birth
                      <input
                        type="date"
                        required
                        value={editForm.dateOfBirth}
                        onChange={(e) =>
                          setEditForm((s) => ({
                            ...s,
                            dateOfBirth: e.target.value,
                          }))
                        }
                        className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      />
                    </label>

                    <label className="block text-xs font-medium text-gray-700">
                      Permanent address
                      <textarea
                        required
                        value={editForm.permanentAddress}
                        onChange={(e) =>
                          setEditForm((s) => ({
                            ...s,
                            permanentAddress: e.target.value,
                          }))
                        }
                        rows={3}
                        className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-y"
                      />
                    </label>
                    {/* 
                    <label className="block text-xs font-medium text-gray-700">
                      Contact number
                      <input
                        type="tel"
                        inputMode="numeric"
                        required
                        maxLength={10}
                        value={editForm.contactNumber}
                        onChange={(e) =>
                          setEditForm((s) => ({
                            ...s,
                            contactNumber: e.target.value
                              .replace(/\D/g, '')
                              .slice(0, 10),
                          }))
                        }
                        placeholder="10-digit mobile number"
                        className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      />
                    </label> */}

                    <label className="block text-xs font-medium text-gray-700">
                      PAN card number
                      <input
                        type="text"
                        inputMode="text"
                        autoCapitalize="characters"
                        required
                        maxLength={10}
                        value={editForm.panCardNumber}
                        onChange={(e) =>
                          setEditForm((s) => ({
                            ...s,
                            panCardNumber: e.target.value.toUpperCase(),
                          }))
                        }
                        placeholder="e.g. ABCDE1234F"
                        className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase"
                      />
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 md:gap-3">
                      {[
                        [
                          'aadhaarFront',
                          'Aadhaar Front',
                          kycState.aadhaarFront,
                        ],
                        ['aadhaarBack', 'Aadhaar Back', kycState.aadhaarBack],
                        ['panCard', 'PAN Card', kycState.panCard],
                      ].map(([key, label, existing]) => {
                        const hasDoc = Boolean(files[key]?.name || existing);
                        const actionLabel = hasDoc
                          ? `Re-upload ${label}`
                          : 'Click to upload';
                        const imagePreviewSrc =
                          filePreviews[key] ||
                          (existing && /\.(png|jpe?g|webp|gif)$/i.test(existing)
                            ? existing
                            : '');
                        return (
                          <label
                            key={key}
                            className={`rounded-xl border border-gray-200 p-2.5 md:p-3 text-center bg-gray-50 hover:bg-gray-100 cursor-pointer ${
                              key === 'panCard'
                                ? 'col-span-2 sm:col-span-1'
                                : ''
                            }`}
                          >
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setFiles((s) => ({ ...s, [key]: file }));
                                makePreviewUrl(key, file);
                              }}
                            />
                            {imagePreviewSrc ? (
                              <img
                                src={imagePreviewSrc}
                                alt={label}
                                className="h-16 w-full object-cover rounded-lg border border-gray-200 mx-auto"
                              />
                            ) : (
                              <Upload className="w-4 h-4 mx-auto text-gray-400" />
                            )}
                            <p className="text-xs font-semibold text-gray-800 mt-1">
                              {label}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 text-center">
                              {actionLabel}
                            </p>
                            {hasDoc && !imagePreviewSrc && (
                              <p className="text-[10px] text-green-600 mt-1 font-medium truncate max-w-full">
                                {files[key]?.name || existing?.split('/').pop()}
                              </p>
                            )}
                          </label>
                        );
                      })}
                    </div>

                    <div className="mt-3 flex gap-2 bg-[#EFF6FF] border border-[#BEDBFF] text-[#1C398E] text-xs rounded-lg p-3">
                      <p>
                        <span className="font-semibold">Tips:</span> Ensure
                        documents are clear, unblurred, and all corners are
                        visible. Accepted formats: JPG, PNG, PDF (Max 5MB).
                      </p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-black">
                        Live Photo Check
                      </p>

                      <div className="rounded-xl border border-gray-200 bg-slate-50/60 min-h-[260px] flex flex-col overflow-hidden">
                        {selfiePhase === 'idle' ? (
                          <div className="flex flex-col items-center justify-center flex-1 px-4 py-10 gap-3">
                            <div className="w-24 h-24 rounded-full border border-[#CBD5E1] bg-white flex items-center justify-center">
                              <Camera
                                className="w-9 h-9 text-gray-400"
                                aria-hidden
                              />
                            </div>
                            <p className="text-xs text-gray-500 text-center max-w-[220px]">
                              Please ensure your face is clearly visible
                            </p>
                            <button
                              type="button"
                              onClick={startSelfieCamera}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-[#F37021] bg-white text-[#F37021] text-xs font-medium hover:bg-orange-50 transition-colors"
                            >
                              <Camera className="w-4 h-4" aria-hidden />
                              Take Selfie
                            </button>
                          </div>
                        ) : null}

                        {selfiePhase === 'live' ? (
                          <div className="flex flex-col flex-1 p-3 gap-3 min-h-[260px]">
                            <video
                              ref={videoRef}
                              playsInline
                              muted
                              className="w-full flex-1 min-h-[200px] max-h-[280px] rounded-lg object-cover bg-black"
                            />
                            <button
                              type="button"
                              onClick={captureSelfie}
                              className="w-full py-2.5 rounded-lg bg-[#F37021] hover:bg-orange-600 text-white text-sm font-medium transition-colors"
                            >
                              Capture photo
                            </button>
                          </div>
                        ) : null}

                        {selfiePhase === 'preview' ? (
                          <div className="flex flex-col flex-1 p-3 gap-3 min-h-[260px]">
                            <img
                              src={selfiePreviewUrl}
                              alt="Selfie preview"
                              className="w-full flex-1 min-h-[200px] max-h-[280px] rounded-lg object-cover bg-black"
                            />
                            <button
                              type="button"
                              onClick={retakeSelfie}
                              className="text-sm font-medium text-[#F37021] hover:underline py-1"
                            >
                              Re-take selfie
                            </button>
                          </div>
                        ) : null}
                      </div>

                      {selfieError ? (
                        <p className="text-xs text-red-600">{selfieError}</p>
                      ) : null}
                    </div>

                    {kycModalError ? (
                      <p className="text-xs text-red-600">{kycModalError}</p>
                    ) : null}
                    {kycSubmitError ? (
                      <p className="text-xs text-red-600">{kycSubmitError}</p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={kycSubmitting}
                      className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2.5 disabled:opacity-60"
                    >
                      {kycSubmitting
                        ? 'Submitting KYC...'
                        : 'Submit KYC Update'}
                    </button>

                    <div className="flex items-start gap-2 text-xs text-gray-500 leading-relaxed">
                      <Shield
                        className="w-4 h-4 text-[#00A63E] shrink-0 mt-0.5"
                        aria-hidden
                      />
                      <p>
                        Your data is{' '}
                        <span className="font-semibold text-gray-700">
                          encrypted and safe
                        </span>
                        . Verification status will be updated here once
                        reviewed.
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};

export default Profile;
