// 'use client';

// import Link from 'next/link';
// import { useState } from 'react';
// import { toast } from 'react-toastify';
// import { apiSubmitContact } from '@/lib/api';
// import {
//   FiHeadphones,
//   FiFileText,
//   FiMapPin,
//   FiPhone,
//   FiSend,
//   FiBriefcase,
//   FiUser,
//   FiMail,
// } from 'react-icons/fi';

// export default function ContactPage() {
//   // ================= STATE =================
//   const [formData, setFormData] = useState({
//     subject: '',
//     fullName: '',
//     email: '',
//     phone: '',
//     message: '',
//   });

//   // ================= HANDLE CHANGE =================
//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   // ================= HANDLE SUBMIT =================
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const { subject, fullName, email, phone, message } = formData;

//     const toastOptions = {
//       position: 'top-right',
//       autoClose: 2000,
//       hideProgressBar: false,
//       closeOnClick: true,
//       pauseOnHover: true,
//       draggable: true,
//       theme: 'light',
//     };

//     if (!subject || !fullName || !email || !phone || !message) {
//       toast.error('Please fill all required fields', toastOptions);
//       return;
//     }

//     if (subject.trim().length < 5) {
//       toast.error('Subject must be at least 5 characters', toastOptions);
//       return;
//     }

//     const nameRegex = /^[A-Za-z0-9\s]{3,50}$/;
//     if (!nameRegex.test(fullName.trim())) {
//       toast.error('Full name must be at least 3 characters', toastOptions);
//       return;
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.com$/i;
//     if (!emailRegex.test(email.trim())) {
//       toast.error('Please enter a valid email address', toastOptions);
//       return;
//     }

//     const phoneRegex = /^[6-9]\d{9}$/;
//     if (!phoneRegex.test(phone.trim())) {
//       toast.error('Please enter a valid 10-digit phone number', toastOptions);
//       return;
//     }

//     if (message.trim().length < 10) {
//       toast.error('Message must be at least 10 characters', toastOptions);
//       return;
//     }

//     try {
//       await apiSubmitContact(formData);

//       toast.success('Inquiry submitted successfully', toastOptions);

//       setFormData({
//         subject: '',
//         fullName: '',
//         email: '',
//         phone: '',
//         message: '',
//       });
//     } catch (error) {
//       console.log(error);
//       toast.error(
//         error?.response?.data?.message || 'Server error, please try again',
//         toastOptions,
//       );
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#f3f5f7]">
//       <div className="w-full max-w-6xl mx-auto py-8 sm:py-10 lg:py-14 px-4 sm:px-6 lg:px-8">
//         {/* HERO */}
//         <div className="text-center mb-8 sm:mb-12">
//           <h1 className="text-3xl sm:text-3xl lg:text-3xl font-bold text-black leading-tight">
//             How Can We Help You?
//           </h1>
//           <p className="mt-3 text-[#6b7280] text-base font-semibold sm:text-lg leading-6 sm:leading-6">
//             Whether you&apos;re a customer or vendor, We&apos;re here to support
//             your <br />
//             journey with Rentnpay.
//           </p>
//         </div>

//         {/* SUPPORT CARD */}
//         <div className="bg-white border border-[#dfe3e8] rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex items-center gap-4 sm:gap-8 mb-6 sm:mb-8 shadow-sm">
//           <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#eef4ff] flex items-center justify-center shrink-0">
//             <FiHeadphones className="text-[#2563eb] text-xl sm:text-3xl" />
//           </div>

//           <div>
//             <h2 className="text-lg sm:text-xl font-semibold text-[#020713]">
//               Customer Support
//             </h2>
//             <p className="text-[#6b7280] mt-1 text-sm sm:text-base">
//               Need help with a rental or service?
//             </p>
//           </div>
//         </div>

//         {/* GRID */}
//         <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 sm:gap-6">
//           {/* LEFT FORM */}
//           <div className="bg-white rounded-3xl border border-[#e5e7eb] shadow-sm overflow-hidden">
//             {/* HEADER */}
//             <div className="p-5 sm:p-8 border-b border-[#f0f0f0] flex items-start gap-3 sm:gap-4">
//               <div className="w-12 h-12 sm:h-16 rounded-2xl bg-[#f3e8ff] flex items-center justify-center shrink-0">
//                 <FiFileText className="text-[#9333ea] text-xl sm:text-3xl" />
//               </div>

//               <div>
//                 <h2 className="text-lg sm:text-xl font-semibold text-black">
//                   Submit Your Inquiry
//                 </h2>
//                 <p className="text-[#6c6d70] mt-1 text-sm sm:text-base">
//                   We&apos;ll get back to you within 24 hours
//                 </p>
//               </div>
//             </div>

//             {/* FORM */}
//             <form
//               onSubmit={handleSubmit}
//               className="p-4 sm:p-6 space-y-4 sm:space-y-6"
//             >
//               {/* SUBJECT */}
//               <div>
//                 <label className="block text-sm font-semibold mb-4 text-[#010613]">
//                   Subject <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   name="subject"
//                   value={formData.subject}
//                   onChange={handleChange}
//                   placeholder="Enter subject of your inquiry "
//                   className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl border border-[#d1d5db] px-4 sm:px-5 text-sm sm:text-base outline-none focus:border-orange-400"
//                 />
//               </div>
//               {/* NAME + EMAIL */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                 {/* FULL NAME */}
//                 <div>
//                   <label className="block text-sm font-semibold mb-3 text-[#010613]">
//                     Full Name <span className="text-red-500">*</span>
//                   </label>

//                   <div className="relative">
//                     <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

//                     <input
//                       name="fullName"
//                       value={formData.fullName}
//                       onChange={handleChange}
//                       placeholder="Enter full name "
//                       className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl border border-[#d1d5db] pl-11 sm:pl-12 pr-4 sm:pr-5 text-sm sm:text-base outline-none focus:border-orange-400"
//                     />
//                   </div>
//                 </div>

//                 {/* EMAIL */}
//                 <div>
//                   <label className="block text-sm font-semibold mb-3 text-[#010613]">
//                     Email Address <span className="text-red-500">*</span>
//                   </label>

//                   <div className="relative">
//                     <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

//                     <input
//                       name="email"
//                       value={formData.email}
//                       onChange={handleChange}
//                       placeholder="you@example.com "
//                       className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl border border-[#d1d5db] pl-11 sm:pl-12 pr-4 sm:pr-5 text-sm sm:text-base outline-none focus:border-orange-400"
//                     />
//                   </div>
//                 </div>
//               </div>
//               {/* PHONE */}
//               <div>
//                 <label className="block text-sm font-semibold mb-3 text-[#010613]">
//                   Phone Number <span className="text-red-500">*</span>
//                 </label>

//                 <div className="relative">
//                   <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
//                   <input
//                     name="phone"
//                     value={formData.phone}
//                     onChange={(e) => {
//                       const digitsOnly = e.target.value.replace(/\D/g, '');
//                       setFormData({ ...formData, phone: digitsOnly });
//                     }}
//                     maxLength={10}
//                     inputMode="numeric"
//                     placeholder="Enter phone number "
//                     className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl border border-[#d1d5db] pl-11 sm:pl-12 pr-4 sm:pr-5 text-sm sm:text-base outline-none focus:border-orange-400"
//                   />
//                 </div>
//               </div>

//               {/* MESSAGE */}
//               <div>
//                 <label className="block text-sm font-semibold mb-3 text-[#010613]">
//                   Message <span className="text-red-500">*</span>
//                 </label>

//                 <textarea
//                   name="message"
//                   value={formData.message}
//                   onChange={handleChange}
//                   rows={5}
//                   placeholder="Type your message here..."
//                   className="w-full rounded-xl sm:rounded-2xl border border-[#d1d5db] p-4 sm:p-5 text-sm sm:text-base outline-none resize-none focus:border-orange-400"
//                 />
//               </div>
//               <br />
//               {/* BUTTON */}

//               <button
//                 type="submit"
//                 className="w-full h-12 sm:h-14 lg:h-16 rounded-xl sm:rounded-2xl bg-[#ff6b00] hover:bg-[#f25f00] transition-all text-white font-semibold text-base sm:text-lg flex items-center justify-center gap-2 sm:gap-3 shadow-lg shadow-orange-200"
//               >
//                 <FiSend />
//                 Submit Inquiry
//               </button>
//             </form>
//           </div>

//           {/* RIGHT SIDE */}
//           <div className="space-y-5 sm:space-y-8">
//             {/* CORPORATE */}
//             <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#e5e7eb] p-4 sm:p-6 shadow-sm">
//               <div className="flex items-center gap-3 mb-4 sm:mb-6">
//                 <div className="w-12 h-12 sm:w-14 sm:h-16 rounded-2xl bg-[#e0e6f6] flex items-center justify-center shrink-0">
//                   <FiBriefcase className="text-[#2f6bff] text-xl sm:text-3xl" />
//                 </div>

//                 <h3 className="text-lg sm:text-xl font-semibold">
//                   Corporate Details
//                 </h3>
//               </div>

//               <div className="bg-[#f9fafb] rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-4 sm:mb-6">
//                 <div className="flex gap-3">
//                   <FiMapPin className="text-gray-600 mt-1" />

//                   <div>
//                     <p className="font-semibold text-[#5b5d65]">
//                       REGISTERED OFFICE
//                     </p>

//                     <p className="mt-2 sm:mt-3 text-[#0b0b0b] text-sm sm:text-base leading-6 sm:leading-6">
//                       Rentnpay Private Limited
//                       <br />
//                       B1-1002, Sr. No. 41/1/1,
//                       <br />
//                       Near Kakde Terrace, Warje,
//                       <br />
//                       Pune – 411058, Maharashtra, India
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-[#f8f9fa] rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-4 sm:mb-6 text-sm sm:text-base">
//                 <div className="flex justify-between">
//                   <span className="text-gray-500">CIN</span>
//                   <span className="font-medium">U74999HR2023PTC098765</span>
//                 </div>

//                 <div className="flex justify-between">
//                   <span className="text-gray-500">GSTIN</span>
//                   <span className="font-medium">27ABNFR6490F1ZO</span>
//                 </div>

//                 <div className="flex justify-between">
//                   <span className="text-gray-500">Founded</span>
//                   <span className="font-medium">March 2023</span>
//                 </div>
//               </div>
//             </div>

//             {/* DIRECT LINES */}
//             <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#e5e7eb] p-5 sm:p-8 shadow-sm">
//               <h3 className="text-lg sm:text-xl font-semibold">Direct Lines</h3>
//               <br />

//               <div className="bg-[#f0f6ff] border border-[#687c9d] rounded-xl sm:rounded-2xl p-5 sm:p-4">
//                 <div className="flex items-center gap-3 text-[#2563eb] font-semibold">
//                   <FiPhone />
//                   Corporate Desk
//                 </div>

//                 <p className="mt-5 text-black">+91 124 456 7890</p>

//                 <p className="text-sm text-gray-500 mt-1">
//                   Mon-Fri: 10:00 AM - 7:00 PM IST
//                 </p>

//                 {/* <p className="mt-5 text-black">investors@rentnpay.com</p> */}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* BOTTOM BANNER */}
//         {/* <div className="mt-8 sm:mt-10 border-2 border-[#ff6b00] rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-5">
//           <div className="flex items-center gap-4 sm:gap-5">
//             <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#fff1e6] flex items-center justify-center shrink-0">
//               <FiBriefcase className="text-[#ff6b00] text-xl sm:text-3xl" />
//             </div>

//             <div>
//               <h2 className="text-xl sm:text-3xl font-semibold text-black">
//                 Vendor Loans
//               </h2>

//               <p className="text-[#6b7280] mt-2 leading-7 text-sm sm:text-base">
//                 Get up to 40% of your monthly revenue as a growth loan.
//               </p>
//             </div>
//           </div>

//           <Link href="/loan">
//             <button className="mt-6 md:mt-0 text-[#bda797] font-semibold text-lg hover:underline">
//               Apply for Loan →
//             </button>
//           </Link>
//         </div> */}

//         {/* FOOTER */}
//         {/* <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 mt-10 sm:mt-16 pb-8 sm:pb-10 gap-3">
//           <p>© 2026 Rent&apos;n Pay Private Limited. All rights reserved.</p>

//           <div className="flex gap-8 mt-4 md:mt-0">
//             <button className="hover:text-orange-500 transition">
//               Privacy Policy
//             </button>

//             <button className="hover:text-orange-500 transition">
//               Terms of Service
//             </button>
//           </div>
//         </div> */}
//       </div>
//     </div>
//   );
// }

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { apiSubmitContact } from '@/lib/api';
import {
  FiHeadphones,
  FiFileText,
  FiMapPin,
  FiPhone,
  FiSend,
  FiBriefcase,
  FiUser,
  FiMail,
} from 'react-icons/fi';

export default function ContactPage() {
  // ================= STATE =================
  const [formData, setFormData] = useState({
    subject: '',
    fullName: '',
    email: '',
    phone: '',
    message: '',
  });

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================= HANDLE SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { subject, fullName, email, phone, message } = formData;

    const toastOptions = {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'light',
    };

    if (!subject || !fullName || !email || !phone || !message) {
      toast.error('Please fill all required fields', toastOptions);
      return;
    }

    if (subject.trim().length < 5) {
      toast.error('Subject must be at least 5 characters', toastOptions);
      return;
    }

    const nameRegex = /^[A-Za-z0-9\s]{3,50}$/;
    if (!nameRegex.test(fullName.trim())) {
      toast.error('Full name must be at least 3 characters', toastOptions);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/i;
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address', toastOptions);
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      toast.error('Please enter a valid 10-digit phone number', toastOptions);
      return;
    }

    if (message.trim().length < 10) {
      toast.error('Message must be at least 10 characters', toastOptions);
      return;
    }

    try {
      await apiSubmitContact(formData);

      toast.success('Inquiry submitted successfully', toastOptions);

      setFormData({
        subject: '',
        fullName: '',
        email: '',
        phone: '',
        message: '',
      });
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || 'Server error, please try again',
        toastOptions,
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f5f7]">
      <div className="w-full max-w-6xl mx-auto py-8 sm:py-10 lg:py-14 px-4 sm:px-6 lg:px-8">
        {/* HERO */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-2xl lg:text-2xl font-bold text-black leading-tight">
            How Can We Help You?
          </h1>
          {/* <p className="mt-3 text-[#6b7280] text-sm font-semibold sm:text-base leading-5 sm:leading-5">
            Whether you&apos;re a customer or vendor, We&apos;re here to support
            your <br />
            journey with Rentnpay.
          </p> */}
          Whether you&apos;re a customer or vendor, We&apos;re here to support
          your <br className="hidden sm:block" />
          journey with Rentnpay.
        </div>

        {/* SUPPORT CARD */}
        <div className="bg-white border border-[#dfe3e8] rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex items-center gap-4 sm:gap-4 mb-6 sm:mb-8 shadow-sm">
          <div className="w-12 h-12 sm:w-12 sm:h-12 rounded-2xl bg-[#eef4ff] flex items-center justify-center shrink-0">
            <FiHeadphones className="text-[#2563eb] text-lg sm:text-2xl" />
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-semibold text-[#020713]">
              Customer Support
            </h2>
            <p className="text-[#6b7280] mt-1 text-xs sm:text-sm">
              Need help with a rental or service?
            </p>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 sm:gap-6">
          {/* LEFT FORM */}
          <div className="bg-white rounded-3xl border border-[#e5e7eb] shadow-sm overflow-hidden">
            {/* HEADER */}
            <div className="p-5 sm:p-8 border-b border-[#f0f0f0] flex items-start gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-12 sm:h-12 rounded-2xl bg-[#f3e8ff] flex items-center justify-center shrink-0">
                <FiFileText className="text-[#9333ea] text-lg sm:text-2xl" />
              </div>

              <div>
                <h2 className="text-base sm:text-lg font-semibold text-black">
                  Submit Your Inquiry
                </h2>
                <p className="text-[#6c6d70] mt-1 text-xs sm:text-sm">
                  We&apos;ll get back to you within 24 hours
                </p>
              </div>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="p-4 sm:p-6 space-y-4 sm:space-y-6"
            >
              {/* SUBJECT */}
              <div>
                <label className="block text-xs font-semibold mb-4 text-[#010613]">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Enter subject of your inquiry "
                  className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl border border-[#d1d5db] px-4 sm:px-5 text-xs sm:text-sm outline-none focus:border-orange-400"
                />
              </div>
              {/* NAME + EMAIL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* FULL NAME */}
                <div>
                  <label className="block text-xs font-semibold mb-3 text-[#010613]">
                    Full Name <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                    <input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter full name "
                      className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl border border-[#d1d5db] pl-11 sm:pl-12 pr-4 sm:pr-5 text-xs sm:text-sm outline-none focus:border-orange-400"
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div>
                  <label className="block text-xs font-semibold mb-3 text-[#010613]">
                    Email Address <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com "
                      className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl border border-[#d1d5db] pl-11 sm:pl-12 pr-4 sm:pr-5 text-xs sm:text-sm outline-none focus:border-orange-400"
                    />
                  </div>
                </div>
              </div>
              {/* PHONE */}
              <div>
                <label className="block text-xs font-semibold mb-3 text-[#010613]">
                  Phone Number <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, phone: digitsOnly });
                    }}
                    maxLength={10}
                    inputMode="numeric"
                    placeholder="Enter phone number "
                    className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl border border-[#d1d5db] pl-11 sm:pl-12 pr-4 sm:pr-5 text-xs sm:text-sm outline-none focus:border-orange-400"
                  />
                </div>
              </div>

              {/* MESSAGE */}
              <div>
                <label className="block text-xs font-semibold mb-3 text-[#010613]">
                  Message <span className="text-red-500">*</span>
                </label>

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Type your message here..."
                  className="w-full rounded-xl sm:rounded-2xl border border-[#d1d5db] p-4 sm:p-5 text-xs sm:text-sm outline-none resize-none focus:border-orange-400"
                />
              </div>
              <br />
              {/* BUTTON */}

              <button
                type="submit"
                className="w-full h-12 sm:h-14 lg:h-16 rounded-xl sm:rounded-2xl bg-[#ff6b00] hover:bg-[#f25f00] transition-all text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 sm:gap-2 shadow-lg shadow-orange-200"
              >
                <FiSend />
                Submit Inquiry
              </button>
            </form>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-5 sm:space-y-8">
            {/* CORPORATE */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#e5e7eb] p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-12 sm:h-12 rounded-2xl bg-[#e0e6f6] flex items-center justify-center shrink-0">
                  <FiBriefcase className="text-[#2f6bff] text-lg sm:text-2xl" />
                </div>

                <h3 className="text-base sm:text-lg font-semibold">
                  Corporate Details
                </h3>
              </div>

              <div className="bg-[#f9fafb] rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-4 sm:mb-6">
                <div className="flex gap-2">
                  <FiMapPin className="text-gray-600 " />

                  <div>
                    <p className="font-bold text-[#5b5d65] text-xs">
                      REGISTERED OFFICE
                    </p>

                    <p className="mt-2 sm:mt-3 text-[#0b0b0b] text-xs sm:text-sm leading-5 sm:leading-5">
                      Rentnpay Private Limited
                      <br />
                      B1-1002, Sr. No. 41/1/1,
                      <br />
                      Near Kakde Terrace, Warje,
                      <br />
                      Pune – 411058, Maharashtra, India
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#f8f9fa] rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-4 sm:mb-6 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="font-bold text-[#5b5d65] text-xs">CIN</span>
                  <span className="font-medium">U74999HR2023PTC098765</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-bold text-[#5b5d65] text-xs">
                    GSTIN
                  </span>
                  <span className="font-medium">27ABNFR6490F1ZO</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-bold text-[#5b5d65] text-xs">
                    Founded
                  </span>
                  <span className="font-medium">March 2023</span>
                </div>
              </div>
            </div>

            {/* DIRECT LINES */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#e5e7eb] p-5 sm:p-8 shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold">
                Direct Lines
              </h3>
              <br />

              <div className="bg-[#f0f6ff] border border-[#687c9d] rounded-xl sm:rounded-2xl p-5 sm:p-4">
                <div className="flex items-center gap-2 text-[#2563eb] font-bold text-sm">
                  <FiPhone />
                  Corporate Desk
                </div>

                <p className="mt-5 text-black font-semibold text-sm">
                  +91 124 456 7890
                </p>

                <p className="text-xs font-semibold text-gray-500 mt-1">
                  Mon-Fri: 10:00 AM - 7:00 PM IST
                </p>

                {/* <p className="mt-5 text-black">investors@rentnpay.com</p> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
