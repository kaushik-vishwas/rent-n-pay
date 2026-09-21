// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';

// dotenv.config();

// // Create transporter once
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL,
//     pass: process.env.PASSWORD,
//   },
// });

// // Common wrapper
// const emailWrapper = (title, subtitle, otp) => `
//   <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:10px">
//   <h1 style="color:#F97316;text-align:center;">Rentnpay</h1>
//     <h2>${title}</h2>
//     <p>${subtitle}</p>

//     <div style="
//       background:#f3f4f6;
//       padding:15px;
//       text-align:center;
//       font-size:32px;
//       font-weight:bold;
//       letter-spacing:4px;
//       border-radius:8px;
//       margin:20px 0;
//     ">
//       ${otp}
//     </div>

//     <p>This OTP will expire in 5 minutes.</p>
//     <p style="color:#666;">Do not share this OTP with anyone.</p>

//     <hr />
//     <p style="font-size:12px;color:#999;text-align:center;">
//       © Rentnpay. All rights reserved.
//     </p>
//   </div>
// `;

// // 1. User Signup
// // export const sendOTPEmail = async (email, otp) => {
// //   await transporter.sendMail({
// //     // from: process.env.EMAIL,
// //     from: `"RentNPay Support" <${process.env.EMAIL}>`,
// //     to: email,
// //     subject: 'Verify Your Account - RentNPay',
// //     html: emailWrapper(
// //       'Welcome to RentNPay',
// //       'Use the OTP below to verify your account:',
// //       otp,
// //     ),
// //   });
// // };

// // 1. User Signup (OTP + Welcome merged)
// export const sendOTPEmail = async (email, otp, fullName) => {
//   await transporter.sendMail({
//     // from: process.env.EMAIL,
//     from: `"Rentnpay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: 'Welcome to Rentnpay - Verify Your Account',
//     attachments: [
//       {
//         filename: 'vedorReset.png',
//         path: './assets/email/vedorReset.png',
//         cid: 'vedorResetImage',
//       },
//       {
//         filename: 'rent.png',
//         path: './assets/email/rent.png',
//         cid: 'rentIconImage',
//       },
//       {
//         filename: 'buy.png',
//         path: './assets/email/buy.png',
//         cid: 'buyIconImage',
//       },
//       {
//         filename: 'service.png',
//         path: './assets/email/service.png',
//         cid: 'serviceIconImage',
//       },
//     ],
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
//         <table role="presentation" width="100%" style="border-collapse:collapse;padding:16px 24px;border-bottom:1px solid #eee;">
//           <tr>
//             <td style="padding:16px 0 16px 24px;vertical-align:middle;">
//               <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#F97316;color:#fff;text-align:center;line-height:28px;font-weight:bold;margin-right:8px;">R</span>
//               <span style="font-weight:bold;font-size:16px;color:#111;">Rentnpay</span>
//             </td>

//           </tr>
//         </table>

//         <img src="cid:vedorResetImage" alt="" style="width:100%;display:block;" />

//         <div style="padding:24px;">
//           <h2 style="margin-top:0;">Welcome to Rentnpay${fullName ? `, ${fullName}` : ''}!</h2>
//           <p>Thank you for joining Rentnpay. To unlock full access to renting high-quality furniture, purchasing premium electronics, and booking trusted local services.</p>

//           <div style="background:#f3f4f6;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
//             <p style="margin:0;font-size:12px;letter-spacing:1px;color:#666;">YOUR ONE-TIME VERIFICATION CODE</p>
//             <p style="margin:8px 0;font-size:32px;font-weight:bold;letter-spacing:6px;color:#111;">${otp}</p>
//             <p style="margin:0;font-size:13px;color:#F97316;">This code will expire in 5 minutes.</p>
//           </div>

//           <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />

//           <p style="font-size:11px;letter-spacing:1px;color:#999;font-weight:bold;margin:0 0 16px 0;">WITH RENTNPAY, YOU CAN:</p>
// <table role="presentation" width="100%" style="border-collapse:separate;border-spacing:8px 0;">
//             <tr>
//               <td width="33%" style="background:#f9fafb;border-radius:8px;padding:20px 12px;text-align:center;vertical-align:top;">
//                 <img src="cid:rentIconImage" alt="" width="40" height="40" style="display:block;margin:0 auto 10px auto;" />
//                 <p style="margin:0 0 8px 0;font-weight:bold;color:#111;">Rent Products</p>
//                 <p style="margin:0;font-size:12px;color:#666;">Flexible tenures on premium furniture &amp; appliances</p>
//               </td>
//               <td width="33%" style="background:#f9fafb;border-radius:8px;padding:20px 12px;text-align:center;vertical-align:top;">
//                 <img src="cid:buyIconImage" alt="" width="40" height="40" style="display:block;margin:0 auto 10px auto;" />
//                 <p style="margin:0 0 8px 0;font-weight:bold;color:#111;">Direct Buy</p>
//                 <p style="margin:0;font-size:12px;color:#666;">Purchase verified assets directly with trust</p>
//               </td>
//               <td width="33%" style="background:#f9fafb;border-radius:8px;padding:20px 12px;text-align:center;vertical-align:top;">
//                 <img src="cid:serviceIconImage" alt="" width="40" height="40" style="display:block;margin:0 auto 10px auto;" />
//                 <p style="margin:0 0 8px 0;font-weight:bold;color:#111;">Book Services</p>
//                 <p style="margin:0;font-size:12px;color:#666;">Instant booking for professional repairs &amp; setups</p>
//               </td>
//             </tr>
//           </table>
//         </div>

//         <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;">
//           Do not share this OTP with anyone. If you did not create an account on Rent'n , you can safely ignore this email.
//         </div>
//         <div style="background:#f9fafb;padding:0 24px 20px 24px;">
//           <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Unsubscribe</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Help Centre</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Privacy Policy</a>
//           </p>
//           <p style="margin:0;font-size:11px;color:#999;text-align:left;">
//             © 2026 Rentnpay. All rights reserved. Registered office: Pune, India.
//           </p>
//         </div>
//       </div>
//     `,
//   });
// };

// // 2. Vendor Signup
// // export const sendVendorOtpEmail = async (email, otp) => {
// //   await transporter.sendMail({
// //     // from: process.env.EMAIL,
// //     from: `"RentNPay Support" <${process.env.EMAIL}>`,
// //     to: email,
// //     subject: 'Verify Your Vendor Account - RentNPay',
// //     html: emailWrapper(
// //       'Welcome Partner!',
// //       'Use this OTP to verify your vendor account:',
// //       otp,
// //     ),
// //   });
// // };

// export const sendVendorOtpEmail = async (email, otp, vendorName) => {
//   await transporter.sendMail({
//     from: `"Rentnpay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: 'Verify Your Vendor Account - Rentnpay',
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
//         <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
//           <tr>
//             <td style="padding:16px 24px;vertical-align:middle;">
//               <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#F97316;color:#fff;text-align:center;line-height:28px;font-weight:bold;margin-right:8px;">R</span>
//               <span style="font-weight:bold;font-size:16px;color:#111;">Rentnpay</span>
//             </td>
//             <td style="padding:16px 24px;text-align:right;vertical-align:middle;">
//               <span style="background:#ffedd5;color:#F97316;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">PARTNER PORTAL</span>
//             </td>
//           </tr>
//         </table>

//         <div style="padding:24px;">
//           <h2 style="margin-top:0;">Welcome Partner!</h2>
//           <p>Hi ${vendorName || 'there'}, use the OTP below to verify your vendor account and start listing on Rentnpay.</p>

//           <div style="background:#f3f4f6;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
//             <p style="margin:0;font-size:12px;letter-spacing:1px;color:#666;">YOUR ONE-TIME VERIFICATION CODE</p>
//             <p style="margin:8px 0;font-size:32px;font-weight:bold;letter-spacing:6px;color:#111;">${otp}</p>
//             <p style="margin:0;font-size:13px;color:#F97316;">This code will expire in 5 minutes.</p>
//           </div>

//           <p style="text-align:center;margin:0 0 20px 0;">
//             <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Support</a>
//           </p>
//         </div>

//         <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;">
//           Do not share this OTP with anyone. If you did not create a vendor account on Rentnpay, you can safely ignore this email.
//         </div>
//         <div style="background:#f9fafb;padding:0 24px 20px 24px;">
//           <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Unsubscribe</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Help Centre</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Privacy Policy</a>
//           </p>
//           <p style="margin:0;font-size:11px;color:#999;text-align:left;">
//             © 2026 Rentnpay. All rights reserved. Registered office: Pune, India.
//           </p>
//         </div>
//       </div>
//     `,
//   });
// };

// // 3. Vendor Forgot Password
// // export const sendVendorForgotPasswordOtp = async (email, otp) => {
// //   await transporter.sendMail({
// //     // from: process.env.EMAIL,
// //     from: `"RentNPay Support" <${process.env.EMAIL}>`,
// //     to: email,
// //     subject: 'Reset Your Password - RentNPay',
// //     html: emailWrapper(
// //       'Password Reset Request',
// //       'Use this OTP to reset your password:',
// //       otp,
// //     ),
// //   });
// // };

// export const sendVendorForgotPasswordOtp = async (email, otp) => {
//   await transporter.sendMail({
//     // from: process.env.EMAIL,
//     from: `"Rentnpay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: 'Reset Your Password - Rentnpay',
//     attachments: [
//       {
//         filename: 'vedorReset.png',
//         path: './assets/email/vedorReset.png',
//         cid: 'vendorResetImage',
//       },
//     ],
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
//      <table role="presentation" width="100%" style="border-collapse:collapse;padding:16px 24px;border-bottom:1px solid #eee;">
//           <tr>
//             <td style="padding:16px 0 16px 24px;vertical-align:middle;">
//               <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#F97316;color:#fff;text-align:center;line-height:28px;font-weight:bold;margin-right:8px;">R</span>
//               <span style="font-weight:bold;font-size:16px;color:#111;">Rentnpay</span>
//             </td>
//             <td style="padding:16px 24px 16px 0;text-align:right;vertical-align:middle;">
//               <span style="background:#ffedd5;color:#F97316;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">ACCOUNT SECURITY</span>
//             </td>
//           </tr>
//         </table>

//    <img src="cid:vendorResetImage" alt="" style="width:100%;display:block;" />

//         <div style="padding:24px;">
//           <h2 style="margin-top:0;">Reset Your Password</h2>
//           <p>We received a request to reset the password for your Rentnpay vendor account. Use the secure code below to proceed.</p>

//           <div style="background:#f3f4f6;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
//             <p style="margin:0;font-size:12px;letter-spacing:1px;color:#666;">YOUR ONE-TIME VERIFICATION CODE</p>
//             <p style="margin:8px 0;font-size:32px;font-weight:bold;letter-spacing:6px;color:#111;">${otp}</p>
//             <p style="margin:0;font-size:13px;color:#F97316;">This code will expire in 5 minutes.</p>
//           </div>

//           <a href="https://rent-npay-admin.vercel.app/vendor-main" style="display:block;background:#F97316;color:#fff;text-align:center;text-decoration:none;font-weight:bold;padding:14px;border-radius:8px;margin:0 0 16px 0;">Reset Password Directly</a>

//           <p style="text-align:center;margin:0 0 20px 0;">
//             <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Support</a>
//           </p>
// <div style="background:#f3f4f6;border-radius:8px;padding:14px;font-size:13px;color:#555;display:flex;align-items:flex-start;">
//             <span style="margin-right:8px;flex-shrink:0;line-height:1;">
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;">
//                 <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
//                 <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
//               </svg>
//             </span>
//             <span>If you did not request a password reset, please ignore this email or contact support immediately if you suspect unauthorized access.</span>
//           </div>
//         </div>

//         <div style="background:#f9fafb;padding:20px 24px;">
//           <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Unsubscribe</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Help Centre</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Account Security</a>
//           </p>
//           <p style="margin:0;font-size:11px;color:#999;text-align:left;">
//             © 2025 Rentnpay. All rights reserved. Registered office: Pune, India.
//           </p>
//         </div>
//     `,
//   });
// };

// export const sendAdminEmailChangeOtp = async (email, otp) => {
//   await transporter.sendMail({
//     from: `"Rentnpay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: 'Verify Your New Email - Rentnpay Admin',
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
//         <div style="padding:24px;">
//           <h2 style="margin-top:0;">Verify Your New Email</h2>
//           <p>Use the code below to confirm your new email address for your Rentnpay admin account.</p>
//           <div style="background:#f3f4f6;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
//             <p style="margin:0;font-size:12px;letter-spacing:1px;color:#666;">YOUR ONE-TIME VERIFICATION CODE</p>
//             <p style="margin:8px 0;font-size:32px;font-weight:bold;letter-spacing:6px;color:#111;">${otp}</p>
//             <p style="margin:0;font-size:13px;color:#F97316;">This code will expire in 10 minutes.</p>
//           </div>
//           <p style="font-size:13px;color:#555;">If you did not request this, please ignore this email.</p>
//         </div>
//       </div>
//     `,
//   });
// };

// export const sendAdminForgotPasswordOtp = async (email, otp) => {
//   await transporter.sendMail({
//     from: `"Rentnpay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: 'Reset Your Admin Password - Rentnpay',
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
//         <div style="padding:24px;">
//           <h2 style="margin-top:0;">Reset Your Admin Password</h2>
//           <p>We received a request to reset the password for your Rentnpay admin account. Use the code below to proceed.</p>
//           <div style="background:#f3f4f6;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
//             <p style="margin:0;font-size:12px;letter-spacing:1px;color:#666;">YOUR ONE-TIME VERIFICATION CODE</p>
//             <p style="margin:8px 0;font-size:32px;font-weight:bold;letter-spacing:6px;color:#111;">${otp}</p>
//             <p style="margin:0;font-size:13px;color:#F97316;">This code will expire in 10 minutes.</p>
//           </div>
//           <p style="font-size:13px;color:#555;">If you did not request this, please ignore this email or contact support immediately.</p>
//         </div>
//       </div>
//     `,
//   });
// };

// // export const sendVendorBankChangeOtp = async (email, otp) => {
// //   await transporter.sendMail({
// //     from: `"RentNPay Support" <${process.env.EMAIL}>`,
// //     to: email,
// //     subject: 'Verify Bank Account Change - RentNPay',
// //     html: emailWrapper(
// //       'Confirm Bank Account Update',
// //       'Use this OTP to verify changing your payout bank account:',
// //       otp,
// //     ),
// //   });
// // };

// export const sendVendorBankChangeOtp = async (email, otp) => {
//   await transporter.sendMail({
//     from: `"Rentnpay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: 'Verify Bank Account Change - Rentnpay',
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
//         <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
//           <tr>
//             <td style="padding:16px 24px;vertical-align:middle;">
//               <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#F97316;color:#fff;text-align:center;line-height:28px;font-weight:bold;margin-right:8px;">R</span>
//               <span style="font-weight:bold;font-size:16px;color:#111;">Rentnpay</span>
//             </td>
//             <td style="padding:16px 24px;text-align:right;vertical-align:middle;">
//               <span style="background:#ffedd5;color:#F97316;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">ACCOUNT SECURITY</span>
//             </td>
//           </tr>
//         </table>

//         <div style="padding:24px;">
//           <h2 style="margin-top:0;">Confirm Bank Account Update</h2>
//           <p>We received a request to update the payout bank account linked to your Rentnpay vendor store. Use the secure code below to confirm this change.</p>

//           <div style="background:#f3f4f6;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
//             <p style="margin:0;font-size:12px;letter-spacing:1px;color:#666;">YOUR ONE-TIME VERIFICATION CODE</p>
//             <p style="margin:8px 0;font-size:32px;font-weight:bold;letter-spacing:6px;color:#111;">${otp}</p>
//             <p style="margin:0;font-size:13px;color:#F97316;">This code will expire in 5 minutes.</p>
//           </div>

//           <p style="text-align:center;margin:0 0 20px 0;">
//             <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Support</a>
//           </p>

//           <div style="background:#f3f4f6;border-radius:8px;padding:14px;font-size:13px;color:#555;display:flex;align-items:flex-start;">
//             <span style="margin-right:8px;flex-shrink:0;line-height:1;">
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;">
//                 <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
//                 <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
//               </svg>
//             </span>
//             <span>If you did not request this bank account change, please ignore this email or contact support immediately if you suspect unauthorized access.</span>
//           </div>
//         </div>

//         <div style="background:#f9fafb;padding:20px 24px;">
//           <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Unsubscribe</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Help Centre</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Account Security</a>
//           </p>
//           <p style="margin:0;font-size:11px;color:#999;text-align:left;">
//             © 2026 Rentnpay. All rights reserved. Registered office: Pune, India.
//           </p>
//         </div>
//       </div>
//     `,
//   });
// };

// // export const sendUserForgotPasswordOtp = async (email, otp) => {
// //   await transporter.sendMail({
// //     from: `"RentNPay Support" <${process.env.EMAIL}>`,
// //     to: email,
// //     subject: 'Reset Your Password - RentNPay',
// //     html: emailWrapper(
// //       'Password Reset Request',
// //       'Use this OTP to reset your password:',
// //       otp,
// //     ),
// //   });
// // };

// export const sendUserForgotPasswordOtp = async (email, otp) => {
//   await transporter.sendMail({
//     from: `"Rentnpay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: 'Reset Your Password - Rentnpay',
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
//         <table role="presentation" width="100%" style="border-collapse:collapse;padding:16px 24px;border-bottom:1px solid #eee;">
//           <tr>
//             <td style="padding:16px 0 16px 24px;vertical-align:middle;">
//               <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#F97316;color:#fff;text-align:center;line-height:28px;font-weight:bold;margin-right:8px;">R</span>
//               <span style="font-weight:bold;font-size:16px;color:#111;">Rentnpay</span>
//             </td>
//             <td style="padding:16px 24px 16px 0;text-align:right;vertical-align:middle;">
//               <span style="background:#dbeafe;color:#2563eb;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">ACCOUNT SECURITY</span>
//             </td>
//           </tr>
//         </table>

//         <div style="padding:24px;">
//           <h2 style="margin-top:0;">Reset Your Password</h2>
//           <p>We received a request to reset the password for your Rentnpay account. Use the secure code below or click the button to proceed.</p>

//           <div style="background:#f3f4f6;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
//             <p style="margin:0;font-size:12px;letter-spacing:1px;color:#666;">YOUR ONE-TIME VERIFICATION CODE</p>
//             <p style="margin:8px 0;font-size:32px;font-weight:bold;letter-spacing:6px;color:#111;">${otp}</p>
//             <p style="margin:0;font-size:13px;color:#F97316;">This code will expire in 5 minutes.</p>
//           </div>

//           <a href="https://rentnpay-website.vercel.app/" style="display:block;background:#F97316;color:#fff;text-align:center;text-decoration:none;font-weight:bold;padding:14px;border-radius:8px;margin:0 0 16px 0;">Reset Password Directly</a>

//           <p style="text-align:center;margin:0 0 20px 0;">
//             <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Support</a>
//           </p>

//           <div style="background:#f3f4f6;border-radius:8px;padding:14px;font-size:13px;color:#555;display:flex;align-items:flex-start;">
//             <span style="margin-right:8px;flex-shrink:0;line-height:1;">
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;">
//                 <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
//                 <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
//               </svg>
//             </span>
//             <span>If you did not request a password reset, please ignore this email or contact support immediately if you suspect unauthorized access.</span>
//           </div>
//         </div>

//         <div style="background:#f9fafb;padding:20px 24px;">
//           <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Unsubscribe</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Help Centre</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Account Security</a>
//           </p>
//           <p style="margin:0;font-size:11px;color:#999;text-align:left;">
//             © 2026 Rentnpay. All rights reserved. Registered office: Pune, India.
//           </p>
//         </div>
//       </div>
//     `,
//   });
// };

// // export const sendServiceCompletionOtpEmail = async (
// //   email,
// //   otp,
// //   serviceName,
// //   customerName,
// // ) => {
// //   await transporter.sendMail({
// //     from: `"RentNPay Support" <${process.env.EMAIL}>`,
// //     to: email,
// //     subject: 'Service Completion OTP - RentNPay',
// //     html: `
// //       <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:10px">
// //         <h1 style="color:#F97316;text-align:center;">RentNPay</h1>
// //         <h2>Confirm your service completion</h2>
// //         <p>Hi ${customerName || 'there'},</p>
// //         <p>Your vendor is requesting to mark <strong>${serviceName}</strong> as completed.</p>
// //         <p>Share this OTP with the vendor only if the service has been completed to your satisfaction:</p>
// //         <div style="background:#f3f4f6;padding:15px;text-align:center;font-size:36px;font-weight:bold;letter-spacing:10px;border-radius:8px;margin:20px 0;color:#111;">
// //           ${otp}
// //         </div>
// //         <p style="color:#e53e3e;"><strong>This OTP expires in 30 minutes.</strong></p>
// //         <p style="color:#666;">Do not share this OTP with anyone other than your service vendor.</p>
// //         <hr />
// //         <p style="font-size:12px;color:#999;text-align:center;">© RentNPay. All rights reserved.</p>
// //       </div>
// //     `,
// //   });
// // };

// export const sendServiceCompletionOtpEmail = async (
//   email,
//   otp,
//   serviceName,
//   customerName,
//   booking,
// ) => {
//   await transporter.sendMail({
//     from: `"Rentnpay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: 'Service Completion OTP - Rentnpay',
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
//         <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
//           <tr>
//             <td style="padding:16px 24px;vertical-align:middle;">
//               <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#F97316;color:#fff;text-align:center;line-height:28px;font-weight:bold;margin-right:8px;">R</span>
//               <span style="font-weight:bold;font-size:16px;color:#111;">Rentnpay</span>
//             </td>
//             <td style="padding:16px 24px;text-align:right;vertical-align:middle;">
//               <span style="background:#dcfce7;color:#16a34a;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">SERVICE COMPLETED</span>
//             </td>
//           </tr>
//         </table>

//         <div style="padding:24px;">
//           <h2 style="margin-top:0;">Confirm your service completion</h2>
//           <p>Hi ${customerName || 'there'}, Share this OTP with the vendor only if the service has been completed to your satisfaction:</p>

//           <div style="border:2px dashed #F97316;background:#fff7ed;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
//             <p style="margin:0;font-size:12px;letter-spacing:1px;color:#F97316;font-weight:bold;">SERVICE COMPLETION CODE</p>
//             <p style="margin:8px 0;font-size:36px;font-weight:bold;letter-spacing:10px;color:#F97316;">${otp}</p>
//           </div>

//           <p style="text-align:center;margin:0 0 20px 0;">
//             <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Support</a>
//           </p>
//         </div>

//         <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;">
//           Do not share this code before the technician completes the requested service.
//         </div>
//         <div style="background:#f9fafb;padding:0 24px 20px 24px;">
//           <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Unsubscribe</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Help Centre</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Privacy Policy</a>
//           </p>
//           <p style="margin:0;font-size:11px;color:#999;text-align:left;">
//             © 2026 Rentnpay. All rights reserved. Registered office: Pune, India.
//           </p>
//         </div>
//       </div>
//     `,
//   });
// };
// // export const sendOrderConfirmationEmail = async (
// //   email,
// //   customerName,
// //   order,
// // ) => {
// //   const itemsHtml = (order.products || [])
// //     .map(
// //       (line) => `
// //         <tr>
// //           <td style="padding:8px;border-bottom:1px solid #eee;">
// //             ${line.product?.productName || 'Item'}${line.variantName ? ` (${line.variantName})` : ''}
// //           </td>
// //           <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">
// //             ${line.quantity}
// //           </td>
// //           <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">
// //             ₹${Number(line.pricePerDay || 0).toLocaleString('en-IN')}
// //           </td>
// //         </tr>`,
// //     )
// //     .join('');

// //   await transporter.sendMail({
// //     from: `"RentNPay Support" <${process.env.EMAIL}>`,
// //     to: email,
// //     subject: `Order Confirmed - RentNPay (#${String(order._id).slice(-8).toUpperCase()})`,
// //     html: `
// //       <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:10px">
// //         <h1 style="color:#F97316;text-align:center;">RentNPay</h1>
// //         <h2>Thank you for your order, ${customerName || 'there'}!</h2>
// //         <p>Your order <strong>#${String(order._id).slice(-8).toUpperCase()}</strong> has been placed successfully.</p>

// //         <table style="width:100%;border-collapse:collapse;margin:20px 0;">
// //           <thead>
// //             <tr style="background:#f3f4f6;">
// //               <th style="padding:8px;text-align:left;">Item</th>
// //               <th style="padding:8px;text-align:center;">Qty</th>
// //               <th style="padding:8px;text-align:right;">Price</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             ${itemsHtml}
// //           </tbody>
// //         </table>

// //         <div style="background:#f3f4f6;padding:15px;border-radius:8px;margin:20px 0;">
// //           <p><strong>Total Paid: ₹${Number(order.totalAmount || 0).toLocaleString('en-IN')}</strong></p>
// //         </div>

// //         <p><strong>Delivery Address:</strong> ${order.address || ''}</p>
// //         <p><strong>Phone:</strong> ${order.phone || ''}</p>

// //         <hr />
// //         <p style="font-size:12px;color:#999;text-align:center;">
// //           © RentNPay. All rights reserved.
// //         </p>
// //       </div>
// //     `,
// //   });
// // };

// export const sendBookingConfirmationEmail = async (
//   email,
//   customerName,
//   booking,
// ) => {
//   const taxHtml = (booking.taxLines || [])
//     .map(
//       (t) => `
//         <tr>
//           <td style="padding:6px 8px;border-bottom:1px solid #eee;">${t.label}</td>
//           <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">
//             ₹${Number(t.value || 0).toLocaleString('en-IN')}
//           </td>
//         </tr>`,
//     )
//     .join('');

//   await transporter.sendMail({
//     from: `"Rentnpay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: `Booking Confirmed - Rentnpay (#${String(booking._id).slice(-8).toUpperCase()})`,
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:10px">
//         <h1 style="color:#F97316;text-align:center;">Rentnpay</h1>
//         <h2>Your service is booked, ${customerName || 'there'}!</h2>
//      <p>Booking <strong>#${String(booking._id).slice(-8).toUpperCase()}</strong> for <strong>${booking.serviceSnapshot?.productName || 'your service'}</strong> is confirmed.</p>

//         <div style="background:#f3f4f6;padding:15px;border-radius:8px;margin:20px 0;">
//           <p style="margin:4px 0;"><strong>Date:</strong> ${booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('en-IN') : '-'}</p>
//           <p style="margin:4px 0;"><strong>Time Slot:</strong> ${booking.timeSlot?.label || '-'}</p>
//         </div>

//         <table style="width:100%;border-collapse:collapse;margin:20px 0;">
//           <tbody>
//          <tr>
//               <td style="padding:6px 8px;border-bottom:1px solid #eee;">Service Charge</td>
//               <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">
//                 ₹${Number(booking.baseAmount || 0).toLocaleString('en-IN')}
//               </td>
//             </tr>
//             ${taxHtml}
//           </tbody>
//         </table>

//         <p><strong>Total Paid: ₹${Number(booking.totalAmount || 0).toLocaleString('en-IN')}</strong></p>
//         <p><strong>Address:</strong> ${booking.address || ''}</p>
//         <p><strong>Phone:</strong> ${booking.phone || ''}</p>

//         <hr />
//         <p style="font-size:12px;color:#999;text-align:center;">
//           © Rentnpay. All rights reserved.
//         </p>
//       </div>
//     `,
//   });
// };

// export const sendNewOrderEmail = async (email, vendorName, order, lines) => {
//   const itemsHtml = (lines || [])
//     .map((line) => {
//       const isRental = line.productType === 'Rental';
//       const tenure = line.rentalDuration ?? order.rentalDuration;
//       const unit = line.tenureUnit ?? order.tenureUnit;
//       const durationLabel =
//         isRental && tenure
//           ? `${line.quantity} Unit${line.quantity > 1 ? 's' : ''} (${tenure}-${unit === 'day' ? 'Day' : 'Month'} Rental Tenure)`
//           : `${line.quantity} Unit${line.quantity > 1 ? 's' : ''}`;

//       return `
//         <tr>
//           <td style="padding:10px 16px;color:#666;border-top:1px solid #eee;"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#F97316;margin-right:8px;"></span>Order Type</td>
//           <td style="padding:10px 16px;text-align:right;border-top:1px solid #eee;">${isRental ? 'Rental' : 'Sell'}</td>
//         </tr>
//         <tr>
//           <td style="padding:10px 16px;color:#666;"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#F97316;margin-right:8px;"></span>Product Name</td>
//           <td style="padding:10px 16px;text-align:right;">${line.product?.productName || 'Item'}${line.variantName ? ` (${line.variantName})` : ''}</td>
//         </tr>
//         <tr>
//           <td style="padding:10px 16px;color:#666;"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#F97316;margin-right:8px;"></span>Quantity &amp; Duration</td>
//           <td style="padding:10px 16px;text-align:right;">${durationLabel}</td>
//         </tr>`;
//     })
//     .join('');

//   await transporter.sendMail({
//     from: `"Rentnpay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: `New Order Received - Rentnpay (#${order.orderNumber})`,
//     attachments: [
//       {
//         filename: 'newOrder.png',
//         path: './assets/email/newOrder.png',
//         cid: 'newOrderImage',
//         contentDisposition: 'inline',
//       },
//     ],
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">

//         <!-- email-header -->
//         <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
//           <tr>
//             <td style="padding:16px 24px;vertical-align:middle;">
//               <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#F97316;color:#fff;text-align:center;line-height:28px;font-weight:bold;margin-right:8px;">R</span>
//               <span style="font-weight:bold;font-size:16px;color:#111;">Rentnpay Partner</span>
//             </td>
//             <td style="padding:16px 24px;text-align:right;vertical-align:middle;">
//               <span style="background:#dcfce7;color:#16a34a;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">NEW ORDER</span>
//             </td>
//           </tr>
//         </table>

//         <!-- hero-banner-container / hero-banner-image -->
//         <img src="cid:newOrderImage" alt="" style="width:100%;display:block;" />

//         <!-- email-body -->
//         <div style="padding:24px;">
//           <h2 style="margin-top:0;">You Have Received a New Order!</h2>
//           <p>Hi ${vendorName || 'Partner'}, a customer has just placed an order from your store. Please review the order details below and prepare for fulfillment to keep your seller rating high.</p>

//           <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f9fafb;border-radius:8px;overflow:hidden;">
//             <tbody>
//               <tr>
//                 <td style="padding:10px 16px;color:#666;"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#F97316;margin-right:8px;"></span>Order ID</td>
//                 <td style="padding:10px 16px;text-align:right;font-weight:bold;">#ORD-${order.orderNumber}</td>
//               </tr>
//               ${itemsHtml}
//               <tr>
//                 <td style="padding:10px 16px;color:#666;"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#F97316;margin-right:8px;"></span>Order Date &amp; Time</td>
//                 <td style="padding:10px 16px;text-align:right;">${new Date(order.createdAt).toLocaleString('en-IN')}</td>
//               </tr>
//             </tbody>
//           </table>

//           <a href="https://rent-npay-admin.vercel.app/vendor-main" style="display:block;background:#F97316;color:#fff;text-align:center;text-decoration:none;font-weight:bold;padding:14px;border-radius:8px;margin:0 0 16px 0;">Accept &amp; Fulfill Order</a>

//           <p style="text-align:center;margin:0 0 20px 0;">
//             <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Support</a>
//           </p>

//           <p style="text-align:center;color:#999;font-size:12px;">Timely fulfillment helps maintain your top vendor rating on Rentnpay.</p>
//         </div>

//         <!-- email-footer -->
//         <div style="background:#f9fafb;padding:16px 24px;font-size:12px;color:#999;">
//           This is an automated system notification to Rentnpay registered partners. Please do not reply directly to this email address.
//         </div>
//         <div style="background:#f9fafb;padding:0 24px 20px 24px;">
//           <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Unsubscribe</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Help Centre</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Privacy Policy</a>
//           </p>
//           <p style="margin:0;font-size:11px;color:#999;text-align:left;">
//             © 2026 Rentnpay. All rights reserved. Registered office: Pune, India.
//           </p>
//         </div>
//       </div>
//     `,
//   });
// };

// export const sendServiceBookingConfirmationEmail = async (
//   email,
//   customerName,
//   booking,
// ) => {
//   await transporter.sendMail({
//     from: `"Rentnpay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: `Service Booking Confirmed - Rentnpay (#${String(booking._id).slice(-8).toUpperCase()})`,
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
//         <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
//           <tr>
//             <td style="padding:16px 24px;vertical-align:middle;">
//               <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#F97316;color:#fff;text-align:center;line-height:28px;font-weight:bold;margin-right:8px;">R</span>
//               <span style="font-weight:bold;font-size:16px;color:#111;">Rentnpay</span>
//             </td>
//             <td style="padding:16px 24px;text-align:right;vertical-align:middle;">
//               <span style="background:#dcfce7;color:#16a34a;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">SERVICE SCHEDULED</span>
//             </td>
//           </tr>
//         </table>

//         <div style="padding:24px;">
//           <h2 style="margin-top:0;">Your Service is Booked</h2>
//           <p>Your technician is scheduled to arrive during your selected time slot.</p>

//           <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f9fafb;border-radius:8px;overflow:hidden;">
//             <tbody>
//               <tr>
//                 <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Service Booked</td>
//                 <td style="padding:10px 16px;text-align:right;font-weight:bold;border-bottom:1px solid #eee;">${booking.serviceSnapshot?.productName || 'your service'}</td>
//               </tr>
//               <tr>
//                 <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Scheduled Date &amp; Time</td>
//                 <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;">${booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('en-IN') : '-'} | ${booking.timeSlot?.label || '-'}</td>
//               </tr>
//               <tr>
//                 <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Service Address</td>
//                 <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;">${booking.address || ''}</td>
//               </tr>
//               <tr>
//                 <td style="padding:10px 16px;color:#111;font-weight:bold;">Total Fee</td>
//                 <td style="padding:10px 16px;text-align:right;font-weight:bold;color:#16a34a;">₹${Number(booking.totalAmount || 0).toLocaleString('en-IN')}</td>
//               </tr>
//             </tbody>
//           </table>

//           <a href="https://rentnpay-website.vercel.app/my-account?tab=orders" style="display:block;background:#F97316;color:#fff;text-align:center;text-decoration:none;font-weight:bold;padding:14px;border-radius:8px;margin:0 0 16px 0;">Manage Booking / Reschedule</a>

//           <p style="text-align:center;margin:0 0 20px 0;">
//             <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Support</a>
//           </p>
//         </div>

//         <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;">
//           Do not share this code before the technician completes the requested service.
//         </div>
//         <div style="background:#f9fafb;padding:0 24px 20px 24px;">
//           <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Unsubscribe</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Help Centre</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Privacy Policy</a>
//           </p>
//           <p style="margin:0;font-size:11px;color:#999;text-align:left;">
//             © 2026 Rentnpay. All rights reserved. Registered office: Pune, India.
//           </p>
//         </div>
//       </div>
//     `,
//   });
// };

// export const sendProductApprovedEmail = async (email, vendorName, product) => {
//   await transporter.sendMail({
//     from: `"Rentnpay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: `Product Approved - Rentnpay (${product.productName})`,
//     attachments: [
//       {
//         filename: 'vedorReset.png',
//         path: './assets/email/vedorReset.png',
//         cid: 'productApprovedImage',
//       },
//     ],
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
//         <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
//           <tr>
//             <td style="padding:16px 24px;vertical-align:middle;">
//               <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#F97316;color:#fff;text-align:center;line-height:28px;font-weight:bold;margin-right:8px;">R</span>
//               <span style="font-weight:bold;font-size:16px;color:#111;">Rentnpay</span>
//             </td>
//             <td style="padding:16px 24px;text-align:right;vertical-align:middle;">
//               <span style="background:#ffedd5;color:#F97316;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">CATALOG MANAGEMENT</span>
//             </td>
//           </tr>
//         </table>

//         <img src="cid:productApprovedImage" alt="" style="width:100%;display:block;" />

//         <div style="padding:24px;">
//           <h2 style="margin-top:0;">
//             <span style="color:#16a34a;">Approved</span>: Your item is now live on the marketplace.
//           </h2>
//           <p>Here is the review result for your recently submitted product listing.</p>

//           <p style="font-size:11px;letter-spacing:1px;color:#999;font-weight:bold;margin:20px 0 8px 0;">LISTING &amp; AUDIT DETAILS</p>

//           <table style="width:100%;border-collapse:collapse;margin:0 0 20px 0;background:#f9fafb;border-radius:8px;overflow:hidden;">
//             <tbody>
//               <tr>
//                 <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Product Name</td>
//                 <td style="padding:10px 16px;text-align:right;font-weight:bold;border-bottom:1px solid #eee;">${product.productName}</td>
//               </tr>
//               <tr>
//                 <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Category &amp; Type</td>
//                 <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;">${product.category || ''}${product.type ? ` | ${product.type} Listing` : ''}</td>
//               </tr>
//               <tr>
//                 <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Submission Date</td>
//                 <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;">${product.adminApprovedAt ? new Date(product.adminApprovedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
//               </tr>
//               <tr>
//                 <td style="padding:10px 16px;color:#666;">Admin Audit Notes</td>
//                 <td style="padding:10px 16px;text-align:right;">Images verified. Pricing slabs approved.</td>
//               </tr>
//             </tbody>
//           </table>

//           <a href="https://rent-npay-admin.vercel.app/vendor-products" style="display:block;background:#F97316;color:#fff;text-align:center;text-decoration:none;font-weight:bold;padding:14px;border-radius:8px;margin:0 0 16px 0;">View Product in Inventory</a>

//           <p style="text-align:center;margin:0 0 20px 0;">
//             <a href="https://rent-npay-admin.vercel.app/vendor-products" style="color:#374151;font-size:14px;text-decoration:underline;">Edit Product Listing</a>
//           </p>
//         </div>

//         <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#666;">
//           All product submissions are evaluated according to Rentnpay marketplace quality standards.
//         </div>
//         <div style="background:#f9fafb;padding:0 24px 20px 24px;">
//           <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Unsubscribe</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Partner Catalog Guidelines</a>
//           </p>
//           <p style="margin:0;font-size:11px;color:#999;text-align:left;">
//             © 2026 Rentnpay. All rights reserved. Suggestions@rentpay.info
//           </p>
//         </div>
//       </div>
//     `,
//   });
// };

// export const sendWelcomeEmail = async (email, fullName) => {
//   await transporter.sendMail({
//     from: `"Rentnpay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: 'Welcome to Rentnpay!',
//     attachments: [
//       {
//         filename: 'welcomeBanner.png',
//         path: './assets/email/welcomeBanner.png',
//         cid: 'welcomeBannerImage',
//       },
//     ],
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
//         <table role="presentation" width="100%" style="border-collapse:collapse;padding:16px 24px;border-bottom:1px solid #eee;">
//           <tr>
//             <td style="padding:16px 0 16px 24px;vertical-align:middle;">
//               <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#F97316;color:#fff;text-align:center;line-height:28px;font-weight:bold;margin-right:8px;">R</span>
//               <span style="font-weight:bold;font-size:16px;color:#111;">Rentnpay</span>
//             </td>
//           </tr>
//         </table>

//         <img src="cid:welcomeBannerImage" alt="" style="width:100%;display:block;" />

//         <div style="padding:24px;">
//           <h2 style="margin-top:0;">Welcome to Rentnpay!</h2>
//           <p>Thank you for joining Rentnpay${fullName ? `, ${fullName}` : ''}. To unlock full access to renting high-quality furniture, purchasing premium electronics, and booking trusted local services, explore what you can do below.</p>

//           <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />

//           <p style="font-size:11px;letter-spacing:1px;color:#999;font-weight:bold;margin:0 0 16px 0;">WITH RENTNPAY, YOU CAN:</p>

//           <table role="presentation" width="100%" style="border-collapse:separate;border-spacing:8px 0;">
//             <tr>
//               <td width="33%" style="background:#f9fafb;border-radius:8px;padding:20px 12px;text-align:center;vertical-align:top;">
//                 <p style="margin:0 0 8px 0;font-weight:bold;color:#111;">Rent Products</p>
//                 <p style="margin:0;font-size:12px;color:#666;">Flexible tenures on premium furniture &amp; appliances</p>
//               </td>
//               <td width="33%" style="background:#f9fafb;border-radius:8px;padding:20px 12px;text-align:center;vertical-align:top;">
//                 <p style="margin:0 0 8px 0;font-weight:bold;color:#111;">Direct Buy</p>
//                 <p style="margin:0;font-size:12px;color:#666;">Purchase verified assets directly with trust</p>
//               </td>
//               <td width="33%" style="background:#f9fafb;border-radius:8px;padding:20px 12px;text-align:center;vertical-align:top;">
//                 <p style="margin:0 0 8px 0;font-weight:bold;color:#111;">Book Services</p>
//                 <p style="margin:0;font-size:12px;color:#666;">Instant booking for professional repairs &amp; setups</p>
//               </td>
//             </tr>
//           </table>
//         </div>

//         <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;">
//           Security Note: If you did not create an account on Rentnpay, you can safely ignore or delete this email. No further action is required.
//         </div>
//         <div style="background:#f9fafb;padding:0 24px 20px 24px;">
//           <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Unsubscribe</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Help Center</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Privacy Policy</a>
//           </p>
//           <p style="margin:0;font-size:11px;color:#999;text-align:left;">
//             © 2026 Rentnpay . All rights reserved. Registered address: Pune, India.
//           </p>
//         </div>
//       </div>
//     `,
//   });
// };

// export const sendRentalOrderConfirmedEmail = async (
//   email,
//   customerName,
//   order,
//   line,
// ) => {
//   const startDate = order.createdAt ? new Date(order.createdAt) : new Date();
//   const durationValue = line.rentalDuration ?? order.rentalDuration;
//   const unit = line.tenureUnit ?? order.tenureUnit;

//   const endDate = new Date(startDate);
//   if (unit === 'day') {
//     endDate.setDate(endDate.getDate() + Number(durationValue || 0));
//   } else {
//     endDate.setMonth(endDate.getMonth() + Number(durationValue || 0));
//   }

//   const nextBillingDate = new Date(startDate);
//   if (unit === 'day') {
//     nextBillingDate.setDate(nextBillingDate.getDate() + 30);
//   } else {
//     nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
//   }

//   const fmt = (d) =>
//     d.toLocaleDateString('en-IN', {
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric',
//     });

//   const tenureLabel = durationValue
//     ? `${durationValue}-${unit === 'day' ? 'Day' : 'Month'} Plan (${fmt(startDate)} - ${fmt(endDate)})`
//     : '-';

//   await transporter.sendMail({
//     from: `"Rentnpay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: `Your Rental is Confirmed - Rentnpay (#${order.orderNumber})`,
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
//         <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
//           <tr>
//             <td style="padding:16px 24px;vertical-align:middle;">
//               <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#F97316;color:#fff;text-align:center;line-height:28px;font-weight:bold;margin-right:8px;">R</span>
//               <span style="font-weight:bold;font-size:16px;color:#111;">Rentnpay</span>
//             </td>

//           </tr>
//         </table>

//         <div style="padding:24px;">
//           <h2 style="margin-top:0;">Your Rental is Ordered!</h2>
//           <p>Thank you for renting with Rentnpay${customerName ? `, ${customerName}` : ''}. Here are the details of your active rental agreement.</p>

//           <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f9fafb;border-radius:8px;overflow:hidden;">
//             <tbody>
//               <tr>
//                 <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Item Rented</td>
//                 <td style="padding:10px 16px;text-align:right;font-weight:bold;border-bottom:1px solid #eee;">${line.product?.productName || 'Item'}${line.variantName ? ` - ${line.variantName}` : ''}</td>
//               </tr>
//               <tr>
//                 <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Tenure Selected</td>
//                 <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;">${tenureLabel}</td>
//               </tr>
//               <tr>
//                 <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Monthly Rental</td>
//                 <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;">₹${Number(line.pricePerDay || 0).toLocaleString('en-IN')} / month</td>
//               </tr>
//               <tr>
//                 <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Security Deposit Paid</td>
//                 <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;">₹${Number(line.refundableDeposit || 0).toLocaleString('en-IN')} (Refundable)</td>
//               </tr>
//               <tr>
//                 <td style="padding:10px 16px;color:#666;">Next Billing Date</td>
//                 <td style="padding:10px 16px;text-align:right;">${fmt(nextBillingDate)}</td>
//               </tr>
//             </tbody>
//           </table>

//           <a href="https://rentnpay-website.vercel.app/my-account?tab=orders" style="display:block;background:#F97316;color:#fff;text-align:center;text-decoration:none;font-weight:bold;padding:14px;border-radius:8px;margin:0 0 16px 0;">Track Order &amp; Rental Status</a>

//           <p style="text-align:center;margin:0 0 20px 0;">
//             <a href="https://rentnpay-website.vercel.app/my-account?tab=orders" style="color:#F97316;font-size:14px;text-decoration:underline;">Download invoice</a>
//           </p>
//         </div>

//         <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;border-top:1px solid #eee;">
//           Need to extend your tenure or schedule an early return? Visit My Rentals in your dashboard.
//         </div>
//         <div style="background:#f9fafb;padding:0 24px 20px 24px;">
//           <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Unsubscribe</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Help Centre</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Privacy Policy</a>
//           </p>
//           <p style="margin:0;font-size:11px;color:#999;text-align:left;">
//             © 2026 Rentnpay. All rights reserved. Registered address: Pune, India.
//           </p>
//         </div>
//       </div>
//     `,
//   });
// };

// export const sendUserKycRejectedEmail = async (
//   email,
//   fullName,
//   reasons, // array of { title, description } OR array of strings
// ) => {
//   const reasonsList =
//     Array.isArray(reasons) && reasons.length
//       ? reasons
//           .map((r) => {
//             const title = typeof r === 'string' ? r : r.title || '';
//             const desc = typeof r === 'string' ? '' : r.description || '';
//             return `
//             <div style="display:flex;align-items:flex-start;margin-bottom:14px;">
//               <span style="flex-shrink:0;width:20px;height:20px;border-radius:50%;background:#fee2e2;color:#dc2626;text-align:center;line-height:20px;font-size:12px;margin-right:10px;">!</span>
//               <div>
//                 <p style="margin:0;font-weight:bold;color:#111;font-size:14px;">${title}</p>
//                 ${desc ? `<p style="margin:2px 0 0 0;font-size:13px;color:#666;">${desc}</p>` : ''}
//               </div>
//             </div>`;
//           })
//           .join('')
//       : `<p style="margin:0;font-size:13px;color:#666;">Please review your submitted documents and resubmit.</p>`;

//   await transporter.sendMail({
//     from: `"Rentnpay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: 'KYC Verification Rejected - Rentnpay',
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
//         <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
//           <tr>
//             <td style="padding:16px 24px;vertical-align:middle;">
//               <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#F97316;color:#fff;text-align:center;line-height:28px;font-weight:bold;margin-right:8px;">R</span>
//               <span style="font-weight:bold;font-size:16px;color:#111;">Rentnpay</span>
//             </td>
//             <td style="padding:16px 24px;text-align:right;vertical-align:middle;">
//               <span style="background:#ffedd5;color:#F97316;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">ACTION REQUIRED</span>
//             </td>
//           </tr>
//         </table>

//         <div style="padding:24px;">
//           <h2 style="margin-top:0;">KYC Verification Rejected</h2>
//           <p>Hi ${fullName || 'there'}, your identity verification was unsuccessful. Please review the details and resubmit your documents for verification.</p>

//           <div style="background:#fef2f2;border-radius:8px;padding:20px;margin:20px 0;">
//             <p style="margin:0 0 14px 0;font-size:11px;letter-spacing:1px;color:#dc2626;font-weight:bold;">REASONS FOR REJECTION</p>
//             ${reasonsList}
//           </div>

//           <a href="https://rentnpay-website.vercel.app/my-account?tab=profile" style="display:block;background:#F97316;color:#fff;text-align:center;text-decoration:none;font-weight:bold;padding:14px;border-radius:8px;margin:0 0 16px 0;">Resubmit Documents</a>

//           <p style="text-align:center;margin:0 0 20px 0;">
//             <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Support</a>
//           </p>
//         </div>

//         <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;">
//           Security Note: If you did not request any verification or don't have an active account on Rentnpay, you can safely ignore this email. No further action is required.
//         </div>
//         <div style="background:#f9fafb;padding:0 24px 20px 24px;">
//           <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Unsubscribe</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Help Center</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Privacy Policy</a>
//           </p>
//           <p style="margin:0;font-size:11px;color:#999;text-align:left;">
//             © 2026 Rentnpay. All rights reserved. Registered address: Pune, India.
//           </p>
//         </div>
//       </div>
//     `,
//   });
// };

// export const sendUserKycApprovedEmail = async (email, fullName) => {
//   await transporter.sendMail({
//     from: `"Rentnpay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: 'KYC Verified Successfully - Rentnpay',
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
//         <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
//           <tr>
//             <td style="padding:16px 24px;vertical-align:middle;">
//               <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#F97316;color:#fff;text-align:center;line-height:28px;font-weight:bold;margin-right:8px;">R</span>
//               <span style="font-weight:bold;font-size:16px;color:#111;">Rentnpay</span>
//             </td>
//           </tr>
//         </table>

//         <div style="padding:24px;">
//           <h2 style="margin-top:0;">KYC Verified Successfully</h2>
//           <p>Hi ${fullName || 'there'}, your identity profile is verified. Full rental and direct buy access unlocked.</p>

//           <a href="https://rentnpay-website.vercel.app/my-account?tab=profile" style="display:block;background:#F97316;color:#fff;text-align:center;text-decoration:none;font-weight:bold;padding:14px;border-radius:8px;margin:20px 0 16px 0;">Go to KYC Portal</a>

//           <p style="text-align:center;margin:0 0 20px 0;">
//             <a href="https://rentnpay-website.vercel.app/my-account?tab=profile" style="color:#F97316;font-size:14px;text-decoration:underline;">Re-upload Documents</a>
//           </p>
//         </div>

//         <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;">
//           Security Note: If you did not request any verification or don't have an active account on Rentnpay, you can safely ignore this email. No further action is required.
//         </div>
//         <div style="background:#f9fafb;padding:0 24px 20px 24px;">
//           <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Unsubscribe</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Help Center</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Privacy Policy</a>
//           </p>
//           <p style="margin:0;font-size:11px;color:#999;text-align:left;">
//             © 2026 Rentnpay. All rights reserved. Registered address: Pune, India.
//           </p>
//         </div>
//       </div>
//     `,
//   });
// };

// export const sendVendorKycRejectedEmail = async (
//   email,
//   vendorName,
//   reasons, // array of { title, description }
// ) => {
//   const reasonsList =
//     Array.isArray(reasons) && reasons.length
//       ? reasons
//           .map(
//             (r) => `
//             <div style="background:#f9fafb;border-radius:8px;padding:14px 16px;margin-bottom:8px;">
//               <table role="presentation" width="100%" style="border-collapse:collapse;">
//                 <tr>
//                   <td style="vertical-align:top;">
//                     <p style="margin:0;font-weight:bold;color:#111;font-size:14px;">${r.title}</p>
//                     ${r.description ? `<p style="margin:4px 0 0 0;font-size:13px;color:#666;">(${r.description})</p>` : ''}
//                   </td>
//                   <td style="vertical-align:top;text-align:right;white-space:nowrap;">
//                     <span style="color:#dc2626;font-weight:bold;font-size:13px;">Rejected</span>
//                   </td>
//                 </tr>
//               </table>
//             </div>`,
//           )
//           .join('')
//       : `<div style="background:#f9fafb;border-radius:8px;padding:14px 16px;">
//          <p style="margin:0;font-size:13px;color:#666;">Please review your submitted documents and resubmit.</p>
//        </div>`;

//   await transporter.sendMail({
//     from: `"Rentnpay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: 'Vendor KYC Verification Rejected - Rentnpay',
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
//         <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
//           <tr>
//             <td style="padding:16px 24px;vertical-align:middle;">
//               <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#F97316;color:#fff;text-align:center;line-height:28px;font-weight:bold;margin-right:8px;">R</span>
//               <span style="font-weight:bold;font-size:16px;color:#111;">Rentnpay</span>
//             </td>
//             <td style="padding:16px 24px;text-align:right;vertical-align:middle;">
//               <span style="background:#ffedd5;color:#F97316;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">PARTNER PORTAL</span>
//             </td>
//           </tr>
//         </table>

//         <div style="padding:24px;">
//           <h2 style="margin-top:0;">Your KYC verification was unsuccessful. Please correct the highlighted issues below.</h2>
//           <p>Hi ${vendorName || 'Partner'}, we reviewed your submission and noticed some details that need your attention before we can activate your store.</p>

//           <p style="font-size:11px;letter-spacing:1px;color:#999;font-weight:bold;margin:20px 0 8px 0;">KYC AUDIT REPORT</p>

//           ${reasonsList}

//           <a href="https://rent-npay-admin.vercel.app/vendor-main" style="display:block;background:#F97316;color:#fff;text-align:center;text-decoration:none;font-weight:bold;padding:14px;border-radius:8px;margin:20px 0 16px 0;">Resubmit Documents</a>

//           <p style="text-align:center;margin:0 0 20px 0;">
//             <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Support</a>
//           </p>
//         </div>

//         <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;">
//           Need immediate assistance correcting your information? Reach out to Partner Support.
//         </div>
//         <div style="background:#f9fafb;padding:0 24px 20px 24px;">
//           <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Unsubscribe</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Partner Guidelines</a>
//           </p>
//           <p style="margin:0;font-size:11px;color:#999;text-align:left;">
//             © 2026 Rentnpay. All rights reserved. Suggestions@rentpay.info
//           </p>
//         </div>
//       </div>
//     `,
//   });
// };

// export const sendVendorKycReuploadRequestedEmail = async (
//   email,
//   vendorName,
//   documentLabel,
//   comment,
// ) => {
//   await transporter.sendMail({
//     from: `"Rentnpay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: 'Action Required: Re-upload a KYC Document - Rentnpay',
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
//         <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
//           <tr>
//             <td style="padding:16px 24px;vertical-align:middle;">
//               <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#F97316;color:#fff;text-align:center;line-height:28px;font-weight:bold;margin-right:8px;">R</span>
//               <span style="font-weight:bold;font-size:16px;color:#111;">Rentnpay</span>
//             </td>
//             <td style="padding:16px 24px;text-align:right;vertical-align:middle;">
//               <span style="background:#ffedd5;color:#F97316;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">PARTNER PORTAL</span>
//             </td>
//           </tr>
//         </table>

//         <div style="padding:24px;">
//           <h2 style="margin-top:0;">One of your documents needs to be re-uploaded</h2>
//           <p>Hi ${vendorName || 'Partner'}, we reviewed your KYC submission and found an issue with one document. Please correct it below to continue verification.</p>

//           <div style="background:#f9fafb;border-radius:8px;padding:14px 16px;margin:20px 0;">
//             <table role="presentation" width="100%" style="border-collapse:collapse;">
//               <tr>
//                 <td style="vertical-align:top;">
//                   <p style="margin:0;font-weight:bold;color:#111;font-size:14px;">${documentLabel || 'Document'}</p>
//                   ${comment ? `<p style="margin:4px 0 0 0;font-size:13px;color:#666;">(${comment})</p>` : ''}
//                 </td>
//                 <td style="vertical-align:top;text-align:right;white-space:nowrap;">
//                   <span style="color:#dc2626;font-weight:bold;font-size:13px;">Rejected</span>
//                 </td>
//               </tr>
//             </table>
//           </div>

//           <a href="https://rent-npay-admin.vercel.app/vendor-kyc-status" style="display:block;background:#F97316;color:#fff;text-align:center;text-decoration:none;font-weight:bold;padding:14px;border-radius:8px;margin:0 0 16px 0;">Resubmit Document</a>

//           <p style="text-align:center;margin:0 0 20px 0;">
//             <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Support</a>
//           </p>
//         </div>

//         <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;">
//           Need immediate assistance correcting your information? Reach out to Partner Support.
//         </div>
//         <div style="background:#f9fafb;padding:0 24px 20px 24px;">
//           <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Unsubscribe</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Partner Guidelines</a>
//           </p>
//           <p style="margin:0;font-size:11px;color:#999;text-align:left;">
//             © 2026 Rentnpay. All rights reserved. Suggestions@rentpay.info
//           </p>
//         </div>
//       </div>
//     `,
//   });
// };

// export const sendVendorKycApprovedEmail = async (email, vendorName) => {
//   await transporter.sendMail({
//     from: `"Rentnpay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: 'Your KYC is Approved - Store is Live! - Rentnpay',
//     attachments: [
//       {
//         filename: 'welcomeBanner.png',
//         path: './assets/email/welcomeBanner.png',
//         cid: 'vendorApprovedBannerImage',
//       },
//     ],
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
//         <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
//           <tr>
//             <td style="padding:16px 24px;vertical-align:middle;">
//               <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#F97316;color:#fff;text-align:center;line-height:28px;font-weight:bold;margin-right:8px;">R</span>
//               <span style="font-weight:bold;font-size:16px;color:#111;">Rentnpay</span>
//             </td>
//             <td style="padding:16px 24px;text-align:right;vertical-align:middle;">
//               <span style="background:#ffedd5;color:#F97316;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">PARTNER PORTAL</span>
//             </td>
//           </tr>
//         </table>

//         <img src="cid:vendorApprovedBannerImage" alt="" style="width:100%;display:block;" />

//         <div style="padding:24px;">
//           <h2 style="margin-top:0;">Congratulations! Your KYC has been approved and your store is now live.</h2>
//           <p>Hi ${vendorName || 'Partner'}, here is the current status of your vendor registration and store verification with Rentnpay.</p>

//           <p style="font-size:11px;letter-spacing:1px;color:#999;font-weight:bold;margin:20px 0 8px 0;">KYC AUDIT REPORT</p>

//           <div style="background:#f9fafb;border-radius:8px;overflow:hidden;margin:0 0 20px 0;">
//             <table role="presentation" width="100%" style="border-collapse:collapse;">
//               <tr>
//                 <td style="padding:14px 16px;border-bottom:1px solid #eee;font-weight:bold;color:#111;font-size:14px;">Proprietor Details</td>
//                 <td style="padding:14px 16px;border-bottom:1px solid #eee;text-align:right;color:#16a34a;font-weight:bold;font-size:13px;">Verified ✓</td>
//               </tr>
//               <tr>
//                 <td style="padding:14px 16px;border-bottom:1px solid #eee;font-weight:bold;color:#111;font-size:14px;">Business KYC (Shop Act / GST)</td>
//                 <td style="padding:14px 16px;border-bottom:1px solid #eee;text-align:right;color:#16a34a;font-weight:bold;font-size:13px;">Verified ✓</td>
//               </tr>
//               <tr>
//                 <td style="padding:14px 16px;font-weight:bold;color:#111;font-size:14px;">Bank Account KYC</td>
//                 <td style="padding:14px 16px;text-align:right;color:#16a34a;font-weight:bold;font-size:13px;">Verified ✓</td>
//               </tr>
//             </table>
//           </div>

//           <a href="https://rent-npay-admin.vercel.app/vendor-dashboard" style="display:block;background:#F97316;color:#fff;text-align:center;text-decoration:none;font-weight:bold;padding:14px;border-radius:8px;margin:0 0 16px 0;">Go to Partner Dashboard</a>

//           <p style="text-align:center;margin:0 0 20px 0;">
//             <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Support</a>
//           </p>
//         </div>

//         <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;">
//           Questions about your merchant verification? Reach out to Partner Support.
//         </div>
//         <div style="background:#f9fafb;padding:0 24px 20px 24px;">
//           <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Unsubscribe</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Partner Guidelines</a>
//           </p>
//           <p style="margin:0;font-size:11px;color:#999;text-align:left;">
//             © 2026 Rentnpay. All rights reserved. Suggestions@rentpay.info
//           </p>
//         </div>
//       </div>
//     `,
//   });
// };

// export const sendVendorPayoutEmail = async (
//   email,
//   vendorName,
//   settlement,
//   accountNumber,
// ) => {
//   const last4 = accountNumber ? String(accountNumber).slice(-4) : '----';
//   await transporter.sendMail({
//     from: `"Rentnpay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: `Your Weekly Payout Has Been Initiated - Rentnpay (${settlement.settlementId})`,
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
//         <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
//           <tr>
//             <td style="padding:16px 24px;vertical-align:middle;">
//               <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#F97316;color:#fff;text-align:center;line-height:28px;font-weight:bold;margin-right:8px;">R</span>
//               <span style="font-weight:bold;font-size:16px;color:#111;">Rentnpay Partner</span>
//             </td>
//             <td style="padding:16px 24px;text-align:right;vertical-align:middle;">
//               <span style="background:#dcfce7;color:#16a34a;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">PAYOUT PROCESSED</span>
//             </td>
//           </tr>
//         </table>

//         <div style="padding:24px;">
//           <h2 style="margin-top:0;">Your Weekly Payout Has Been Initiated!</h2>
//           <p>Hi ${vendorName || 'Partner'}, here is the complete financial settlement summary for your store activity during the period ${settlement.period}.</p>

//           <div style="border:1px solid #7BF1A8;background:#ecfdf5;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
//             <p style="margin:0;font-size:11px;letter-spacing:1px;color:#16a34a;font-weight:bold;">NET SETTLEMENT AMOUNT</p>
//             <p style="margin:8px 0;font-size:32px;font-weight:bold;color:#10b981;">₹${Number(settlement.netPayout || 0).toLocaleString('en-IN')}</p>
//             <p style="margin:0;font-size:12px;color:#555;">Credited to Bank Account ending in ****${last4}</p>
//           </div>

//           <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f9fafb;border-radius:8px;overflow:hidden;">
//             <tbody>
//               <tr>
//                 <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Gross Sales Volume</td>
//                 <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;">₹${Number(settlement.grossAmount || 0).toLocaleString('en-IN')}</td>
//               </tr>
//               <tr>
//                 <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Platform Fee Deducted</td>
//                 <td style="padding:10px 16px;text-align:right;color:#E7000B;border-bottom:1px solid #eee;">-₹${Number(settlement.platformFee || 0).toLocaleString('en-IN')}</td>
//               </tr>
//               <tr>
//                 <td style="padding:10px 16px;color:#111;font-weight:bold;">Net Disbursed Earnings</td>
//                 <td style="padding:10px 16px;text-align:right;font-weight:bold;color:#10b981;">₹${Number(settlement.netPayout || 0).toLocaleString('en-IN')}</td>
//               </tr>
//             </tbody>
//           </table>

//           <p style="text-align:center;margin:0 0 20px 0;">
//             <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Partner Support</a>
//           </p>
//         </div>

//         <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;">
//           Payouts typically take 24-48 hours to reflect in your registered bank account depending on banking clearance cycles.
//         </div>
//         <div style="background:#f9fafb;padding:0 24px 20px 24px;">
//           <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Unsubscribe</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Partner Financial Guidelines</a>
//           </p>
//           <p style="margin:0;font-size:11px;color:#999;text-align:left;">
//             © 2026 Rentnpay. All rights reserved. Registered office: Pune, India.
//           </p>
//         </div>
//       </div>
//     `,
//   });
// };

// export const sendReturnCompletedEmail = async (
//   email,
//   customerName,
//   order,
//   line,
// ) => {
//   const deposit = Number(line?.refundableDeposit || 0);
//   const deduction = Number(line?.returnRequest?.totalDeduction || 0);
//   const refundAmount = Number(line?.returnRequest?.finalRefundAmount || 0);
//   const hasDamage = deduction > 0;

//   const bankName = line?.returnRequest?.refundDetails?.bankAccountName
//     ? ''
//     : '';
//   const bankAccNum =
//     line?.returnRequest?.refundDetails?.bankAccountNumber || '';
//   const refundMethod = line?.returnRequest?.refundMethod || 'original';
//   const refundDestinationLabel =
//     refundMethod === 'bank' && bankAccNum
//       ? `Bank Account (****${bankAccNum.slice(-4)})`
//       : refundMethod === 'upi' && line?.returnRequest?.refundDetails?.upiId
//         ? `UPI (${line.returnRequest.refundDetails.upiId})`
//         : 'Original Payment Method';

//   await transporter.sendMail({
//     from: `"Rentnpay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: `Return Completed & Refund Processed - Rentnpay (#${order.orderNumber})`,
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
//         <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
//           <tr>
//             <td style="padding:16px 24px;vertical-align:middle;">
//               <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#F97316;color:#fff;text-align:center;line-height:28px;font-weight:bold;margin-right:8px;">R</span>
//               <span style="font-weight:bold;font-size:16px;color:#111;">Rentnpay</span>
//             </td>
//             <td style="padding:16px 24px;text-align:right;vertical-align:middle;">
//               <span style="background:#dcfce7;color:#16a34a;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">RETURN COMPLETED</span>
//             </td>
//           </tr>
//         </table>

//         <div style="padding:24px;">
//           <h2 style="margin-top:0;">Return Completed &amp; Refund Processed</h2>
//           <p>Hi ${customerName || 'there'}, we have successfully received and inspected your returned item. Here is the financial settlement summary for your order.</p>

//           <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f9fafb;border-radius:8px;overflow:hidden;">
//             <tbody>
//               <tr>
//                 <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Item Returned</td>
//                 <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;">
//                   <div style="font-weight:bold;color:#111;">${line?.product?.productName || 'Item'}${line?.variantName ? ` (${line.variantName})` : ''}</div>
//                   <div style="font-size:12px;color:#999;">Order #RNP-${String(order.orderNumber)}</div>
//                 </td>
//               </tr>
//               <tr>
//                 <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Initial Deposit Paid</td>
//                 <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;">₹${deposit.toLocaleString('en-IN')}</td>
//               </tr>
//               <tr>
//                 <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Item Condition Status</td>
//                 <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;color:${hasDamage ? '#dc2626' : '#16a34a'};">${hasDamage ? 'Damage/Usage Deductions Applied' : 'Good — No Damage Found'}</td>
//               </tr>
//               <tr>
//                 <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Damage / Usage Deductions</td>
//                 <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;">-₹${deduction.toLocaleString('en-IN')}</td>
//               </tr>
//               <tr>
//                 <td style="padding:10px 16px;color:#111;font-weight:bold;border-bottom:1px solid #eee;">Net Refund Amount</td>
//                 <td style="padding:10px 16px;text-align:right;font-weight:bold;color:#16a34a;border-bottom:1px solid #eee;">₹${refundAmount.toLocaleString('en-IN')}</td>
//               </tr>
//               <tr>
//                 <td style="padding:10px 16px;color:#666;">Refund Destination</td>
//                 <td style="padding:10px 16px;text-align:right;">${refundDestinationLabel}</td>
//               </tr>
//             </tbody>
//           </table>

//           <a href="https://rentnpay-website.vercel.app/my-account?tab=orders" style="display:block;background:#F97316;color:#fff;text-align:center;text-decoration:none;font-weight:bold;padding:14px;border-radius:8px;margin:0 0 16px 0;">View Settlement Invoice</a>

//           <p style="text-align:center;margin:0 0 20px 0;">
//             <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Support</a>
//           </p>
//         </div>

//         <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;">
//           Refunds typically take 3-5 business days to reflect in your account depending on your bank provider.
//         </div>
//         <div style="background:#f9fafb;padding:0 24px 20px 24px;">
//           <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Unsubscribe</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Help Centre</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Privacy Policy</a>
//           </p>
//           <p style="margin:0;font-size:11px;color:#999;text-align:left;">
//             © 2026 Rentnpay. All rights reserved. Registered office: Pune, India.
//           </p>
//         </div>
//       </div>
//     `,
//   });
// };

// export const sendTenureExpiryEmail = async (
//   email,
//   customerName,
//   order,
//   line,
//   endDate,
// ) => {
//   const fmt = (d) =>
//     new Date(d).toLocaleDateString('en-IN', {
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric',
//     });

//   const duration = line?.rentalDuration ?? order?.rentalDuration;
//   const unit = line?.tenureUnit ?? order?.tenureUnit;
//   const planLabel = duration
//     ? `${duration}-${String(unit).toLowerCase().includes('day') ? 'Day' : 'Month'} Rental`
//     : '-';

//   await transporter.sendMail({
//     from: `"Rentnpay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: `Your Rental Tenure is Expiring Soon - Rentnpay`,
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
//         <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
//           <tr>
//             <td style="padding:16px 24px;vertical-align:middle;">
//               <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#F97316;color:#fff;text-align:center;line-height:28px;font-weight:bold;margin-right:8px;">R</span>
//               <span style="font-weight:bold;font-size:16px;color:#111;">Rentnpay</span>
//             </td>
//             <td style="padding:16px 24px;text-align:right;vertical-align:middle;">
//               <span style="background:#ffedd5;color:#F97316;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">TENURE ALERT</span>
//             </td>
//           </tr>
//         </table>

//         <div style="padding:24px;">
//           <h2 style="margin-top:0;">Your Rental Tenure is Expiring Soon!</h2>
//           <p>Your active rental contract for <strong>${line?.product?.productName || 'your item'}${line?.variantName ? ` - ${line.variantName}` : ''}</strong> is scheduled to end on <strong>${fmt(endDate)}</strong>. Choose an option below to continue enjoying your product or schedule a return.</p>

//           <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f9fafb;border-radius:8px;overflow:hidden;">
//             <tbody>
//               <tr>
//                 <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Item Name</td>
//                 <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;">${line?.product?.productName || 'Item'}${line?.variantName ? ` - ${line.variantName}` : ''}</td>
//               </tr>
//               <tr>
//                 <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Current Plan</td>
//                 <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;">${planLabel}</td>
//               </tr>
//               <tr>
//                 <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Expiry Date</td>
//                 <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;">${fmt(endDate)}</td>
//               </tr>
//               <tr>
//                 <td style="padding:10px 16px;color:#666;">Renewal Monthly Rate</td>
//                 <td style="padding:10px 16px;text-align:right;">₹${Number(line?.pricePerDay || 0).toLocaleString('en-IN')} / month</td>
//               </tr>
//             </tbody>
//           </table>

//           <a href="https://rentnpay-website.vercel.app/my-account?tab=orders" style="display:block;background:#F97316;color:#fff;text-align:center;text-decoration:none;font-weight:bold;padding:14px;border-radius:8px;margin:0 0 12px 0;">Extend Tenure (1-Click)</a>
//           <a href="https://rentnpay-website.vercel.app/my-account?tab=orders" style="display:block;background:#fff;color:#111;text-align:center;text-decoration:none;font-weight:bold;padding:14px;border-radius:8px;border:1px solid #e5e7eb;margin:0 0 16px 0;">Schedule Return Pickup</a>
//         </div>

//         <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;">
//           Need flexible extension terms? You can extend day-wise, month-wise, or tenure-wise directly from your dashboard.
//         </div>
//         <div style="background:#f9fafb;padding:0 24px 20px 24px;">
//           <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Unsubscribe</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Help Centre</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Privacy Policy</a>
//           </p>
//           <p style="margin:0;font-size:11px;color:#999;text-align:left;">
//             © 2026 Rentnpay. All rights reserved. Registered address: Pune, India.
//           </p>
//         </div>
//       </div>
//     `,
//   });
// };

// export const sendTicketResolvedEmail = async (
//   email,
//   customerName,
//   order,
//   ticket,
// ) => {
//   const statusLabel =
//     ticket.status === 'resolved'
//       ? 'Resolved'
//       : ticket.status === 'in_progress'
//         ? 'In Progress'
//         : 'Open';
//   const statusColor =
//     ticket.status === 'resolved'
//       ? { bg: '#dcfce7', text: '#16a34a' }
//       : { bg: '#dbeafe', text: '#2563eb' };

//   await transporter.sendMail({
//     from: `"Rentnpay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: `Resolved Your Support Ticket - Rentnpay (#${order.orderNumber})`,
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
//         <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
//           <tr>
//             <td style="padding:16px 24px;vertical-align:middle;">
//               <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#F97316;color:#fff;text-align:center;line-height:28px;font-weight:bold;margin-right:8px;">R</span>
//               <span style="font-weight:bold;font-size:16px;color:#111;">Rentnpay</span>
//             </td>
//           </tr>
//         </table>

//         <div style="padding:24px;">
//           <h2 style="margin-top:0;">Resolved Your Support Ticket</h2>
//           <p>Hi ${customerName || 'there'}, our support team has updated your ticket regarding Order #ORD-${String(order.orderNumber)}. Please review the details and latest response below.</p>

//           <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f9fafb;border-radius:8px;overflow:hidden;">
//             <tbody>
//               <tr>
//                 <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Ticket ID</td>
//                 <td style="padding:10px 16px;text-align:right;font-weight:bold;border-bottom:1px solid #eee;">#TCK-${String(ticket._id).slice(-5).toUpperCase()}</td>
//               </tr>
//               <tr>
//                 <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Category</td>
//                 <td style="padding:10px 16px;text-align:right;font-weight:bold;border-bottom:1px solid #eee;">${ticket.issueType || 'General Inquiry'}</td>
//               </tr>
//               <tr>
//                 <td style="padding:10px 16px;color:#666;">Status</td>
//                 <td style="padding:10px 16px;text-align:right;">
//                   <span style="background:${statusColor.bg};color:${statusColor.text};font-size:11px;font-weight:bold;padding:4px 10px;border-radius:12px;">${statusLabel}</span>
//                 </td>
//               </tr>
//             </tbody>
//           </table>

//           <a href="https://rentnpay-website.vercel.app/my-account?tab=support" style="display:block;background:#F97316;color:#fff;text-align:center;text-decoration:none;font-weight:bold;padding:14px;border-radius:8px;margin:0 0 16px 0;">View Ticket</a>

//           <p style="text-align:center;margin:0 0 20px 0;">
//             <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Support</a>
//           </p>

//           <p style="text-align:center;color:#999;font-size:12px;">You can also track all your active support requests inside your Account Dashboard under the Help Centre.</p>
//         </div>

//         <div style="background:#f9fafb;padding:16px 24px;">
//           <p style="margin:0 0 8px 0;font-size:13px;text-align:center;">
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Unsubscribe</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Help Centre</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Privacy Policy</a>
//           </p>
//           <p style="margin:0;font-size:11px;color:#999;text-align:center;">
//             © 2026 Rentnpay. All rights reserved. Registered office: Pune, India.
//           </p>
//         </div>
//       </div>
//     `,
//   });
// };

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter once
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

// Common wrapper
const emailWrapper = (title, subtitle, otp) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:10px">
  <h1 style="color:#F97316;text-align:center;">Rentnpay</h1>
    <h2>${title}</h2>
    <p>${subtitle}</p>

    <div style="
      background:#f3f4f6;
      padding:15px;
      text-align:center;
      font-size:32px;
      font-weight:bold;
      letter-spacing:4px;
      border-radius:8px;
      margin:20px 0;
    ">
      ${otp}
    </div>

    <p>This OTP will expire in 5 minutes.</p>
    <p style="color:#666;">Do not share this OTP with anyone.</p>

    <hr />
    <p style="font-size:12px;color:#999;text-align:center;">
      © Rentnpay. All rights reserved.
    </p>
  </div>
`;

// 1. User Signup
// export const sendOTPEmail = async (email, otp) => {
//   await transporter.sendMail({
//     // from: process.env.EMAIL,
//     from: `"RentNPay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: 'Verify Your Account - RentNPay',
//     html: emailWrapper(
//       'Welcome to RentNPay',
//       'Use the OTP below to verify your account:',
//       otp,
//     ),
//   });
// };

// 1. User Signup (OTP + Welcome merged)
export const sendOTPEmail = async (email, otp, fullName) => {
  await transporter.sendMail({
    // from: process.env.EMAIL,
    from: `"Rentnpay Support" <${process.env.EMAIL}>`,
    to: email,
    subject: 'Welcome to Rentnpay - Verify Your Account',
    attachments: [
      {
        filename: 'rentnpay-logo.png',
        path: 'assets/email/rentnpay-logo.png',
        cid: 'rentnpayLogo',
      },
      {
        filename: 'vedorReset.png',
        path: './assets/email/vedorReset.png',
        cid: 'vedorResetImage',
      },
      {
        filename: 'rent.png',
        path: './assets/email/rent.png',
        cid: 'rentIconImage',
      },
      {
        filename: 'buy.png',
        path: './assets/email/buy.png',
        cid: 'buyIconImage',
      },
      {
        filename: 'service.png',
        path: './assets/email/service.png',
        cid: 'serviceIconImage',
      },
    ],
    html: `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
        <table role="presentation" width="100%" style="border-collapse:collapse;padding:16px 24px;border-bottom:1px solid #eee;">
          <tr>
                     <td style="padding:16px 0 16px 24px;vertical-align:middle;">
              <img src="cid:rentnpayLogo" alt="Rentnpay" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:2px;" />
              <span style="font-weight:bold;font-size:20px;color:#F97316;vertical-align:middle;">Rentnpay</span>
            </td>
          
          </tr>
        </table>

        <img src="cid:vedorResetImage" alt="" style="width:100%;display:block;" />

        <div style="padding:24px;">
          <h2 style="margin-top:0;">Welcome to Rentnpay${fullName ? `, ${fullName}` : ''}!</h2>
          <p>Thank you for joining Rentnpay. To unlock full access to renting high-quality furniture, purchasing premium electronics, and booking trusted local services.</p>

          <div style="background:#f3f4f6;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
            <p style="margin:0;font-size:12px;letter-spacing:1px;color:#666;">YOUR ONE-TIME VERIFICATION CODE</p>
            <p style="margin:8px 0;font-size:32px;font-weight:bold;letter-spacing:6px;color:#111;">${otp}</p>
            <p style="margin:0;font-size:13px;color:#F97316;">This code will expire in 5 minutes.</p>
          </div>

          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />

          <p style="font-size:11px;letter-spacing:1px;color:#999;font-weight:bold;margin:0 0 16px 0;">WITH RENTNPAY, YOU CAN:</p>
<table role="presentation" width="100%" style="border-collapse:separate;border-spacing:8px 0;">
            <tr>
              <td width="33%" style="background:#f9fafb;border-radius:8px;padding:20px 12px;text-align:center;vertical-align:top;">
                <img src="cid:rentIconImage" alt="" width="40" height="40" style="display:block;margin:0 auto 10px auto;" />
                <p style="margin:0 0 8px 0;font-weight:bold;color:#111;">Rent Products</p>
                <p style="margin:0;font-size:12px;color:#666;">Flexible tenures on premium furniture &amp; appliances</p>
              </td>
              <td width="33%" style="background:#f9fafb;border-radius:8px;padding:20px 12px;text-align:center;vertical-align:top;">
                <img src="cid:buyIconImage" alt="" width="40" height="40" style="display:block;margin:0 auto 10px auto;" />
                <p style="margin:0 0 8px 0;font-weight:bold;color:#111;">Direct Buy</p>
                <p style="margin:0;font-size:12px;color:#666;">Purchase verified assets directly with trust</p>
              </td>
              <td width="33%" style="background:#f9fafb;border-radius:8px;padding:20px 12px;text-align:center;vertical-align:top;">
                <img src="cid:serviceIconImage" alt="" width="40" height="40" style="display:block;margin:0 auto 10px auto;" />
                <p style="margin:0 0 8px 0;font-weight:bold;color:#111;">Book Services</p>
                <p style="margin:0;font-size:12px;color:#666;">Instant booking for professional repairs &amp; setups</p>
              </td>
            </tr>
          </table>
        </div>

        <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;">
          Do not share this OTP with anyone. If you did not create an account on Rentnpay , you can safely ignore this email.
        </div>
        <div style="background:#f9fafb;padding:0 24px 20px 24px;">
                 <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
            <a href="https://rentnpay-website.vercel.app/help-center" style="color:#374151;text-decoration:none;">Help Centre</a>
            &nbsp;|&nbsp;
            <a href="https://rentnpay-website.vercel.app/privacy-policy" style="color:#374151;text-decoration:none;">Privacy Policy</a>
          </p>
          <p style="margin:0;font-size:11px;color:#999;text-align:left;">
            © 2026 Rentnpay. All rights reserved. Registered office: Pune, India.
          </p>
        </div>
      </div>
    `,
  });
};

// 2. Vendor Signup
// export const sendVendorOtpEmail = async (email, otp) => {
//   await transporter.sendMail({
//     // from: process.env.EMAIL,
//     from: `"RentNPay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: 'Verify Your Vendor Account - RentNPay',
//     html: emailWrapper(
//       'Welcome Partner!',
//       'Use this OTP to verify your vendor account:',
//       otp,
//     ),
//   });
// };

export const sendVendorOtpEmail = async (email, otp, vendorName) => {
  await transporter.sendMail({
    from: `"Rentnpay Support" <${process.env.EMAIL}>`,
    to: email,
    subject: 'Verify Your Vendor Account - Rentnpay',
    attachments: [
      {
        filename: 'rentnpay-logo.png',
        path: 'assets/email/rentnpay-logo.png',
        cid: 'rentnpayLogo',
      },
    ],
    html: `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
        <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
          <tr>
                      <td style="padding:16px 24px;vertical-align:middle;">
              <img src="cid:rentnpayLogo" alt="Rentnpay" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:2px;" />
              <span style="font-weight:bold;font-size:20px;color:#F97316;vertical-align:middle;">Rentnpay</span>
            </td>
            <td style="padding:16px 24px;text-align:right;vertical-align:middle;">
              <span style="background:#ffedd5;color:#F97316;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">PARTNER PORTAL</span>
            </td>
          </tr>
        </table>

        <div style="padding:24px;">
          <h2 style="margin-top:0;">Welcome Partner!</h2>
          <p>Hi ${vendorName || 'there'}, use the OTP below to verify your vendor account and start listing on Rentnpay.</p>

          <div style="background:#f3f4f6;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
            <p style="margin:0;font-size:12px;letter-spacing:1px;color:#666;">YOUR ONE-TIME VERIFICATION CODE</p>
            <p style="margin:8px 0;font-size:32px;font-weight:bold;letter-spacing:6px;color:#111;">${otp}</p>
            <p style="margin:0;font-size:13px;color:#F97316;">This code will expire in 5 minutes.</p>
          </div>

          <p style="text-align:center;margin:0 0 20px 0;">
            <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Support</a>
          </p>
        </div>

        <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;">
          Do not share this OTP with anyone. If you did not create a vendor account on Rentnpay, you can safely ignore this email.
        </div>
        <div style="background:#f9fafb;padding:0 24px 20px 24px;">
                  <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
            <a href="https://rentnpay-website.vercel.app/help-center" style="color:#374151;text-decoration:none;">Help Centre</a>
            &nbsp;|&nbsp;
            <a href="https://rentnpay-website.vercel.app/privacy-policy" style="color:#374151;text-decoration:none;">Privacy Policy</a>
          </p>
          <p style="margin:0;font-size:11px;color:#999;text-align:left;">
            © 2026 Rentnpay. All rights reserved. Registered office: Pune, India.
          </p>
        </div>
      </div>
    `,
  });
};

// 3. Vendor Forgot Password
// export const sendVendorForgotPasswordOtp = async (email, otp) => {
//   await transporter.sendMail({
//     // from: process.env.EMAIL,
//     from: `"RentNPay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: 'Reset Your Password - RentNPay',
//     html: emailWrapper(
//       'Password Reset Request',
//       'Use this OTP to reset your password:',
//       otp,
//     ),
//   });
// };

export const sendVendorForgotPasswordOtp = async (email, otp) => {
  await transporter.sendMail({
    // from: process.env.EMAIL,
    from: `"Rentnpay Support" <${process.env.EMAIL}>`,
    to: email,
    subject: 'Reset Your Password - Rentnpay',
    attachments: [
      {
        filename: 'rentnpay-logo.png',
        path: 'assets/email/rentnpay-logo.png',
        cid: 'rentnpayLogo',
      },
      {
        filename: 'vedorReset.png',
        path: './assets/email/vedorReset.png',
        cid: 'vendorResetImage',
      },
    ],
    html: `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
     <table role="presentation" width="100%" style="border-collapse:collapse;padding:16px 24px;border-bottom:1px solid #eee;">
          <tr>
                      <td style="padding:16px 0 16px 24px;vertical-align:middle;">
              <img src="cid:rentnpayLogo" alt="Rentnpay" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:2px;" />
              <span style="font-weight:bold;font-size:20px;color:#F97316;vertical-align:middle;">Rentnpay</span>
            </td>
            <td style="padding:16px 24px 16px 0;text-align:right;vertical-align:middle;">
              <span style="background:#ffedd5;color:#F97316;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">ACCOUNT SECURITY</span>
            </td>
          </tr>
        </table>

   <img src="cid:vendorResetImage" alt="" style="width:100%;display:block;" />

        <div style="padding:24px;">
          <h2 style="margin-top:0;">Reset Your Password</h2>
          <p>We received a request to reset the password for your Rentnpay vendor account. Use the secure code below to proceed.</p>

          <div style="background:#f3f4f6;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
            <p style="margin:0;font-size:12px;letter-spacing:1px;color:#666;">YOUR ONE-TIME VERIFICATION CODE</p>
            <p style="margin:8px 0;font-size:32px;font-weight:bold;letter-spacing:6px;color:#111;">${otp}</p>
            <p style="margin:0;font-size:13px;color:#F97316;">This code will expire in 5 minutes.</p>
          </div>

          <a href="https://rent-npay-admin.vercel.app/vendor-main" style="display:block;background:#F97316;color:#fff;text-align:center;text-decoration:none;font-weight:bold;padding:14px;border-radius:8px;margin:0 0 16px 0;">Reset Password Directly</a>

          <p style="text-align:center;margin:0 0 20px 0;">
            <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Support</a>
          </p>
<div style="background:#f3f4f6;border-radius:8px;padding:14px;font-size:13px;color:#555;display:flex;align-items:flex-start;">
            <span style="margin-right:8px;flex-shrink:0;line-height:1;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </span>
            <span>If you did not request a password reset, please ignore this email or contact support immediately if you suspect unauthorized access.</span>
          </div>
        </div>

        <div style="background:#f9fafb;padding:20px 24px;">
                  <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
            <a href="https://rentnpay-website.vercel.app/help-center" style="color:#374151;text-decoration:none;">Help Centre</a>
            &nbsp;|&nbsp;
            <a href="https://rentnpay-website.vercel.app/privacy-policy" style="color:#374151;text-decoration:none;">Account Security</a>
          </p>
          <p style="margin:0;font-size:11px;color:#999;text-align:left;">
            © 2025 Rentnpay. All rights reserved. Registered office: Pune, India.
          </p>
        </div>
    `,
  });
};

export const sendAdminEmailChangeOtp = async (email, otp) => {
  await transporter.sendMail({
    from: `"Rentnpay Support" <${process.env.EMAIL}>`,
    to: email,
    subject: 'Verify Your New Email - Rentnpay Admin',
    attachments: [
      {
        filename: 'rentnpay-logo.png',
        path: 'assets/email/rentnpay-logo.png',
        cid: 'rentnpayLogo',
      },
    ],
    html: `
           <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
        <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
          <tr>
            <td style="padding:16px 24px;vertical-align:middle;">
              <img src="cid:rentnpayLogo" alt="Rentnpay" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:2px;" />
              <span style="font-weight:bold;font-size:20px;color:#F97316;vertical-align:middle;">Rentnpay</span>
            </td>
          </tr>
        </table>

        <div style="padding:24px;">
          <h2 style="margin-top:0;">Verify Your New Email</h2>
          <p>Use the code below to confirm your new email address for your Rentnpay admin account.</p>
          <div style="background:#f3f4f6;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
            <p style="margin:0;font-size:12px;letter-spacing:1px;color:#666;">YOUR ONE-TIME VERIFICATION CODE</p>
            <p style="margin:8px 0;font-size:32px;font-weight:bold;letter-spacing:6px;color:#111;">${otp}</p>
            <p style="margin:0;font-size:13px;color:#F97316;">This code will expire in 10 minutes.</p>
          </div>
          <p style="font-size:13px;color:#555;">If you did not request this, please ignore this email.</p>
        </div>
      </div>
    `,
  });
};

export const sendAdminForgotPasswordOtp = async (email, otp) => {
  await transporter.sendMail({
    from: `"Rentnpay Support" <${process.env.EMAIL}>`,
    to: email,
    subject: 'Reset Your Admin Password - Rentnpay',
    attachments: [
      {
        filename: 'rentnpay-logo.png',
        path: 'assets/email/rentnpay-logo.png',
        cid: 'rentnpayLogo',
      },
    ],
    html: `
         <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
        <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
          <tr>
            <td style="padding:16px 24px;vertical-align:middle;">
              <img src="cid:rentnpayLogo" alt="Rentnpay" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:2px;" />
              <span style="font-weight:bold;font-size:20px;color:#F97316;vertical-align:middle;">Rentnpay</span>
            </td>
            <td style="padding:16px 24px;text-align:right;vertical-align:middle;">
              <span style="background:#ffedd5;color:#F97316;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">ACCOUNT SECURITY</span>
            </td>
          </tr>
        </table>

        <div style="padding:24px;">
          <h2 style="margin-top:0;">Reset Your Admin Password</h2>
          <p>We received a request to reset the password for your Rentnpay admin account. Use the code below to proceed.</p>
          <div style="background:#f3f4f6;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
            <p style="margin:0;font-size:12px;letter-spacing:1px;color:#666;">YOUR ONE-TIME VERIFICATION CODE</p>
            <p style="margin:8px 0;font-size:32px;font-weight:bold;letter-spacing:6px;color:#111;">${otp}</p>
            <p style="margin:0;font-size:13px;color:#F97316;">This code will expire in 10 minutes.</p>
          </div>
          <p style="font-size:13px;color:#555;">If you did not request this, please ignore this email or contact support immediately.</p>
        </div>

        <div style="background:#f9fafb;padding:0 24px 20px 24px;border-top:1px solid #eee;">
          <p style="margin:8px 0;font-size:13px;text-align:left;">
            <a href="https://rentnpay-website.vercel.app/help-center" style="color:#374151;text-decoration:none;">Help Centre</a>
            &nbsp;|&nbsp;
            <a href="https://rentnpay-website.vercel.app/privacy-policy" style="color:#374151;text-decoration:none;">Privacy Policy</a>
          </p>
          <p style="margin:0;font-size:11px;color:#999;text-align:left;">
            © 2026 Rentnpay. All rights reserved. Registered office: Pune, India.
          </p>
        </div>
      </div>
    `,
  });
};

// export const sendVendorBankChangeOtp = async (email, otp) => {
//   await transporter.sendMail({
//     from: `"RentNPay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: 'Verify Bank Account Change - RentNPay',
//     html: emailWrapper(
//       'Confirm Bank Account Update',
//       'Use this OTP to verify changing your payout bank account:',
//       otp,
//     ),
//   });
// };

export const sendVendorBankChangeOtp = async (email, otp) => {
  await transporter.sendMail({
    from: `"Rentnpay Support" <${process.env.EMAIL}>`,
    to: email,
    subject: 'Verify Bank Account Change - Rentnpay',
    attachments: [
      {
        filename: 'rentnpay-logo.png',
        path: 'assets/email/rentnpay-logo.png',
        cid: 'rentnpayLogo',
      },
    ],
    html: `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
        <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
          <tr>
            <td style="padding:16px 24px;vertical-align:middle;">
                           <img src="cid:rentnpayLogo" alt="Rentnpay" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:2px;" />
              <span style="font-weight:bold;font-size:20px;color:#F97316;vertical-align:middle;">Rentnpay</span>
            </td>
            <td style="padding:16px 24px;text-align:right;vertical-align:middle;">
              <span style="background:#ffedd5;color:#F97316;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">ACCOUNT SECURITY</span>
            </td>
          </tr>
        </table>

        <div style="padding:24px;">
          <h2 style="margin-top:0;">Confirm Bank Account Update</h2>
          <p>We received a request to update the payout bank account linked to your Rentnpay vendor store. Use the secure code below to confirm this change.</p>

          <div style="background:#f3f4f6;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
            <p style="margin:0;font-size:12px;letter-spacing:1px;color:#666;">YOUR ONE-TIME VERIFICATION CODE</p>
            <p style="margin:8px 0;font-size:32px;font-weight:bold;letter-spacing:6px;color:#111;">${otp}</p>
            <p style="margin:0;font-size:13px;color:#F97316;">This code will expire in 5 minutes.</p>
          </div>

          <p style="text-align:center;margin:0 0 20px 0;">
            <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Support</a>
          </p>

          <div style="background:#f3f4f6;border-radius:8px;padding:14px;font-size:13px;color:#555;display:flex;align-items:flex-start;">
            <span style="margin-right:8px;flex-shrink:0;line-height:1;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </span>
            <span>If you did not request this bank account change, please ignore this email or contact support immediately if you suspect unauthorized access.</span>
          </div>
        </div>

        <div style="background:#f9fafb;padding:20px 24px;">
                    <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
            <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Unsubscribe</a>
            &nbsp;|&nbsp;
            <a href="https://rentnpay-website.vercel.app/help-center" style="color:#374151;text-decoration:none;">Help Centre</a>
            &nbsp;|&nbsp;
            <a href="https://rentnpay-website.vercel.app/privacy-policy" style="color:#374151;text-decoration:none;">Privacy Policy</a>
          </p>
          <p style="margin:0;font-size:11px;color:#999;text-align:left;">
            © 2026 Rentnpay. All rights reserved. Registered office: Pune, India.
          </p>
        </div>
      </div>
    `,
  });
};

// export const sendUserForgotPasswordOtp = async (email, otp) => {
//   await transporter.sendMail({
//     from: `"RentNPay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: 'Reset Your Password - RentNPay',
//     html: emailWrapper(
//       'Password Reset Request',
//       'Use this OTP to reset your password:',
//       otp,
//     ),
//   });
// };

export const sendUserForgotPasswordOtp = async (email, otp) => {
  await transporter.sendMail({
    from: `"Rentnpay Support" <${process.env.EMAIL}>`,
    to: email,
    subject: 'Reset Your Password - Rentnpay',
    attachments: [
      {
        filename: 'rentnpay-logo.png',
        path: 'assets/email/rentnpay-logo.png',
        cid: 'rentnpayLogo',
      },
    ],
    html: `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
        <table role="presentation" width="100%" style="border-collapse:collapse;padding:16px 24px;border-bottom:1px solid #eee;">
          <tr>
            <td style="padding:16px 0 16px 24px;vertical-align:middle;">
                         <img src="cid:rentnpayLogo" alt="Rentnpay" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:2px;" />
              <span style="font-weight:bold;font-size:20px;color:#F97316;vertical-align:middle;">Rentnpay</span>
            </td>
            <td style="padding:16px 24px 16px 0;text-align:right;vertical-align:middle;">
              <span style="background:#dbeafe;color:#2563eb;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">ACCOUNT SECURITY</span>
            </td>
          </tr>
        </table>

        <div style="padding:24px;">
          <h2 style="margin-top:0;">Reset Your Password</h2>
          <p>We received a request to reset the password for your Rentnpay account. Use the secure code below or click the button to proceed.</p>

          <div style="background:#f3f4f6;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
            <p style="margin:0;font-size:12px;letter-spacing:1px;color:#666;">YOUR ONE-TIME VERIFICATION CODE</p>
            <p style="margin:8px 0;font-size:32px;font-weight:bold;letter-spacing:6px;color:#111;">${otp}</p>
            <p style="margin:0;font-size:13px;color:#F97316;">This code will expire in 5 minutes.</p>
          </div>

          <a href="https://rentnpay-website.vercel.app/" style="display:block;background:#F97316;color:#fff;text-align:center;text-decoration:none;font-weight:bold;padding:14px;border-radius:8px;margin:0 0 16px 0;">Reset Password Directly</a>

          <p style="text-align:center;margin:0 0 20px 0;">
            <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Support</a>
          </p>

          <div style="background:#f3f4f6;border-radius:8px;padding:14px;font-size:13px;color:#555;display:flex;align-items:flex-start;">
            <span style="margin-right:8px;flex-shrink:0;line-height:1;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </span>
            <span>If you did not request a password reset, please ignore this email or contact support immediately if you suspect unauthorized access.</span>
          </div>
        </div>

        <div style="background:#f9fafb;padding:20px 24px;">
          <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
                 
            <a href="https://rentnpay-website.vercel.app/help-center" style="color:#374151;text-decoration:none;">Help Centre</a>
            &nbsp;|&nbsp;
            <a href="https://rentnpay-website.vercel.app/privacy-policy" style="color:#374151;text-decoration:none;">Privacy Policy</a>
          </p>
          <p style="margin:0;font-size:11px;color:#999;text-align:left;">
            © 2026 Rentnpay. All rights reserved. Registered office: Pune, India.
          </p>
        </div>
      </div>
    `,
  });
};

// export const sendServiceCompletionOtpEmail = async (
//   email,
//   otp,
//   serviceName,
//   customerName,
// ) => {
//   await transporter.sendMail({
//     from: `"RentNPay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: 'Service Completion OTP - RentNPay',
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:10px">
//         <h1 style="color:#F97316;text-align:center;">RentNPay</h1>
//         <h2>Confirm your service completion</h2>
//         <p>Hi ${customerName || 'there'},</p>
//         <p>Your vendor is requesting to mark <strong>${serviceName}</strong> as completed.</p>
//         <p>Share this OTP with the vendor only if the service has been completed to your satisfaction:</p>
//         <div style="background:#f3f4f6;padding:15px;text-align:center;font-size:36px;font-weight:bold;letter-spacing:10px;border-radius:8px;margin:20px 0;color:#111;">
//           ${otp}
//         </div>
//         <p style="color:#e53e3e;"><strong>This OTP expires in 30 minutes.</strong></p>
//         <p style="color:#666;">Do not share this OTP with anyone other than your service vendor.</p>
//         <hr />
//         <p style="font-size:12px;color:#999;text-align:center;">© RentNPay. All rights reserved.</p>
//       </div>
//     `,
//   });
// };

export const sendServiceCompletionOtpEmail = async (
  email,
  otp,
  serviceName,
  customerName,
  booking,
) => {
  await transporter.sendMail({
    from: `"Rentnpay Support" <${process.env.EMAIL}>`,
    to: email,
    subject: 'Service Completion OTP - Rentnpay',
    attachments: [
      {
        filename: 'rentnpay-logo.png',
        path: 'assets/email/rentnpay-logo.png',
        cid: 'rentnpayLogo',
      },
    ],
    html: `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
        <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
          <tr>
            <td style="padding:16px 24px;vertical-align:middle;">
                           <img src="cid:rentnpayLogo" alt="Rentnpay" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:2px;" />
              <span style="font-weight:bold;font-size:20px;color:#F97316;vertical-align:middle;">Rentnpay</span>
            </td>
            <td style="padding:16px 24px;text-align:right;vertical-align:middle;">
              <span style="background:#dcfce7;color:#16a34a;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">SERVICE COMPLETED</span>
            </td>
          </tr>
        </table>

        <div style="padding:24px;">
          <h2 style="margin-top:0;">Confirm your service completion</h2>
          <p>Hi ${customerName || 'there'}, Share this OTP with the vendor only if the service has been completed to your satisfaction:</p>

          <div style="border:2px dashed #F97316;background:#fff7ed;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
            <p style="margin:0;font-size:12px;letter-spacing:1px;color:#F97316;font-weight:bold;">SERVICE COMPLETION CODE</p>
            <p style="margin:8px 0;font-size:36px;font-weight:bold;letter-spacing:10px;color:#F97316;">${otp}</p>
          </div>

          <p style="text-align:center;margin:0 0 20px 0;">
            <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Support</a>
          </p>
        </div>

        <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;">
          Do not share this code before the technician completes the requested service.
        </div>
        <div style="background:#f9fafb;padding:0 24px 20px 24px;">
          <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
                      <a href="https://rentnpay-website.vercel.app/help-center" style="color:#374151;text-decoration:none;">Help Centre</a>
            &nbsp;|&nbsp;
            <a href="https://rentnpay-website.vercel.app/privacy-policy" style="color:#374151;text-decoration:none;">Privacy Policy</a>
          </p>
          <p style="margin:0;font-size:11px;color:#999;text-align:left;">
            © 2026 Rentnpay. All rights reserved. Registered office: Pune, India.
          </p>
        </div>
      </div>
    `,
  });
};
// export const sendOrderConfirmationEmail = async (
//   email,
//   customerName,
//   order,
// ) => {
//   const itemsHtml = (order.products || [])
//     .map(
//       (line) => `
//         <tr>
//           <td style="padding:8px;border-bottom:1px solid #eee;">
//             ${line.product?.productName || 'Item'}${line.variantName ? ` (${line.variantName})` : ''}
//           </td>
//           <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">
//             ${line.quantity}
//           </td>
//           <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">
//             ₹${Number(line.pricePerDay || 0).toLocaleString('en-IN')}
//           </td>
//         </tr>`,
//     )
//     .join('');

//   await transporter.sendMail({
//     from: `"RentNPay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: `Order Confirmed - RentNPay (#${String(order._id).slice(-8).toUpperCase()})`,
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:10px">
//         <h1 style="color:#F97316;text-align:center;">RentNPay</h1>
//         <h2>Thank you for your order, ${customerName || 'there'}!</h2>
//         <p>Your order <strong>#${String(order._id).slice(-8).toUpperCase()}</strong> has been placed successfully.</p>

//         <table style="width:100%;border-collapse:collapse;margin:20px 0;">
//           <thead>
//             <tr style="background:#f3f4f6;">
//               <th style="padding:8px;text-align:left;">Item</th>
//               <th style="padding:8px;text-align:center;">Qty</th>
//               <th style="padding:8px;text-align:right;">Price</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${itemsHtml}
//           </tbody>
//         </table>

//         <div style="background:#f3f4f6;padding:15px;border-radius:8px;margin:20px 0;">
//           <p><strong>Total Paid: ₹${Number(order.totalAmount || 0).toLocaleString('en-IN')}</strong></p>
//         </div>

//         <p><strong>Delivery Address:</strong> ${order.address || ''}</p>
//         <p><strong>Phone:</strong> ${order.phone || ''}</p>

//         <hr />
//         <p style="font-size:12px;color:#999;text-align:center;">
//           © RentNPay. All rights reserved.
//         </p>
//       </div>
//     `,
//   });
// };

export const sendBookingConfirmationEmail = async (
  email,
  customerName,
  booking,
) => {
  const taxHtml = (booking.taxLines || [])
    .map(
      (t) => `
        <tr>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;">${t.label}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">
            ₹${Number(t.value || 0).toLocaleString('en-IN')}
          </td>
        </tr>`,
    )
    .join('');

  await transporter.sendMail({
    from: `"Rentnpay Support" <${process.env.EMAIL}>`,
    to: email,
    subject: `Booking Confirmed - Rentnpay (#${String(booking._id).slice(-8).toUpperCase()})`,
    attachments: [
      {
        filename: 'rentnpay-logo.png',
        path: 'assets/email/rentnpay-logo.png',
        cid: 'rentnpayLogo',
      },
    ],
    html: `
          <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
        <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
          <tr>
            <td style="padding:16px 24px;vertical-align:middle;">
              <img src="cid:rentnpayLogo" alt="Rentnpay" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:2px;" />
              <span style="font-weight:bold;font-size:20px;color:#F97316;vertical-align:middle;">Rentnpay</span>
            </td>
          </tr>
        </table>

        <div style="padding:24px;">
          <h2 style="margin-top:0;">Your service is booked, ${customerName || 'there'}!</h2>
          <p>Booking <strong>#${String(booking._id).slice(-8).toUpperCase()}</strong> for <strong>${booking.serviceSnapshot?.productName || 'your service'}</strong> is confirmed.</p>

          <div style="background:#f3f4f6;padding:15px;border-radius:8px;margin:20px 0;">
            <p style="margin:4px 0;"><strong>Date:</strong> ${booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('en-IN') : '-'}</p>
            <p style="margin:4px 0;"><strong>Time Slot:</strong> ${booking.timeSlot?.label || '-'}</p>
          </div>

          <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f9fafb;border-radius:8px;overflow:hidden;">
            <tbody>
              <tr>
                <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Service Charge</td>
                <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;">₹${Number(booking.baseAmount || 0).toLocaleString('en-IN')}</td>
              </tr>
              ${taxHtml}
              <tr>
                <td style="padding:10px 16px;color:#666;font-weight:bold;">Total Paid</td>
                <td style="padding:10px 16px;text-align:right;font-weight:bold;">₹${Number(booking.totalAmount || 0).toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          <table style="width:100%;border-collapse:collapse;margin:0 0 20px 0;">
            <tbody>
              <tr>
                <td style="padding:6px 0;color:#666;width:100px;">Address</td>
                <td style="padding:6px 0;">${booking.address || '-'}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#666;">Phone</td>
                <td style="padding:6px 0;">${booking.phone || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;border-top:1px solid #eee;">
          Need help with your booking? Visit the Help Centre or contact our support team.
        </div>
        <div style="background:#f9fafb;padding:0 24px 20px 24px;">
          <p style="margin:8px 0;font-size:13px;text-align:left;">
            <a href="https://rentnpay-website.vercel.app/help-center" style="color:#374151;text-decoration:none;">Help Centre</a>
            &nbsp;|&nbsp;
            <a href="https://rentnpay-website.vercel.app/privacy-policy" style="color:#374151;text-decoration:none;">Privacy Policy</a>
          </p>
          <p style="margin:0;font-size:11px;color:#999;text-align:left;">
            © 2026 Rentnpay. All rights reserved. Registered address: Pune, India.
          </p>
        </div>
      </div>
    `,
  });
};

// export const sendDeliveryOtpEmail = async (
//   email,
//   otp,
//   productName,
//   customerName,
// ) => {
//   await transporter.sendMail({
//     from: `"Rentnpay Support" <${process.env.EMAIL}>`,
//     to: email,
//     subject: 'Your Delivery OTP - Rentnpay',
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
//         <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
//           <tr>
//             <td style="padding:16px 24px;vertical-align:middle;">
//               <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#F97316;color:#fff;text-align:center;line-height:28px;font-weight:bold;margin-right:8px;">R</span>
//               <span style="font-weight:bold;font-size:16px;color:#111;">Rentnpay</span>
//             </td>
//             <td style="padding:16px 24px;text-align:right;vertical-align:middle;">
//               <span style="background:#dcfce7;color:#16a34a;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">DELIVERY AT YOUR DOOR</span>
//             </td>
//           </tr>
//         </table>

//         <div style="padding:24px;">
//           <h2 style="margin-top:0;">Your delivery is here!</h2>
//           <p>Hi ${customerName || 'there'}, the delivery person is at your door with <strong>${productName}</strong>. Share this OTP with them to confirm receipt:</p>

//           <div style="border:2px dashed #F97316;background:#fff7ed;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
//             <p style="margin:0;font-size:12px;letter-spacing:1px;color:#F97316;font-weight:bold;">DELIVERY CONFIRMATION CODE</p>
//             <p style="margin:8px 0;font-size:36px;font-weight:bold;letter-spacing:10px;color:#F97316;">${otp}</p>
//             <p style="margin:0;font-size:13px;color:#e53e3e;">This OTP expires in 30 minutes.</p>
//           </div>

//           <p style="text-align:center;margin:0 0 20px 0;">
//             <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Support</a>
//           </p>
//         </div>

//         <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;">
//           Do not share this OTP with anyone other than the delivery person at your door.
//         </div>
//         <div style="background:#f9fafb;padding:0 24px 20px 24px;">
//           <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Unsubscribe</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Help Centre</a>
//             &nbsp;|&nbsp;
//             <a href="https://rentnpay-website.vercel.app/" style="color:#374151;text-decoration:none;">Privacy Policy</a>
//           </p>
//           <p style="margin:0;font-size:11px;color:#999;text-align:left;">
//             © 2026 Rentnpay. All rights reserved. Registered office: Pune, India.
//           </p>
//         </div>
//       </div>
//     `,
//   });
// };

export const sendDeliveryOtpEmail = async (
  email,
  otp,
  productName,
  customerName,
) => {
  await transporter.sendMail({
    from: `"Rentnpay Support" <${process.env.EMAIL}>`,
    to: email,
    subject: 'Your Delivery OTP - Rentnpay',
    attachments: [
      {
        filename: 'rentnpay-logo.png',
        path: 'assets/email/rentnpay-logo.png',
        cid: 'rentnpayLogo',
        contentDisposition: 'inline',
      },
    ],
    html: `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
        <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
          <tr>
                     <td style="padding:16px 24px;vertical-align:middle;">
              <img src="cid:rentnpayLogo" alt="Rentnpay" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:2px;" />
              <span style="font-weight:bold;font-size:20px;color:#F97316;vertical-align:middle;">Rentnpay</span>
            </td>
            <td style="padding:16px 24px;text-align:right;vertical-align:middle;">
              <span style="background:#dcfce7;color:#16a34a;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">DELIVERY AT YOUR DOOR</span>
            </td>
          </tr>
        </table>

        <div style="padding:24px;">
          <h2 style="margin-top:0;">Your delivery is here!</h2>
          <p>Hi ${customerName || 'there'}, the delivery person is at your door with <strong>${productName}</strong>. Share this OTP with them to confirm receipt:</p>

          <div style="border:2px dashed #F97316;background:#fff7ed;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
            <p style="margin:0;font-size:12px;letter-spacing:1px;color:#F97316;font-weight:bold;">DELIVERY CONFIRMATION CODE</p>
            <p style="margin:8px 0;font-size:36px;font-weight:bold;letter-spacing:10px;color:#F97316;">${otp}</p>
            <p style="margin:0;font-size:13px;color:#e53e3e;">This OTP expires in 30 minutes.</p>
          </div>

          <p style="text-align:center;margin:0 0 20px 0;">
            <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Support</a>
          </p>
        </div>

        <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;">
          Do not share this OTP with anyone other than the delivery person at your door.
        </div>
        <div style="background:#f9fafb;padding:0 24px 20px 24px;">
                   <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
            <a href="https://rentnpay-website.vercel.app/help-center" style="color:#374151;text-decoration:none;">Help Centre</a>
            &nbsp;|&nbsp;
            <a href="https://rentnpay-website.vercel.app/privacy-policy" style="color:#374151;text-decoration:none;">Privacy Policy</a>
          </p>
          <p style="margin:0;font-size:11px;color:#999;text-align:left;">
            © 2026 Rentnpay. All rights reserved. Registered office: Pune, India.
          </p>
        </div>
      </div>
    `,
  });
};

export const sendNewOrderEmail = async (email, vendorName, order, lines) => {
  const itemsHtml = (lines || [])
    .map((line) => {
      const isRental = line.productType === 'Rental';
      const tenure = line.rentalDuration ?? order.rentalDuration;
      const unit = line.tenureUnit ?? order.tenureUnit;
      const durationLabel =
        isRental && tenure
          ? `${line.quantity} Unit${line.quantity > 1 ? 's' : ''} (${tenure}-${unit === 'day' ? 'Day' : 'Month'} Rental Tenure)`
          : `${line.quantity} Unit${line.quantity > 1 ? 's' : ''}`;

      return `
        <tr>
          <td style="padding:10px 16px;color:#666;border-top:1px solid #eee;"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#F97316;margin-right:8px;"></span>Order Type</td>
          <td style="padding:10px 16px;text-align:right;border-top:1px solid #eee;">${isRental ? 'Rental' : 'Sell'}</td>
        </tr>
        <tr>
          <td style="padding:10px 16px;color:#666;"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#F97316;margin-right:8px;"></span>Product Name</td>
          <td style="padding:10px 16px;text-align:right;">${line.product?.productName || 'Item'}${line.variantName ? ` (${line.variantName})` : ''}</td>
        </tr>
        <tr>
          <td style="padding:10px 16px;color:#666;"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#F97316;margin-right:8px;"></span>Quantity &amp; Duration</td>
          <td style="padding:10px 16px;text-align:right;">${durationLabel}</td>
        </tr>`;
    })
    .join('');

  await transporter.sendMail({
    from: `"Rentnpay Support" <${process.env.EMAIL}>`,
    to: email,
    subject: `New Order Received - Rentnpay (#${order.orderNumber})`,
    attachments: [
      {
        filename: 'newOrder.png',
        path: './assets/email/newOrder.png',
        cid: 'newOrderImage',
        contentDisposition: 'inline',
      },
      {
        filename: 'rentnpay-logo.png',
        path: 'assets/email/rentnpay-logo.png',
        cid: 'rentnpayLogo',
      },
    ],
    html: `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">

        <!-- email-header -->
        <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
          <tr>
                      <td style="padding:16px 24px;vertical-align:middle;">
              <img src="cid:rentnpayLogo" alt="Rentnpay" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:2px;" />
              <span style="font-weight:bold;font-size:20px;color:#F97316;vertical-align:middle;">Rentnpay Partner</span>
            </td>
            <td style="padding:16px 24px;text-align:right;vertical-align:middle;">
              <span style="background:#dcfce7;color:#16a34a;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">NEW ORDER</span>
            </td>
          </tr>
        </table>

        <!-- hero-banner-container / hero-banner-image -->
        <img src="cid:newOrderImage" alt="" style="width:100%;display:block;" />

        <!-- email-body -->
        <div style="padding:24px;">
          <h2 style="margin-top:0;">You Have Received a New Order!</h2>
          <p>Hi ${vendorName || 'Partner'}, a customer has just placed an order from your store. Please review the order details below and prepare for fulfillment to keep your seller rating high.</p>

          <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f9fafb;border-radius:8px;overflow:hidden;">
            <tbody>
              <tr>
                <td style="padding:10px 16px;color:#666;"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#F97316;margin-right:8px;"></span>Order ID</td>
                <td style="padding:10px 16px;text-align:right;font-weight:bold;">#ORD-${order.orderNumber}</td>
              </tr>
              ${itemsHtml}
              <tr>
                <td style="padding:10px 16px;color:#666;"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#F97316;margin-right:8px;"></span>Order Date &amp; Time</td>
                <td style="padding:10px 16px;text-align:right;">${new Date(order.createdAt).toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          <a href="https://rent-npay-admin.vercel.app/vendor-main" style="display:block;background:#F97316;color:#fff;text-align:center;text-decoration:none;font-weight:bold;padding:14px;border-radius:8px;margin:0 0 16px 0;">Accept &amp; Fulfill Order</a>

          <p style="text-align:center;margin:0 0 20px 0;">
            <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Support</a>
          </p>

          <p style="text-align:center;color:#999;font-size:12px;">Timely fulfillment helps maintain your top vendor rating on Rentnpay.</p>
        </div>

        <!-- email-footer -->
        <div style="background:#f9fafb;padding:16px 24px;font-size:12px;color:#999;">
          This is an automated system notification to Rentnpay registered partners. Please do not reply directly to this email address.
        </div>
        <div style="background:#f9fafb;padding:0 24px 20px 24px;">
                  <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
            <a href="https://rentnpay-website.vercel.app/help-center" style="color:#374151;text-decoration:none;">Help Centre</a>
            &nbsp;|&nbsp;
            <a href="https://rentnpay-website.vercel.app/privacy-policy" style="color:#374151;text-decoration:none;">Privacy Policy</a>
          </p>
          <p style="margin:0;font-size:11px;color:#999;text-align:left;">
            © 2026 Rentnpay. All rights reserved. Registered office: Pune, India.
          </p>
        </div>
      </div>
    `,
  });
};

export const sendServiceBookingConfirmationEmail = async (
  email,
  customerName,
  booking,
) => {
  await transporter.sendMail({
    from: `"Rentnpay Support" <${process.env.EMAIL}>`,
    to: email,
    subject: `Service Booking Confirmed - Rentnpay (#${String(booking._id).slice(-8).toUpperCase()})`,
    attachments: [
      {
        filename: 'rentnpay-logo.png',
        path: 'assets/email/rentnpay-logo.png',
        cid: 'rentnpayLogo',
      },
    ],
    html: `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
        <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
          <tr>
                     <td style="padding:16px 24px;vertical-align:middle;">
              <img src="cid:rentnpayLogo" alt="Rentnpay" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:2px;" />
              <span style="font-weight:bold;font-size:20px;color:#F97316;vertical-align:middle;">Rentnpay</span>
            </td>
            <td style="padding:16px 24px;text-align:right;vertical-align:middle;">
              <span style="background:#dcfce7;color:#16a34a;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">SERVICE SCHEDULED</span>
            </td>
          </tr>
        </table>

        <div style="padding:24px;">
          <h2 style="margin-top:0;">Your Service is Booked</h2>
          <p>Your technician is scheduled to arrive during your selected time slot.</p>

          <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f9fafb;border-radius:8px;overflow:hidden;">
            <tbody>
              <tr>
                <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Service Booked</td>
                <td style="padding:10px 16px;text-align:right;font-weight:bold;border-bottom:1px solid #eee;">${booking.serviceSnapshot?.productName || 'your service'}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Scheduled Date &amp; Time</td>
                <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;">${booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('en-IN') : '-'} | ${booking.timeSlot?.label || '-'}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Service Address</td>
                <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;">${booking.address || ''}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;color:#111;font-weight:bold;">Total Fee</td>
                <td style="padding:10px 16px;text-align:right;font-weight:bold;color:#16a34a;">₹${Number(booking.totalAmount || 0).toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          <a href="https://rentnpay-website.vercel.app/my-account?tab=orders" style="display:block;background:#F97316;color:#fff;text-align:center;text-decoration:none;font-weight:bold;padding:14px;border-radius:8px;margin:0 0 16px 0;">Manage Booking / Reschedule</a>

          <p style="text-align:center;margin:0 0 20px 0;">
            <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Support</a>
          </p>
        </div>

        <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;">
          Do not share this code before the technician completes the requested service.
        </div>
        <div style="background:#f9fafb;padding:0 24px 20px 24px;">
                   <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
            <a href="https://rentnpay-website.vercel.app/help-center" style="color:#374151;text-decoration:none;">Help Centre</a>
            &nbsp;|&nbsp;
            <a href="https://rentnpay-website.vercel.app/privacy-policy" style="color:#374151;text-decoration:none;">Privacy Policy</a>
          </p>
          <p style="margin:0;font-size:11px;color:#999;text-align:left;">
            © 2026 Rentnpay. All rights reserved. Registered office: Pune, India.
          </p>
        </div>
      </div>
    `,
  });
};

export const sendProductApprovedEmail = async (email, vendorName, product) => {
  await transporter.sendMail({
    from: `"Rentnpay Support" <${process.env.EMAIL}>`,
    to: email,
    subject: `Product Approved - Rentnpay (${product.productName})`,
    attachments: [
      {
        filename: 'vedorReset.png',
        path: './assets/email/vedorReset.png',
        cid: 'productApprovedImage',
      },
      {
        filename: 'rentnpay-logo.png',
        path: 'assets/email/rentnpay-logo.png',
        cid: 'rentnpayLogo',
      },
    ],
    html: `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
        <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
          <tr>
            <td style="padding:16px 24px;vertical-align:middle;">
                      <img src="cid:rentnpayLogo" alt="Rentnpay" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:2px;" />
              <span style="font-weight:bold;font-size:20px;color:#F97316;vertical-align:middle;">Rentnpay</span>
            </td>
            <td style="padding:16px 24px;text-align:right;vertical-align:middle;">
              <span style="background:#ffedd5;color:#F97316;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">CATALOG MANAGEMENT</span>
            </td>
          </tr>
        </table>

        <img src="cid:productApprovedImage" alt="" style="width:100%;display:block;" />

        <div style="padding:24px;">
          <h2 style="margin-top:0;">
            <span style="color:#16a34a;">Approved</span>: Your item is now live on the marketplace.
          </h2>
          <p>Here is the review result for your recently submitted product listing.</p>

          <p style="font-size:11px;letter-spacing:1px;color:#999;font-weight:bold;margin:20px 0 8px 0;">LISTING &amp; AUDIT DETAILS</p>

          <table style="width:100%;border-collapse:collapse;margin:0 0 20px 0;background:#f9fafb;border-radius:8px;overflow:hidden;">
            <tbody>
              <tr>
                <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Product Name</td>
                <td style="padding:10px 16px;text-align:right;font-weight:bold;border-bottom:1px solid #eee;">${product.productName}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Category &amp; Type</td>
                <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;">${product.category || ''}${product.type ? ` | ${product.type} Listing` : ''}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Submission Date</td>
                <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;">${product.adminApprovedAt ? new Date(product.adminApprovedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;color:#666;">Admin Audit Notes</td>
                <td style="padding:10px 16px;text-align:right;">Images verified. Pricing slabs approved.</td>
              </tr>
            </tbody>
          </table>

          <a href="https://rent-npay-admin.vercel.app/vendor-products" style="display:block;background:#F97316;color:#fff;text-align:center;text-decoration:none;font-weight:bold;padding:14px;border-radius:8px;margin:0 0 16px 0;">View Product in Inventory</a>

          <p style="text-align:center;margin:0 0 20px 0;">
            <a href="https://rent-npay-admin.vercel.app/vendor-products" style="color:#374151;font-size:14px;text-decoration:underline;">Edit Product Listing</a>
          </p>
        </div>

        <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#666;">
          All product submissions are evaluated according to Rentnpay marketplace quality standards.
        </div>
        <div style="background:#f9fafb;padding:0 24px 20px 24px;">
          <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
                   <a href="https://rentnpay-website.vercel.app/help-center" style="color:#374151;text-decoration:none;">Help Centre</a>
            &nbsp;|&nbsp;
            <a href="https://rentnpay-website.vercel.app/privacy-policy" style="color:#374151;text-decoration:none;">Privacy Policy</a>
          </p>
          <p style="margin:0;font-size:11px;color:#999;text-align:left;">
            © 2026 Rentnpay. All rights reserved. Registered office: Pune, India.
          </p>
        </div>
      </div>
    `,
  });
};

export const sendWelcomeEmail = async (email, fullName) => {
  await transporter.sendMail({
    from: `"Rentnpay Support" <${process.env.EMAIL}>`,
    to: email,
    subject: 'Welcome to Rentnpay!',
    attachments: [
      {
        filename: 'welcomeBanner.png',
        path: './assets/email/welcomeBanner.png',
        cid: 'welcomeBannerImage',
      },
      {
        filename: 'rentnpay-logo.png',
        path: 'assets/email/rentnpay-logo.png',
        cid: 'rentnpayLogo',
      },
    ],
    html: `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
        <table role="presentation" width="100%" style="border-collapse:collapse;padding:16px 24px;border-bottom:1px solid #eee;">
          <tr>
            <td style="padding:16px 0 16px 24px;vertical-align:middle;">
                         <img src="cid:rentnpayLogo" alt="Rentnpay" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:2px;" />
              <span style="font-weight:bold;font-size:20px;color:#F97316;vertical-align:middle;">Rentnpay</span>
            </td>
          </tr>
        </table>

        <img src="cid:welcomeBannerImage" alt="" style="width:100%;display:block;" />

        <div style="padding:24px;">
          <h2 style="margin-top:0;">Welcome to Rentnpay!</h2>
          <p>Thank you for joining Rentnpay${fullName ? `, ${fullName}` : ''}. To unlock full access to renting high-quality furniture, purchasing premium electronics, and booking trusted local services, explore what you can do below.</p>

          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />

          <p style="font-size:11px;letter-spacing:1px;color:#999;font-weight:bold;margin:0 0 16px 0;">WITH RENTNPAY, YOU CAN:</p>

          <table role="presentation" width="100%" style="border-collapse:separate;border-spacing:8px 0;">
            <tr>
              <td width="33%" style="background:#f9fafb;border-radius:8px;padding:20px 12px;text-align:center;vertical-align:top;">
                <p style="margin:0 0 8px 0;font-weight:bold;color:#111;">Rent Products</p>
                <p style="margin:0;font-size:12px;color:#666;">Flexible tenures on premium furniture &amp; appliances</p>
              </td>
              <td width="33%" style="background:#f9fafb;border-radius:8px;padding:20px 12px;text-align:center;vertical-align:top;">
                <p style="margin:0 0 8px 0;font-weight:bold;color:#111;">Direct Buy</p>
                <p style="margin:0;font-size:12px;color:#666;">Purchase verified assets directly with trust</p>
              </td>
              <td width="33%" style="background:#f9fafb;border-radius:8px;padding:20px 12px;text-align:center;vertical-align:top;">
                <p style="margin:0 0 8px 0;font-weight:bold;color:#111;">Book Services</p>
                <p style="margin:0;font-size:12px;color:#666;">Instant booking for professional repairs &amp; setups</p>
              </td>
            </tr>
          </table>
        </div>

        <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;">
          Security Note: If you did not create an account on Rentnpay, you can safely ignore or delete this email. No further action is required.
        </div>
        <div style="background:#f9fafb;padding:0 24px 20px 24px;">
          <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
                       <a href="https://rentnpay-website.vercel.app/help-center" style="color:#374151;text-decoration:none;">Help Centre</a>
            &nbsp;|&nbsp;
            <a href="https://rentnpay-website.vercel.app/privacy-policy" style="color:#374151;text-decoration:none;">Privacy Policy</a>
          </p>
          <p style="margin:0;font-size:11px;color:#999;text-align:left;">
            © 2026 Rentnpay . All rights reserved. Registered address: Pune, India.
          </p>
        </div>
      </div>
    `,
  });
};

export const sendRentalOrderConfirmedEmail = async (
  email,
  customerName,
  order,
  line,
) => {
  const invoiceToken = `${String(order._id)}-${order.orderNumber}`;
  const startDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const durationValue = line.rentalDuration ?? order.rentalDuration;
  const unit = line.tenureUnit ?? order.tenureUnit;

  const endDate = new Date(startDate);
  if (unit === 'day') {
    endDate.setDate(endDate.getDate() + Number(durationValue || 0));
  } else {
    endDate.setMonth(endDate.getMonth() + Number(durationValue || 0));
  }

  const nextBillingDate = new Date(startDate);
  if (unit === 'day') {
    nextBillingDate.setDate(nextBillingDate.getDate() + 30);
  } else {
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
  }

  const fmt = (d) =>
    d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const tenureLabel = durationValue
    ? `${durationValue}-${unit === 'day' ? 'Day' : 'Month'} Plan (${fmt(startDate)} - ${fmt(endDate)})`
    : '-';

  await transporter.sendMail({
    from: `"Rentnpay Support" <${process.env.EMAIL}>`,
    to: email,
    subject: `Your Rental is Placed - Rentnpay (#${order.orderNumber})`,
    attachments: [
      {
        filename: 'rentnpay-logo.png',
        path: 'assets/email/rentnpay-logo.png',
        cid: 'rentnpayLogo',
      },
    ],
    html: `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
        <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
          <tr>
            <td style="padding:16px 24px;vertical-align:middle;">
                                                                     <img src="cid:rentnpayLogo" alt="Rentnpay" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:2px;" />
              <span style="font-weight:bold;font-size:20px;color:#F97316;vertical-align:middle;">Rentnpay</span>
            </td>
         
          </tr>
        </table>

        <div style="padding:24px;">
          <h2 style="margin-top:0;">Your Rental is Ordered!</h2>
          <p>Thank you for renting with Rentnpay${customerName ? `, ${customerName}` : ''}. Here are the details of your active rental agreement.</p>

          <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f9fafb;border-radius:8px;overflow:hidden;">
            <tbody>
              <tr>
                <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Item Rented</td>
                <td style="padding:10px 16px;text-align:right;font-weight:bold;border-bottom:1px solid #eee;">${line.product?.productName || 'Item'}${line.variantName ? ` - ${line.variantName}` : ''}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Tenure Selected</td>
                <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;">${tenureLabel}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Monthly Rental</td>
                <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;">₹${Number(line.pricePerDay || 0).toLocaleString('en-IN')} / month</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Security Deposit Paid</td>
                <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;">₹${Number(line.refundableDeposit || 0).toLocaleString('en-IN')} (Refundable)</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;color:#666;">Next Billing Date</td>
                <td style="padding:10px 16px;text-align:right;">${fmt(nextBillingDate)}</td>
              </tr>
            </tbody>
          </table>

          <a href="https://rentnpay-website.vercel.app/my-account?tab=orders" style="display:block;background:#F97316;color:#fff;text-align:center;text-decoration:none;font-weight:bold;padding:14px;border-radius:8px;margin:0 0 16px 0;">Track Order &amp; Rental Status</a>

                <p style="text-align:center;margin:0 0 20px 0;">

<a href="https://backend.delicod.com/api/invoice-pdf/${order._id}?token=${invoiceToken}" style="color:#F97316;font-size:14px;text-decoration:underline;">Download invoice</a>
          </p>
        </div>

        <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;border-top:1px solid #eee;">
          Need to extend your tenure or schedule an early return? Visit My Rentals in your dashboard.
        </div>
        <div style="background:#f9fafb;padding:0 24px 20px 24px;">
          <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
         
            <a href="https://rentnpay-website.vercel.app/help-center" style="color:#374151;text-decoration:none;">Help Centre</a>
            &nbsp;|&nbsp;
            <a href="https://rentnpay-website.vercel.app/privacy-policy" style="color:#374151;text-decoration:none;">Privacy Policy</a>
          </p>
          <p style="margin:0;font-size:11px;color:#999;text-align:left;">
            © 2026 Rentnpay. All rights reserved. Registered address: Pune, India.
          </p>
        </div>
      </div>
    `,
  });
};

export const sendUserKycRejectedEmail = async (
  email,
  fullName,
  reasons, // array of { title, description } OR array of strings
) => {
  const reasonsList =
    Array.isArray(reasons) && reasons.length
      ? reasons
          .map((r) => {
            const title = typeof r === 'string' ? r : r.title || '';
            const desc = typeof r === 'string' ? '' : r.description || '';
            return `
            <div style="display:flex;align-items:flex-start;margin-bottom:14px;">
              <span style="flex-shrink:0;width:20px;height:20px;border-radius:50%;background:#fee2e2;color:#dc2626;text-align:center;line-height:20px;font-size:12px;margin-right:10px;">!</span>
              <div>
                <p style="margin:0;font-weight:bold;color:#111;font-size:14px;">${title}</p>
                ${desc ? `<p style="margin:2px 0 0 0;font-size:13px;color:#666;">${desc}</p>` : ''}
              </div>
            </div>`;
          })
          .join('')
      : `<p style="margin:0;font-size:13px;color:#666;">Please review your submitted documents and resubmit.</p>`;

  await transporter.sendMail({
    from: `"Rentnpay Support" <${process.env.EMAIL}>`,
    to: email,
    subject: 'KYC Verification Rejected - Rentnpay',
    attachments: [
      {
        filename: 'rentnpay-logo.png',
        path: 'assets/email/rentnpay-logo.png',
        cid: 'rentnpayLogo',
      },
    ],
    html: `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
        <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
          <tr>
                     <td style="padding:16px 24px;vertical-align:middle;">
              <img src="cid:rentnpayLogo" alt="Rentnpay" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:2px;" />
              <span style="font-weight:bold;font-size:20px;color:#F97316;vertical-align:middle;">Rentnpay</span>
            </td>
            <td style="padding:16px 24px;text-align:right;vertical-align:middle;">
              <span style="background:#ffedd5;color:#F97316;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">ACTION REQUIRED</span>
            </td>
          </tr>
        </table>

        <div style="padding:24px;">
          <h2 style="margin-top:0;">KYC Verification Rejected</h2>
          <p>Hi ${fullName || 'there'}, your identity verification was unsuccessful. Please review the details and resubmit your documents for verification.</p>

          <div style="background:#fef2f2;border-radius:8px;padding:20px;margin:20px 0;">
            <p style="margin:0 0 14px 0;font-size:11px;letter-spacing:1px;color:#dc2626;font-weight:bold;">REASONS FOR REJECTION</p>
            ${reasonsList}
          </div>

          <a href="https://rentnpay-website.vercel.app/my-account?tab=profile" style="display:block;background:#F97316;color:#fff;text-align:center;text-decoration:none;font-weight:bold;padding:14px;border-radius:8px;margin:0 0 16px 0;">Resubmit Documents</a>

          <p style="text-align:center;margin:0 0 20px 0;">
            <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Support</a>
          </p>
        </div>

        <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;">
          Security Note: If you did not request any verification or don't have an active account on Rentnpay, you can safely ignore this email. No further action is required.
        </div>
        <div style="background:#f9fafb;padding:0 24px 20px 24px;">
                 <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
            <a href="https://rentnpay-website.vercel.app/help-center" style="color:#374151;text-decoration:none;">Help Center</a>
            &nbsp;|&nbsp;
            <a href="https://rentnpay-website.vercel.app/privacy-policy" style="color:#374151;text-decoration:none;">Privacy Policy</a>
          </p>
          <p style="margin:0;font-size:11px;color:#999;text-align:left;">
            © 2026 Rentnpay. All rights reserved. Registered address: Pune, India.
          </p>
        </div>
      </div>
    `,
  });
};

export const sendUserKycApprovedEmail = async (email, fullName) => {
  await transporter.sendMail({
    from: `"Rentnpay Support" <${process.env.EMAIL}>`,
    to: email,
    subject: 'KYC Verified Successfully - Rentnpay',
    attachments: [
      {
        filename: 'rentnpay-logo.png',
        path: 'assets/email/rentnpay-logo.png',
        cid: 'rentnpayLogo',
      },
    ],
    html: `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
        <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
          <tr>
                      <td style="padding:16px 24px;vertical-align:middle;">
              <img src="cid:rentnpayLogo" alt="Rentnpay" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:2px;" />
              <span style="font-weight:bold;font-size:20px;color:#F97316;vertical-align:middle;">Rentnpay</span>
            </td>
          </tr>
        </table>

        <div style="padding:24px;">
          <h2 style="margin-top:0;">KYC Verified Successfully</h2>
          <p>Hi ${fullName || 'there'}, your identity profile is verified. Full rental and direct buy access unlocked.</p>

          <a href="https://rentnpay-website.vercel.app/my-account?tab=profile" style="display:block;background:#F97316;color:#fff;text-align:center;text-decoration:none;font-weight:bold;padding:14px;border-radius:8px;margin:20px 0 16px 0;">Go to KYC Portal</a>

          <p style="text-align:center;margin:0 0 20px 0;">
            <a href="https://rentnpay-website.vercel.app/my-account?tab=profile" style="color:#F97316;font-size:14px;text-decoration:underline;">Re-upload Documents</a>
          </p>
        </div>

        <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;">
          Security Note: If you did not request any verification or don't have an active account on Rentnpay, you can safely ignore this email. No further action is required.
        </div>
        <div style="background:#f9fafb;padding:0 24px 20px 24px;">
                   <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
            <a href="https://rentnpay-website.vercel.app/help-center" style="color:#374151;text-decoration:none;">Help Center</a>
            &nbsp;|&nbsp;
            <a href="https://rentnpay-website.vercel.app/privacy-policy" style="color:#374151;text-decoration:none;">Privacy Policy</a>
          </p>
          <p style="margin:0;font-size:11px;color:#999;text-align:left;">
            © 2026 Rentnpay. All rights reserved. Registered address: Pune, India.
          </p>
        </div>
      </div>
    `,
  });
};

export const sendVendorKycRejectedEmail = async (
  email,
  vendorName,
  reasons, // array of { title, description }
) => {
  const reasonsList =
    Array.isArray(reasons) && reasons.length
      ? reasons
          .map(
            (r) => `
            <div style="background:#f9fafb;border-radius:8px;padding:14px 16px;margin-bottom:8px;">
              <table role="presentation" width="100%" style="border-collapse:collapse;">
                <tr>
                  <td style="vertical-align:top;">
                    <p style="margin:0;font-weight:bold;color:#111;font-size:14px;">${r.title}</p>
                    ${r.description ? `<p style="margin:4px 0 0 0;font-size:13px;color:#666;">(${r.description})</p>` : ''}
                  </td>
                  <td style="vertical-align:top;text-align:right;white-space:nowrap;">
                    <span style="color:#dc2626;font-weight:bold;font-size:13px;">Rejected</span>
                  </td>
                </tr>
              </table>
            </div>`,
          )
          .join('')
      : `<div style="background:#f9fafb;border-radius:8px;padding:14px 16px;">
         <p style="margin:0;font-size:13px;color:#666;">Please review your submitted documents and resubmit.</p>
       </div>`;

  await transporter.sendMail({
    from: `"Rentnpay Support" <${process.env.EMAIL}>`,
    to: email,
    subject: 'Vendor KYC Verification Rejected - Rentnpay',
    attachments: [
      {
        filename: 'rentnpay-logo.png',
        path: 'assets/email/rentnpay-logo.png',
        cid: 'rentnpayLogo',
      },
    ],
    html: `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
        <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
          <tr>
            <td style="padding:16px 24px;vertical-align:middle;">
                           <img src="cid:rentnpayLogo" alt="Rentnpay" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:2px;" />
              <span style="font-weight:bold;font-size:20px;color:#F97316;vertical-align:middle;">Rentnpay</span>
            </td>
            <td style="padding:16px 24px;text-align:right;vertical-align:middle;">
              <span style="background:#ffedd5;color:#F97316;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">PARTNER PORTAL</span>
            </td>
          </tr>
        </table>

        <div style="padding:24px;">
          <h2 style="margin-top:0;">Your KYC verification was unsuccessful. Please correct the highlighted issues below.</h2>
          <p>Hi ${vendorName || 'Partner'}, we reviewed your submission and noticed some details that need your attention before we can activate your store.</p>

          <p style="font-size:11px;letter-spacing:1px;color:#999;font-weight:bold;margin:20px 0 8px 0;">KYC AUDIT REPORT</p>

          ${reasonsList}

          <a href="https://rent-npay-admin.vercel.app/vendor-main" style="display:block;background:#F97316;color:#fff;text-align:center;text-decoration:none;font-weight:bold;padding:14px;border-radius:8px;margin:20px 0 16px 0;">Resubmit Documents</a>

          <p style="text-align:center;margin:0 0 20px 0;">
            <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Support</a>
          </p>
        </div>

        <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;">
          Need immediate assistance correcting your information? Reach out to Partner Support.
        </div>
        <div style="background:#f9fafb;padding:0 24px 20px 24px;">
          <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
                     <a href="https://rentnpay-website.vercel.app/help-center" style="color:#374151;text-decoration:none;">Help Centre</a>
            &nbsp;|&nbsp;
            <a href="https://rentnpay-website.vercel.app/privacy-policy" style="color:#374151;text-decoration:none;">Privacy Policy</a>
          </p>
          <p style="margin:0;font-size:11px;color:#999;text-align:left;">
            © 2026 Rentnpay. All rights reserved. Registered office: Pune, India.
          </p>
        </div>
      </div>
    `,
  });
};

export const sendVendorKycReuploadRequestedEmail = async (
  email,
  vendorName,
  documentLabel,
  comment,
) => {
  await transporter.sendMail({
    from: `"Rentnpay Support" <${process.env.EMAIL}>`,
    to: email,
    subject: 'Action Required: Re-upload a KYC Document - Rentnpay',
    attachments: [
      {
        filename: 'rentnpay-logo.png',
        path: 'assets/email/rentnpay-logo.png',
        cid: 'rentnpayLogo',
      },
    ],
    html: `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
        <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
          <tr>
                      <td style="padding:16px 24px;vertical-align:middle;">
              <img src="cid:rentnpayLogo" alt="Rentnpay" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:2px;" />
              <span style="font-weight:bold;font-size:20px;color:#F97316;vertical-align:middle;">Rentnpay</span>
            </td>
            <td style="padding:16px 24px;text-align:right;vertical-align:middle;">
              <span style="background:#ffedd5;color:#F97316;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">PARTNER PORTAL</span>
            </td>
          </tr>
        </table>

        <div style="padding:24px;">
          <h2 style="margin-top:0;">One of your documents needs to be re-uploaded</h2>
          <p>Hi ${vendorName || 'Partner'}, we reviewed your KYC submission and found an issue with one document. Please correct it below to continue verification.</p>

          <div style="background:#f9fafb;border-radius:8px;padding:14px 16px;margin:20px 0;">
            <table role="presentation" width="100%" style="border-collapse:collapse;">
              <tr>
                <td style="vertical-align:top;">
                  <p style="margin:0;font-weight:bold;color:#111;font-size:14px;">${documentLabel || 'Document'}</p>
                  ${comment ? `<p style="margin:4px 0 0 0;font-size:13px;color:#666;">(${comment})</p>` : ''}
                </td>
                <td style="vertical-align:top;text-align:right;white-space:nowrap;">
                  <span style="color:#dc2626;font-weight:bold;font-size:13px;">Rejected</span>
                </td>
              </tr>
            </table>
          </div>

          <a href="https://rent-npay-admin.vercel.app/vendor-kyc-status" style="display:block;background:#F97316;color:#fff;text-align:center;text-decoration:none;font-weight:bold;padding:14px;border-radius:8px;margin:0 0 16px 0;">Resubmit Document</a>

          <p style="text-align:center;margin:0 0 20px 0;">
            <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Support</a>
          </p>
        </div>

        <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;">
          Need immediate assistance correcting your information? Reach out to Partner Support.
        </div>
        <div style="background:#f9fafb;padding:0 24px 20px 24px;">
                  <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
            <a href="https://rentnpay-website.vercel.app/help-center" style="color:#374151;text-decoration:none;">Partner Guidelines</a>
          </p>
          <p style="margin:0;font-size:11px;color:#999;text-align:left;">
            © 2026 Rentnpay. All rights reserved. Suggestions@rentpay.info
          </p>
        </div>
      </div>
    `,
  });
};

export const sendVendorKycApprovedEmail = async (email, vendorName) => {
  await transporter.sendMail({
    from: `"Rentnpay Support" <${process.env.EMAIL}>`,
    to: email,
    subject: 'Your KYC is Approved - Store is Live! - Rentnpay',
    attachments: [
      {
        filename: 'rentnpay-logo.png',
        path: 'assets/email/rentnpay-logo.png',
        cid: 'rentnpayLogo',
      },
      {
        filename: 'welcomeBanner.png',
        path: './assets/email/welcomeBanner.png',
        cid: 'vendorApprovedBannerImage',
      },
    ],
    html: `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
        <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
          <tr>
                      <td style="padding:16px 24px;vertical-align:middle;">
              <img src="cid:rentnpayLogo" alt="Rentnpay" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:2px;" />
              <span style="font-weight:bold;font-size:20px;color:#F97316;vertical-align:middle;">Rentnpay</span>
            </td>
            <td style="padding:16px 24px;text-align:right;vertical-align:middle;">
              <span style="background:#ffedd5;color:#F97316;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">PARTNER PORTAL</span>
            </td>
          </tr>
        </table>

        <img src="cid:vendorApprovedBannerImage" alt="" style="width:100%;display:block;" />

        <div style="padding:24px;">
          <h2 style="margin-top:0;">Congratulations! Your KYC has been approved and your store is now live.</h2>
          <p>Hi ${vendorName || 'Partner'}, here is the current status of your vendor registration and store verification with Rentnpay.</p>

          <p style="font-size:11px;letter-spacing:1px;color:#999;font-weight:bold;margin:20px 0 8px 0;">KYC AUDIT REPORT</p>

          <div style="background:#f9fafb;border-radius:8px;overflow:hidden;margin:0 0 20px 0;">
            <table role="presentation" width="100%" style="border-collapse:collapse;">
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #eee;font-weight:bold;color:#111;font-size:14px;">Proprietor Details</td>
                <td style="padding:14px 16px;border-bottom:1px solid #eee;text-align:right;color:#16a34a;font-weight:bold;font-size:13px;">Verified ✓</td>
              </tr>
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #eee;font-weight:bold;color:#111;font-size:14px;">Business KYC (Shop Act / GST)</td>
                <td style="padding:14px 16px;border-bottom:1px solid #eee;text-align:right;color:#16a34a;font-weight:bold;font-size:13px;">Verified ✓</td>
              </tr>
              <tr>
                <td style="padding:14px 16px;font-weight:bold;color:#111;font-size:14px;">Bank Account KYC</td>
                <td style="padding:14px 16px;text-align:right;color:#16a34a;font-weight:bold;font-size:13px;">Verified ✓</td>
              </tr>
            </table>
          </div>

          <a href="https://rent-npay-admin.vercel.app/vendor-dashboard" style="display:block;background:#F97316;color:#fff;text-align:center;text-decoration:none;font-weight:bold;padding:14px;border-radius:8px;margin:0 0 16px 0;">Go to Partner Dashboard</a>

          <p style="text-align:center;margin:0 0 20px 0;">
            <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Support</a>
          </p>
        </div>

        <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;">
          Questions about your merchant verification? Reach out to Partner Support.
        </div>
        <div style="background:#f9fafb;padding:0 24px 20px 24px;">
                   <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
            <a href="https://rentnpay-website.vercel.app/help-center" style="color:#374151;text-decoration:none;">Partner Guidelines</a>
          </p>
          <p style="margin:0;font-size:11px;color:#999;text-align:left;">
            © 2026 Rentnpay. All rights reserved. Suggestions@rentpay.info
          </p>
        </div>
      </div>
    `,
  });
};

export const sendVendorPayoutEmail = async (
  email,
  vendorName,
  settlement,
  accountNumber,
) => {
  const last4 = accountNumber ? String(accountNumber).slice(-4) : '----';
  await transporter.sendMail({
    from: `"Rentnpay Support" <${process.env.EMAIL}>`,
    to: email,
    subject: `Your Weekly Payout Has Been Initiated - Rentnpay (${settlement.settlementId})`,
    attachments: [
      {
        filename: 'rentnpay-logo.png',
        path: 'assets/email/rentnpay-logo.png',
        cid: 'rentnpayLogo',
      },
    ],
    html: `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
        <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
          <tr>
            <td style="padding:16px 24px;vertical-align:middle;">
                           <img src="cid:rentnpayLogo" alt="Rentnpay" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:2px;" />
              <span style="font-weight:bold;font-size:20px;color:#F97316;vertical-align:middle;">Rentnpay Partner</span>
            </td>
            <td style="padding:16px 24px;text-align:right;vertical-align:middle;">
              <span style="background:#dcfce7;color:#16a34a;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">PAYOUT PROCESSED</span>
            </td>
          </tr>
        </table>

        <div style="padding:24px;">
          <h2 style="margin-top:0;">Your Weekly Payout Has Been Initiated!</h2>
          <p>Hi ${vendorName || 'Partner'}, here is the complete financial settlement summary for your store activity during the period ${settlement.period}.</p>

          <div style="border:1px solid #7BF1A8;background:#ecfdf5;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
            <p style="margin:0;font-size:11px;letter-spacing:1px;color:#16a34a;font-weight:bold;">NET SETTLEMENT AMOUNT</p>
            <p style="margin:8px 0;font-size:32px;font-weight:bold;color:#10b981;">₹${Number(settlement.netPayout || 0).toLocaleString('en-IN')}</p>
            <p style="margin:0;font-size:12px;color:#555;">Credited to Bank Account ending in ****${last4}</p>
          </div>

          <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f9fafb;border-radius:8px;overflow:hidden;">
            <tbody>
              <tr>
                <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Gross Sales Volume</td>
                <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;">₹${Number(settlement.grossAmount || 0).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Platform Fee Deducted</td>
                <td style="padding:10px 16px;text-align:right;color:#E7000B;border-bottom:1px solid #eee;">-₹${Number(settlement.platformFee || 0).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;color:#111;font-weight:bold;">Net Disbursed Earnings</td>
                <td style="padding:10px 16px;text-align:right;font-weight:bold;color:#10b981;">₹${Number(settlement.netPayout || 0).toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          <p style="text-align:center;margin:0 0 20px 0;">
            <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Partner Support</a>
          </p>
        </div>

        <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;">
          Payouts typically take 24-48 hours to reflect in your registered bank account depending on banking clearance cycles.
        </div>
        <div style="background:#f9fafb;padding:0 24px 20px 24px;">
          <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
                       <a href="https://rentnpay-website.vercel.app/help-center" style="color:#374151;text-decoration:none;">Help Centre</a>
            &nbsp;|&nbsp;
            <a href="https://rentnpay-website.vercel.app/privacy-policy" style="color:#374151;text-decoration:none;">Privacy Policy</a>
          </p>
          <p style="margin:0;font-size:11px;color:#999;text-align:left;">
            © 2026 Rentnpay. All rights reserved. Registered office: Pune, India.
          </p>
        </div>
      </div>
    `,
  });
};

export const sendReturnCompletedEmail = async (
  email,
  customerName,
  order,
  line,
) => {
  const deposit = Number(line?.refundableDeposit || 0);
  const deduction = Number(line?.returnRequest?.totalDeduction || 0);
  const refundAmount = Number(line?.returnRequest?.finalRefundAmount || 0);
  const hasDamage = deduction > 0;

  const bankName = line?.returnRequest?.refundDetails?.bankAccountName
    ? ''
    : '';
  const bankAccNum =
    line?.returnRequest?.refundDetails?.bankAccountNumber || '';
  const refundMethod = line?.returnRequest?.refundMethod || 'original';
  const refundDestinationLabel =
    refundMethod === 'bank' && bankAccNum
      ? `Bank Account (****${bankAccNum.slice(-4)})`
      : refundMethod === 'upi' && line?.returnRequest?.refundDetails?.upiId
        ? `UPI (${line.returnRequest.refundDetails.upiId})`
        : 'Original Payment Method';

  await transporter.sendMail({
    from: `"Rentnpay Support" <${process.env.EMAIL}>`,
    to: email,
    subject: `Return Completed & Refund Processed - Rentnpay (#${order.orderNumber})`,
    attachments: [
      {
        filename: 'rentnpay-logo.png',
        path: 'assets/email/rentnpay-logo.png',
        cid: 'rentnpayLogo',
      },
    ],
    html: `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
        <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
          <tr>
                      <td style="padding:16px 24px;vertical-align:middle;">
              <img src="cid:rentnpayLogo" alt="Rentnpay" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:2px;" />
              <span style="font-weight:bold;font-size:20px;color:#F97316;vertical-align:middle;">Rentnpay</span>
            </td>
            <td style="padding:16px 24px;text-align:right;vertical-align:middle;">
              <span style="background:#dcfce7;color:#16a34a;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">RETURN COMPLETED</span>
            </td>
          </tr>
        </table>

        <div style="padding:24px;">
          <h2 style="margin-top:0;">Return Completed &amp; Refund Processed</h2>
          <p>Hi ${customerName || 'there'}, we have successfully received and inspected your returned item. Here is the financial settlement summary for your order.</p>

          <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f9fafb;border-radius:8px;overflow:hidden;">
            <tbody>
              <tr>
                <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Item Returned</td>
                <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;">
                  <div style="font-weight:bold;color:#111;">${line?.product?.productName || 'Item'}${line?.variantName ? ` (${line.variantName})` : ''}</div>
                  <div style="font-size:12px;color:#999;">Order #RNP-${String(order.orderNumber)}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Initial Deposit Paid</td>
                <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;">₹${deposit.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Item Condition Status</td>
                <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;color:${hasDamage ? '#dc2626' : '#16a34a'};">${hasDamage ? 'Damage/Usage Deductions Applied' : 'Good — No Damage Found'}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Damage / Usage Deductions</td>
                <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;">-₹${deduction.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;color:#111;font-weight:bold;border-bottom:1px solid #eee;">Net Refund Amount</td>
                <td style="padding:10px 16px;text-align:right;font-weight:bold;color:#16a34a;border-bottom:1px solid #eee;">₹${refundAmount.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;color:#666;">Refund Destination</td>
                <td style="padding:10px 16px;text-align:right;">${refundDestinationLabel}</td>
              </tr>
            </tbody>
          </table>

          <a href="https://rentnpay-website.vercel.app/my-account?tab=orders" style="display:block;background:#F97316;color:#fff;text-align:center;text-decoration:none;font-weight:bold;padding:14px;border-radius:8px;margin:0 0 16px 0;">View Settlement Invoice</a>

          <p style="text-align:center;margin:0 0 20px 0;">
            <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Support</a>
          </p>
        </div>

        <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;">
          Refunds typically take 3-5 business days to reflect in your account depending on your bank provider.
        </div>
        <div style="background:#f9fafb;padding:0 24px 20px 24px;">
                <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
            <a href="https://rentnpay-website.vercel.app/help-center" style="color:#374151;text-decoration:none;">Help Centre</a>
            &nbsp;|&nbsp;
            <a href="https://rentnpay-website.vercel.app/privacy-policy" style="color:#374151;text-decoration:none;">Privacy Policy</a>
          </p>
          <p style="margin:0;font-size:11px;color:#999;text-align:left;">
            © 2026 Rentnpay. All rights reserved. Registered office: Pune, India.
          </p>
        </div>
      </div>
    `,
  });
};

export const sendTenureExpiryEmail = async (
  email,
  customerName,
  order,
  line,
  endDate,
) => {
  const fmt = (d) =>
    new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const duration = line?.rentalDuration ?? order?.rentalDuration;
  const unit = line?.tenureUnit ?? order?.tenureUnit;
  const planLabel = duration
    ? `${duration}-${String(unit).toLowerCase().includes('day') ? 'Day' : 'Month'} Rental`
    : '-';

  await transporter.sendMail({
    from: `"Rentnpay Support" <${process.env.EMAIL}>`,
    to: email,
    subject: `Your Rental Tenure is Expiring Soon - Rentnpay`,
    attachments: [
      {
        filename: 'rentnpay-logo.png',
        path: 'assets/email/rentnpay-logo.png',
        cid: 'rentnpayLogo',
      },
    ],
    html: `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
        <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
          <tr>
            <td style="padding:16px 24px;vertical-align:middle;">
                           <img src="cid:rentnpayLogo" alt="Rentnpay" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:2px;" />
              <span style="font-weight:bold;font-size:20px;color:#F97316;vertical-align:middle;">Rentnpay</span>
            </td>
            <td style="padding:16px 24px;text-align:right;vertical-align:middle;">
              <span style="background:#ffedd5;color:#F97316;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">TENURE ALERT</span>
            </td>
          </tr>
        </table>

        <div style="padding:24px;">
          <h2 style="margin-top:0;">Your Rental Tenure is Expiring Soon!</h2>
          <p>Your active rental contract for <strong>${line?.product?.productName || 'your item'}${line?.variantName ? ` - ${line.variantName}` : ''}</strong> is scheduled to end on <strong>${fmt(endDate)}</strong>. Choose an option below to continue enjoying your product or schedule a return.</p>

          <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f9fafb;border-radius:8px;overflow:hidden;">
            <tbody>
              <tr>
                <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Item Name</td>
                <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;">${line?.product?.productName || 'Item'}${line?.variantName ? ` - ${line.variantName}` : ''}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Current Plan</td>
                <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;">${planLabel}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Expiry Date</td>
                <td style="padding:10px 16px;text-align:right;border-bottom:1px solid #eee;">${fmt(endDate)}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;color:#666;">Renewal Monthly Rate</td>
                <td style="padding:10px 16px;text-align:right;">₹${Number(line?.pricePerDay || 0).toLocaleString('en-IN')} / month</td>
              </tr>
            </tbody>
          </table>

          <a href="https://rentnpay-website.vercel.app/my-account?tab=orders" style="display:block;background:#F97316;color:#fff;text-align:center;text-decoration:none;font-weight:bold;padding:14px;border-radius:8px;margin:0 0 12px 0;">Extend Tenure (1-Click)</a>
          <a href="https://rentnpay-website.vercel.app/my-account?tab=orders" style="display:block;background:#fff;color:#111;text-align:center;text-decoration:none;font-weight:bold;padding:14px;border-radius:8px;border:1px solid #e5e7eb;margin:0 0 16px 0;">Schedule Return Pickup</a>
        </div>

        <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;">
          Need flexible extension terms? You can extend day-wise, month-wise, or tenure-wise directly from your dashboard.
        </div>
        <div style="background:#f9fafb;padding:0 24px 20px 24px;">
          <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
                       <a href="https://rentnpay-website.vercel.app/help-center" style="color:#374151;text-decoration:none;">Help Centre</a>
            &nbsp;|&nbsp;
            <a href="https://rentnpay-website.vercel.app/privacy-policy" style="color:#374151;text-decoration:none;">Privacy Policy</a>
          </p>
          <p style="margin:0;font-size:11px;color:#999;text-align:left;">
            © 2026 Rentnpay. All rights reserved. Registered address: Pune, India.
          </p>
        </div>
      </div>
    `,
  });
};

export const sendTicketResolvedEmail = async (
  email,
  customerName,
  order,
  ticket,
) => {
  const statusLabel =
    ticket.status === 'resolved'
      ? 'Resolved'
      : ticket.status === 'in_progress'
        ? 'In Progress'
        : 'Open';
  const statusColor =
    ticket.status === 'resolved'
      ? { bg: '#dcfce7', text: '#16a34a' }
      : { bg: '#dbeafe', text: '#2563eb' };

  await transporter.sendMail({
    from: `"Rentnpay Support" <${process.env.EMAIL}>`,
    to: email,
    subject: `Resolved Your Support Ticket - Rentnpay (#${order.orderNumber})`,
    attachments: [
      {
        filename: 'rentnpay-logo.png',
        path: 'assets/email/rentnpay-logo.png',
        cid: 'rentnpayLogo',
      },
    ],
    html: `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
        <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
          <tr>
                    <td style="padding:16px 24px;vertical-align:middle;">
              <img src="cid:rentnpayLogo" alt="Rentnpay" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:2px;" />
              <span style="font-weight:bold;font-size:20px;color:#F97316;vertical-align:middle;">Rentnpay</span>
            </td>
          </tr>
        </table>

        <div style="padding:24px;">
          <h2 style="margin-top:0;">Resolved Your Support Ticket</h2>
          <p>Hi ${customerName || 'there'}, our support team has updated your ticket regarding Order #ORD-${String(order.orderNumber)}. Please review the details and latest response below.</p>

          <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f9fafb;border-radius:8px;overflow:hidden;">
            <tbody>
              <tr>
                <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Ticket ID</td>
                <td style="padding:10px 16px;text-align:right;font-weight:bold;border-bottom:1px solid #eee;">#TCK-${String(ticket._id).slice(-5).toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">Category</td>
                <td style="padding:10px 16px;text-align:right;font-weight:bold;border-bottom:1px solid #eee;">${ticket.issueType || 'General Inquiry'}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;color:#666;">Status</td>
                <td style="padding:10px 16px;text-align:right;">
                  <span style="background:${statusColor.bg};color:${statusColor.text};font-size:11px;font-weight:bold;padding:4px 10px;border-radius:12px;">${statusLabel}</span>
                </td>
              </tr>
            </tbody>
          </table>

          <a href="https://rentnpay-website.vercel.app/my-account?tab=support" style="display:block;background:#F97316;color:#fff;text-align:center;text-decoration:none;font-weight:bold;padding:14px;border-radius:8px;margin:0 0 16px 0;">View Ticket</a>

          <p style="text-align:center;margin:0 0 20px 0;">
            <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Support</a>
          </p>

          <p style="text-align:center;color:#999;font-size:12px;">You can also track all your active support requests inside your Account Dashboard under the Help Centre.</p>
        </div>

        <div style="background:#f9fafb;padding:16px 24px;">
                   <p style="margin:0 0 8px 0;font-size:13px;text-align:center;">
            <a href="https://rentnpay-website.vercel.app/help-center" style="color:#374151;text-decoration:none;">Help Centre</a>
            &nbsp;|&nbsp;
            <a href="https://rentnpay-website.vercel.app/privacy-policy" style="color:#374151;text-decoration:none;">Privacy Policy</a>
          </p>
          <p style="margin:0;font-size:11px;color:#999;text-align:center;">
            © 2026 Rentnpay. All rights reserved. Registered office: Pune, India.
          </p>
        </div>
      </div>
    `,
  });
};

export const sendVendorCancelledOrderEmail = async (
  email,
  {
    customerName,
    displayId,
    productName,
    totalAmount,
    deduction,
    fullRefundAmount,
  },
) => {
  const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  await transporter.sendMail({
    from: `"Rentnpay Support" <${process.env.EMAIL}>`,
    to: email,
    subject: `Your Order #${displayId} Was Cancelled by the Vendor - Rentnpay`,
    attachments: [
      {
        filename: 'rentnpay-logo.png',
        path: 'assets/email/rentnpay-logo.png',
        cid: 'rentnpayLogo',
      },
    ],
    html: `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
        <table role="presentation" width="100%" style="border-collapse:collapse;border-bottom:1px solid #eee;">
          <tr>
            <td style="padding:16px 24px;vertical-align:middle;">
              <img src="cid:rentnpayLogo" alt="Rentnpay" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:2px;" />
              <span style="font-weight:bold;font-size:20px;color:#F97316;vertical-align:middle;">Rentnpay</span>
            </td>
            <td style="padding:16px 24px;text-align:right;vertical-align:middle;">
              <span style="background:#fee2e2;color:#dc2626;font-size:11px;font-weight:bold;letter-spacing:0.5px;padding:6px 12px;border-radius:20px;white-space:nowrap;">ORDER CANCELLED</span>
            </td>
          </tr>
        </table>

        <div style="padding:24px;">
          <h2 style="margin-top:0;">Order Cancelled by Vendor</h2>
          <p>Hi ${customerName || 'there'}, your order <strong>#${displayId}</strong> for <strong>${productName || 'the product'}</strong> has been cancelled by the vendor. Since this was not your fault, you will receive a full refund with no deductions.</p>

          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:20px 0;">
            <p style="margin:0 0 12px 0;font-size:14px;font-weight:bold;color:#111;">Refund Breakdown</p>
                       <table role="presentation" width="100%" style="border-collapse:collapse;font-size:14px;">
              <tr>
                <td style="padding:6px 0;color:#555;">Amount</td>
                <td style="padding:6px 0;text-align:right;color:#111;font-weight:600;">${money(totalAmount)}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#555;border-top:1px solid #e5e7eb;">Deduction</td>
                <td style="padding:6px 0;text-align:right;color:#111;font-weight:600;border-top:1px solid #e5e7eb;">${money(deduction)}</td>
              </tr>
            </table>
          </div>

                  <table role="presentation" width="100%" style="border-collapse:collapse;background:#ecfdf5;border:1px solid #05df72;border-radius:8px;margin:0 0 20px 0;">
            <tr>
              <td style="padding:16px 20px;font-size:14px;font-weight:bold;color:#111;white-space:nowrap;">Full Refund Amount</td>
              <td style="padding:16px 20px;font-size:22px;font-weight:bold;color:#059669;text-align:right;">${money(fullRefundAmount)}</td>
            </tr>
          </table>

          <p style="text-align:center;margin:0 0 20px 0;">
            <a href="https://rentnpay-website.vercel.app/contact" style="color:#374151;font-size:14px;text-decoration:underline;">Contact Support</a>
          </p>
        </div>

        <div style="background:#f9fafb;padding:16px 24px;font-size:13px;color:#555;">
          The refund will be credited to your original payment method within the usual processing time. If you have any questions, please contact our support team.
        </div>
        <div style="background:#f9fafb;padding:0 24px 20px 24px;">
          <p style="margin:0 0 8px 0;font-size:13px;text-align:left;">
            <a href="https://rentnpay-website.vercel.app/help-center" style="color:#374151;text-decoration:none;">Help Centre</a>
            &nbsp;|&nbsp;
            <a href="https://rentnpay-website.vercel.app/privacy-policy" style="color:#374151;text-decoration:none;">Privacy Policy</a>
          </p>
          <p style="margin:0;font-size:11px;color:#999;text-align:left;">
            © 2026 Rentnpay. All rights reserved. Registered office: Pune, India.
          </p>
        </div>
      </div>
    `,
  });
};
