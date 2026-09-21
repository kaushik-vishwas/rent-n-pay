import axios from 'axios';

const API = axios.create({
  // baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://backend.delicod.com/api',
});

// admin auth
// export const apiAdminLogin = (loginData) =>
//   API.post('/admin/admin-login', loginData);
export const apiAdminLogin = (loginData) =>
  API.post('/admin/admin-login', loginData);
export const apiAdminForgotPassword = (data) =>
  API.post('/admin/forgot-password', data);
export const apiAdminVerifyOtp = (data) => API.post('/admin/verify-otp', data);
export const apiAdminResetPassword = (data) =>
  API.post('/admin/reset-password', data);
export const apiGetAdminSettings = (token) =>
  API.get('/admin/settings', { headers: { Authorization: `Bearer ${token}` } });
export const apiChangeAdminSettingsPassword = (data, token) =>
  API.post('/admin/settings/change-password', data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const apiSendEmailChangeOtp = (data, token) =>
  API.post('/admin/settings/send-email-otp', data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const apiVerifyEmailChangeOtp = (data, token) =>
  API.post('/admin/settings/verify-email-otp', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const apiSubAdminRegister = (data) =>
  API.post('/admin/subadmin-register', data);

export const apiAdminLogout = () => API.post('/admin/admin-logout');

//vendor auth
export const apiVendorSignup = (data) =>
  API.post('/vendor/vendor-signup', data);

export const apiVendorVerifyOtp = (data) =>
  API.post('/vendor/verify-otp', data);

export const apiVendorLogin = (data) => API.post('/vendor/vendor-login', data);
export const apiVendorForgotPassword = (data) =>
  API.post('/vendor/forgot-password', data);
export const apiVendorVerifyResetOtp = (data) =>
  API.post('/vendor/verify-reset-otp', data);
export const apiVendorResetPassword = (data) =>
  API.post('/vendor/reset-password', data);
export const apiVendorCheckEmailStartSelling = (data) =>
  API.post('/vendor/check-email-start-selling', data);
export const apiVendorVerifyStartSellingOtp = (data) =>
  API.post('/vendor/verify-start-selling-otp', data);

export const apiGetVendorsPublicCount = () =>
  API.get('/vendor/get-vendors-count');

export const apiVendorSendBankChangeOtp = (token) =>
  API.post(
    '/vendor/bank-details/send-otp',
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
export const apiVendorVerifyBankChangeOtp = (token, otp) =>
  API.post(
    '/vendor/bank-details/verify-otp',
    { otp },
    { headers: { Authorization: `Bearer ${token}` } },
  );
export const apiGetMyDefaultBankAccount = (token) =>
  API.get('/vendor/my-default-bank-account', {
    headers: { Authorization: `Bearer ${token}` },
  });

// vendor kyc
export const apiGetMyVendorKyc = (token) =>
  API.get('/vendor/kyc', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiUpdateMyKycBankDetails = (formData, token) =>
  API.put('/vendor/my-kyc-bank-details', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

export const apiGetVendorNotifications = (token) =>
  API.get('/vendor/notifications', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiSubmitVendorKyc = (data, token) =>
  API.post('/vendor/kyc', data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

// ── PRODUCT APIs ─────────────────────────────────────────

// Create Product
export const apiCreateProduct = (data, token) =>
  API.post('/vendor/create-product', data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

// Get My Products
export const apiGetMyProducts = (token) =>
  API.get('/vendor/my-products', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// ── SERVICE PRODUCTS (vendor) ──────────────────────────────────────────────
export const apiCreateServiceProduct = (data, token) =>
  API.post('/vendor/create-service-product', data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

export const apiGetMyServiceProducts = (token) =>
  API.get('/vendor/my-service-products', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiUpdateServiceProduct = (id, data, token) =>
  API.put(`/vendor/update-service-product/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

export const apiDeleteServiceProduct = (id, token) =>
  API.delete(`/vendor/delete-service-product/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiPatchVendorServiceListingVisibility = (
  id,
  { vendorListingEnabled },
  token,
) =>
  API.patch(
    `/vendor/service-product/${id}/listing-visibility`,
    { vendorListingEnabled },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

// ── SERVICE LISTING TEMPLATES (vendor browse admin templates) ────────────
export const apiGetVendorServiceListingTemplates = (token) =>
  API.get('/vendor/service-listing-templates', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiGetVendorServiceListingTemplateById = (id, token) =>
  API.get(`/vendor/service-listing-templates/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

/** Per-tenure market lows (₹/month or ₹/day) excluding current vendor — manual product modal. */
export const apiGetVendorMarketLowRentalTenures = (params, token) =>
  API.get('/vendor/market-low-rental-tenures', {
    params: params || {},
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Vendor Customers summary
export const apiGetVendorCustomers = (token) =>
  API.get('/vendor/customers', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiGetVendorCustomerDetails = (userId, token) =>
  API.get(`/vendor/customers/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiGetVendorTickets = (token) =>
  API.get('/vendor/tickets', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiGetVendorTicketById = (orderId, issueId, token) =>
  API.get(`/vendor/tickets/${orderId}/${issueId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// export const apiUpdateVendorTicketStatus = (orderId, issueId, status, token) =>
//   API.patch(
//     `/vendor/tickets/${orderId}/${issueId}/status`,
//     { status },
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     },
//   );
export const apiUpdateVendorTicketStatus = (
  orderId,
  issueId,
  status,
  token,
  resolutionNote = '',
) =>
  API.patch(
    `/vendor/tickets/${orderId}/${issueId}/status`,
    { status, resolutionNote },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

// ── ADMIN TICKETS (READ-ONLY) ────────────────────────────────────────────────
export const apiAdminGetTickets = (token) =>
  API.get('/admin/tickets', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiAdminGetTicketById = (orderId, issueId, token) =>
  API.get(`/admin/tickets/${orderId}/${issueId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
export const apiAdminGetContactTickets = (token) =>
  API.get('/contact/tickets', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiGetVendorOrders = (token) =>
  API.get('/vendor/orders', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiConfirmVendorRelocation = (orderId, data, token) =>
  API.patch(`/vendor/orders/${orderId}/relocation-confirm`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiGetVendorServiceBookings = (token) =>
  API.get('/vendor/service-bookings', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiUpdateVendorServiceBookingStatus = (id, status, token) =>
  API.put(
    `/vendor/service-bookings/${id}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

export const apiGetVendorOrder = (id, token) =>
  API.get(`/vendor/orders/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// export const apiGetVendorOrderPack = (id, token) =>
//   API.get(`/vendor/orders/${id}/pack`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

export const apiGetVendorOrderPack = (id, token, productId = '') =>
  API.get(`/vendor/orders/${id}/pack`, {
    params: productId ? { productId } : {},
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiVendorMarkOrderShipped = (id, body, token) =>
  API.put(`/vendor/orders/${id}/mark-shipped`, body, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// export const apiUpdateVendorOrderStatus = (id, status, token, productId = '') =>
//   API.put(
//     `/vendor/orders/${id}/status`,
//     { status, productId },
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     },
//   );

export const apiUpdateVendorOrderStatus = (
  id,
  status,
  token,
  productId = '',
  reason = '',
) =>
  API.put(
    `/vendor/orders/${id}/status`,
    { status, productId, reason },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

export const apiScheduleVendorReturnPickup = (id, body, token) =>
  API.put(`/vendor/orders/${id}/return-pickup`, body, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// export const apiCompleteVendorReturnInspection = (id, body, token) =>
//   API.put(`/vendor/orders/${id}/return-inspection`, body, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

export const apiCompleteVendorReturnInspection = (id, body, token) => {
  const isFormData =
    typeof FormData !== 'undefined' && body instanceof FormData;
  return API.put(`/vendor/orders/${id}/return-inspection`, body, {
    headers: {
      Authorization: `Bearer ${token}`,
      ...(isFormData ? { 'Content-Type': 'multipart/form-data' } : {}),
    },
  });
};

// Vendor Offers
export const apiGetVendorOffers = (token) =>
  API.get('/vendor/offers', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiUpsertVendorOffer = (data, token) =>
  API.post('/vendor/offers', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiDeleteVendorOffer = (id, token) =>
  API.delete(`/vendor/offers/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Update Product
export const apiUpdateProduct = (id, data, token) =>
  API.put(`/vendor/update-product/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

// Delete Product
export const apiDeleteProduct = (id, token) =>
  API.delete(`/vendor/delete-product/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

/** Active admin listing templates (vendor catalog — clone into vendor Product). */
export const apiGetVendorListingTemplates = (token, params = {}) =>
  API.get('/vendor/listing-templates', {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiGetVendorListingTemplate = (id, token) =>
  API.get(`/vendor/listing-templates/${id}`, {
    params: {},
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiGetVendorListingTemplateByType = (id, token, type = 'rental') =>
  API.get(`/vendor/listing-templates/${id}`, {
    params: { type },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// ── CATEGORY APIs ─────────────────────────

// Create Category
export const apiCreateCategory = (data, token) =>
  API.post('/admin/create-category', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Get Categories
export const apiGetCategories = () => API.get('/admin/get-categories');

// Master category tree + stats (admin)
export const apiGetMasterCategories = (token, platform = 'rent') =>
  API.get(`/admin/master-categories?platform=${encodeURIComponent(platform)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Delete Category
export const apiDeleteCategory = (id, token) =>
  API.delete(`/admin/delete-category/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Update Category (FormData; omit file fields to keep existing assets)
export const apiUpdateCategory = (id, data, token) =>
  API.put(`/admin/update-category/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// ── SUBCATEGORY APIs ─────────────────────────

// Create SubCategory
export const apiCreateSubCategory = (data, token) =>
  API.post('/admin/create-sub-category', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiVendorCreateSubCategory = (data, token) =>
  API.post('/vendor/create-sub-category', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Get SubCategories (public; optional token for backwards compatibility)
export const apiGetSubCategories = (categoryId, token) =>
  API.get(`/admin/get-sub-categories/${categoryId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

export const apiGetAllSubCategories = () =>
  API.get(`/admin/get-all-sub-categories`);

// Delete SubCategory
export const apiDeleteSubCategory = (id, token) =>
  API.delete(`/admin/delete-sub-category/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Update SubCategory (FormData)
export const apiUpdateSubCategory = (id, data, token) =>
  API.put(`/admin/update-sub-category/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// ── ADMIN LISTING TEMPLATES (Custom Listings) ─────────────────────────

export const apiGetListingTemplates = (token) =>
  API.get('/admin/listing-templates', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiCreateListingTemplate = (data, token) =>
  API.post('/admin/listing-templates', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiUpdateListingTemplate = (id, data, token) =>
  API.put(`/admin/listing-templates/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiDeleteListingTemplate = (id, token) =>
  API.delete(`/admin/listing-templates/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiPatchListingTemplateActive = (id, isActive, token) =>
  API.patch(
    `/admin/listing-templates/${id}/active`,
    { isActive },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

export const apiGetSellListingTemplates = (token) =>
  API.get('/admin/sell-listing-templates', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiCreateSellListingTemplate = (data, token) =>
  API.post('/admin/sell-listing-templates', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiUpdateSellListingTemplate = (id, data, token) =>
  API.put(`/admin/sell-listing-templates/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiDeleteSellListingTemplate = (id, token) =>
  API.delete(`/admin/sell-listing-templates/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiPatchSellListingTemplateActive = (id, isActive, token) =>
  API.patch(
    `/admin/sell-listing-templates/${id}/active`,
    { isActive },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

export const apiGetServiceListingTemplates = (token) =>
  API.get('/admin/service-listing-templates', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiCreateServiceListingTemplate = (data, token) =>
  API.post('/admin/service-listing-templates', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiUpdateServiceListingTemplate = (id, data, token) =>
  API.put(`/admin/service-listing-templates/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiDeleteServiceListingTemplate = (id, token) =>
  API.delete(`/admin/service-listing-templates/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiPatchServiceListingTemplateActive = (id, isActive, token) =>
  API.patch(
    `/admin/service-listing-templates/${id}/active`,
    { isActive },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

// ── ADMIN VENDOR APIs ─────────────────────────

// Get All Vendors
export const apiGetAllVendors = (token) =>
  API.get('/admin/get-vendors', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiGetAdminStores = (token) =>
  API.get('/admin/stores', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiGetLocationSettings = (token) =>
  API.get('/admin/location-settings', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiPatchLocationSettings = (data, token) =>
  API.patch('/admin/location-settings', data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

export const apiPatchAdminStoreStatus = (
  vendorId,
  storeIndex,
  isActive,
  token,
) =>
  API.patch(
    `/admin/stores/${vendorId}/${storeIndex}/status`,
    { isActive },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

// ── INVESTOR ENQUIRIES (ADMIN) ───────────────────────────────────────────────
export const apiAdminListInvestorEnquiries = (token, params = {}) =>
  API.get('/admin/investor-enquiries', {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiAdminGetInvestorEnquiry = (id, token) =>
  API.get(`/admin/investor-enquiries/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiAdminMarkInvestorEnquiryRead = (id, isRead, token) =>
  API.patch(
    `/admin/investor-enquiries/${id}/read`,
    { isRead },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

export const apiCreateVendorProfile = (data, token) =>
  API.post('/admin/create-vendor', data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

export const apiGetAdminVendorDetails = (id, token) =>
  API.get(`/admin/get-vendors/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

/** Full vendor KYC payload (same source as KYC review page) — useful fallback for document URLs. */
export const apiGetAdminVendorKycReview = (vendorId, token) =>
  API.get(`/admin/kyc/${vendorId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Get All Users
export const apiGetAllUsers = (token) =>
  API.get('/admin/get-users', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiGetAdminUserDetails = (id, token) =>
  API.get(`/admin/get-users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiGetAdminInvoices = (token, params = {}) =>
  API.get(`/admin/invoices`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });

// export const apiUpdateInvoiceLateFee = (token, invoiceId, payload) =>
//   API.patch(`/admin/invoices/${invoiceId}/late-fee`, payload, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

export const apiUpdateInvoiceLateFee = (token, invoiceId, payload) =>
  API.patch(`/admin/invoices/${invoiceId}/late-fee`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// For a still-PENDING (unpaid) month's live-computed late fee — separate
// endpoint/route from apiUpdateInvoiceLateFee above, which only works
// once a month has already been paid.
export const apiUpdatePendingLateFeeWaiver = (token, invoiceId, payload) =>
  API.patch(`/admin/invoices/${invoiceId}/pending-late-fee`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Get All Products (admin)
export const apiGetAllAdminProducts = (token, query = '') =>
  API.get(`/admin/admin/products${query ? `?${query}` : ''}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiGetAdminOffers = (token) =>
  API.get('/admin/admin-offers', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiUpsertAdminOffer = (data, token) =>
  API.post('/admin/admin-offers', data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

export const apiDeleteAdminOffer = (id, token) =>
  API.delete(`/admin/admin-offers/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
export const apiGetAdminOfferByProduct = (productId) =>
  API.get(`/admin/admin-offers/by-product/${productId}`);

export const apiGetProductApprovalQueue = (token, params = {}) =>
  API.get('/admin/product-approvals', {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiApproveProductAndGoLive = (productId, token) =>
  API.patch(
    `/admin/product-approvals/${productId}/approve`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

export const apiPatchAdminProductListingVisibility = (productId, body, token) =>
  API.patch(`/admin/products/${productId}/listing-visibility`, body, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

export const apiPatchVendorProductListingVisibility = (
  productId,
  body,
  token,
) =>
  API.patch(`/vendor/product/${productId}/listing-visibility`, body, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

// ── ADMIN ORDER APIs ─────────────────────────
export const apiGetAllOrders = (token) =>
  API.get('/orders', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiGetLiveCarts = (token) =>
  API.get('/live-cart/admin/live-carts', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiGetAllServiceBookings = (token) =>
  API.get('/bookings', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiUpdateServiceBookingStatus = (id, status, token) =>
  API.put(
    `/bookings/${id}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

export const apiUpdateOrderStatus = (id, status, token) =>
  API.put(
    `/orders/${id}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

// ── ADMIN WISHLIST ANALYTICS ─────────────────
export const apiGetWishlistAnalytics = (token) =>
  API.get('/admin/wishlist/analytics', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// ── VENDOR KYC APIs ─────────────────────────────────────────────
export const apiGetVendorKycQueue = (token) =>
  API.get('/admin/kyc/queue', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
export const apiGetWelcomeKitList = (token) =>
  API.get('/admin/kyc/welcome-kit', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiGetVendorKycReview = (vendorId, token) =>
  API.get(`/admin/kyc/${vendorId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiReviewVendorKyc = (vendorId, payload, token) =>
  API.put(`/admin/kyc/${vendorId}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

export const apiRequestVendorKycDocumentReupload = (vendorId, body, token) =>
  API.post(`/admin/kyc/${vendorId}/request-reupload`, body, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

// ── CUSTOMER KYC APIs ───────────────────────────────────────────
export const apiGetCustomerKycQueue = (token) =>
  API.get('/admin/kyc/customer/queue', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiGetCustomerKycReview = (userId, token) =>
  API.get(`/admin/kyc/customer/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiReviewCustomerKyc = (userId, payload, token) =>
  API.put(`/admin/kyc/customer/${userId}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

// ── ADMIN COUPON APIs ─────────────────────────────────────────────

export const apiCreateCoupon = (data, token) =>
  API.post('/admin/coupons', data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

export const apiGetAllCoupons = (token, params = {}) =>
  API.get('/admin/coupons', {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiGetCouponById = (id, token) =>
  API.get(`/admin/coupons/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiUpdateCoupon = (id, data, token) =>
  API.put(`/admin/coupons/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

export const apiToggleCouponStatus = (id, token) =>
  API.patch(
    `/admin/coupons/${id}/toggle`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

export const apiDeleteCoupon = (id, token) =>
  API.delete(`/admin/coupons/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiSendVendorDeliveryOtp = (orderId, productId, token) =>
  API.post(
    `/vendor/orders/${orderId}/send-delivery-otp`,
    { productId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

export const apiSendServiceCompletionOtp = (bookingId, token) =>
  API.post(
    `/vendor/service-bookings/${bookingId}/send-completion-otp`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

export const apiVerifyServiceCompletionOtp = (bookingId, otp, token) =>
  API.post(
    `/vendor/service-bookings/${bookingId}/verify-completion-otp`,
    { otp },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

export const apiGetVendorServiceBooking = (bookingId, token) =>
  API.get(`/vendor/service-bookings/${bookingId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const apiCancelVendorServiceBooking = (bookingId, reason, token) =>
  API.post(
    `/vendor/service-bookings/${bookingId}/cancel`,
    { reason },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

export const apiVerifyVendorDeliveryOtp = (orderId, productId, otp, token) =>
  API.post(
    `/vendor/orders/${orderId}/verify-delivery-otp`,
    { productId, otp },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

// export const apiUpdateVendorLineStatus = (
//   orderId,
//   productId,
//   lineStatus,
//   token,
// ) =>
//   axios.put(
//     `${API_BASE_URL}/orders/${orderId}/line-status`,
//     { productId, lineStatus },
//     { headers: { Authorization: `Bearer ${token}` } },
//   );

export const apiUpdateVendorLineStatus = (
  orderId,
  productId,
  lineStatus,
  token,
) =>
  API.put(
    `/vendor/orders/${orderId}/line-status`,
    { productId, lineStatus },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

export const apiGetAdminSettlements = (token) =>
  API.get('/admin/settlements', {
    headers: { Authorization: `Bearer ${token}` },
  });

// PATCH mark a settlement as paid
export const apiMarkSettlementPaid = (settlementId, token) =>
  API.patch(
    `/admin/settlements/${settlementId}/mark-paid`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

// GET single vendor settlements (VendorDetails financials tab)
export const apiGetAdminVendorSettlements = (vendorId, token) =>
  API.get(`/admin/settlements/${vendorId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const apiGetReferralDashboard = (token) =>
  API.get('/users/referral-dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  });

/** POST save or update bank details for withdrawal */
export const apiSaveBankDetails = (data, token) =>
  API.post('/users/bank-details', data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

/** POST request a withdrawal of available referral earnings */
export const apiRequestWithdrawal = (amount, token) =>
  API.post(
    '/users/withdraw',
    { amount },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

/** GET full referral genealogy tree for admin panel */
export const apiAdminGetReferralActivity = (token) =>
  API.get('/admin/referral-activity', {
    headers: { Authorization: `Bearer ${token}` },
  });

/** PATCH admin marks a user's pending withdrawal as paid or failed */
export const apiAdminProcessWithdrawal = (
  userId,
  withdrawalId,
  status,
  utr,
  token,
) =>
  API.patch(
    `/admin/withdrawals/${userId}/${withdrawalId}`,
    { status, utr },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

export const apiGetVendorSettlements = (token) =>
  API.get(`/vendor/my-settlements`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const apiGetVendorBankDetails = (token) =>
  API.get(`/vendor/bank-details`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// export const apiUpdateVendorBankDetails = (token, data) =>
//   API.put(`/vendor/bank-details`, data, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
export const apiUpdateVendorBankDetails = (token, data) => {
  const formData = new FormData();
  formData.append('accountHolderName', data.accountHolderName);
  formData.append('accountNumber', data.accountNumber);
  formData.append('ifscCode', data.ifscCode);
  formData.append('bankName', data.bankName || '');
  if (data.chequeImage) {
    formData.append('chequeImage', data.chequeImage);
  }
  return API.put(`/vendor/bank-details`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const apiGetAdminBankVerifications = (token) =>
  API.get(`/admin/vendors/bank-verifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const apiVerifyVendorBank = (token, vendorId) =>
  API.patch(
    `/admin/vendors/${vendorId}/bank-verify`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );

export const apiRejectVendorBank = (token, vendorId, reason) =>
  API.patch(
    `/admin/vendors/${vendorId}/bank-reject`,
    { reason },
    { headers: { Authorization: `Bearer ${token}` } },
  );

// ── BANNER APIs (Admin) ─────────────────────────────────────────────
export const apiGetAllBanners = (token) =>
  API.get('/admin/banners', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const apiCreateBanner = (data, token) =>
  API.post('/admin/banners', data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

export const apiUpdateBanner = (id, data, token) =>
  API.put(`/admin/banners/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

export const apiDeleteBanner = (id, token) =>
  API.delete(`/admin/banners/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const apiToggleBannerStatus = (id, token) =>
  API.patch(
    `/admin/banners/${id}/toggle`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

// ── RENT BANNER APIs (Admin) ─────────────────────────────────────────────
export const apiGetAllRentBanners = (token) =>
  API.get('/admin/rent-banners', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const apiCreateRentBanner = (data, token) =>
  API.post('/admin/rent-banners', data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

export const apiUpdateRentBanner = (id, data, token) =>
  API.put(`/admin/rent-banners/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

export const apiDeleteRentBanner = (id, token) =>
  API.delete(`/admin/rent-banners/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const apiToggleRentBannerStatus = (id, token) =>
  API.patch(
    `/admin/rent-banners/${id}/toggle`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

// ── BUY BANNER APIs (Admin) ─────────────────────────────────────────────
export const apiGetAllBuyBanners = (token) =>
  API.get('/admin/buy-banners', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const apiCreateBuyBanner = (data, token) =>
  API.post('/admin/buy-banners', data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

export const apiUpdateBuyBanner = (id, data, token) =>
  API.put(`/admin/buy-banners/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

export const apiDeleteBuyBanner = (id, token) =>
  API.delete(`/admin/buy-banners/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const apiToggleBuyBannerStatus = (id, token) =>
  API.patch(
    `/admin/buy-banners/${id}/toggle`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

// ── ADVERTISEMENT APIs (Admin) ──────────────────────────────────────
export const apiGetAllAdvertisements = (token) =>
  API.get('/admin/advertisements', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const apiCreateAdvertisement = (data, token) =>
  API.post('/admin/advertisements', data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

export const apiUpdateAdvertisement = (id, data, token) =>
  API.put(`/admin/advertisements/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

export const apiDeleteAdvertisement = (id, token) =>
  API.delete(`/admin/advertisements/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const apiToggleAdvertisementStatus = (id, token) =>
  API.patch(
    `/admin/advertisements/${id}/toggle`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

// export const apiGetLifelineDistribution = (token) =>
//   API.get('/admin/lifeline', {
//     headers: { Authorization: `Bearer ${token}` },
//   });
export const apiGetLifelineDistribution = (token, days) =>
  API.get('/admin/lifeline', {
    params: { days },
    headers: { Authorization: `Bearer ${token}` },
  });

// export const apiGetCityStats = (city, period, token) =>
//   API.get('/admin/cities/city-stats', {
//     params: { city, period },
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

export const apiGetGlobalTax = (token) =>
  API.get('/admin/global-tax', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const apiUpdateGlobalTax = (data, token) =>
  API.put('/admin/global-tax', data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

export const apiUpdateCategoryTax = (id, type, payload, token) =>
  API.patch(`/admin/category-tax/${id}?type=${type}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

export const apiToggleCategoryStatus = (id, type, taxBlocked, token) =>
  API.patch(
    `/admin/category-status/${id}`,
    { type, taxBlocked },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

export const apiGetCityDashboard = (token, city, period) =>
  API.get('/admin/city-dashboard', {
    params: {
      city,
      period,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
export const apiGetCities = (token) =>
  API.get('/admin/cities', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiCreateAdsPlan = (token, data) =>
  API.post('/vendor/ads-plans', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiGetMyAdsPlans = (token) =>
  API.get('/vendor/ads-plans', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiGetAllAdsPlans = (token) =>
  API.get('/admin/ads-plans', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiGetMyKycSettings = (token) =>
  API.get('/vendor/kyc/settings', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const apiGetMyBankAccounts = (token) =>
  API.get('/vendor/my-bank-accounts', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const apiAddBankAccount = (formData, token) =>
  API.post('/vendor/my-bank-accounts', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

export const apiUpdateBankAccount = (id, formData, token) =>
  API.put(`/vendor/my-bank-accounts/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

export const apiDeleteBankAccount = (id, token) =>
  API.delete(`/vendor/my-bank-accounts/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const apiGetMyVendorProfile = (token) =>
  API.get('/vendor/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });

// ── RENTAS BANNER APIs (Admin) ──────────────────────────────────────
export const apiGetAllRentAsBanners = (token) =>
  API.get('/admin/rentas-banners', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const apiCreateRentAsBanner = (data, token) =>
  API.post('/admin/rentas-banners', data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

export const apiUpdateRentAsBanner = (id, data, token) =>
  API.put(`/admin/rentas-banners/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

export const apiDeleteRentAsBanner = (id, token) =>
  API.delete(`/admin/rentas-banners/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const apiToggleRentAsBannerStatus = (id, token) =>
  API.patch(
    `/admin/rentas-banners/${id}/toggle`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

export const apiRunSettlementPayoutNow = (token) =>
  API.post(
    '/admin/settlements/run-payout-now',
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
export const apiRunRefundPayoutNow = (token) =>
  API.post(
    '/admin/refunds/run-payout-now',
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

export const apiRunCancelRefundPayoutNow = (token) =>
  API.post(
    '/admin/cancellations/run-payout-now',
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

export const apiGetAllRentOffers = (token) =>
  API.get('/admin/rent-offers', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const apiCreateRentOffer = (data, token) =>
  API.post('/admin/rent-offers', data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

export const apiUpdateRentOffer = (id, data, token) =>
  API.put(`/admin/rent-offers/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

export const apiDeleteRentOffer = (id, token) =>
  API.delete(`/admin/rent-offers/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const apiToggleRentOfferStatus = (id, token) =>
  API.patch(
    `/admin/rent-offers/${id}/toggle`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

// ── BUY ADVERTISEMENT APIs (Admin) ──────────────────────────────────────
export const apiGetAllBuyAdvertisements = (token) =>
  API.get('/admin/buy-advertisements', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const apiCreateBuyAdvertisement = (data, token) =>
  API.post('/admin/buy-advertisements', data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

export const apiUpdateBuyAdvertisement = (id, data, token) =>
  API.put(`/admin/buy-advertisements/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

export const apiDeleteBuyAdvertisement = (id, token) =>
  API.delete(`/admin/buy-advertisements/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const apiToggleBuyAdvertisementStatus = (id, token) =>
  API.patch(
    `/admin/buy-advertisements/${id}/toggle`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

// ── SERVICE ADVERTISEMENT APIs (Admin) ──────────────────────────────────────
export const apiGetAllServiceAdvertisements = (token) =>
  API.get('/admin/service-advertisements', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const apiCreateServiceAdvertisement = (data, token) =>
  API.post('/admin/service-advertisements', data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

export const apiUpdateServiceAdvertisement = (id, data, token) =>
  API.put(`/admin/service-advertisements/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

export const apiDeleteServiceAdvertisement = (id, token) =>
  API.delete(`/admin/service-advertisements/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const apiToggleServiceAdvertisementStatus = (id, token) =>
  API.patch(
    `/admin/service-advertisements/${id}/toggle`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

export const apiGetAllSettlements = (token) =>
  API.get(`/admin/all-settlements`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const apiAdminGetRefundApprovals = (token) =>
  API.get(`/admin/refund-approvals`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
export const apiGetVendorRefundApprovals = (token) =>
  API.get(`/vendor/refund-approvals`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiGetVendorCancellations = (token) =>
  API.get(`/vendor/cancellations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiVendorCancelOrder = (orderId, productId, token) =>
  API.put(
    `/vendor/orders/${orderId}/cancel`,
    { productId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

export const apiAdminDecideRefundApproval = (orderId, lineId, payload, token) =>
  API.post(`/admin/refund-approvals/${orderId}/${lineId}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// export const apiAdminMarkRefundPaid = (orderId, lineId, token) =>
//   API.post(
//     `/admin/refund-approvals/${orderId}/${lineId}/mark-paid`,
//     {},
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     },
//   );

export const apiAdminMarkRefundPaid = (orderId, lineId, transactionId, token) =>
  API.post(
    `/admin/refund-approvals/${orderId}/${lineId}/mark-paid`,
    { transactionId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

export const apiAdminGetPendingSubAdmins = (token) =>
  API.get(`/admin/subadmin-pending`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiAdminGetAllSubAdmins = (token) =>
  API.get(`/admin/subadmin-all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiAdminDecideSubAdminApproval = (subAdminId, status, token) =>
  API.patch(
    `/admin/subadmin-approval/${subAdminId}`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

export const apiAdminCreateSubAdmin = (data, token) =>
  API.post(`/admin/subadmin-create`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiAdminUpdateSubAdmin = (id, data, token) =>
  API.put(`/admin/subadmin-update/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiAdminGetCancelRefunds = (token) =>
  API.get(`/admin/cancel-refunds`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiAdminMarkCancelRefundPaid = (
  orderId,
  lineId,
  transactionId,
  token,
) =>
  API.put(
    `/admin/cancel-refunds/${orderId}/${lineId}/paid`,
    { transactionId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

export const apiAdminGetContactEnquiries = (token) =>
  API.get(`/admin/all-contacts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const apiCreateRazorpayOrder = (amount) =>
  API.post('/vendor/razorpay/vendor-create-order', { amount });

export const apiVerifyRazorpayPayment = (data) =>
  API.post('/vendor/razorpay/vendor-verify', data);
export default API;
