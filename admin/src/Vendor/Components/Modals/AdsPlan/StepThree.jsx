// import React, { useState } from 'react';
// import { useDispatch } from 'react-redux';
// import {
//   X,
//   ChevronLeft,
//   Wallet,
//   Smartphone,
//   CreditCard,
//   ShieldCheck,
// } from 'lucide-react';
// import { toast } from 'react-toastify';
// import { StepDots } from './../AdsPlan/StepOne';
// import { BOOST_PRICE } from './../AdsPlan/StepTwo';
// import { createAdsPlan } from '../../../../redux/slices/adsPlanSlice';

// const PAYMENT_METHODS = [
//   {
//     id: 'wallet',
//     label: 'Wallet Balance',

//     icon: Wallet,
//   },
//   {
//     id: 'upi',
//     label: 'UPI Payment',
//     sub: 'PhonePe, GPay, Paytm',
//     icon: Smartphone,
//   },
//   {
//     id: 'card',
//     label: 'Saved Card',
//     sub: '•••• •••• •••• 4532',
//     icon: CreditCard,
//   },
// ];

// /**
//  * StepThree — "Payment & Order Summary" modal.
//  *
//  * Props:
//  *  - open: boolean
//  *  - products: Array of the 2 chosen products
//  *  - schedules: { [productId]: { startDate, duration } }
//  *  - onBack: () => void, go back to StepTwo
//  *  - onClose: () => void, close entirely
//  *  - onConfirm: ({ total, method }) => void, called when "Confirm & Pay" is clicked
//  */
// export default function StepThree({
//   open,
//   products,
//   schedules,
//   onBack,
//   onClose,
//   onConfirm,
// }) {
//   const dispatch = useDispatch();
//   const [method, setMethod] = useState('wallet');
//   const [submitting, setSubmitting] = useState(false);

//   if (!open || !products || products.length === 0) return null;

//   const subtotal = products.length * BOOST_PRICE;
//   const discount = Math.round(subtotal * 0.02);
//   const total = subtotal - discount;

//   const handleConfirmPay = async () => {
//     setSubmitting(true);
//     const resultAction = await dispatch(
//       createAdsPlan({
//         planType: 'category_hero',
//         products: products.map((p) => ({ ...p, boostPrice: BOOST_PRICE })),
//         schedules,
//         subtotal,
//         discount,
//         total,
//         paymentMethod: method,
//       }),
//     );
//     setSubmitting(false);

//     if (createAdsPlan.fulfilled.match(resultAction)) {
//       toast.success('Boost order placed successfully!');
//       onConfirm({ total, method });
//     } else {
//       toast.error(resultAction.payload || 'Failed to place boost order');
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm sm:p-6">
//       <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
//         {/* Header */}
//         <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4 sm:px-7 sm:py-5">
//           <div className="flex items-start gap-3">
//             <button
//               onClick={onBack}
//               className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-gray-100 hover:text-slate-800"
//               aria-label="Back"
//             >
//               <ChevronLeft size={18} />
//             </button>
//             <div>
//               <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
//                 Category Hero Boost
//               </h2>
//               <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
//                 Get your products featured at #1 position
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center gap-4">
//             <StepDots step={3} />
//             <button
//               onClick={onClose}
//               className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-gray-100 hover:text-slate-700"
//               aria-label="Close"
//             >
//               <X size={18} />
//             </button>
//           </div>
//         </div>

//         {/* Body */}
//         <div className="hide-scrollbar flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
//           <h3 className="text-base font-bold text-slate-900 sm:text-[17px]">
//             Step 3: Payment & Order Summary
//           </h3>
//           <p className="mt-1 text-xs text-gray-500 sm:text-sm">
//             Review your order and complete payment
//           </p>

//           {/* Order Summary */}
//           <div className="mt-5 rounded-xl border border-gray-100 p-4 sm:p-5">
//             <p className="mb-3 text-sm font-semibold text-slate-800">
//               Order Summary
//             </p>
//             <div className="divide-y divide-gray-50">
//               {products.map((p) => {
//                 const s = schedules?.[p.id] || {};
//                 return (
//                   <div key={p.id} className="flex items-center gap-3 py-3">
//                     <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-gray-100">
//                       <img
//                         src={p.image}
//                         alt=""
//                         className="h-full w-full object-cover"
//                         onError={(e) => (e.currentTarget.style.opacity = 0)}
//                       />
//                     </div>
//                     <div className="flex-1">
//                       <p className="text-sm font-semibold text-slate-800">
//                         {p.name}
//                       </p>
//                       <p className="text-xs text-gray-400">
//                         Category Hero • {p.category}
//                       </p>
//                       <p className="text-[11px] text-gray-400">
//                         Starts: {s.startDate || 'Not set'} • {s.duration}
//                       </p>
//                     </div>
//                     <p className="text-sm font-bold text-slate-900">
//                       ₹{BOOST_PRICE}
//                     </p>
//                   </div>
//                 );
//               })}
//             </div>

//             <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3 text-sm">
//               <div className="flex justify-between text-gray-500">
//                 <span>
//                   Subtotal ({products.length} products × ₹{BOOST_PRICE})
//                 </span>
//                 <span>₹{subtotal}</span>
//               </div>
//               <div className="flex justify-between text-green-600">
//                 <span>Gold Partner Discount (2%)</span>
//                 <span>-₹{discount}</span>
//               </div>
//               <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold text-slate-900">
//                 <span>Total Amount</span>
//                 <span>₹{total}</span>
//               </div>
//             </div>
//           </div>

//           {/* Payment method */}
//           <div className="mt-5">
//             <p className="mb-3 text-sm font-semibold text-slate-800">
//               Select Payment Method
//             </p>
//             <div className="space-y-2.5">
//               {PAYMENT_METHODS.map((m) => {
//                 const Icon = m.icon;
//                 const active = method === m.id;
//                 return (
//                   <button
//                     key={m.id}
//                     onClick={() => setMethod(m.id)}
//                     className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
//                       active
//                         ? 'border-blue-400 bg-blue-50/60'
//                         : 'border-gray-200 hover:bg-gray-50'
//                     }`}
//                   >
//                     <div
//                       className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
//                         active
//                           ? 'bg-blue-500 text-white'
//                           : 'bg-gray-100 text-gray-500'
//                       }`}
//                     >
//                       <Icon size={16} />
//                     </div>
//                     <div className="flex-1">
//                       <p className="text-sm font-semibold text-slate-800">
//                         {m.label}
//                       </p>
//                       <p className="text-xs text-gray-400">{m.sub}</p>
//                     </div>
//                     <span
//                       className={`flex h-4.5 w-4.5 items-center justify-center rounded-full border-2 ${
//                         active ? 'border-blue-500' : 'border-gray-300'
//                       }`}
//                     >
//                       {active && (
//                         <span className="h-2 w-2 rounded-full bg-blue-500" />
//                       )}
//                     </span>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           <button
//             onClick={handleConfirmPay}
//             disabled={submitting}
//             className="mt-6 w-full rounded-xl bg-blue-500 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
//           >
//             {submitting ? 'Processing...' : `Confirm & Pay ₹${total}`}
//           </button>
//           <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
//             <ShieldCheck size={12} /> Secure payment • Your boost will be
//             scheduled immediately
//           </p>

//           {/* <button
//             onClick={onBack}
//             className="mt-3 w-full text-center text-xs font-medium text-slate-500 hover:text-slate-700"
//           >
//             ← Back to Schedule
//           </button> */}
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  X,
  ChevronLeft,
  Wallet,
  Smartphone,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  apiCreateRazorpayOrder,
  apiVerifyRazorpayPayment,
} from '@/service/api';
import { StepDots } from './../AdsPlan/StepOne';
import { BOOST_PRICE } from './../AdsPlan/StepTwo';
import { createAdsPlan } from '../../../../redux/slices/adsPlanSlice';

const PAYMENT_METHODS = [
  {
    id: 'wallet',
    label: 'Wallet Balance',

    icon: Wallet,
  },
  {
    id: 'upi',
    label: 'UPI Payment',
    sub: 'PhonePe, GPay, Paytm',
    icon: Smartphone,
  },
  {
    id: 'card',
    label: 'Saved Card',
    sub: '•••• •••• •••• 4532',
    icon: CreditCard,
  },
];

/**
 * StepThree — "Payment & Order Summary" modal.
 *
 * Props:
 *  - open: boolean
 *  - products: Array of the 2 chosen products
 *  - schedules: { [productId]: { startDate, duration } }
 *  - onBack: () => void, go back to StepTwo
 *  - onClose: () => void, close entirely
 *  - onConfirm: ({ total, method }) => void, called when "Confirm & Pay" is clicked
 */
export default function StepThree({
  open,
  products,
  schedules,
  onBack,
  onClose,
  onConfirm,
}) {
  const dispatch = useDispatch();
  const [method, setMethod] = useState('wallet');
  const [submitting, setSubmitting] = useState(false);

  if (!open || !products || products.length === 0) return null;

  const subtotal = products.length * BOOST_PRICE;
  const discount = Math.round(subtotal * 0.02);
  const total = subtotal - discount;

  const handleConfirmPay = async () => {
    setSubmitting(true);
    try {
      console.log('[StepThree] Creating Razorpay order, amount:', total);
      const rzpRes = await apiCreateRazorpayOrder(total);
      console.log('[StepThree] Order create response:', rzpRes.data);
      const { orderId: razorpayOrderId, amount } = rzpRes.data;
      console.log(
        '[StepThree] razorpayOrderId:',
        razorpayOrderId,
        'amount:',
        amount,
      );
      console.log(
        '[StepThree] window.Razorpay available?',
        typeof window.Razorpay,
      );

      await new Promise((resolve, reject) => {
        const options = {
          key:
            process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
            'rzp_test_TF4N39zZPzWuGw',
          amount,
          currency: 'INR',
          name: 'Rentnpay',
          description: 'Category Hero Boost',
          order_id: razorpayOrderId,
          handler: async (response) => {
            try {
              await apiVerifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              resolve();
            } catch (e) {
              reject(e);
            }
          },
          modal: {
            ondismiss: () => {
              console.log('[StepThree] Razorpay modal dismissed by user');
              reject(new Error('Payment cancelled'));
            },
          },
          theme: { color: '#F97316' },
        };
        console.log('[StepThree] Razorpay options:', options);
        try {
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', (resp) => {
            console.error(
              '[StepThree] Razorpay payment.failed event:',
              resp?.error,
            );
          });
          rzp.open();
          console.log('[StepThree] rzp.open() called successfully');
        } catch (openErr) {
          console.error(
            '[StepThree] Error constructing/opening Razorpay:',
            openErr,
          );
          reject(openErr);
        }
      });

      const resultAction = await dispatch(
        createAdsPlan({
          planType: 'category_hero',
          products: products.map((p) => ({ ...p, boostPrice: BOOST_PRICE })),
          schedules,
          subtotal,
          discount,
          total,
          paymentMethod: 'razorpay',
        }),
      );

      if (createAdsPlan.fulfilled.match(resultAction)) {
        toast.success('Boost order placed successfully!');
        onConfirm({ total, method: 'razorpay' });
      } else {
        toast.error(resultAction.payload || 'Failed to place boost order');
      }
    } catch (err) {
      console.error('[StepThree] Payment flow error:', err);
      console.error('[StepThree] err.message:', err?.message);
      console.error('[StepThree] err.response?.data:', err?.response?.data);
      console.error('[StepThree] err.stack:', err?.stack);
      if (err.message === 'Payment cancelled') {
        toast.error('Payment was cancelled. Please try again.');
      } else {
        toast.error(
          err.response?.data?.message || 'Payment failed. Please try again.',
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm sm:p-6">
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4 sm:px-7 sm:py-5">
          <div className="flex items-start gap-3">
            <button
              onClick={onBack}
              className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-gray-100 hover:text-slate-800"
              aria-label="Back"
            >
              <ChevronLeft size={18} />
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                Category Hero Boost
              </h2>
              <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                Get your products featured at #1 position
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <StepDots step={3} />
            <button
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-gray-100 hover:text-slate-700"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="hide-scrollbar flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <h3 className="text-base font-bold text-slate-900 sm:text-[17px]">
            Step 3: Payment & Order Summary
          </h3>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            Review your order and complete payment
          </p>

          {/* Order Summary */}
          <div className="mt-5 rounded-xl border border-gray-100 p-4 sm:p-5">
            <p className="mb-3 text-sm font-semibold text-slate-800">
              Order Summary
            </p>
            <div className="divide-y divide-gray-50">
              {products.map((p) => {
                const s = schedules?.[p.id] || {};
                return (
                  <div key={p.id} className="flex items-center gap-3 py-3">
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={p.image}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => (e.currentTarget.style.opacity = 0)}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        Category Hero • {p.category}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Starts: {s.startDate || 'Not set'} • {s.duration}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      ₹{BOOST_PRICE}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>
                  Subtotal ({products.length} products × ₹{BOOST_PRICE})
                </span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Gold Partner Discount (2%)</span>
                <span>-₹{discount}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold text-slate-900">
                <span>Total Amount</span>
                <span>₹{total}</span>
              </div>
            </div>
          </div>

          {/* Payment method */}
          {/* <div className="mt-5">
            <p className="mb-3 text-sm font-semibold text-slate-800">
              Select Payment Method
            </p>
            <div className="space-y-2.5">
              {PAYMENT_METHODS.map((m) => {
                const Icon = m.icon;
                const active = method === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                      active
                        ? 'border-blue-400 bg-blue-50/60'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        active
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">
                        {m.label}
                      </p>
                      <p className="text-xs text-gray-400">{m.sub}</p>
                    </div>
                    <span
                      className={`flex h-4.5 w-4.5 items-center justify-center rounded-full border-2 ${
                        active ? 'border-blue-500' : 'border-gray-300'
                      }`}
                    >
                      {active && (
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div> */}

          <button
            onClick={handleConfirmPay}
            disabled={submitting}
            className="mt-6 w-full rounded-xl bg-blue-500 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Processing...' : `Confirm & Pay ₹${total}`}
          </button>
          <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
            <ShieldCheck size={12} /> Secure payment • Your boost will be
            scheduled immediately
          </p>

          {/* <button
            onClick={onBack}
            className="mt-3 w-full text-center text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            ← Back to Schedule
          </button> */}
        </div>
      </div>
    </div>
  );
}
