// 'use client';

// import React, { useState, useEffect } from 'react';
// import {
//   Mail,
//   Lock,
//   User,
//   Eye,
//   EyeOff,
//   Phone,
//   MapPin,
//   UserCog,
// } from 'lucide-react';
// // import { useRouter } from 'next/navigation';
// // import { useDispatch, useSelector } from 'react-redux';
// // import {
// //   adminLogin,
// //   subAdminRegister,
// //   clearError,
// // } from '../../../redux/slices/adminSlice';
// // import LocationPicker from '../AdminAuth/LocationPicker';
// import { useRouter } from 'next/navigation';
// import { useDispatch, useSelector } from 'react-redux';
// import dynamic from 'next/dynamic';
// import portalLoginImage from '@/assets/images/portal-login.png';
// import {
//   adminLogin,
//   subAdminRegister,
//   clearError,
// } from '../../../redux/slices/adminSlice';

// const LocationPicker = dynamic(() => import('../AdminAuth/LocationPicker'), {
//   ssr: false,
// });

// const AdminLogin = () => {
//   const [activeTab, setActiveTab] = useState('admin'); // 'admin' | 'subadmin'
//   const [subAdminMode, setSubAdminMode] = useState('login'); // 'login' | 'register'
//   const [showMapPicker, setShowMapPicker] = useState(false);

//   const [formData, setFormData] = useState({
//     identifier: '',
//     password: '',
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [showRegPassword, setShowRegPassword] = useState(false);

//   // ---- NEW: subadmin registration form state ----
//   const [regData, setRegData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     password: '',
//     location: '',
//   });
//   const [detectingLocation, setDetectingLocation] = useState(false);
//   const [registerSuccess, setRegisterSuccess] = useState('');
//   const [regErrors, setRegErrors] = useState({});

//   const router = useRouter();
//   const dispatch = useDispatch();
//   const { loading, error } = useSelector((state) => state.admin);

//   useEffect(() => {
//     if (!error) return;
//     const timer = setTimeout(() => {
//       dispatch(clearError());
//     }, 5000);
//     return () => clearTimeout(timer);
//   }, [error, dispatch]);

//   // ---- Auto-detect location when SubAdmin + Register mode opens ----
//   useEffect(() => {
//     if (
//       activeTab === 'subadmin' &&
//       subAdminMode === 'register' &&
//       !regData.location
//     ) {
//       detectLocation();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [activeTab, subAdminMode]);

//   const detectLocation = () => {
//     if (!navigator.geolocation) {
//       setRegData((prev) => ({ ...prev, location: '' }));
//       return;
//     }
//     setDetectingLocation(true);
//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         try {
//           const { latitude, longitude } = position.coords;
//           const res = await fetch(
//             `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
//           );
//           const data = await res.json();
//           const detectedState =
//             data.principalSubdivision || data.locality || '';
//           setRegData((prev) => ({ ...prev, location: detectedState }));
//         } catch (err) {
//           console.error('Location detect failed:', err);
//         } finally {
//           setDetectingLocation(false);
//         }
//       },
//       (err) => {
//         console.error('Geolocation error:', err);
//         setDetectingLocation(false);
//       },
//     );
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleRegChange = (e) => {
//     const { name, value } = e.target;
//     setRegData((prev) => ({ ...prev, [name]: value }));
//     setRegErrors((prev) => ({ ...prev, [name]: '' }));
//   };

//   // ---- EXISTING login handler — untouched ----
//   const handleLogin = async (e) => {
//     e.preventDefault();

//     if (!formData.identifier || !formData.password) {
//       alert('Please enter both identifier and password');
//       return;
//     }

//     //   try {
//     //     const result = await dispatch(adminLogin(formData)).unwrap();
//     //     console.log('Admin login successful:', result);
//     //     router.push('/dashboard');
//     //   } catch (error) {
//     //     console.error('Admin login failed:', error);
//     //   }
//     // };

//     // try {
//     //   const expectedRole = activeTab === 'subadmin' ? 'subadmin' : 'admin';
//     //   const result = await dispatch(
//     //     adminLogin({ ...formData, expectedRole }),
//     //   ).unwrap();
//     //   // console.log('Admin login successful:', result);
//     //   router.push('/dashboard');
//     // } catch (error) {
//     //   // console.error('Admin login failed:', error);
//     // }
//     try {
//       const result = await dispatch(adminLogin({ ...formData })).unwrap();
//       // console.log('Admin login successful:', result);
//       router.push('/dashboard');
//     } catch (error) {
//       // console.error('Admin login failed:', error);
//     }
//   };

//   // ---- NEW: subadmin registration handler ----
//   const validateRegForm = () => {
//     const errors = {};

//     if (!regData.name.trim()) {
//       errors.name = 'Full name is required';
//     }

//     if (!regData.email.trim()) {
//       errors.email = 'Email is required';
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regData.email)) {
//       errors.email = 'Enter a valid email address';
//     }

//     if (!regData.phone.trim()) {
//       errors.phone = 'Phone number is required';
//     } else if (!/^[0-9]{10}$/.test(regData.phone)) {
//       errors.phone = 'Enter a valid 10-digit phone number';
//     }

//     if (!regData.password) {
//       errors.password = 'Password is required';
//     } else if (regData.password.length < 6) {
//       errors.password = 'Password must be at least 6 characters';
//     }

//     if (!regData.location) {
//       errors.location = 'Please select a location on the map';
//     }

//     setRegErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSubAdminRegister = async (e) => {
//     e.preventDefault();
//     setRegisterSuccess('');

//     if (!validateRegForm()) {
//       return;
//     }

//     try {
//       const result = await dispatch(subAdminRegister(regData)).unwrap();
//       setRegisterSuccess(
//         result.message || 'Registered! Waiting for admin approval.',
//       );
//       setRegData({
//         name: '',
//         email: '',
//         phone: '',
//         password: '',
//         location: '',
//       });
//       setRegErrors({});
//       setTimeout(() => setSubAdminMode('login'), 2500);
//     } catch (err) {
//       console.error('SubAdmin registration failed:', err);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
//       <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
//         <div className="grid grid-cols-1 md:grid-cols-2 min-h-[480px]">
//           {/* Left Side - unchanged */}
//           {/* <div className="bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center p-6">
//             <div className="w-full h-full bg-white/10 rounded-lg flex items-center justify-center">
//               <div className="text-center text-white">
//                 <User className="w-16 h-16 text-white mx-auto mb-3" />

//                 <h2 className="text-2xl font-bold">Authorized Portal</h2>

//                 <p className="mt-2 opacity-90">
//                   Sign in to manage the platform
//                 </p>
//               </div>
//             </div>
//           </div> */}
//           {/* Left Side - now shows portal-login.png image */}
//           <div className="relative flex items-center justify-center">
//             <img
//               src={portalLoginImage.src}
//               alt="Authorized Portal"
//               className="w-full h-full object-cover"
//             />
//           </div>

//           {/* Right Side */}
//           <div className="flex items-center justify-center p-6 md:p-8">
//             <div className="w-full max-w-sm">
//               {/* ---- NEW: Role Tabs ---- */}
//               {/* <div className="flex mb-6 border border-gray-200 rounded-lg overflow-hidden">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setActiveTab('admin');
//                     dispatch(clearError());
//                   }}
//                   className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
//                     activeTab === 'admin'
//                       ? 'bg-orange-600 text-white'
//                       : 'bg-white text-gray-600 hover:bg-gray-50'
//                   }`}
//                 >
//                   Admin
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setActiveTab('subadmin');
//                     dispatch(clearError());
//                   }}
//                   className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
//                     activeTab === 'subadmin'
//                       ? 'bg-orange-600 text-white'
//                       : 'bg-white text-gray-600 hover:bg-gray-50'
//                   }`}
//                 >
//                   SubAdmin
//                 </button>
//               </div> */}

//               {/* <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
//                 {activeTab === 'admin'
//                   ? 'Admin Sign In'
//                   : subAdminMode === 'login'
//                     ? 'SubAdmin Sign In'
//                     : 'SubAdmin Registration'}
//               </h1> */}
//               <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-5 text-center">
//                 Portal Sign In
//               </h1>

//               {error && (
//                 <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-center">
//                   {error}
//                 </div>
//               )}
//               {registerSuccess && (
//                 <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-center">
//                   {registerSuccess}
//                 </div>
//               )}

//               {/* ---- EXISTING admin login form — shown for both Admin tab AND SubAdmin-login mode ---- */}
//               {(activeTab === 'admin' ||
//                 (activeTab === 'subadmin' && subAdminMode === 'login')) && (
//                 <form onSubmit={handleLogin}>
//                   <div className="mb-4">
//                     <label
//                       htmlFor="identifier"
//                       className="block text-sm font-medium text-gray-700 mb-2"
//                     >
//                       Email *
//                     </label>
//                     <div className="relative">
//                       <div className="absolute left-4 top-1/2 -translate-y-1/2">
//                         <Mail className="w-5 h-5 text-gray-600" />
//                       </div>
//                       <input
//                         id="identifier"
//                         name="identifier"
//                         type="text"
//                         placeholder="Enter your email"
//                         value={formData.identifier}
//                         onChange={handleInputChange}
//                         disabled={loading}
//                         className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700 disabled:bg-gray-100"
//                         required
//                       />
//                     </div>
//                   </div>

//                   <div className="mb-6">
//                     <label
//                       htmlFor="password"
//                       className="block text-sm font-medium text-gray-700 mb-2"
//                     >
//                       Password *
//                     </label>
//                     <div className="relative">
//                       <div className="absolute left-4 top-1/2 -translate-y-1/2">
//                         <Lock className="w-5 h-5 text-gray-600" />
//                       </div>
//                       <input
//                         id="password"
//                         name="password"
//                         type={showPassword ? 'text' : 'password'}
//                         placeholder="Enter your password"
//                         value={formData.password}
//                         onChange={handleInputChange}
//                         disabled={loading}
//                         className="w-full pl-12 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700 disabled:bg-gray-100"
//                         required
//                       />
//                       <div
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-600"
//                       >
//                         {showPassword ? (
//                           <EyeOff size={20} />
//                         ) : (
//                           <Eye size={20} />
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="w-full bg-orange-600 text-white font-semibold py-2.5 rounded-lg hover:bg-orange-700 transition-colors mb-3 disabled:opacity-50 flex items-center justify-center"
//                   >
//                     {loading ? 'Signing In...' : 'Sign In'}
//                   </button>

//                   {/* ---- NEW: link to switch to register, only in subadmin tab ---- */}
//                   {/* {activeTab === 'subadmin' && (
//                     <p className="text-center text-sm text-gray-600 mb-2">
//                       New SubAdmin?{' '}
//                       <span
//                         onClick={() => setSubAdminMode('register')}
//                         className="text-orange-600 font-semibold cursor-pointer hover:underline"
//                       >
//                         Register here
//                       </span>
//                     </p>
//                   )} */}
//                 </form>
//               )}

//               {/* ---- NEW: SubAdmin Registration Form ---- */}
//               {activeTab === 'subadmin' && subAdminMode === 'register' && (
//                 <form onSubmit={handleSubAdminRegister}>
//                   <div className="mb-4">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Full Name *
//                     </label>
//                     <div className="relative">
//                       <div className="absolute left-4 top-1/2 -translate-y-1/2">
//                         <User className="w-5 h-5 text-gray-600" />
//                       </div>
//                       <input
//                         name="name"
//                         type="text"
//                         placeholder="Enter your full name"
//                         value={regData.name}
//                         onChange={handleRegChange}
//                         disabled={loading}
//                         className={`w-full pl-12 pr-4 py-3.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 disabled:bg-gray-100 ${
//                           regErrors.name ? 'border-red-400' : 'border-gray-300'
//                         }`}
//                       />
//                     </div>
//                     {regErrors.name && (
//                       <p className="text-red-600 text-xs mt-1">
//                         {regErrors.name}
//                       </p>
//                     )}
//                   </div>

//                   <div className="mb-4">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Email *
//                     </label>
//                     <div className="relative">
//                       <div className="absolute left-4 top-1/2 -translate-y-1/2">
//                         <Mail className="w-5 h-5 text-gray-600" />
//                       </div>
//                       <input
//                         name="email"
//                         type="email"
//                         placeholder="Enter your email"
//                         value={regData.email}
//                         onChange={handleRegChange}
//                         disabled={loading}
//                         className={`w-full pl-12 pr-4 py-3.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 disabled:bg-gray-100 ${
//                           regErrors.email ? 'border-red-400' : 'border-gray-300'
//                         }`}
//                       />
//                     </div>
//                     {regErrors.email && (
//                       <p className="text-red-600 text-xs mt-1">
//                         {regErrors.email}
//                       </p>
//                     )}
//                   </div>

//                   <div className="mb-4">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Phone Number *
//                     </label>
//                     <div className="relative">
//                       <div className="absolute left-4 top-1/2 -translate-y-1/2">
//                         <Phone className="w-5 h-5 text-gray-600" />
//                       </div>
//                       <input
//                         name="phone"
//                         type="tel"
//                         placeholder="Enter your phone number"
//                         value={regData.phone}
//                         onChange={handleRegChange}
//                         disabled={loading}
//                         className={`w-full pl-12 pr-4 py-3.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 disabled:bg-gray-100 ${
//                           regErrors.phone ? 'border-red-400' : 'border-gray-300'
//                         }`}
//                       />
//                     </div>
//                     {regErrors.phone && (
//                       <p className="text-red-600 text-xs mt-1">
//                         {regErrors.phone}
//                       </p>
//                     )}
//                   </div>

//                   <div className="mb-4">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Password *
//                     </label>
//                     <div className="relative">
//                       <div className="absolute left-4 top-1/2 -translate-y-1/2">
//                         <Lock className="w-5 h-5 text-gray-600" />
//                       </div>
//                       <input
//                         name="password"
//                         type={showRegPassword ? 'text' : 'password'}
//                         placeholder="Create a password"
//                         value={regData.password}
//                         onChange={handleRegChange}
//                         disabled={loading}
//                         className={`w-full pl-12 pr-12 py-3.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 disabled:bg-gray-100 ${
//                           regErrors.password
//                             ? 'border-red-400'
//                             : 'border-gray-300'
//                         }`}
//                       />
//                       <div
//                         onClick={() => setShowRegPassword(!showRegPassword)}
//                         className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-600"
//                       >
//                         {showRegPassword ? (
//                           <EyeOff size={20} />
//                         ) : (
//                           <Eye size={20} />
//                         )}
//                       </div>
//                     </div>
//                     {regErrors.password && (
//                       <p className="text-red-600 text-xs mt-1">
//                         {regErrors.password}
//                       </p>
//                     )}
//                   </div>
//                   {/* ---- Location - selected via map picker ---- */}
//                   <div className="mb-6">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Location *
//                     </label>

//                     {regData.location ? (
//                       <div className="flex items-center justify-between border border-gray-300 rounded-lg px-4 py-3.5 bg-gray-50">
//                         <div className="flex items-center gap-2">
//                           <MapPin className="w-5 h-5 text-orange-600" />
//                           <span className="text-gray-700 font-medium">
//                             {regData.location}
//                           </span>
//                         </div>
//                         <button
//                           type="button"
//                           onClick={() => setShowMapPicker(true)}
//                           className="text-xs text-orange-600 font-semibold hover:underline"
//                         >
//                           Change
//                         </button>
//                       </div>
//                     ) : (
//                       <button
//                         type="button"
//                         onClick={() => setShowMapPicker(true)}
//                         className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg px-4 py-3.5 text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors"
//                       >
//                         <MapPin className="w-5 h-5" />
//                         Select Location on Map
//                       </button>
//                     )}
//                     {regErrors.location && (
//                       <p className="text-red-600 text-xs mt-1">
//                         {regErrors.location}
//                       </p>
//                     )}
//                   </div>

//                   {showMapPicker && (
//                     <LocationPicker
//                       onClose={() => setShowMapPicker(false)}
//                       onConfirm={({ state, place }) => {
//                         setRegData((prev) => ({
//                           ...prev,
//                           location: state,
//                           locationPlace: place,
//                         }));
//                         setShowMapPicker(false);
//                         setRegErrors((prev) => ({ ...prev, location: '' }));
//                       }}
//                     />
//                   )}

//                   <button
//                     type="submit"
//                     disabled={loading || detectingLocation || !regData.location}
//                     className="w-full bg-orange-600 text-white font-semibold py-3.5 rounded-lg hover:bg-orange-700 transition-colors mb-4 disabled:opacity-50 flex items-center justify-center"
//                   >
//                     {loading ? 'Registering...' : 'Register'}
//                   </button>

//                   <p className="text-center text-sm text-gray-600">
//                     Already registered?{' '}
//                     <span
//                       onClick={() => setSubAdminMode('login')}
//                       className="text-orange-600 font-semibold cursor-pointer hover:underline"
//                     >
//                       Sign in
//                     </span>
//                   </p>
//                 </form>
//               )}

//               {/* <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
//                 <p className="text-yellow-800 text-sm text-center">
//                   <strong>Note:</strong>{' '}
//                   {activeTab === 'admin'
//                     ? 'This portal is for authorized administrators only.'
//                     : 'SubAdmin access requires admin approval after registration.'}
//                 </p>
//               </div> */}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminLogin;

'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  UserCog,
} from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   adminLogin,
//   subAdminRegister,
//   clearError,
// } from '../../../redux/slices/adminSlice';
// import LocationPicker from '../AdminAuth/LocationPicker';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import dynamic from 'next/dynamic';
import portalLoginImage from '@/assets/images/portal-login.png';
import {
  adminLogin,
  subAdminRegister,
  clearError,
  adminForgotPassword,
  adminVerifyOtp,
  adminResetPassword,
} from '../../../redux/slices/adminSlice';

const LocationPicker = dynamic(() => import('../AdminAuth/LocationPicker'), {
  ssr: false,
});

const AdminLogin = () => {
  const [activeTab, setActiveTab] = useState('admin'); // 'admin' | 'subadmin'
  const [subAdminMode, setSubAdminMode] = useState('login'); // 'login' | 'register'
  const [showMapPicker, setShowMapPicker] = useState(false);

  // ---- NEW: forgot password flow ----
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState('email'); // 'email' | 'otp' | 'reset'
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotErr, setForgotErr] = useState('');
  const [forgotBusy, setForgotBusy] = useState(false);

  const resetForgotState = () => {
    setShowForgotModal(false);
    setForgotStep('email');
    setForgotEmail('');
    setForgotOtp('');
    setForgotNewPassword('');
    setForgotMsg('');
    setForgotErr('');
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setForgotErr('');
    setForgotMsg('');
    if (!forgotEmail.trim()) {
      setForgotErr('Please enter your email');
      return;
    }
    setForgotBusy(true);
    try {
      const res = await dispatch(
        adminForgotPassword({ email: forgotEmail.trim() }),
      ).unwrap();
      setForgotMsg(res.message || 'OTP sent to your email');
      setForgotStep('otp');
    } catch (err) {
      setForgotErr(err || 'Failed to send OTP');
    } finally {
      setForgotBusy(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setForgotErr('');
    if (!forgotOtp.trim()) {
      setForgotErr('Please enter the OTP');
      return;
    }
    setForgotBusy(true);
    try {
      await dispatch(
        adminVerifyOtp({ email: forgotEmail.trim(), otp: forgotOtp.trim() }),
      ).unwrap();
      setForgotStep('reset');
      setForgotMsg('');
    } catch (err) {
      setForgotErr(err || 'Invalid OTP');
    } finally {
      setForgotBusy(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotErr('');
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setForgotErr('Password must be at least 6 characters');
      return;
    }
    setForgotBusy(true);
    try {
      const res = await dispatch(
        adminResetPassword({
          email: forgotEmail.trim(),
          otp: forgotOtp.trim(),
          newPassword: forgotNewPassword,
        }),
      ).unwrap();
      setForgotMsg(res.message || 'Password reset successful');
      setTimeout(() => resetForgotState(), 2000);
    } catch (err) {
      setForgotErr(err || 'Failed to reset password');
    } finally {
      setForgotBusy(false);
    }
  };

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // ---- NEW: subadmin registration form state ----
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    location: '',
  });
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [regErrors, setRegErrors] = useState({});

  const router = useRouter();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => {
      dispatch(clearError());
    }, 5000);
    return () => clearTimeout(timer);
  }, [error, dispatch]);

  // ---- Auto-detect location when SubAdmin + Register mode opens ----
  useEffect(() => {
    if (
      activeTab === 'subadmin' &&
      subAdminMode === 'register' &&
      !regData.location
    ) {
      detectLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, subAdminMode]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setRegData((prev) => ({ ...prev, location: '' }));
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          );
          const data = await res.json();
          const detectedState =
            data.principalSubdivision || data.locality || '';
          setRegData((prev) => ({ ...prev, location: detectedState }));
        } catch (err) {
          console.error('Location detect failed:', err);
        } finally {
          setDetectingLocation(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setDetectingLocation(false);
      },
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegChange = (e) => {
    const { name, value } = e.target;
    setRegData((prev) => ({ ...prev, [name]: value }));
    setRegErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // ---- EXISTING login handler — untouched ----
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.identifier || !formData.password) {
      alert('Please enter both identifier and password');
      return;
    }

    //   try {
    //     const result = await dispatch(adminLogin(formData)).unwrap();
    //     console.log('Admin login successful:', result);
    //     router.push('/dashboard');
    //   } catch (error) {
    //     console.error('Admin login failed:', error);
    //   }
    // };

    // try {
    //   const expectedRole = activeTab === 'subadmin' ? 'subadmin' : 'admin';
    //   const result = await dispatch(
    //     adminLogin({ ...formData, expectedRole }),
    //   ).unwrap();
    //   // console.log('Admin login successful:', result);
    //   router.push('/dashboard');
    // } catch (error) {
    //   // console.error('Admin login failed:', error);
    // }
    try {
      const result = await dispatch(adminLogin({ ...formData })).unwrap();
      // console.log('Admin login successful:', result);
      router.push('/dashboard');
    } catch (error) {
      // console.error('Admin login failed:', error);
    }
  };

  // ---- NEW: subadmin registration handler ----
  const validateRegForm = () => {
    const errors = {};

    if (!regData.name.trim()) {
      errors.name = 'Full name is required';
    }

    if (!regData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regData.email)) {
      errors.email = 'Enter a valid email address';
    }

    if (!regData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(regData.phone)) {
      errors.phone = 'Enter a valid 10-digit phone number';
    }

    if (!regData.password) {
      errors.password = 'Password is required';
    } else if (regData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!regData.location) {
      errors.location = 'Please select a location on the map';
    }

    setRegErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubAdminRegister = async (e) => {
    e.preventDefault();
    setRegisterSuccess('');

    if (!validateRegForm()) {
      return;
    }

    try {
      const result = await dispatch(subAdminRegister(regData)).unwrap();
      setRegisterSuccess(
        result.message || 'Registered! Waiting for admin approval.',
      );
      setRegData({
        name: '',
        email: '',
        phone: '',
        password: '',
        location: '',
      });
      setRegErrors({});
      setTimeout(() => setSubAdminMode('login'), 2500);
    } catch (err) {
      console.error('SubAdmin registration failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[480px]">
          {/* Left Side - unchanged */}
          {/* <div className="bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center p-6">
            <div className="w-full h-full bg-white/10 rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <User className="w-16 h-16 text-white mx-auto mb-3" />

                <h2 className="text-2xl font-bold">Authorized Portal</h2>

                <p className="mt-2 opacity-90">
                  Sign in to manage the platform
                </p>
              </div>
            </div>
          </div> */}
          {/* Left Side - now shows portal-login.png image */}
          <div className="relative flex items-center justify-center">
            <img
              src={portalLoginImage.src}
              alt="Authorized Portal"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Side */}
          <div className="flex items-center justify-center p-6 md:p-8">
            <div className="w-full max-w-sm">
              {/* ---- NEW: Role Tabs ---- */}
              {/* <div className="flex mb-6 border border-gray-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('admin');
                    dispatch(clearError());
                  }}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                    activeTab === 'admin'
                      ? 'bg-orange-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('subadmin');
                    dispatch(clearError());
                  }}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                    activeTab === 'subadmin'
                      ? 'bg-orange-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  SubAdmin
                </button>
              </div> */}

              {/* <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
                {activeTab === 'admin'
                  ? 'Admin Sign In'
                  : subAdminMode === 'login'
                    ? 'SubAdmin Sign In'
                    : 'SubAdmin Registration'}
              </h1> */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-5 text-center">
                Portal Sign In
              </h1>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-center">
                  {error}
                </div>
              )}
              {registerSuccess && (
                <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-center">
                  {registerSuccess}
                </div>
              )}

              {/* ---- EXISTING admin login form — shown for both Admin tab AND SubAdmin-login mode ---- */}
              {(activeTab === 'admin' ||
                (activeTab === 'subadmin' && subAdminMode === 'login')) && (
                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <label
                      htmlFor="identifier"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {activeTab === 'subadmin' ? 'Username' : 'Email'}{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Mail className="w-5 h-5 text-gray-600" />
                      </div>
                      <input
                        id="identifier"
                        name="identifier"
                        type="text"
                        placeholder={
                          activeTab === 'subadmin'
                            ? 'e.g. rnpadm-bangalore'
                            : 'Enter your email'
                        }
                        value={formData.identifier}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700 disabled:bg-gray-100"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {/* Password * */}
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Lock className="w-5 h-5 text-gray-600" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="w-full pl-12 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700 disabled:bg-gray-100"
                        required
                      />
                      <div
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </div>
                    </div>
                  </div>
                  {/* 
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-orange-600 text-white font-semibold py-2.5 rounded-lg hover:bg-orange-700 transition-colors mb-3 disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </button>

                  <div className="flex justify-end -mt-1 mb-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs sm:text-sm text-orange-600 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div> */}
                  <div className="flex justify-end mb-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs sm:text-sm text-orange-600 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-orange-600 text-white font-semibold py-2.5 rounded-lg hover:bg-orange-700 transition-colors mb-3 disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </button>

                  {/* ---- NEW: link to switch to register, only in subadmin tab ---- */}
                  {/* {activeTab === 'subadmin' && (
                    <p className="text-center text-sm text-gray-600 mb-2">
                      New SubAdmin?{' '}
                      <span
                        onClick={() => setSubAdminMode('register')}
                        className="text-orange-600 font-semibold cursor-pointer hover:underline"
                      >
                        Register here
                      </span>
                    </p>
                  )} */}
                </form>
              )}

              {/* ---- NEW: SubAdmin Registration Form ---- */}
              {activeTab === 'subadmin' && subAdminMode === 'register' && (
                <form onSubmit={handleSubAdminRegister}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <input
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={regData.name}
                        onChange={handleRegChange}
                        disabled={loading}
                        className={`w-full pl-12 pr-4 py-3.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 disabled:bg-gray-100 ${
                          regErrors.name ? 'border-red-400' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {regErrors.name && (
                      <p className="text-red-600 text-xs mt-1">
                        {regErrors.name}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {/* Email * */}
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Mail className="w-5 h-5 text-gray-600" />
                      </div>
                      <input
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={regData.email}
                        onChange={handleRegChange}
                        disabled={loading}
                        className={`w-full pl-12 pr-4 py-3.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 disabled:bg-gray-100 ${
                          regErrors.email ? 'border-red-400' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {regErrors.email && (
                      <p className="text-red-600 text-xs mt-1">
                        {regErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Phone className="w-5 h-5 text-gray-600" />
                      </div>
                      <input
                        name="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={regData.phone}
                        onChange={handleRegChange}
                        disabled={loading}
                        className={`w-full pl-12 pr-4 py-3.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 disabled:bg-gray-100 ${
                          regErrors.phone ? 'border-red-400' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {regErrors.phone && (
                      <p className="text-red-600 text-xs mt-1">
                        {regErrors.phone}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {/* Password * */}
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Lock className="w-5 h-5 text-gray-600" />
                      </div>
                      <input
                        name="password"
                        type={showRegPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        value={regData.password}
                        onChange={handleRegChange}
                        disabled={loading}
                        className={`w-full pl-12 pr-12 py-3.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 disabled:bg-gray-100 ${
                          regErrors.password
                            ? 'border-red-400'
                            : 'border-gray-300'
                        }`}
                      />
                      <div
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-600"
                      >
                        {showRegPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </div>
                    </div>
                    {regErrors.password && (
                      <p className="text-red-600 text-xs mt-1">
                        {regErrors.password}
                      </p>
                    )}
                  </div>
                  {/* ---- Location - selected via map picker ---- */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>

                    {regData.location ? (
                      <div className="flex items-center justify-between border border-gray-300 rounded-lg px-4 py-3.5 bg-gray-50">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-orange-600" />
                          <span className="text-gray-700 font-medium">
                            {regData.location}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowMapPicker(true)}
                          className="text-xs text-orange-600 font-semibold hover:underline"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowMapPicker(true)}
                        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg px-4 py-3.5 text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors"
                      >
                        <MapPin className="w-5 h-5" />
                        Select Location on Map
                      </button>
                    )}
                    {regErrors.location && (
                      <p className="text-red-600 text-xs mt-1">
                        {regErrors.location}
                      </p>
                    )}
                  </div>

                  {showMapPicker && (
                    <LocationPicker
                      onClose={() => setShowMapPicker(false)}
                      onConfirm={({ state, place }) => {
                        setRegData((prev) => ({
                          ...prev,
                          location: state,
                          locationPlace: place,
                        }));
                        setShowMapPicker(false);
                        setRegErrors((prev) => ({ ...prev, location: '' }));
                      }}
                    />
                  )}

                  <button
                    type="submit"
                    disabled={loading || detectingLocation || !regData.location}
                    className="w-full bg-orange-600 text-white font-semibold py-3.5 rounded-lg hover:bg-orange-700 transition-colors mb-4 disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? 'Registering...' : 'Register'}
                  </button>

                  <p className="text-center text-sm text-gray-600">
                    Already registered?{' '}
                    <span
                      onClick={() => setSubAdminMode('login')}
                      className="text-orange-600 font-semibold cursor-pointer hover:underline"
                    >
                      Sign in
                    </span>
                  </p>
                </form>
              )}

              {/* <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                <p className="text-yellow-800 text-sm text-center">
                  <strong>Note:</strong>{' '}
                  {activeTab === 'admin'
                    ? 'This portal is for authorized administrators only.'
                    : 'SubAdmin access requires admin approval after registration.'}
                </p>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* ---- NEW: Forgot Password Modal ---- */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 relative">
            <button
              type="button"
              onClick={resetForgotState}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Reset Admin Password
            </h2>

            {forgotErr && (
              <div className="mb-3 p-2.5 bg-red-100 text-red-800 rounded-lg text-sm text-center">
                {forgotErr}
              </div>
            )}
            {forgotMsg && (
              <div className="mb-3 p-2.5 bg-green-100 text-green-800 rounded-lg text-sm text-center">
                {forgotMsg}
              </div>
            )}

            {forgotStep === 'email' && (
              <form onSubmit={handleSendOtp}>
                {/* <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registered Email
                </label> */}
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your admin email"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={forgotBusy}
                />
                <button
                  type="submit"
                  disabled={forgotBusy}
                  className="w-full bg-orange-600 text-white font-semibold py-2.5 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {forgotBusy ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            )}

            {forgotStep === 'otp' && (
              <form onSubmit={handleVerifyOtp}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP sent to {forgotEmail}
                </label>
                <input
                  type="text"
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value)}
                  placeholder="6-digit OTP"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={forgotBusy}
                />
                <button
                  type="submit"
                  disabled={forgotBusy}
                  className="w-full bg-orange-600 text-white font-semibold py-2.5 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {forgotBusy ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
            )}

            {forgotStep === 'reset' && (
              <form onSubmit={handleResetPassword}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={forgotBusy}
                />
                <button
                  type="submit"
                  disabled={forgotBusy}
                  className="w-full bg-orange-600 text-white font-semibold py-2.5 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {forgotBusy ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;
