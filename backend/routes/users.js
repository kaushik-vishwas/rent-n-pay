import express from 'express';
import upload from '../middleware/upload.js';
import {
  signupUser,
  verifyUserOTP,
  loginUser,
  userLogout,
  sendUserForgotPasswordOtpController,
  resetUserPassword,
  verifyForgotOtp,
  getReferralDashboard,
  updateBankDetails,
  requestWithdrawal,
  deleteUserAccount,
  mobileSendOtp,
  mobileVerifyOtp,
  mobileSignup,
} from '../controller/user/userController.js';
import { getMyInvoices } from '../controller/user/InvoiceController.js';
import { userAuth } from '../middleware/userAuth.js';
import {
  getMyAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  getCheckoutPickupStores,
} from '../controller/user/addressController.js';
import {
  getMyWishlist,
  toggleWishlist,
} from '../controller/user/wishlistController.js';
import { submitContact } from '../controller/user/contactController.js';
import {
  getMyUserKyc,
  submitMyUserKyc,
} from '../controller/user/kycController.js';
import {
  getUserNotifications,
  requestStockNotify,
} from '../controller/user/notificationController.js';
import { getMySupportTickets } from '../controller/user/ticketController.js';
import { createInvestorEnquiry } from '../controller/investorEnquiryController.js';
import {
  getActivePublicCoupons,
  validateCoupon,
} from '../controller/admin/couponController.js';
import {
  sendOrderConfirmationNotification,
  sendBookingConfirmationNotification,
} from '../controller/orderController.js';

const router = express.Router();

// auth
router.post('/user-signup', signupUser);
router.post('/user-verify-otp', verifyUserOTP);
router.post('/user-login', loginUser);
router.post('/user-logout', userAuth, userLogout);
router.post('/forgot-password', sendUserForgotPasswordOtpController);
router.post('/reset-password', resetUserPassword);
// router.post('/verify-forgot-otp', verifyForgotOtp);
router.post('/verify-forgot-otp', verifyForgotOtp);

// mobile auth
router.post('/mobile-send-otp', mobileSendOtp);
router.post('/mobile-verify-otp', mobileVerifyOtp);
router.post('/mobile-signup', mobileSignup);
router.get('/referral-dashboard', userAuth, getReferralDashboard);
router.post('/bank-details', userAuth, updateBankDetails);
router.post('/withdraw', userAuth, requestWithdrawal);
router.delete('/delete-account', userAuth, deleteUserAccount);

// addresses
router.get('/addresses', userAuth, getMyAddresses);
router.get('/checkout-pickup-stores', userAuth, getCheckoutPickupStores);
router.post('/addresses', userAuth, createAddress);
router.put('/addresses/:id', userAuth, updateAddress);
router.delete('/addresses/:id', userAuth, deleteAddress);

// wishlist
router.get('/wishlist', userAuth, getMyWishlist);
router.post('/wishlist/toggle', userAuth, toggleWishlist);
router.post('/submit-contact', userAuth, submitContact);

// notifications (activity feed)
router.get('/notifications', userAuth, getUserNotifications);
router.post('/notifications/stock-notify', userAuth, requestStockNotify);

// support tickets (issue reports on my orders — Help Center)
router.get('/support-tickets', userAuth, getMySupportTickets);
router.get('/my-invoices', userAuth, getMyInvoices);

// investor enquiries (public)
router.post('/investor-enquiries', createInvestorEnquiry);
router.post(
  '/orders/:orderId/send-confirmation-email',
  userAuth,
  sendOrderConfirmationNotification,
);
router.post(
  '/bookings/:bookingId/send-confirmation-email',
  userAuth,
  sendBookingConfirmationNotification,
);

// user kyc
router.get('/kyc', userAuth, getMyUserKyc);
router.post(
  '/kyc',
  userAuth,
  upload.fields([
    { name: 'aadhaarFront', maxCount: 1 },
    { name: 'aadhaarBack', maxCount: 1 },
    { name: 'panCard', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
  ]),
  submitMyUserKyc,
);

router.post('/coupons/validate', userAuth, validateCoupon);

router.get('/coupons/active', getActivePublicCoupons);

export default router;
