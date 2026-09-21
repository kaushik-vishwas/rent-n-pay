import express from 'express';
import {
  adminLogin,
  adminLogout,
  getAllVendors,
  getAdminStores,
  patchAdminStoreStatus,
  createVendorProfile,
  getVendorDetails,
  getAllUsers,
  getUserDetails,
  getAllProducts,
  getProductApprovalQueue,
  approveProductAndGoLive,
  patchAdminProductListingVisibility,
  getAdminProfile,
  changeAdminPassword,
  updateAdminProfile,
  getAdminInvoices,
  getCityDashboard,
  updateInvoiceLateFee,
  triggerSettlementPayoutNow,
  triggerRefundPayoutNow,
  getAllSettlements,
  getPendingRefundApprovals,
  decideRefundApproval,
  markRefundPaid,
  getPublicLocationSettings,
  getPlainCancelRefunds,
  markPlainCancelRefundPaid,
  triggerCancelRefundPayoutNow,
  forgotAdminPassword,
  verifyAdminOtp,
  resetAdminPassword,
  getAdminSettings,
  sendEmailChangeOtp,
  verifyEmailChangeOtp,
  changeAdminSettingsPassword,
  updatePendingLateFeeWaiver,
} from '../controller/admin/adminController.js';
import {
  getVendorKycQueue,
  getVendorKycReview,
  reviewVendorKyc,
  requestVendorKycDocumentReupload,
  getCustomerKycQueue,
  getCustomerKycReview,
  reviewCustomerKyc,
  getWelcomeKitList,
} from '../controller/admin/kycController.js';

import { getContacts } from '../controller/user/contactController.js';

import {
  registerSubAdmin,
  getPendingSubAdmins,
  getAllSubAdmins,
  updateSubAdminApproval,
  createSubAdminByAdmin,
  updateSubAdminByAdmin,
} from '../controller/subAdmin/subAdminController.js';

import {
  getMyLocationSettings,
  updateMyLocationSettings,
} from '../controller/admin/locationSourceController.js';
import {
  createCategory,
  getCategories,
  deleteCategory,
  getMasterCategories,
  updateCategory,
} from '../controller/admin/categoryController.js';
import { getAllAdsPlans } from '../controller/vendor/adsPlanController.js';
import {
  createSubCategory,
  getSubCategories,
  deleteSubCategory,
  updateSubCategory,
  getAllSubCategories,
} from '../controller/admin/subCategoryController.js';
import {
  listListingTemplates,
  getListingTemplate,
  createListingTemplate,
  updateListingTemplate,
  deleteListingTemplate,
  patchListingTemplateActive,
} from '../controller/admin/listingTemplateController.js';
import {
  listSellListingTemplates,
  createSellListingTemplate,
  updateSellListingTemplate,
  deleteSellListingTemplate,
  patchSellListingTemplateActive,
} from '../controller/admin/sellListingTemplateController.js';
import {
  listServiceListingTemplates,
  createServiceListingTemplate,
  updateServiceListingTemplate,
  deleteServiceListingTemplate,
  patchServiceListingTemplateActive,
} from '../controller/admin/serviceListingTemplateController.js';
import { getWishlistAnalytics } from '../controller/admin/wishlistController.js';
import {
  getAdminTickets,
  getAdminTicketById,
} from '../controller/admin/ticketAdminController.js';
import {
  getAdminOffers,
  upsertAdminOffer,
  deleteAdminOffer,
  getAdminOfferByProduct,
} from '../controller/admin/adminOfferController.js';
import {
  listInvestorEnquiries,
  getInvestorEnquiryById,
  markInvestorEnquiryRead,
} from '../controller/admin/investorAdminController.js';
import { adminAuth } from '../middleware/auth.js';
const router = express.Router();
import upload from '../middleware/upload.js';
import {
  addToFeatured,
  getAvailableListings,
  getFeaturedListings,
  removeFromFeatured,
  toggleFeaturedStatus,
  updateFeaturedPriority,
} from '../controller/admin/featuredController.js';
import {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
  getCouponById,
  toggleCouponStatus,
  updateCoupon,
} from '../controller/admin/couponController.js';

import {
  getAdminCities,
  patchCityServiceStatus,
  deleteCity,
  // getCityStats,
} from '../controller/admin/cityController.js';

import {
  getAdminSettlements,
  getAdminVendorSettlements,
  markSettlementPaid,
  getAdminBankVerificationQueue,
  verifyVendorBankDetails,
  rejectVendorBankDetails,
} from '../controller/admin/settlementController.js';

import {
  adminGetReferralActivity,
  adminProcessWithdrawal,
} from '../controller/user/userController.js';
import { getLifelineDistribution } from '../controller/admin/analyticsController.js';

import Contact from '../models/Contact.js';
import {
  getBanners,
  getActiveBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
} from '../controller/admin/bannerController.js';

import {
  getRentOffers,
  getActiveRentOffers,
  createRentOffer,
  updateRentOffer,
  deleteRentOffer,
  toggleRentOfferStatus,
} from '../controller/admin/rentOfferController.js';

import {
  getRentBanners,
  getActiveRentBanners,
  createRentBanner,
  updateRentBanner,
  deleteRentBanner,
  toggleRentBannerStatus,
} from '../controller/admin/rentBannerController.js';

import {
  getBuyBanners,
  getActiveBuyBanners,
  createBuyBanner,
  updateBuyBanner,
  deleteBuyBanner,
  toggleBuyBannerStatus,
} from '../controller/admin/buyBannerController.js';

import {
  getRentaBanners,
  getActiveRentaBanners,
  createRentaBanner,
  updateRentaBanner,
  deleteRentaBanner,
  toggleRentaBannerStatus,
} from '../controller/admin/rentaController.js';

import {
  getAdvertisements,
  getActiveAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  toggleAdvertisementStatus,
} from '../controller/admin/advertisementController.js';
import {
  getBuyAdvertisements,
  getActiveBuyAdvertisements,
  createBuyAdvertisement,
  updateBuyAdvertisement,
  deleteBuyAdvertisement,
  toggleBuyAdvertisementStatus,
} from '../controller/admin/buyAdvertisementController.js';

import {
  getServiceAdvertisements,
  getActiveServiceAdvertisements,
  createServiceAdvertisement,
  updateServiceAdvertisement,
  deleteServiceAdvertisement,
  toggleServiceAdvertisementStatus,
} from '../controller/admin/serviceAdvertisementController.js';

import {
  getGlobalTax,
  updateGlobalTax,
  updateCategoryTax,
  toggleCategoryStatus,
} from '../controller/admin/globalTaxController.js';
// Admin auth
router.post('/admin-login', adminLogin);
router.post('/forgot-password', forgotAdminPassword);
router.post('/verify-otp', verifyAdminOtp);
router.post('/reset-password', resetAdminPassword);
router.get('/settings', adminAuth, getAdminSettings);
router.post(
  '/settings/change-password',
  adminAuth,
  changeAdminSettingsPassword,
);
router.post('/settings/send-email-otp', adminAuth, sendEmailChangeOtp);
router.post('/settings/verify-email-otp', adminAuth, verifyEmailChangeOtp);
router.post('/admin-logout', adminLogout);

router.post('/subadmin-register', registerSubAdmin);
router.get('/subadmin-pending', getPendingSubAdmins);
router.get('/subadmin-all', getAllSubAdmins);
router.patch('/subadmin-approval/:subAdminId', updateSubAdminApproval);
router.post('/subadmin-create', createSubAdminByAdmin);
router.put('/subadmin-update/:id', updateSubAdminByAdmin);

// router.get('/location-settings', adminAuth, getMyLocationSettings);
// router.patch('/location-settings', adminAuth, updateMyLocationSettings);

router.get('/profile', adminAuth, getAdminProfile);
router.patch('/change-password', adminAuth, changeAdminPassword);
router.patch('/update-profile', adminAuth, updateAdminProfile);
router.get('/invoices', adminAuth, getAdminInvoices);
router.patch('/invoices/:invoiceId/late-fee', adminAuth, updateInvoiceLateFee);
router.patch(
  '/invoices/:invoiceId/pending-late-fee',
  adminAuth,
  updatePendingLateFeeWaiver,
);
router.get('/city-dashboard', adminAuth, getCityDashboard);

router.post(
  '/create-category',
  adminAuth,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'icon', maxCount: 1 },
  ]),
  createCategory,
);
router.get('/get-categories', getCategories);
router.get('/master-categories', adminAuth, getMasterCategories);
router.delete('/delete-category/:id', adminAuth, deleteCategory);

router.put(
  '/update-category/:id',
  adminAuth,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'icon', maxCount: 1 },
  ]),
  updateCategory,
);

router.get('/all-contacts', adminAuth, getContacts);
router.post(
  '/create-sub-category',
  adminAuth,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'icon', maxCount: 1 },
  ]),
  createSubCategory,
);
router.get('/get-sub-categories/:categoryId', getSubCategories);
router.get('/get-all-sub-categories', getAllSubCategories);
router.delete('/delete-sub-category/:id', adminAuth, deleteSubCategory);

router.put(
  '/update-sub-category/:id',
  adminAuth,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'icon', maxCount: 1 },
  ]),
  updateSubCategory,
);

router.get('/listing-templates', adminAuth, listListingTemplates);
router.get('/listing-templates/:id', adminAuth, getListingTemplate);
router.post(
  '/listing-templates',
  adminAuth,
  upload.any(),
  createListingTemplate,
);
router.put(
  '/listing-templates/:id',
  adminAuth,
  upload.any(),
  updateListingTemplate,
);
router.delete('/listing-templates/:id', adminAuth, deleteListingTemplate);
router.patch(
  '/listing-templates/:id/active',
  adminAuth,
  patchListingTemplateActive,
);
router.get('/sell-listing-templates', adminAuth, listSellListingTemplates);
router.post(
  '/sell-listing-templates',
  adminAuth,
  upload.any(),
  createSellListingTemplate,
);
router.put(
  '/sell-listing-templates/:id',
  adminAuth,
  upload.any(),
  updateSellListingTemplate,
);
router.delete(
  '/sell-listing-templates/:id',
  adminAuth,
  deleteSellListingTemplate,
);
router.patch(
  '/sell-listing-templates/:id/active',
  adminAuth,
  patchSellListingTemplateActive,
);
router.get(
  '/service-listing-templates',
  adminAuth,
  listServiceListingTemplates,
);
router.post(
  '/service-listing-templates',
  adminAuth,
  upload.any(),
  createServiceListingTemplate,
);
router.put(
  '/service-listing-templates/:id',
  adminAuth,
  upload.any(),
  updateServiceListingTemplate,
);
router.delete(
  '/service-listing-templates/:id',
  adminAuth,
  deleteServiceListingTemplate,
);
router.patch(
  '/service-listing-templates/:id/active',
  adminAuth,
  patchServiceListingTemplateActive,
);

router.get('/get-vendors', adminAuth, getAllVendors);
router.get('/stores', adminAuth, getAdminStores);
router.patch(
  '/stores/:vendorId/:storeIndex/status',
  adminAuth,
  patchAdminStoreStatus,
);
router.get('/location-settings', adminAuth, getMyLocationSettings);
router.patch('/location-settings', adminAuth, updateMyLocationSettings);
router.get('/location-settings/public', getPublicLocationSettings);
router.post('/create-vendor', adminAuth, createVendorProfile);
router.get('/get-vendors/:id', adminAuth, getVendorDetails);
router.get('/get-users', adminAuth, getAllUsers);
router.get('/get-users/:id', adminAuth, getUserDetails);
// router.get('/products', getAllProducts);
router.get('/products', getAllProducts);
router.get('/admin/products', adminAuth, getAllProducts);
router.get('/product-approvals', adminAuth, getProductApprovalQueue);
router.patch(
  '/product-approvals/:productId/approve',
  adminAuth,
  approveProductAndGoLive,
);
router.patch(
  '/products/:productId/listing-visibility',
  adminAuth,
  patchAdminProductListingVisibility,
);
router.get('/wishlist/analytics', adminAuth, getWishlistAnalytics);
// router.get('/offers', adminAuth, getAdminOffers);
// router.post('/offers', adminAuth, upsertAdminOffer);
// router.delete('/offers/:id', adminAuth, deleteAdminOffer);

// Tickets (read-only admin view)
router.get('/tickets', adminAuth, getAdminTickets);
router.get('/tickets/:orderId/:issueId', adminAuth, getAdminTicketById);

// Investor enquiries (Finances → Investors)
router.get('/investor-enquiries', adminAuth, listInvestorEnquiries);
router.get('/investor-enquiries/:id', adminAuth, getInvestorEnquiryById);
router.patch(
  '/investor-enquiries/:id/read',
  adminAuth,
  markInvestorEnquiryRead,
);

// Vendor KYC approvals
router.get('/kyc/queue', adminAuth, getVendorKycQueue);
router.get('/kyc/welcome-kit', adminAuth, getWelcomeKitList);
router.post(
  '/kyc/:vendorId/request-reupload',
  adminAuth,
  requestVendorKycDocumentReupload,
);
router.get('/kyc/:vendorId', adminAuth, getVendorKycReview);
router.put('/kyc/:vendorId', adminAuth, reviewVendorKyc);

// Customer KYC approvals
router.get('/kyc/customer/queue', adminAuth, getCustomerKycQueue);
router.get('/kyc/customer/:userId', adminAuth, getCustomerKycReview);
router.put('/kyc/customer/:userId', adminAuth, reviewCustomerKyc);

/**
 * Featured Listings
 */
router.post('/featured', adminAuth, addToFeatured);

router.get('/featured', adminAuth, getFeaturedListings);

router.get('/featured/available', adminAuth, getAvailableListings);

router.patch(
  '/featured/:listingType/:listingId/status',
  adminAuth,
  toggleFeaturedStatus,
);

router.patch(
  '/featured/:listingType/:listingId/priority',
  adminAuth,
  updateFeaturedPriority,
);

router.delete(
  '/featured/:listingType/:listingId',
  adminAuth,
  removeFromFeatured,
);

router.post('/coupons', adminAuth, createCoupon);
router.get('/coupons/', adminAuth, getAllCoupons);
router.get('/coupons/:id', adminAuth, getCouponById);
router.put('/coupons/:id', adminAuth, updateCoupon);
router.patch('/coupons/:id/toggle', adminAuth, toggleCouponStatus);
router.delete('/coupons/:id', adminAuth, deleteCoupon);

// router.get('/cities', adminAuth, getAdminCities);
// router.patch(
//   '/cities/:cityKey/service-status',
//   adminAuth,
//   patchCityServiceStatus,
// );
// router.delete('/cities/:cityKey', adminAuth, deleteCity);
// router.get('/cities/city-stats', adminAuth, getCityStats);

router.get('/cities', adminAuth, getAdminCities);
// router.get('/cities/city-stats', adminAuth, getCityStats);
router.patch(
  '/cities/:cityKey/service-status',
  adminAuth,
  patchCityServiceStatus,
);
router.delete('/cities/:cityKey', adminAuth, deleteCity);
router.get('/settlements', adminAuth, getAdminSettlements);
router.patch(
  '/settlements/:settlementId/mark-paid',
  adminAuth,
  markSettlementPaid,
);
router.get(
  '/vendors/bank-verifications',
  adminAuth,
  getAdminBankVerificationQueue,
);
router.patch(
  '/vendors/:vendorId/bank-verify',
  adminAuth,
  verifyVendorBankDetails,
);
router.patch(
  '/vendors/:vendorId/bank-reject',
  adminAuth,
  rejectVendorBankDetails,
);
router.get('/settlements/:vendorId', adminAuth, getAdminVendorSettlements);

router.get('/referral-activity', adminAuth, adminGetReferralActivity);
router.patch(
  '/withdrawals/:userId/:withdrawalId',
  adminAuth,
  adminProcessWithdrawal,
);

// Banners
router.get('/banners', getBanners);
router.get('/banners/active', getActiveBanners); // public - for user side
router.post(
  '/banners',

  upload.fields([{ name: 'image', maxCount: 1 }]),
  createBanner,
);
router.put(
  '/banners/:id',

  upload.fields([{ name: 'image', maxCount: 1 }]),
  updateBanner,
);
router.delete('/banners/:id', deleteBanner);
router.patch('/banners/:id/toggle', toggleBannerStatus);

router.get('/rent-offers', getRentOffers);
router.get('/rent-offers/active', getActiveRentOffers); // public - for user side
router.post(
  '/rent-offers',
  upload.fields([{ name: 'image', maxCount: 1 }]),
  createRentOffer,
);
router.put(
  '/rent-offers/:id',
  upload.fields([{ name: 'image', maxCount: 1 }]),
  updateRentOffer,
);
router.delete('/rent-offers/:id', deleteRentOffer);
router.patch('/rent-offers/:id/toggle', toggleRentOfferStatus);

// Rent Banners
router.get('/rent-banners', getRentBanners);
router.get('/rent-banners/active', getActiveRentBanners); // public - for user side
router.post(
  '/rent-banners',
  upload.fields([{ name: 'image', maxCount: 1 }]),
  createRentBanner,
);
router.put(
  '/rent-banners/:id',
  upload.fields([{ name: 'image', maxCount: 1 }]),
  updateRentBanner,
);
router.delete('/rent-banners/:id', deleteRentBanner);
router.patch('/rent-banners/:id/toggle', toggleRentBannerStatus);

// Buy Banners
router.get('/buy-banners', getBuyBanners);
router.get('/buy-banners/active', getActiveBuyBanners); // public - for user side
router.post(
  '/buy-banners',
  upload.fields([{ name: 'image', maxCount: 1 }]),
  createBuyBanner,
);
router.put(
  '/buy-banners/:id',
  upload.fields([{ name: 'image', maxCount: 1 }]),
  updateBuyBanner,
);
router.delete('/buy-banners/:id', deleteBuyBanner);
router.patch('/buy-banners/:id/toggle', toggleBuyBannerStatus);

// Rentas
router.get('/rentas-banners', getRentaBanners);
router.get('/rentas-banners/active', getActiveRentaBanners); // public - user side
router.post(
  '/rentas-banners',
  upload.fields([{ name: 'image', maxCount: 1 }]),
  createRentaBanner,
);
router.put(
  '/rentas-banners/:id',
  upload.fields([{ name: 'image', maxCount: 1 }]),
  updateRentaBanner,
);
router.delete('/rentas-banners/:id', deleteRentaBanner);
router.patch('/rentas-banners/:id/toggle', toggleRentaBannerStatus);

// Advertisements
router.get('/advertisements', getAdvertisements);
router.get('/advertisements/active', getActiveAdvertisements);
router.post(
  '/advertisements',
  upload.fields([{ name: 'image', maxCount: 1 }]),
  createAdvertisement,
);
router.put(
  '/advertisements/:id',
  upload.fields([{ name: 'image', maxCount: 1 }]),
  updateAdvertisement,
);
router.delete('/advertisements/:id', deleteAdvertisement);
router.patch('/advertisements/:id/toggle', toggleAdvertisementStatus);

// Buy Advertisements
router.get('/buy-advertisements', getBuyAdvertisements);
router.get('/buy-advertisements/active', getActiveBuyAdvertisements);
router.post(
  '/buy-advertisements',
  upload.fields([{ name: 'image', maxCount: 1 }]),
  createBuyAdvertisement,
);
router.put(
  '/buy-advertisements/:id',
  upload.fields([{ name: 'image', maxCount: 1 }]),
  updateBuyAdvertisement,
);
router.delete('/buy-advertisements/:id', deleteBuyAdvertisement);
router.patch('/buy-advertisements/:id/toggle', toggleBuyAdvertisementStatus);

router.get('/lifeline', adminAuth, getLifelineDistribution);
// Add these routes
router.get('/admin-offers', adminAuth, getAdminOffers);
router.post('/admin-offers', adminAuth, upsertAdminOffer);
router.delete('/admin-offers/:id', adminAuth, deleteAdminOffer);

// Public route — vendor modal uses this
router.get('/admin-offers/by-product/:productId', getAdminOfferByProduct);

router.get('/global-tax', adminAuth, getGlobalTax);
router.put('/global-tax', adminAuth, updateGlobalTax);
router.patch('/category-tax/:id', adminAuth, updateCategoryTax);
router.patch('/category-status/:id', adminAuth, toggleCategoryStatus);
router.get('/global-tax/public', getGlobalTax);
router.get('/ads-plans', adminAuth, getAllAdsPlans);

router.post(
  '/settlements/run-payout-now',
  adminAuth,
  triggerSettlementPayoutNow,
);
router.post('/refunds/run-payout-now', adminAuth, triggerRefundPayoutNow);
router.post(
  '/cancellations/run-payout-now',
  adminAuth,
  triggerCancelRefundPayoutNow,
);
router.get('/all-settlements', adminAuth, getAllSettlements);

router.get('/refund-approvals', adminAuth, getPendingRefundApprovals);
router.post(
  '/refund-approvals/:orderId/:lineId',
  adminAuth,
  decideRefundApproval,
);

router.post(
  '/refund-approvals/:orderId/:lineId/mark-paid',
  adminAuth,
  markRefundPaid,
);

router.get('/cancel-refunds', adminAuth, getPlainCancelRefunds);
router.put(
  '/cancel-refunds/:orderId/:lineId/paid',
  adminAuth,
  markPlainCancelRefundPaid,
);

// Service Advertisements
router.get('/service-advertisements', getServiceAdvertisements);
router.get('/service-advertisements/active', getActiveServiceAdvertisements);
router.post(
  '/service-advertisements',
  upload.fields([{ name: 'image', maxCount: 1 }]),
  createServiceAdvertisement,
);
router.put(
  '/service-advertisements/:id',
  upload.fields([{ name: 'image', maxCount: 1 }]),
  updateServiceAdvertisement,
);
router.delete('/service-advertisements/:id', deleteServiceAdvertisement);
router.patch(
  '/service-advertisements/:id/toggle',
  toggleServiceAdvertisementStatus,
);

export default router;
