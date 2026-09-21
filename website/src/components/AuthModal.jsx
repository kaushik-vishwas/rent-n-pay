// 'use client';

// import { useEffect, useRef, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter } from 'next/navigation';
// import { X, ArrowRight, Eye, EyeOff } from 'lucide-react';
// import { api } from '@/lib/axios';
// import { setCredentials } from '@/store/slices/authSlice';
// import { toast } from 'react-toastify';
// import { USER_AUTH, normalizeUserFromApi } from '@/lib/api';
// import {
//   AUTH_REDIRECT_SESSION_KEY,
//   useAuthModal,
// } from '@/contexts/AuthModalContext';
// import authImage from '@/assets/images/auth.png';

// // ── OTP Input component
// function OtpInputs({ value, onChange, disabled }) {
//   const inputsRef = useRef([]);
//   const chars = Array.from({ length: 6 }, (_, i) => value[i] ?? '');

//   const handleChange = (i, raw) => {
//     const c = raw.replace(/\D/g, '').slice(-1);
//     const next = Array.from({ length: 6 }, (_, j) => value[j] ?? '');
//     next[i] = c;
//     onChange(next.join('').replace(/\D/g, '').slice(0, 6));
//     if (c && i < 5) inputsRef.current[i + 1]?.focus();
//   };

//   const handleKeyDown = (i, e) => {
//     if (e.key === 'Backspace' && !chars[i] && i > 0) {
//       inputsRef.current[i - 1]?.focus();
//     }
//   };

//   const handlePaste = (e) => {
//     const t = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
//     if (t) {
//       e.preventDefault();
//       onChange(t);
//       const idx = Math.min(t.length, 5);
//       inputsRef.current[idx]?.focus();
//     }
//   };

//   return (
//     <div className="flex gap-2 justify-between" onPaste={handlePaste}>
//       {[0, 1, 2, 3, 4, 5].map((i) => (
//         <input
//           key={i}
//           ref={(el) => {
//             inputsRef.current[i] = el;
//           }}
//           type="text"
//           inputMode="numeric"
//           autoComplete="off"
//           maxLength={1}
//           disabled={disabled}
//           value={chars[i]}
//           onChange={(e) => handleChange(i, e.target.value)}
//           onKeyDown={(e) => handleKeyDown(i, e)}
//           className="w-full min-w-0 aspect-square max-w-[44px] text-center text-lg font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
//         />
//       ))}
//     </div>
//   );
// }

// // ── Main Modal ────────────────────────────────────────────────────────────────
// export default function AuthModal() {
//   const { open, view, closeAuth } = useAuthModal();
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);

//   const [screen, setScreen] = useState('login');
//   const [fullName, setFullName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [otp, setOtp] = useState('');
//   const [devOtpRevealed, setDevOtpRevealed] = useState(false);
//   const [agree, setAgree] = useState(false);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const [showForgotPassword, setShowForgotPassword] = useState(false);
//   const [forgotStep, setForgotStep] = useState('email');

//   const [forgotEmail, setForgotEmail] = useState('');
//   const [forgotOtp, setForgotOtp] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');

//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [referralCode, setReferralCode] = useState('');

//   // Sync screen with the view requested by openAuth()
//   useEffect(() => {
//     if (!open) return;
//     setScreen(view === 'signup' ? 'signup' : 'login');
//     setError('');
//     setOtp('');
//     setDevOtpRevealed(false);
//   }, [open, view]);

//   // Auto-close when user becomes authenticated
//   useEffect(() => {
//     if (isAuthenticated && open) closeAuth();
//   }, [isAuthenticated, open, closeAuth]);

//   // Lock page scroll while auth modal is open.
//   useEffect(() => {
//     if (!open || typeof document === 'undefined') return undefined;
//     const prevOverflow = document.body.style.overflow;
//     document.body.style.overflow = 'hidden';
//     return () => {
//       document.body.style.overflow = prevOverflow;
//     };
//   }, [open]);

//   const reset = () => {
//     setError('');
//     setLoading(false);
//   };
//   const emailAddress = email.trim();

//   //Signup
//   // const handleSignup = async (e) => {
//   //   e.preventDefault();
//   //   if (!agree) {
//   //     setError('Please agree to the Terms & Conditions and Privacy Policies.');
//   //     return;
//   //   }
//   //   setError('');
//   //   setLoading(true);
//   //   try {
//   //     const { data } = await api.post(USER_AUTH.signup, {
//   //       fullName: fullName.trim(),
//   //       emailAddress,
//   //       password,
//   //     });
//   //     const testOtp = String(data?.testOtp ?? '').trim();
//   //     const hasTestOtp = /^\d{6}$/.test(testOtp);
//   //     setDevOtpRevealed(hasTestOtp);
//   //     setOtp(hasTestOtp ? testOtp : '');
//   //     setScreen('otp');
//   //   } catch (err) {
//   //     setError(err.response?.data?.message || 'Registration failed.');
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     if (!agree) {
//       setError('Please agree to the Terms & Conditions and Privacy Policies.');
//       return;
//     }
//     setError('');
//     setLoading(true);
//     try {
//       const { data } = await api.post(USER_AUTH.signup, {
//         fullName: fullName.trim(),
//         emailAddress,
//         password,
//         referralCode: referralCode.trim().toUpperCase() || undefined,
//       });
//       const testOtp = String(data?.testOtp ?? '').trim();
//       const hasTestOtp = /^\d{6}$/.test(testOtp);
//       setDevOtpRevealed(hasTestOtp);
//       setOtp(hasTestOtp ? testOtp : '');
//       setScreen('otp');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Registration failed.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   //Verify OTP then auto-login
//   const handleVerifyOtp = async (e) => {
//     e.preventDefault();
//     if (otp.length !== 6) {
//       setError('Enter the 6-digit code.');
//       return;
//     }
//     setError('');
//     setLoading(true);
//     try {
//       // 1. Verify OTP
//       await api.post(USER_AUTH.verifyOtp, { emailAddress, otp: otp.trim() });

//       // 2. Auto-login with the same credentials
//       const { data } = await api.post(USER_AUTH.login, {
//         emailAddress,
//         password,
//       });
//       const user = normalizeUserFromApi(data.user);
//       dispatch(setCredentials({ user, token: data.token }));

//       toast.success('Your account created successfully', {
//         position: 'top-right',
//         autoClose: 2000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         theme: 'light',
//       });
//       if (typeof window !== 'undefined') {
//         sessionStorage.setItem('rn_login_welcome', '1');
//       }

//       closeAuth();
//       const redirect = sessionStorage.getItem(AUTH_REDIRECT_SESSION_KEY) || '/';
//       sessionStorage.removeItem(AUTH_REDIRECT_SESSION_KEY);
//       router.push(redirect);
//     } catch (err) {
//       setError(
//         err.response?.data?.message ||
//           'Verification failed. Check the code and try again.',
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Login
//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);
//     try {
//       const { data } = await api.post(USER_AUTH.login, {
//         emailAddress,
//         password,
//       });
//       const user = normalizeUserFromApi(data.user);
//       dispatch(setCredentials({ user, token: data.token }));
//       toast.success('Logged in successfully', {
//         position: 'top-right',
//         autoClose: 2000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         theme: 'light',
//       });

//       sessionStorage.setItem('rn_login_welcome', '1');
//       closeAuth();
//       const redirect = sessionStorage.getItem(AUTH_REDIRECT_SESSION_KEY) || '/';
//       sessionStorage.removeItem(AUTH_REDIRECT_SESSION_KEY);
//       router.push(redirect);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Login failed.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   //Forgot Password
//   const handleForgotPassword = async (e) => {
//     e.preventDefault();

//     try {
//       await api.post('/users/forgot-password', {
//         emailAddress: email.trim(),
//       });

//       setScreen('reset-password');
//     } catch (err) {
//       setError(err.response?.data?.message);
//     }
//   };

//   //Reset Password
//   // const handleResetPassword = async (e) => {
//   //   e.preventDefault();

//   //   if (password !== confirmPassword) {
//   //     return setError('Passwords do not match');
//   //   }

//   //   try {
//   //     await api.post('/users/reset-password', {
//   //       emailAddress: email.trim(),
//   //       otp,
//   //       newPassword: password,
//   //     });

//   //     setScreen('login');
//   //     setError('');
//   //     alert('Password updated successfully');
//   //   } catch (err) {
//   //     setError(err.response?.data?.message);
//   //   }
//   // };

//   const handleSendForgotOtp = async (e) => {
//     e.preventDefault();

//     try {
//       await api.post(USER_AUTH.forgotPasswordSendOtp, {
//         emailAddress: forgotEmail,
//       });

//       setForgotStep('otp');
//       setError('');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to send OTP');
//     }
//   };

//   const handleVerifyForgotOtp = async (e) => {
//     e.preventDefault();

//     try {
//       await api.post(USER_AUTH.verifyForgotOtp, {
//         emailAddress: forgotEmail,
//         // otp: forgotOtp,
//         otp: forgotOtp.trim(),
//       });

//       setForgotStep('reset');
//       setError('');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Invalid OTP');
//     }
//   };

//   const handleResetPassword = async (e) => {
//     e.preventDefault();

//     if (newPassword !== confirmPassword) {
//       return setError('Passwords do not match');
//     }

//     try {
//       await api.post(USER_AUTH.resetPassword, {
//         emailAddress: forgotEmail,
//         otp: forgotOtp,
//         newPassword,
//       });

//       toast.success('Password updated successfully', {
//         position: 'top-right',
//         autoClose: 2000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         theme: 'light',
//       });

//       setShowForgotPassword(false);
//       setForgotStep('email');
//       setScreen('login');
//       setForgotEmail('');
//       setForgotOtp('');
//       setNewPassword('');
//       setConfirmPassword('');
//       setError('');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Reset failed');
//     }
//   };

//   const isPasswordValid = newPassword.length >= 6;
//   const doPasswordsMatch =
//     newPassword && confirmPassword && newPassword === confirmPassword;
//   if (!open) return null;

//   return (
//     <div
//       className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-3 sm:px-4 py-6"
//       role="dialog"
//       aria-modal="true"
//       aria-labelledby="auth-modal-title"
//     >
//       <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[min(90vh,720px)]">
//         {/* Left image panel */}
//         {/* <div className="hidden md:flex md:w-1/2 bg-primary-50 items-center justify-center">
//           <div className="p-8 text-center">
//             <div className="text-6xl mb-4">🛋️</div>
//             <h3 className="text-xl font-bold text-gray-800">
//               Rent what you need
//             </h3>
//             <p className="text-gray-500 text-sm mt-2">
//               Furniture, electronics & more. Flexible daily rental.
//             </p>
//           </div>
//         </div> */}
//         {/* Left image panel */}
//         <div className="hidden md:flex md:w-1/2 bg-primary-50 items-center justify-center overflow-hidden">
//           <img
//             src={authImage.src}
//             alt="Auth"
//             className="w-full h-full object-cover"
//           />
//         </div>

//         {/* Right form panel */}
//         <div className="w-full md:w-1/2 flex flex-col min-h-0 p-6 sm:p-8 relative">
//           {/* <button
//             type="button"
//             onClick={closeAuth}
//             className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
//             aria-label="Close"
//           >
//             <X size={16} />
//           </button> */}
//           <button
//             type="button"
//             onClick={closeAuth}
//             className="absolute top-4 right-4 p-2 bg-[#F3F4F6] rounded-full hover:bg-gray-200 transition"
//             aria-label="Close"
//           >
//             <X size={14} className="text-[#64748B]" />
//           </button>

//           {/* ================= FORGOT PASSWORD UI START ================= */}
//           {showForgotPassword && (
//             <>
//               {forgotStep === 'email' && (
//                 <form onSubmit={handleSendForgotOtp}>
//                   <h2 className="text-xl font-semibold">Forgot Password</h2>

//                   <p className="text-sm text-gray-500 mt-1">
//                     Enter your registered email
//                   </p>

//                   <input
//                     type="email"
//                     autoComplete="off"
//                     value={forgotEmail}
//                     onChange={(e) => setForgotEmail(e.target.value)}
//                     className="mt-4 w-full border p-3 rounded"
//                     placeholder="you@example.com"
//                     required
//                   />

//                   <button className="mt-4 w-full bg-primary text-white py-3 rounded">
//                     Send OTP
//                   </button>

//                   <p className="text-sm text-center mt-4">
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setShowForgotPassword(false);
//                         setForgotStep('email');
//                         setForgotEmail('');
//                         setForgotOtp('');
//                         setNewPassword('');
//                         setConfirmPassword('');
//                         setError('');
//                       }}
//                       className="text-primary hover:underline"
//                     >
//                       ← Back to Login
//                     </button>
//                   </p>
//                 </form>
//               )}

//               {forgotStep === 'otp' && (
//                 <form
//                   onSubmit={handleVerifyForgotOtp}
//                   className="space-y-5 pt-2"
//                 >
//                   <h2 className="text-xl font-semibold">Verify OTP</h2>

//                   <p className="text-sm text-gray-500">
//                     Enter OTP sent to {forgotEmail}
//                   </p>

//                   <div className="pt-1">
//                     <OtpInputs
//                       value={forgotOtp}
//                       onChange={setForgotOtp}
//                       disabled={loading}
//                     />
//                   </div>

//                   <button className="w-full bg-primary text-white py-3 rounded-lg">
//                     Verify OTP
//                   </button>
//                 </form>
//               )}

//               {forgotStep === 'reset' && (
//                 <form onSubmit={handleResetPassword}>
//                   <h2 className="text-xl font-semibold">Reset Password</h2>
//                   <div className="relative mt-4">
//                     <input
//                       type={showNewPassword ? 'text' : 'password'}
//                       autoComplete="new-password"
//                       value={newPassword}
//                       onChange={(e) => setNewPassword(e.target.value)}
//                       placeholder="New password"
//                       minLength={6}
//                       className="w-full border p-3 rounded pr-10"
//                     />
//                     {newPassword && !isPasswordValid && (
//                       <p className="text-red-500 text-sm mt-1">
//                         Password must be at least 6 characters
//                       </p>
//                     )}

//                     <button
//                       type="button"
//                       onClick={() => setShowNewPassword(!showNewPassword)}
//                       className="absolute right-3 top-3"
//                     >
//                       {showNewPassword ? (
//                         <EyeOff size={18} />
//                       ) : (
//                         <Eye size={18} />
//                       )}
//                     </button>
//                   </div>
//                   <div className="relative mt-4">
//                     <input
//                       type={showConfirmPassword ? 'text' : 'password'}
//                       // autoComplete="new-password"
//                       autoComplete="off"
//                       value={confirmPassword}
//                       onChange={(e) => setConfirmPassword(e.target.value)}
//                       placeholder="Confirm password"
//                       className="w-full border p-3 rounded pr-10"
//                     />
//                     {confirmPassword && !doPasswordsMatch && (
//                       <p className="text-red-500 text-sm mt-1">
//                         Passwords do not match
//                       </p>
//                     )}

//                     <button
//                       type="button"
//                       onClick={() =>
//                         setShowConfirmPassword(!showConfirmPassword)
//                       }
//                       className="absolute right-3 top-3"
//                     >
//                       {showConfirmPassword ? (
//                         <EyeOff size={18} />
//                       ) : (
//                         <Eye size={18} />
//                       )}
//                     </button>
//                   </div>
//                   <button
//                     type="submit"
//                     disabled={!isPasswordValid || !doPasswordsMatch}
//                     className="mt-4 w-full bg-primary text-white py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     Reset Password
//                   </button>
//                 </form>
//               )}
//             </>
//           )}
//           {/* ================= FORGOT PASSWORD UI END ================= */}

//           {/* ── SIGNUP FORM ── */}
//           {/* {!showForgotPassword && screen === 'signup' && (
//             <form onSubmit={handleSignup} className="flex flex-col flex-1 pt-2">
//               <h2
//                 id="auth-modal-title"
//                 className="text-xl font-semibold text-black pr-8"
//               >
//                 Create your account
//               </h2>
//               <p className="text-sm text-gray-500 mt-1">
//                 Enter your details to sign up
//               </p>

//               <div className="mt-6 space-y-4">
//                 <div>
//                   <label className="text-sm font-medium text-gray-800">
//                     Full name
//                   </label>
//                   <input
//                     type="text"
//                     autoComplete="name"
//                     value={fullName}
//                     onChange={(e) => setFullName(e.target.value)}
//                     placeholder="Your full name"
//                     className="mt-2 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-800">
//                     Email
//                   </label>
//                   <input
//                     type="email"
//                     autoComplete="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="you@example.com"
//                     className="mt-2 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium text-gray-800">
//                     Password
//                   </label>

//                   <div className="relative mt-2">
//                     <input
//                       type={showPassword ? 'text' : 'password'}
//                       // autoComplete="new-password"
//                       autoComplete="off"
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       placeholder="At least 6 characters"
//                       className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
//                       required
//                       minLength={6}
//                     />

//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
//                     >
//                       {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                     </button>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium text-gray-800">
//                     Referral Code{' '}
//                     <span className="text-gray-400 font-normal">
//                       (optional)
//                     </span>
//                   </label>
//                   <input
//                     type="text"
//                     autoComplete="off"
//                     value={referralCode}
//                     onChange={(e) =>
//                       setReferralCode(e.target.value.toUpperCase())
//                     }
//                     placeholder="e.g. RNP-A2X9KL"
//                     maxLength={10}
//                     className="mt-2 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm tracking-widest uppercase placeholder:tracking-normal placeholder:normal-case"
//                   />

//                 </div>
//               </div>

//               <label className="flex items-start gap-2 mt-4 text-xs text-gray-600 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={agree}
//                   onChange={(e) => setAgree(e.target.checked)}
//                   className="mt-0.5 rounded border-gray-300"
//                 />
//                 <span>
//                   I agree to the{' '}
//                   <span className="text-primary">Terms & Conditions</span> and{' '}
//                   <span className="text-primary">Privacy Policy</span>.
//                 </span>
//               </label>

//               {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="mt-6 w-full bg-primary hover:bg-primary-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
//               >
//                 {loading ? 'Creating account…' : 'Create account'}
//                 <ArrowRight size={18} />
//               </button>

//               <p className="text-sm text-gray-600 mt-6 text-center">
//                 Already have an account?{' '}
//                 <button
//                   type="button"
//                   className="text-primary font-medium hover:underline"
//                   onClick={() => {
//                     reset();
//                     setScreen('login');
//                   }}
//                 >
//                   Login
//                 </button>
//               </p>
//             </form>
//           )} */}

//           {/* ── SIGNUP FORM ── */}
//           {!showForgotPassword && screen === 'signup' && (
//             <form
//               onSubmit={handleSignup}
//               className="flex flex-col flex-1 pt-2 min-h-0"
//             >
//               <h2
//                 id="auth-modal-title"
//                 className="text-xl font-semibold text-black pr-8 shrink-0"
//               >
//                 Create your account
//               </h2>
//               <p className="text-sm text-gray-500 mt-1 shrink-0">
//                 Enter your details to sign up
//               </p>

//               <div
//                 className="flex-1 overflow-y-auto min-h-0 mt-6"
//                 style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
//               >
//                 <style>{`
//         .signup-scroll-area::-webkit-scrollbar { display: none; }
//       `}</style>

//                 <div className="signup-scroll-area space-y-4">
//                   <div>
//                     <label className="text-sm font-medium text-gray-800">
//                       Full name
//                     </label>
//                     <input
//                       type="text"
//                       autoComplete="name"
//                       value={fullName}
//                       onChange={(e) => setFullName(e.target.value)}
//                       placeholder="Your full name"
//                       className="mt-2 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="text-sm font-medium text-gray-800">
//                       Email
//                     </label>
//                     <input
//                       type="email"
//                       autoComplete="email"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       placeholder="you@example.com"
//                       className="mt-2 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="text-sm font-medium text-gray-800">
//                       Password
//                     </label>
//                     <div className="relative mt-2">
//                       <input
//                         type={showPassword ? 'text' : 'password'}
//                         autoComplete="off"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         placeholder="At least 6 characters"
//                         className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
//                         required
//                         minLength={6}
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
//                       >
//                         {showPassword ? (
//                           <EyeOff size={18} />
//                         ) : (
//                           <Eye size={18} />
//                         )}
//                       </button>
//                     </div>
//                   </div>

//                   <div>
//                     <label className="text-sm font-medium text-gray-800">
//                       Referral Code{' '}
//                       <span className="text-gray-400 font-normal">
//                         (optional)
//                       </span>
//                     </label>
//                     <input
//                       type="text"
//                       autoComplete="off"
//                       value={referralCode}
//                       onChange={(e) =>
//                         setReferralCode(e.target.value.toUpperCase())
//                       }
//                       placeholder="e.g. RNP-A2X9KL"
//                       maxLength={10}
//                       className="mt-2 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm tracking-widest uppercase placeholder:tracking-normal placeholder:normal-case"
//                     />
//                   </div>

//                   <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={agree}
//                       onChange={(e) => setAgree(e.target.checked)}
//                       className="mt-0.5 rounded border-gray-300"
//                     />
//                     <span>
//                       I agree to the{' '}
//                       <span className="text-primary">Terms & Conditions</span>{' '}
//                       and <span className="text-primary">Privacy Policy</span>.
//                     </span>
//                   </label>

//                   {error && <p className="text-red-600 text-sm">{error}</p>}

//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="w-full bg-primary hover:bg-primary-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
//                   >
//                     {loading ? 'Creating account…' : 'Create account'}
//                     <ArrowRight size={18} />
//                   </button>

//                   <p className="text-sm text-gray-600 text-center pb-2">
//                     Already have an account?{' '}
//                     <button
//                       type="button"
//                       className="text-primary font-medium hover:underline"
//                       onClick={() => {
//                         reset();
//                         setScreen('login');
//                       }}
//                     >
//                       Login
//                     </button>
//                   </p>
//                 </div>
//               </div>
//             </form>
//           )}

//           {/* ── OTP FORM ── */}
//           {!showForgotPassword && screen === 'otp' && (
//             <form
//               onSubmit={handleVerifyOtp}
//               className="flex flex-col flex-1 pt-2"
//             >
//               <h2
//                 id="auth-modal-title"
//                 className="text-xl font-semibold text-black pr-8"
//               >
//                 Verify your email
//               </h2>
//               <p className="text-sm text-gray-500 mt-1">
//                 Enter the 6-digit code sent to{' '}
//                 <span className="font-medium text-gray-700">
//                   {emailAddress}
//                 </span>
//               </p>
//               {/*
//               {devOtpRevealed ? (
//                 <div className="mt-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm text-center">
//                   Test OTP auto-filled for this environment.
//                 </div>
//               ) : null} */}

//               <div className="mt-6">
//                 <label className="text-sm font-medium text-gray-800 mb-2 block">
//                   One-time otp
//                 </label>
//                 <OtpInputs value={otp} onChange={setOtp} disabled={loading} />
//               </div>

//               {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

//               <button
//                 type="submit"
//                 disabled={loading || otp.length !== 6}
//                 className="mt-6 w-full bg-primary hover:bg-primary-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
//               >
//                 {loading ? 'Verifying…' : 'Verify & continue'}
//                 <ArrowRight size={18} />
//               </button>

//               <p className="text-sm text-gray-600 mt-6 text-center">
//                 <button
//                   type="button"
//                   className="text-primary font-medium hover:underline"
//                   onClick={() => {
//                     reset();
//                     setOtp('');
//                     setDevOtpRevealed(false);
//                     setScreen('signup');
//                   }}
//                 >
//                   ← Back to sign up
//                 </button>
//               </p>
//             </form>
//           )}

//           {/* ── LOGIN FORM ── */}
//           {!showForgotPassword && screen === 'login' && (
//             <form onSubmit={handleLogin} className="flex flex-col flex-1 pt-2">
//               <h2
//                 id="auth-modal-title"
//                 className="text-xl font-semibold text-black pr-8"
//               >
//                 Login to your account
//               </h2>
//               <p className="text-sm text-gray-500 mt-1">
//                 Enter your email and password
//               </p>

//               <div className="mt-6 space-y-4">
//                 <div>
//                   <label className="text-sm font-medium text-gray-800">
//                     Email
//                   </label>
//                   <input
//                     type="email"
//                     autoComplete="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="you@example.com"
//                     className="mt-2 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
//                     required
//                   />
//                 </div>
//                 {/* <div>
//                   <label className="text-sm font-medium text-gray-800">
//                     Password
//                   </label>
//                   <input
//                     type="password"
//                     autoComplete="current-password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="Your password"
//                     className="mt-2 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
//                     required
//                   />
//                 </div> */}
//                 <div>
//                   <label className="text-sm font-medium text-gray-800">
//                     Password
//                   </label>

//                   <div className="relative mt-2">
//                     <input
//                       type={showPassword ? 'text' : 'password'}
//                       // autoComplete="current-password"
//                       autoComplete="off"
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       placeholder="Your password"
//                       className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
//                       required
//                     />

//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
//                     >
//                       {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               <p className="text-right mt-2">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowForgotPassword(true);
//                     setForgotStep('email');
//                   }}
//                   className="text-sm text-primary hover:underline"
//                 >
//                   Forgot Password?
//                 </button>
//               </p>

//               {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="mt-6 w-full bg-primary hover:bg-primary-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
//               >
//                 {loading ? 'Logging in…' : 'Login'}
//                 <ArrowRight size={18} />
//               </button>

//               <p className="text-sm text-gray-600 mt-6 text-center">
//                 Don&apos;t have an account?{' '}
//                 <button
//                   type="button"
//                   className="text-primary font-medium hover:underline"
//                   onClick={() => {
//                     reset();
//                     setScreen('signup');
//                   }}
//                 >
//                   Sign up
//                 </button>
//               </p>
//             </form>
//           )}

//           {/* ── FORGOT PASSWORD FORM ── */}
//           {/* {screen === 'forgot-password' && (
//             <form
//               onSubmit={handleForgotPassword}
//               className="flex flex-col flex-1 pt-2"
//             >
//               <h2
//                 id="auth-modal-title"
//                 className="text-xl font-semibold text-black pr-8"
//               >
//                 Forgot Password
//               </h2>

//               <p className="text-sm text-gray-500 mt-1">
//                 Enter your registered email
//               </p>

//               <div className="mt-6">
//                 <label className="text-sm font-medium text-gray-800">
//                   Email
//                 </label>

//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="you@example.com"
//                   className="mt-2 w-full px-3 py-2.5 border border-gray-300 rounded-lg"
//                   required
//                 />
//               </div>

//               {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

//               <button
//                 type="submit"
//                 className="mt-6 w-full bg-primary text-white py-3 rounded-lg"
//               >
//                 Send OTP
//               </button>

//               <p className="text-sm text-center mt-4">
//                 <button
//                   type="button"
//                   onClick={() => setScreen('login')}
//                   className="text-primary hover:underline"
//                 >
//                   ← Back to login
//                 </button>
//               </p>
//             </form>
//           )} */}

//           {/* ── RESET PASSWORD FORM ── */}
//           {/* {screen === 'reset-password' && (
//             <form
//               onSubmit={handleResetPassword}
//               className="flex flex-col flex-1 pt-2"
//             >
//               <h2 className="text-xl font-semibold">Reset Password</h2>

//               <p className="text-sm text-gray-500 mt-1">
//                 Enter OTP and new password
//               </p>

//               <div className="mt-6">
//                 <OtpInputs value={otp} onChange={setOtp} disabled={loading} />
//               </div>

//               <div className="mt-4">
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="New password"
//                   className="w-full px-3 py-2.5 border rounded-lg"
//                 />
//               </div>

//               <div className="mt-4">
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   placeholder="Confirm password"
//                   className="w-full px-3 py-2.5 border rounded-lg"
//                 />
//               </div>

//               {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

//               <button
//                 type="submit"
//                 className="mt-6 w-full bg-primary text-white py-3 rounded-lg"
//               >
//                 Reset Password
//               </button>
//             </form>
//           )} */}
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { X, ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/axios';
import { setCredentials } from '@/store/slices/authSlice';
import { toast } from 'react-toastify';
import { USER_AUTH, normalizeUserFromApi } from '@/lib/api';
import {
  AUTH_REDIRECT_SESSION_KEY,
  useAuthModal,
} from '@/contexts/AuthModalContext';
import authImage from '@/assets/images/auth.png';

// ── OTP Input component
function OtpInputs({ value, onChange, disabled }) {
  const inputsRef = useRef([]);
  const chars = Array.from({ length: 6 }, (_, i) => value[i] ?? '');

  const handleChange = (i, raw) => {
    const c = raw.replace(/\D/g, '').slice(-1);
    const next = Array.from({ length: 6 }, (_, j) => value[j] ?? '');
    next[i] = c;
    onChange(next.join('').replace(/\D/g, '').slice(0, 6));
    if (c && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !chars[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const t = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (t) {
      e.preventDefault();
      onChange(t);
      const idx = Math.min(t.length, 5);
      inputsRef.current[idx]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-between" onPaste={handlePaste}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={1}
          disabled={disabled}
          value={chars[i]}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-full min-w-0 aspect-square max-w-[44px] text-center text-lg font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      ))}
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function AuthModal() {
  const { open, view, closeAuth } = useAuthModal();
  const dispatch = useDispatch();
  const router = useRouter();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);

  const [screen, setScreen] = useState('mobile-login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtpRevealed, setDevOtpRevealed] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState('email');

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  // Mobile login screen checkboxes — default unchecked, user must opt in
  const [mobileAgreeTerms, setMobileAgreeTerms] = useState(false);
  const [mobileWantsConsultation, setMobileWantsConsultation] = useState(false);
  const [mobileSignupAgreeTerms, setMobileSignupAgreeTerms] = useState(false);

  // Mobile OTP flow state (separate from email flow)
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [isNewMobileUser, setIsNewMobileUser] = useState(false);
  const DUMMY_OTP = '123456'; // TODO: remove once real mobile OTP is wired up

  // Sync screen with the view requested by openAuth()
  // useEffect(() => {
  //   if (!open) return;
  //   setScreen(view === 'signup' ? 'signup' : 'mobile-login');
  //   setError('');
  //   setOtp('');
  //   setDevOtpRevealed(false);
  // }, [open, view]);
  useEffect(() => {
    if (!open) return;
    setScreen(view === 'signup' ? 'signup' : 'mobile-login');
    setError('');
    setOtp('');
    setDevOtpRevealed(false);
    setMobileNumber('');
    setMobileOtp('');
    setFullName('');
    setEmail('');
    setReferralCode('');
    // Always reset checkboxes to unchecked each time the modal is opened,
    // even if the user had checked them in a previous open/close cycle.
    setMobileAgreeTerms(false);
    setMobileWantsConsultation(false);
    setMobileSignupAgreeTerms(false);
  }, [open, view]);
  // Auto-close when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && open) closeAuth();
  }, [isAuthenticated, open, closeAuth]);

  // Lock page scroll while auth modal is open.
  useEffect(() => {
    if (!open || typeof document === 'undefined') return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const reset = () => {
    setError('');
    setLoading(false);
  };
  const emailAddress = email.trim();

  //Signup
  // const handleSignup = async (e) => {
  //   e.preventDefault();
  //   if (!agree) {
  //     setError('Please agree to the Terms & Conditions and Privacy Policies.');
  //     return;
  //   }
  //   setError('');
  //   setLoading(true);
  //   try {
  //     const { data } = await api.post(USER_AUTH.signup, {
  //       fullName: fullName.trim(),
  //       emailAddress,
  //       password,
  //     });
  //     const testOtp = String(data?.testOtp ?? '').trim();
  //     const hasTestOtp = /^\d{6}$/.test(testOtp);
  //     setDevOtpRevealed(hasTestOtp);
  //     setOtp(hasTestOtp ? testOtp : '');
  //     setScreen('otp');
  //   } catch (err) {
  //     setError(err.response?.data?.message || 'Registration failed.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!agree) {
      setError('Please agree to the Terms & Conditions and Privacy Policies.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post(USER_AUTH.signup, {
        fullName: fullName.trim(),
        emailAddress,
        password,
        referralCode: referralCode.trim().toUpperCase() || undefined,
      });
      const testOtp = String(data?.testOtp ?? '').trim();
      const hasTestOtp = /^\d{6}$/.test(testOtp);
      setDevOtpRevealed(hasTestOtp);
      setOtp(hasTestOtp ? testOtp : '');
      setScreen('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  //Verify OTP then auto-login
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Enter the 6-digit code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // 1. Verify OTP
      await api.post(USER_AUTH.verifyOtp, { emailAddress, otp: otp.trim() });

      // 2. Auto-login with the same credentials
      const { data } = await api.post(USER_AUTH.login, {
        emailAddress,
        password,
      });
      const user = normalizeUserFromApi(data.user);
      dispatch(setCredentials({ user, token: data.token }));

      toast.success('Your account created successfully', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('rn_login_welcome', '1');
      }

      closeAuth();
      const redirect = sessionStorage.getItem(AUTH_REDIRECT_SESSION_KEY) || '/';
      sessionStorage.removeItem(AUTH_REDIRECT_SESSION_KEY);
      router.push(redirect);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Verification failed. Check the code and try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post(USER_AUTH.login, {
        emailAddress,
        password,
      });
      const user = normalizeUserFromApi(data.user);
      dispatch(setCredentials({ user, token: data.token }));
      toast.success('Logged in successfully', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });

      sessionStorage.setItem('rn_login_welcome', '1');
      closeAuth();
      const redirect = sessionStorage.getItem(AUTH_REDIRECT_SESSION_KEY) || '/';
      sessionStorage.removeItem(AUTH_REDIRECT_SESSION_KEY);
      router.push(redirect);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  // Mobile: Step 1 - submit mobile number, request OTP
  const handleMobileSubmit = async (e) => {
    e.preventDefault();
    if (!mobileAgreeTerms) {
      toast.error(
        'Please agree to the Terms & Conditions and Privacy Policy.',
        {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'light',
        },
      );
      return;
    }
    if (!mobileWantsConsultation) {
      toast.error(
        'Please accept the furnishing consultation checkbox to continue.',
        {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'light',
        },
      );
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post(USER_AUTH.mobileSendOtp, {
        mobileNumber: mobileNumber.trim(),
      });
      setIsNewMobileUser(!!data?.isNewUser);
      setMobileOtp('');
      setScreen('mobile-otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Mobile: Step 2 - verify OTP (dummy for now), branch new vs existing user
  const handleVerifyMobileOtp = async (e) => {
    e.preventDefault();
    if (mobileOtp.length !== 6) {
      setError('Enter the 6-digit code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Dummy OTP bypass for now — always accept DUMMY_OTP.
      // Swap this block for a real api.post(USER_AUTH.mobileVerifyOtp, ...) later.
      if (mobileOtp.trim() !== DUMMY_OTP) {
        throw new Error('Invalid OTP');
      }

      if (isNewMobileUser) {
        // New user -> go to mobile signup screen
        setScreen('mobile-signup');
      } else {
        // Existing user -> log them in
        const { data } = await api.post(USER_AUTH.mobileVerifyOtp, {
          mobileNumber: mobileNumber.trim(),
          otp: mobileOtp.trim(),
        });
        const user = normalizeUserFromApi(data.user);
        dispatch(setCredentials({ user, token: data.token }));

        toast.success('Logged in successfully', {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'light',
        });

        sessionStorage.setItem('rn_login_welcome', '1');
        closeAuth();
        const redirect =
          sessionStorage.getItem(AUTH_REDIRECT_SESSION_KEY) || '/';
        sessionStorage.removeItem(AUTH_REDIRECT_SESSION_KEY);
        router.push(redirect);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Verification failed.',
      );
    } finally {
      setLoading(false);
    }
  };

  // Mobile: Step 3 - new user completes signup (name, referral, email)
  const handleMobileSignup = async (e) => {
    e.preventDefault();
    if (!mobileSignupAgreeTerms) {
      toast.error(
        'Please agree to the Terms & Conditions and Privacy Policy.',
        {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'light',
        },
      );
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post(USER_AUTH.mobileSignup, {
        mobileNumber: mobileNumber.trim(),
        fullName: fullName.trim(),
        emailAddress: email.trim(),
        referralCode: referralCode.trim().toUpperCase() || undefined,
      });
      const user = normalizeUserFromApi(data.user);
      dispatch(setCredentials({ user, token: data.token }));

      toast.success('Your account created successfully', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
      sessionStorage.setItem('rn_login_welcome', '1');
      closeAuth();
      const redirect = sessionStorage.getItem(AUTH_REDIRECT_SESSION_KEY) || '/';
      sessionStorage.removeItem(AUTH_REDIRECT_SESSION_KEY);
      router.push(redirect);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  //Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    try {
      await api.post('/users/forgot-password', {
        emailAddress: email.trim(),
      });

      setScreen('reset-password');
    } catch (err) {
      setError(err.response?.data?.message);
    }
  };

  //Reset Password
  // const handleResetPassword = async (e) => {
  //   e.preventDefault();

  //   if (password !== confirmPassword) {
  //     return setError('Passwords do not match');
  //   }

  //   try {
  //     await api.post('/users/reset-password', {
  //       emailAddress: email.trim(),
  //       otp,
  //       newPassword: password,
  //     });

  //     setScreen('login');
  //     setError('');
  //     alert('Password updated successfully');
  //   } catch (err) {
  //     setError(err.response?.data?.message);
  //   }
  // };

  const handleSendForgotOtp = async (e) => {
    e.preventDefault();

    try {
      await api.post(USER_AUTH.forgotPasswordSendOtp, {
        emailAddress: forgotEmail,
      });

      setForgotStep('otp');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyForgotOtp = async (e) => {
    e.preventDefault();

    try {
      await api.post(USER_AUTH.verifyForgotOtp, {
        emailAddress: forgotEmail,
        // otp: forgotOtp,
        otp: forgotOtp.trim(),
      });

      setForgotStep('reset');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      await api.post(USER_AUTH.resetPassword, {
        emailAddress: forgotEmail,
        otp: forgotOtp,
        newPassword,
      });

      toast.success('Password updated successfully', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });

      setShowForgotPassword(false);
      setForgotStep('email');
      setScreen('login');
      setForgotEmail('');
      setForgotOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    }
  };

  const isPasswordValid = newPassword.length >= 6;
  const doPasswordsMatch =
    newPassword && confirmPassword && newPassword === confirmPassword;
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-3 sm:px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[min(90vh,720px)]"> */}
      <div
        className={`w-full ${screen === 'mobile-login' ? 'max-w-2xl lg:max-w-3xl' : 'max-w-2xl'} bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row ${screen === 'mobile-login' ? 'md:h-[440px] max-h-[min(90vh,440px)]' : 'max-h-[min(90vh,720px)]'}`}
      >
        {/* Left image panel */}
        {/* <div className="hidden md:flex md:w-1/2 bg-primary-50 items-center justify-center">
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">🛋️</div>
            <h3 className="text-xl font-bold text-gray-800">
              Rent what you need
            </h3>
            <p className="text-gray-500 text-sm mt-2">
              Furniture, electronics & more. Flexible daily rental.
            </p>
          </div>
        </div> */}
        {/* Left image panel */}
        <div className="hidden md:flex md:w-1/2 bg-primary-50 items-center justify-center overflow-hidden">
          <img
            src={authImage.src}
            alt="Auth"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right form panel */}
        <div className="w-full md:w-1/2 flex flex-col min-h-0 p-6 sm:p-8 relative">
          {/* <button
            type="button"
            onClick={closeAuth}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            aria-label="Close"
          >
            <X size={16} />
          </button> */}
          <button
            type="button"
            onClick={closeAuth}
            className="absolute top-4 right-4 p-2 bg-[#F3F4F6] rounded-full hover:bg-gray-200 transition"
            aria-label="Close"
          >
            <X size={14} className="text-[#64748B]" />
          </button>

          {/* ================= FORGOT PASSWORD UI START ================= */}
          {showForgotPassword && (
            <>
              {forgotStep === 'email' && (
                <form onSubmit={handleSendForgotOtp}>
                  <h2 className="text-xl font-semibold">Forgot Password</h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Enter your registered email
                  </p>

                  <input
                    type="email"
                    autoComplete="off"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="mt-4 w-full border p-3 rounded"
                    placeholder="you@example.com"
                    required
                  />

                  <button className="mt-4 w-full bg-primary text-white py-3 rounded">
                    Send OTP
                  </button>

                  <p className="text-sm text-center mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotStep('email');
                        setForgotEmail('');
                        setForgotOtp('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setError('');
                      }}
                      className="text-primary hover:underline"
                    >
                      ← Back to Login
                    </button>
                  </p>
                </form>
              )}

              {forgotStep === 'otp' && (
                <form
                  onSubmit={handleVerifyForgotOtp}
                  className="space-y-5 pt-2"
                >
                  <h2 className="text-xl font-semibold">Verify OTP</h2>

                  <p className="text-sm text-gray-500">
                    Enter OTP sent to {forgotEmail}
                  </p>

                  <div className="pt-1">
                    <OtpInputs
                      value={forgotOtp}
                      onChange={setForgotOtp}
                      disabled={loading}
                    />
                  </div>

                  <button className="w-full bg-primary text-white py-3 rounded-lg">
                    Verify OTP
                  </button>
                </form>
              )}

              {forgotStep === 'reset' && (
                <form onSubmit={handleResetPassword}>
                  <h2 className="text-xl font-semibold">Reset Password</h2>
                  <div className="relative mt-4">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password"
                      minLength={6}
                      className="w-full border p-3 rounded pr-10"
                    />
                    {newPassword && !isPasswordValid && (
                      <p className="text-red-500 text-sm mt-1">
                        Password must be at least 6 characters
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3"
                    >
                      {showNewPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  <div className="relative mt-4">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      // autoComplete="new-password"
                      autoComplete="off"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full border p-3 rounded pr-10"
                    />
                    {confirmPassword && !doPasswordsMatch && (
                      <p className="text-red-500 text-sm mt-1">
                        Passwords do not match
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-3"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!isPasswordValid || !doPasswordsMatch}
                    className="mt-4 w-full bg-primary text-white py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reset Password
                  </button>
                </form>
              )}
            </>
          )}
          {/* ================= FORGOT PASSWORD UI END ================= */}

          {/* ── SIGNUP FORM ── */}
          {/* {!showForgotPassword && screen === 'signup' && (
            <form onSubmit={handleSignup} className="flex flex-col flex-1 pt-2">
              <h2
                id="auth-modal-title"
                className="text-xl font-semibold text-black pr-8"
              >
                Create your account
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter your details to sign up
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-800">
                    Full name
                  </label>
                  <input
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="mt-2 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-800">
                    Email
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-2 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    required
                  />
                </div>
            
                <div>
                  <label className="text-sm font-medium text-gray-800">
                    Password
                  </label>

                  <div className="relative mt-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      // autoComplete="new-password"
                      autoComplete="off"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                      required
                      minLength={6}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-800">
                    Referral Code{' '}
                    <span className="text-gray-400 font-normal">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={referralCode}
                    onChange={(e) =>
                      setReferralCode(e.target.value.toUpperCase())
                    }
                    placeholder="e.g. RNP-A2X9KL"
                    maxLength={10}
                    className="mt-2 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm tracking-widest uppercase placeholder:tracking-normal placeholder:normal-case"
                  />
             
                </div>
              </div>

              <label className="flex items-start gap-2 mt-4 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300"
                />
                <span>
                  I agree to the{' '}
                  <span className="text-primary">Terms & Conditions</span> and{' '}
                  <span className="text-primary">Privacy Policy</span>.
                </span>
              </label>

              {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full bg-primary hover:bg-primary-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Creating account…' : 'Create account'}
                <ArrowRight size={18} />
              </button>

              <p className="text-sm text-gray-600 mt-6 text-center">
                Already have an account?{' '}
                <button
                  type="button"
                  className="text-primary font-medium hover:underline"
                  onClick={() => {
                    reset();
                    setScreen('login');
                  }}
                >
                  Login
                </button>
              </p>
            </form>
          )} */}

          {/* ── SIGNUP FORM ── */}
          {!showForgotPassword && screen === 'signup' && (
            <form
              onSubmit={handleSignup}
              className="flex flex-col flex-1 pt-2 min-h-0"
            >
              <h2
                id="auth-modal-title"
                className="text-xl font-semibold text-black pr-8 shrink-0"
              >
                Create your account
              </h2>
              <p className="text-sm text-gray-500 mt-1 shrink-0">
                Enter your details to sign up
              </p>

              <div
                className="flex-1 overflow-y-auto min-h-0 mt-6"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <style>{`
        .signup-scroll-area::-webkit-scrollbar { display: none; }
      `}</style>

                <div className="signup-scroll-area space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-800">
                      Full name
                    </label>
                    <input
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="mt-2 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-800">
                      Email
                    </label>
                    <input
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="mt-2 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-800">
                      Password
                    </label>
                    <div className="relative mt-2">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="off"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-800">
                      Referral Code{' '}
                      <span className="text-gray-400 font-normal">
                        (optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      autoComplete="off"
                      value={referralCode}
                      onChange={(e) =>
                        setReferralCode(e.target.value.toUpperCase())
                      }
                      placeholder="e.g. RNP-A2X9KL"
                      maxLength={10}
                      className="mt-2 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm tracking-widest uppercase placeholder:tracking-normal placeholder:normal-case"
                    />
                  </div>

                  <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                      className="mt-0.5 rounded border-gray-300"
                    />
                    {/* <span>
                      I agree to the{' '}
                      <span className="text-primary">Terms & Conditions</span>{' '}
                      and <span className="text-primary">Privacy Policy</span>.
                    </span> */}

                    <span>
                      I agree to the{' '}
                      <a
                        href="/terms-and-conditions"
                        className="text-primary hover:underline"
                      >
                        Terms & Conditions
                      </a>{' '}
                      and{' '}
                      <a
                        href="/privacy-policy"
                        className="text-primary hover:underline"
                      >
                        Privacy Policy
                      </a>
                      .
                    </span>
                  </label>

                  {error && <p className="text-red-600 text-sm">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'Creating account…' : 'Create account'}
                    <ArrowRight size={18} />
                  </button>

                  <p className="text-sm text-gray-600 text-center pb-2">
                    Already have an account?{' '}
                    <button
                      type="button"
                      className="text-primary font-medium hover:underline"
                      onClick={() => {
                        reset();
                        setScreen('login');
                      }}
                    >
                      Login
                    </button>
                  </p>
                </div>
              </div>
            </form>
          )}

          {/* ── OTP FORM ── */}
          {!showForgotPassword && screen === 'otp' && (
            <form
              onSubmit={handleVerifyOtp}
              className="flex flex-col flex-1 pt-2"
            >
              <h2
                id="auth-modal-title"
                className="text-xl font-semibold text-black pr-8"
              >
                Verify your email
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter the 6-digit code sent to{' '}
                <span className="font-medium text-gray-700">
                  {emailAddress}
                </span>
              </p>
              {/* 
              {devOtpRevealed ? (
                <div className="mt-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm text-center">
                  Test OTP auto-filled for this environment.
                </div>
              ) : null} */}

              <div className="mt-6">
                <label className="text-sm font-medium text-gray-800 mb-2 block">
                  One-time otp
                </label>
                <OtpInputs value={otp} onChange={setOtp} disabled={loading} />
              </div>

              {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="mt-6 w-full bg-primary hover:bg-primary-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Verifying…' : 'Verify & continue'}
                <ArrowRight size={18} />
              </button>

              <p className="text-sm text-gray-600 mt-6 text-center">
                <button
                  type="button"
                  className="text-primary font-medium hover:underline"
                  onClick={() => {
                    reset();
                    setOtp('');
                    setDevOtpRevealed(false);
                    setScreen('signup');
                  }}
                >
                  ← Back to sign up
                </button>
              </p>
            </form>
          )}

          {/* ── MOBILE NUMBER FORM ── */}
          {!showForgotPassword && screen === 'mobile-login' && (
            <form
              onSubmit={handleMobileSubmit}
              className="flex flex-col flex-1 pt-2"
            >
              <h2
                id="auth-modal-title"
                className="text-lg sm:text-xl font-semibold text-black pr-8 whitespace-nowrap"
              >
                <span style={{ color: '#F97316' }}>Login or Sign up</span> to
                Rentnpay
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter your phone number to continue
              </p>

              <div className="mt-6">
                <label className="text-sm font-medium text-gray-800">
                  Phone number
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={mobileNumber}
                  onChange={(e) =>
                    setMobileNumber(
                      e.target.value.replace(/\D/g, '').slice(0, 10),
                    )
                  }
                  placeholder="Enter your phone number"
                  className="mt-2 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                  required
                />
              </div>

              <div className="mt-4 space-y-3">
                <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mobileAgreeTerms}
                    onChange={(e) => setMobileAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-gray-300"
                  />
                  <span>
                    I agree to the{' '}
                    <a
                      href="/terms-and-conditions"
                      className="text-primary hover:underline"
                    >
                      Terms & Conditions
                    </a>{' '}
                    &{' '}
                    <a
                      href="/privacy-policy"
                      className="text-primary hover:underline"
                    >
                      Privacy Policy
                    </a>
                  </span>
                </label>

                <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mobileWantsConsultation}
                    onChange={(e) =>
                      setMobileWantsConsultation(e.target.checked)
                    }
                    className="mt-0.5 rounded border-gray-300"
                  />
                  <span>
                    Get free expert furnishing consultation from Rentnpay
                  </span>
                </label>
              </div>

              {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

              <button
                type="submit"
                disabled={loading || mobileNumber.length !== 10}
                className="mt-6 w-full bg-primary hover:bg-primary-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Sending OTP…' : 'Get OTP'}
                <ArrowRight size={18} />
              </button>

              <p className="text-[10px] text-gray-500 mt-3 text-center">
                By continuing, you agree to receive promotional messages
              </p>
            </form>
          )}
          {/* ── MOBILE OTP FORM ── */}
          {!showForgotPassword && screen === 'mobile-otp' && (
            <form
              onSubmit={handleVerifyMobileOtp}
              className="flex flex-col flex-1 pt-2"
            >
              <h2
                id="auth-modal-title"
                className="text-xl font-semibold text-black pr-8"
              >
                Verify your number
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter the 6-digit code sent to{' '}
                <span className="font-medium text-gray-700">
                  {mobileNumber}
                </span>
              </p>

              <div className="mt-6">
                <label className="text-sm font-medium text-gray-800 mb-2 block">
                  One-time otp (123456)
                </label>
                <OtpInputs
                  value={mobileOtp}
                  onChange={setMobileOtp}
                  disabled={loading}
                />
              </div>

              {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

              <button
                type="submit"
                disabled={loading || mobileOtp.length !== 6}
                className="mt-6 w-full bg-primary hover:bg-primary-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Verifying…' : 'Verify & continue'}
                <ArrowRight size={18} />
              </button>

              <p className="text-sm text-gray-600 mt-6 text-center">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
                  onClick={() => {
                    reset();
                    setMobileOtp('');
                    setScreen('mobile-login');
                  }}
                >
                  <ArrowLeft size={14} />
                  Change phone number
                </button>
              </p>
            </form>
          )}

          {/* ── MOBILE SIGNUP FORM (new user) ── */}
          {!showForgotPassword && screen === 'mobile-signup' && (
            <form
              onSubmit={handleMobileSignup}
              className="flex flex-col flex-1 pt-2 min-h-0"
            >
              {/* <h2
                id="auth-modal-title"
                className="text-xl font-semibold text-black pr-8 shrink-0"
              >
                Enter below details to signup
              </h2> */}
              <h2
                id="auth-modal-title"
                className="text-xl font-semibold text-black pr-8 shrink-0"
              >
                <span style={{ color: '#F97316' }}>Enter below details</span> to
                signup
              </h2>

              <div
                className="mobile-signup-scroll-area flex-1 overflow-y-auto min-h-0 mt-3 space-y-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <style>{`
        .mobile-signup-scroll-area::-webkit-scrollbar { display: none; }
      `}</style>

                <div>
                  <label className="text-sm font-medium text-gray-800">
                    Full Name <span className="text-red-500 text-xs">*</span>
                  </label>
                  <input
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="mt-2 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-800">
                    Email <span className="text-red-500 text-xs">*</span>
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="mt-2 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-800">
                    Referral Code{' '}
                    <span className="text-gray-400 font-normal">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={referralCode}
                    onChange={(e) =>
                      setReferralCode(e.target.value.toUpperCase())
                    }
                    placeholder="e.g. RNP-A2X9HL"
                    maxLength={10}
                    className="mt-2 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm tracking-widest uppercase placeholder:tracking-normal placeholder:normal-case"
                  />
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mobileSignupAgreeTerms}
                    onChange={(e) =>
                      setMobileSignupAgreeTerms(e.target.checked)
                    }
                    className="mt-0.5 rounded border-gray-300"
                  />
                  <span>
                    I agree to the{' '}
                    <a
                      //   href="https://www.rentomojo.com/terms-and-conditions"
                      //   target="_blank"
                      //   rel="noopener noreferrer"
                      //   className="text-primary hover:underline"
                      // >
                      //   Terms & Conditions
                      // </a>{' '}
                      // &{' '}
                      // <a
                      //   href="https://www.rentomojo.com/privacy-policy"
                      //   target="_blank"
                      //   rel="noopener noreferrer"
                      //   className="text-primary hover:underline"
                      // >
                      //   Privacy Policy
                      // </a>

                      href="/terms-and-conditions"
                      className="text-primary hover:underline"
                    >
                      Terms & Conditions
                    </a>{' '}
                    &{' '}
                    <a
                      href="/privacy-policy"
                      className="text-primary hover:underline"
                    >
                      Privacy Policy
                    </a>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Creating account…' : 'Continue'}
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
          )}

          {/* ── LOGIN FORM ── */}
          {!showForgotPassword && screen === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col flex-1 pt-2">
              <h2
                id="auth-modal-title"
                className="text-xl font-semibold text-black pr-8"
              >
                Login to your account
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter your email and password
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-800">
                    Email
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-2 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    required
                  />
                </div>
                {/* <div>
                  <label className="text-sm font-medium text-gray-800">
                    Password
                  </label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="mt-2 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    required
                  />
                </div> */}
                <div>
                  <label className="text-sm font-medium text-gray-800">
                    Password
                  </label>

                  <div className="relative mt-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      // autoComplete="current-password"
                      autoComplete="off"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your password"
                      className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-right mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setForgotStep('email');
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot Password?
                </button>
              </p>

              {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full bg-primary hover:bg-primary-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Logging in…' : 'Login'}
                <ArrowRight size={18} />
              </button>

              <p className="text-sm text-gray-600 mt-6 text-center">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  className="text-primary font-medium hover:underline"
                  onClick={() => {
                    reset();
                    setScreen('signup');
                  }}
                >
                  Sign up
                </button>
              </p>

              <p className="text-sm text-gray-600 mt-3 text-center">
                <button
                  type="button"
                  className="text-primary font-medium hover:underline"
                  onClick={() => {
                    reset();
                    setMobileNumber('');
                    setMobileOtp('');
                    setScreen('mobile-login');
                  }}
                >
                  {/* Login with mobile number */}
                  Login or Sign up to Rentnpay
                </button>
              </p>
            </form>
          )}

          {/* ── FORGOT PASSWORD FORM ── */}
          {/* {screen === 'forgot-password' && (
            <form
              onSubmit={handleForgotPassword}
              className="flex flex-col flex-1 pt-2"
            >
              <h2
                id="auth-modal-title"
                className="text-xl font-semibold text-black pr-8"
              >
                Forgot Password
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Enter your registered email
              </p>

              <div className="mt-6">
                <label className="text-sm font-medium text-gray-800">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

              <button
                type="submit"
                className="mt-6 w-full bg-primary text-white py-3 rounded-lg"
              >
                Send OTP
              </button>

              <p className="text-sm text-center mt-4">
                <button
                  type="button"
                  onClick={() => setScreen('login')}
                  className="text-primary hover:underline"
                >
                  ← Back to login
                </button>
              </p>
            </form>
          )} */}

          {/* ── RESET PASSWORD FORM ── */}
          {/* {screen === 'reset-password' && (
            <form
              onSubmit={handleResetPassword}
              className="flex flex-col flex-1 pt-2"
            >
              <h2 className="text-xl font-semibold">Reset Password</h2>

              <p className="text-sm text-gray-500 mt-1">
                Enter OTP and new password
              </p>

              <div className="mt-6">
                <OtpInputs value={otp} onChange={setOtp} disabled={loading} />
              </div>

              <div className="mt-4">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full px-3 py-2.5 border rounded-lg"
                />
              </div>

              <div className="mt-4">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full px-3 py-2.5 border rounded-lg"
                />
              </div>

              {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

              <button
                type="submit"
                className="mt-6 w-full bg-primary text-white py-3 rounded-lg"
              >
                Reset Password
              </button>
            </form>
          )} */}
        </div>
      </div>
    </div>
  );
}
