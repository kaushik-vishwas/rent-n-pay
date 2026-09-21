import express from 'express';
import upload from '../middleware/upload.js';
import { vendorAuth } from '../middleware/vendorAuth.js';
import {
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  getProductById,
  getMarketLowRentalTenures,
  patchVendorProductListingVisibility,
} from '../controller/vendor/productController.js';
import {
  getListingTemplateForVendor,
  listListingTemplatesForVendor,
} from '../controller/vendor/listingTemplateBrowseController.js';
import {
  getServiceListingTemplateForVendor,
  listServiceListingTemplatesForVendor,
} from '../controller/vendor/serviceListingTemplateBrowseController.js';
import {
  getVendorCustomersSummary,
  getVendorCustomerDetails,
} from '../controller/vendor/customerController.js';
import {
  deleteVendorOffer,
  getPublicActiveOffers,
  getVendorOffers,
  upsertVendorOffer,
} from '../controller/vendor/offerController.js';
import {
  getVendorTicketById,
  getVendorTickets,
  updateVendorTicketStatus,
} from '../controller/vendor/ticketController.js';
import {
  getMyKyc,
  submitMyKyc,
  updateMyKycBankDetails,
} from '../controller/vendor/kycController.js';
import { getVendorNotifications } from '../controller/vendor/notificationController.js';
import {
  getVendorOrders,
  getVendorOrderById,
  getVendorOrderPackDetail,
  updateVendorLineStatus,
  vendorMarkOrderShipped,
  updateVendorOrderStatus,
  scheduleVendorReturnPickup,
  completeVendorReturnInspection,
  sendVendorDeliveryOtp,
  verifyVendorDeliveryOtp,
  sendServiceCompletionOtp,
  verifyServiceCompletionOtp,
  getVendorServiceBookingById,
  cancelVendorServiceBookingByVendor,
  confirmVendorRelocation,
} from '../controller/vendor/orderController.js';
import {
  getVendorServiceBookings,
  updateVendorServiceBookingStatus,
} from '../controller/serviceBookingController.js';
import {
  createServiceProduct,
  getMyServiceProducts,
  updateServiceProduct,
  deleteServiceProduct,
  patchVendorServiceListingVisibility,
} from '../controller/vendor/serviceProductController.js';
import {
  signupVendor,
  verifyOTP,
  loginVendor,
  forgotVendorPassword,
  verifyVendorResetOtp,
  resetVendorPassword,
  vendorLogout,
  getAllVendors,
  deleteVendor,
  checkVendorEmailStartSelling,
  verifyStartSellingOtp,
  getVendorRefundApprovals,
  getVendorCancellations,
  cancelVendorOrderLine,
} from '../controller/vendor/vendorController.js';
import {
  getVendorMySettlements,
  getVendorBankDetails,
  updateVendorBankDetails,
  sendVendorBankChangeOtpHandler,
  verifyVendorBankChangeOtp,
} from '../controller/admin/settlementController.js';
import {
  createAdsPlan,
  getMyAdsPlans,
  getActiveBoosts,
} from '../controller/vendor/adsPlanController.js';
import {
  getMyKycSettings,
  getMyVendorProfile,
} from '../controller/vendor/settingsController.js';
import { getVendorsPublicCount } from '../controller/admin/adminController.js';
import { vendorCreateSubCategory } from '../controller/admin/subCategoryController.js';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '../controller/user/razorpayController.js';
import {
  listMyBankAccounts,
  addMyBankAccount,
  updateMyBankAccount,
  deleteMyBankAccount,
  getMyDefaultBankAccount,
} from '../controller/vendor/vendorBankAccountController.js';

const router = express.Router();

// auth
router.post('/vendor-signup', signupVendor);
router.post('/verify-otp', verifyOTP);
router.post('/vendor-login', loginVendor);
router.post('/check-email-start-selling', checkVendorEmailStartSelling);
router.post('/verify-start-selling-otp', verifyStartSellingOtp);
router.post('/forgot-password', forgotVendorPassword);
router.post('/verify-reset-otp', verifyVendorResetOtp);
router.post('/reset-password', resetVendorPassword);
router.post('/vendor-logout', vendorAuth, vendorLogout);
router.get('/all-vendors', getAllVendors);
router.delete('/delete-vendor/:id', deleteVendor);

// product
// Create
// router.post(
//   '/create-product',
//   vendorAuth,
//   upload.array('images', 5),
//   createProduct,
// );

router.post('/create-product', vendorAuth, upload.any(), createProduct);

// Get My Products
router.get('/my-products', vendorAuth, getMyProducts);

// Create Service Product (vendor auto service)
router.post(
  '/create-service-product',
  vendorAuth,
  upload.array('images', 5),
  createServiceProduct,
);

router.post(
  '/create-sub-category',
  vendorAuth,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'icon', maxCount: 1 },
  ]),
  vendorCreateSubCategory,
);

// Get My Service Products
router.get('/my-service-products', vendorAuth, getMyServiceProducts);

router.get('/market-low-rental-tenures', vendorAuth, getMarketLowRentalTenures);

router.get('/listing-templates', vendorAuth, listListingTemplatesForVendor);
router.get('/listing-templates/:id', vendorAuth, getListingTemplateForVendor);

// Update
// router.put(
//   '/update-product/:id',
//   vendorAuth,
//   upload.array('images', 5),
//   updateProduct,
// );

router.put('/update-product/:id', vendorAuth, upload.any(), updateProduct);

router.put(
  '/update-service-product/:id',
  vendorAuth,
  upload.array('images', 5),
  updateServiceProduct,
);

router.patch(
  '/product/:id/listing-visibility',
  vendorAuth,
  patchVendorProductListingVisibility,
);

router.patch(
  '/service-product/:id/listing-visibility',
  vendorAuth,
  patchVendorServiceListingVisibility,
);

// Delete
router.delete('/delete-product/:id', vendorAuth, deleteProduct);
router.delete('/delete-service-product/:id', vendorAuth, deleteServiceProduct);
router.get('/product/:id', getProductById);

router.get(
  '/service-listing-templates',
  vendorAuth,
  listServiceListingTemplatesForVendor,
);
router.get(
  '/service-listing-templates/:id',
  vendorAuth,
  getServiceListingTemplateForVendor,
);
router.get('/customers', vendorAuth, getVendorCustomersSummary);
router.get('/customers/:userId', vendorAuth, getVendorCustomerDetails);
router.get('/orders', vendorAuth, getVendorOrders);
router.patch(
  '/orders/:orderId/relocation-confirm',
  vendorAuth,
  confirmVendorRelocation,
);
router.get('/service-bookings', vendorAuth, getVendorServiceBookings);
router.put(
  '/service-bookings/:id/status',
  vendorAuth,
  updateVendorServiceBookingStatus,
);
router.get('/orders/:id/pack', vendorAuth, getVendorOrderPackDetail);
router.put('/orders/:id/line-status', vendorAuth, updateVendorLineStatus);
router.put('/orders/:id/mark-shipped', vendorAuth, vendorMarkOrderShipped);
router.get('/orders/:id', vendorAuth, getVendorOrderById);
router.put('/orders/:id/status', vendorAuth, updateVendorOrderStatus);
router.put('/orders/:id/return-pickup', vendorAuth, scheduleVendorReturnPickup);
// router.put(
//   '/orders/:id/return-inspection',
//   vendorAuth,
//   completeVendorReturnInspection,
// );
router.put(
  '/orders/:id/return-inspection',
  vendorAuth,
  upload.single('pickupPhoto'),
  completeVendorReturnInspection,
);
router.post('/orders/:id/send-delivery-otp', vendorAuth, sendVendorDeliveryOtp);
router.post(
  '/service-bookings/:id/send-completion-otp',
  vendorAuth,
  sendServiceCompletionOtp,
);
router.post(
  '/service-bookings/:id/verify-completion-otp',
  vendorAuth,
  verifyServiceCompletionOtp,
);
router.get('/service-bookings/:id', vendorAuth, getVendorServiceBookingById);
router.post(
  '/service-bookings/:id/cancel',
  vendorAuth,
  cancelVendorServiceBookingByVendor,
);
router.post(
  '/orders/:id/verify-delivery-otp',
  vendorAuth,
  verifyVendorDeliveryOtp,
);
router.get('/kyc', vendorAuth, getMyKyc);
router.get('/notifications', vendorAuth, getVendorNotifications);
router.post('/kyc', vendorAuth, upload.any(), submitMyKyc);
router.put(
  '/my-kyc-bank-details',
  vendorAuth,
  upload.single('cancelledCheque'),
  updateMyKycBankDetails,
);

// offers
router.get('/offers/public-active', getPublicActiveOffers);
router.get('/offers', vendorAuth, getVendorOffers);
router.post('/offers', vendorAuth, upsertVendorOffer);
router.delete('/offers/:id', vendorAuth, deleteVendorOffer);

// customer issue tickets (from user “Report an Issue” on rentals)
router.get('/tickets', vendorAuth, getVendorTickets);
router.get('/tickets/:orderId/:issueId', vendorAuth, getVendorTicketById);
router.patch(
  '/tickets/:orderId/:issueId/status',
  vendorAuth,
  updateVendorTicketStatus,
);
router.get('/my-settlements', vendorAuth, getVendorMySettlements);
router.get('/bank-details', vendorAuth, getVendorBankDetails);
router.post(
  '/bank-details/send-otp',
  vendorAuth,
  sendVendorBankChangeOtpHandler,
);
router.post('/bank-details/verify-otp', vendorAuth, verifyVendorBankChangeOtp);
router.put(
  '/bank-details',
  vendorAuth,
  upload.fields([{ name: 'chequeImage', maxCount: 1 }]),
  updateVendorBankDetails,
);
router.post('/ads-plans', vendorAuth, createAdsPlan);
router.get('/ads-plans', vendorAuth, getMyAdsPlans);
router.get('/public/active-boosts', getActiveBoosts);
router.get('/kyc/settings', vendorAuth, getMyKycSettings);
router.get('/auth/me', vendorAuth, getMyVendorProfile);
router.get('/get-vendors-count', getVendorsPublicCount);

router.post('/razorpay/vendor-create-order', createRazorpayOrder);
router.post('/razorpay/vendor-verify', verifyRazorpayPayment);

router.get('/refund-approvals', vendorAuth, getVendorRefundApprovals);
router.get('/cancellations', vendorAuth, getVendorCancellations);
router.put('/orders/:id/cancel', vendorAuth, cancelVendorOrderLine);

router.get('/my-bank-accounts', vendorAuth, listMyBankAccounts);
router.post(
  '/my-bank-accounts',
  vendorAuth,
  upload.single('cancelledCheque'),
  addMyBankAccount,
);
router.put(
  '/my-bank-accounts/:id',
  vendorAuth,
  upload.single('cancelledCheque'),
  updateMyBankAccount,
);
router.delete('/my-bank-accounts/:id', vendorAuth, deleteMyBankAccount);
router.get('/my-default-bank-account', vendorAuth, getMyDefaultBankAccount);

export default router;
