// 'use client';

// import { useEffect } from 'react';
// import {
//   CheckCircle2,
//   CircleCheck,
//   FileSearchCorner,
//   RefreshCw,
//   Search,
//   X,
// } from 'lucide-react';

// export default function PickupScheduledModal({
//   open,
//   onClose,
//   pickupSubtitle,
//   refundableDeposit,
//   extensionFine,
//   netEstimate,
//   onViewReturnStatus,
// }) {
//   useEffect(() => {
//     if (!open) return;
//     const prevBody = document.body.style.overflow;
//     const prevHtml = document.documentElement.style.overflow;
//     document.body.style.overflow = 'hidden';
//     document.documentElement.style.overflow = 'hidden';
//     return () => {
//       document.body.style.overflow = prevBody;
//       document.documentElement.style.overflow = prevHtml;
//     };
//   }, [open]);

//   if (!open) return null;

//   const pendingRent = Math.max(0, extensionFine);

//   return (
//     <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden p-4">
//       <div className="absolute inset-0 z-0 bg-black/50" aria-hidden />
//       <div className="relative z-10 w-full max-w-xl max-h-[min(90vh,920px)] overflow-y-auto rounded-2xl bg-white shadow-xl border border-gray-100 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent">
//         <button
//           type="button"
//           onClick={onClose}
//           className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
//           aria-label="Close dialog"
//         >
//           <X className="h-5 w-5" strokeWidth={2} />
//         </button>
//         <div className="p-6 sm:p-7 pr-12 sm:pr-14">
//           <div className="flex items-center gap-4 text-left">
//             <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full ">
//               <CircleCheck className="h-10 w-10 text-[#00A63E]" aria-hidden />
//             </div>
//             <div className="min-w-0 flex-1">
//               <h2 className="text-lg font-bold  text-black sm:text-2xl">
//                 Pickup Scheduled!
//               </h2>
//               <p className=" text-sm text-gray-600">{pickupSubtitle}</p>
//             </div>
//           </div>

//           <div className="my-5 border-t border-gray-100" />

//           <div className="rounded-xl border-2 border-[#B9F8CF] bg-[#EFF6FF] p-4">
//             <div className="flex items-center gap-2 text-black font-semibold text-sm">
//               <span className="inline-flex h-8 w-8 items-center font-bold justify-center ">
//                 <RefreshCw className="w-4 h-4 text-[#00A63E]" />
//               </span>
//               Estimated Refund Details
//             </div>
//             <ul className="mt-3 space-y-2 text-sm">
//               <li className="flex justify-between gap-3">
//                 <span className="text-[#64748B]">Security Deposit Paid</span>
//                 <span className="font-semibold text-[#00A63E]">
//                   +₹{Number(refundableDeposit || 0).toLocaleString('en-IN')}
//                 </span>
//               </li>
//               <li className="flex justify-between gap-3">
//                 <span className="text-[#64748B]">Pending Rent Dues</span>
//                 <span className="font-medium text-gray-900">
//                   -₹{pendingRent.toLocaleString('en-IN')}
//                 </span>
//               </li>
//               <li className="flex justify-between gap-3 items-start">
//                 <span className="text-[#64748B] flex flex-wrap items-center gap-1.5">
//                   Damage/Repair Cost
//                   <span className="rounded-xl bg-[#FEF3C6] px-2 py-0.4 text-[10px] font-bold text-[#BB4D00]">
//                     TBD
//                   </span>
//                 </span>
//                 <span className="text-xs font-semibold text-orange-600 whitespace-nowrap">
//                   After QC
//                 </span>
//               </li>
//             </ul>
//             <div className="my-3 border-t border-2 border-[#7BF1A8]" />
//             <div className="flex justify-between gap-3 items-baseline">
//               <span className="font-bold text-gray-900">Estimated Refund</span>
//               <span className="text-lg font-bold text-[#00A63E]">
//                 ~ ₹{Number(netEstimate || 0).toLocaleString('en-IN')}
//               </span>
//             </div>
//             <p className="mt-2 text-xs text-gray-500 leading-relaxed">
//               Final amount will be credited to your original payment source
//               within 7 days after quality check.
//             </p>
//           </div>

//           <div className="mt-4 rounded-xl bg-[#F9FAFB]  p-4 text-left">
//             <p className="font-semibold text-black text-sm">
//               What Happens Next?
//             </p>
//             <ul className="mt-3 space-y-2 text-sm text-[#64748B]">
//               <li className="flex gap-2">
//                 <CheckCircle2 className="w-4 h-4 text-[#00A63E] shrink-0 mt-0.5" />
//                 <span>
//                   Our team will arrive at your location on the scheduled date
//                   &amp; time
//                 </span>
//               </li>
//               <li className="flex gap-2">
//                 <FileSearchCorner className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
//                 <span>
//                   Quality check will be conducted to assess the item condition
//                 </span>
//               </li>
//               <li className="flex gap-2">
//                 <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-orange-100 mt-0.5">
//                   <RefreshCw className="w-3 h-3 text-[#E17100]" />
//                 </span>
//                 <span>
//                   Refund will be processed within 7 days if no damage is found
//                 </span>
//               </li>
//             </ul>
//           </div>

//           <button
//             type="button"
//             onClick={onViewReturnStatus}
//             className="mt-5 w-full rounded-xl bg-[#FF6F00] py-3.5 text-center text-sm font-semibold text-white hover:bg-[#e56400] transition-colors"
//           >
//             View Return Status
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircle2,
  CircleCheck,
  FileSearchCorner,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';

export default function PickupScheduledModal({
  open,
  onClose,
  pickupSubtitle,
  refundableDeposit,
  extensionFine,
  netEstimate,
  onViewReturnStatus,
}) {
  useEffect(() => {
    if (!open) return;
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, [open]);
  if (!open) return null;
  if (typeof document === 'undefined') return null;

  const pendingRent = Math.max(0, extensionFine);

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden p-4">
      <div className="absolute inset-0 z-0 bg-black/50" aria-hidden />
      <div className="relative z-10 w-full max-w-xl max-h-[min(90vh,920px)] overflow-y-auto rounded-2xl bg-white shadow-xl border border-gray-100 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" strokeWidth={2} />
        </button>
        <div className="p-6 sm:p-7 pr-12 sm:pr-14">
          <div className="flex items-center gap-4 text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full ">
              <CircleCheck className="h-10 w-10 text-[#00A63E]" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold  text-black sm:text-2xl">
                Pickup Scheduled!
              </h2>
              <p className=" text-sm text-gray-600">{pickupSubtitle}</p>
            </div>
          </div>

          <div className="my-5 border-t border-gray-100" />

          <div className="rounded-xl border-2 border-[#B9F8CF] bg-[#EFF6FF] p-4">
            <div className="flex items-center gap-2 text-black font-semibold text-sm">
              <span className="inline-flex h-8 w-8 items-center font-bold justify-center ">
                <RefreshCw className="w-4 h-4 text-[#00A63E]" />
              </span>
              Estimated Refund Details
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex justify-between gap-3">
                <span className="text-[#64748B]">Security Deposit Paid</span>
                <span className="font-semibold text-[#00A63E]">
                  +₹{Number(refundableDeposit || 0).toLocaleString('en-IN')}
                </span>
              </li>
              <li className="flex justify-between gap-3">
                <span className="text-[#64748B]">Pending Rent Dues</span>
                <span className="font-medium text-gray-900">
                  -₹{pendingRent.toLocaleString('en-IN')}
                </span>
              </li>
              <li className="flex justify-between gap-3 items-start">
                <span className="text-[#64748B] flex flex-wrap items-center gap-1.5">
                  Damage/Repair Cost
                  <span className="rounded-xl bg-[#FEF3C6] px-2 py-0.4 text-[10px] font-bold text-[#BB4D00]">
                    TBD
                  </span>
                </span>
                <span className="text-xs font-semibold text-orange-600 whitespace-nowrap">
                  After QC
                </span>
              </li>
            </ul>
            <div className="my-3 border-t border-2 border-[#7BF1A8]" />
            <div className="flex justify-between gap-3 items-baseline">
              <span className="font-bold text-gray-900">Estimated Refund</span>
              <span className="text-lg font-bold text-[#00A63E]">
                ~ ₹{Number(netEstimate || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-500 leading-relaxed">
              Final amount will be credited to your original payment source
              within 7 days after quality check.
            </p>
          </div>

          <div className="mt-4 rounded-xl bg-[#F9FAFB]  p-4 text-left">
            <p className="font-semibold text-black text-sm">
              What Happens Next?
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[#64748B]">
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00A63E] shrink-0 mt-0.5" />
                <span>
                  Our team will arrive at your location on the scheduled date
                  &amp; time
                </span>
              </li>
              <li className="flex gap-2">
                <FileSearchCorner className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Quality check will be conducted to assess the item condition
                </span>
              </li>
              <li className="flex gap-2">
                <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-orange-100 mt-0.5">
                  <RefreshCw className="w-3 h-3 text-[#E17100]" />
                </span>
                <span>
                  Refund will be processed within 7 days if no damage is found
                </span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={onViewReturnStatus}
            className="mt-5 w-full rounded-xl bg-[#FF6F00] py-3.5 text-center text-sm font-semibold text-white hover:bg-[#e56400] transition-colors"
          >
            View Return Status
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
