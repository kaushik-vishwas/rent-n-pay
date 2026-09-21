import { api } from './axios';

// ── CONSTANTS ─────────────────────────────────
// export const USER_AUTH = {
//   signup: '/users/user-signup',
//   verifyOtp: '/users/user-verify-otp',
//   login: '/users/user-login',
//   logout: '/users/user-logout',
//   forgotPasswordSendOtp: '/users/forgot-password',
//   verifyForgotOtp: '/users/verify-forgot-otp',
//   resetPassword: '/users/reset-password',
//   referralDashboard: '/users/referral-dashboard',
//   updateBankDetails: '/users/bank-details',
//   withdraw: '/users/withdraw',
// };
export const USER_AUTH = {
  signup: '/users/user-signup',
  verifyOtp: '/users/user-verify-otp',
  login: '/users/user-login',
  logout: '/users/user-logout',
  forgotPasswordSendOtp: '/users/forgot-password',
  verifyForgotOtp: '/users/verify-forgot-otp',
  resetPassword: '/users/reset-password',
  referralDashboard: '/users/referral-dashboard',
  updateBankDetails: '/users/bank-details',
  withdraw: '/users/withdraw',
  mobileSendOtp: '/users/mobile-send-otp',
  mobileVerifyOtp: '/users/mobile-verify-otp',
  mobileSignup: '/users/mobile-signup',
};

// ── NORMALIZER ────────────────────────────────
// export const normalizeUserFromApi = (apiUser) => ({
//   id: apiUser.id || apiUser._id,
//   fullName: apiUser.fullName,
//   email: apiUser.emailAddress,
//   createdAt:
//     apiUser.createdAt || apiUser.created_at || apiUser.joinedAt || null,
// });

export const normalizeUserFromApi = (apiUser) => ({
  id: apiUser.id || apiUser._id,
  fullName: apiUser.fullName,
  email: apiUser.emailAddress,
  mobileNumber:
    apiUser.mobileNumber || apiUser.mobile || apiUser.phoneNumber || null,
  createdAt:
    apiUser.createdAt || apiUser.created_at || apiUser.joinedAt || null,
});

// ── AUTH ──────────────────────────────────────
export const apiSignup = (data) => api.post(USER_AUTH.signup, data);
export const apiVerifyOtp = (data) => api.post(USER_AUTH.verifyOtp, data);
export const apiLogin = (data) => api.post(USER_AUTH.login, data);
export const apiLogout = () => api.post(USER_AUTH.logout);

// ── CATEGORIES ────────────────────────────────
export const apiGetCategories = () => api.get('/admin/get-categories');
export const apiGetSubCategories = (categoryId) =>
  api.get(`/admin/get-sub-categories/${categoryId}`);

// ── INVESTOR ENQUIRIES ─────────────────────────
export const apiCreateInvestorEnquiry = (payload) =>
  api.post('/users/investor-enquiries', payload);

// ── PRODUCTS ──────────────────────────────────
/** Admin product list (all vendor inventory rows; optional filters). */
export const apiGetAllProducts = (queryString = '') =>
  api.get(`/admin/products${queryString ? `?${queryString}` : ''}`);

/**
 * Storefront: same `Product` documents vendors create in the vendor dashboard
 * (`/vendor/my-products`). Passes `storefront=1` so drafts / pending approval are hidden.
 */

export const apiGetPublicLocationSettings = () => {
  let locationPart = '';
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('rn_delivery_location');
      const parsed = raw ? JSON.parse(raw) : null;
      const lat = Number(parsed?.lat);
      const lon = Number(parsed?.lon);
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        locationPart = `?userLat=${encodeURIComponent(lat)}&userLng=${encodeURIComponent(lon)}`;
      }
    } catch {
      /* ignore local parse errors */
    }
  }
  return api.get(`/admin/location-settings/public${locationPart}`);
};
export const apiGetStorefrontVendorProducts = (queryString = '') => {
  let locationPart = '';
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('rn_delivery_location');
      const parsed = raw ? JSON.parse(raw) : null;
      const lat = Number(parsed?.lat);
      const lon = Number(parsed?.lon);
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        locationPart = `&userLat=${encodeURIComponent(lat)}&userLng=${encodeURIComponent(lon)}`;
      }
    } catch {
      /* ignore local parse errors */
    }
  }
  return api.get(
    `/admin/products?storefront=1${queryString ? `&${queryString}` : ''}${locationPart}`,
  );
};

/** Buy page hero: total sell listings + Brand New / Refurbished counts (full catalog, not paginated). */
export const apiGetStorefrontSellStats = () =>
  api.get('/admin/products?storefront=1&sellStats=1');

export const apiGetProductById = (id) => api.get(`/vendor/product/${id}`);
export const apiGetPublicActiveOffers = () =>
  api.get('/vendor/offers/public-active');

// ── USER ADDRESSES ────────────────────────────
export const apiGetMyAddresses = () => api.get('/users/addresses');
export const apiGetCheckoutPickupStores = (productIds = [], opts = {}) => {
  let userLat = opts?.userLat;
  let userLng = opts?.userLng;
  if (!Number.isFinite(Number(userLat)) || !Number.isFinite(Number(userLng))) {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('rn_delivery_location');
        const parsed = raw ? JSON.parse(raw) : null;
        userLat = Number(parsed?.lat);
        userLng = Number(parsed?.lon);
      } catch {
        userLat = undefined;
        userLng = undefined;
      }
    }
  }
  const params = {
    productIds: Array.isArray(productIds) ? productIds.join(',') : '',
  };
  if (Number.isFinite(Number(userLat)) && Number.isFinite(Number(userLng))) {
    params.userLat = Number(userLat);
    params.userLng = Number(userLng);
  }
  return api.get('/users/checkout-pickup-stores', { params });
};
export const apiCreateAddress = (data) => api.post('/users/addresses', data);
export const apiUpdateAddress = (id, data) =>
  api.put(`/users/addresses/${id}`, data);
export const apiDeleteAddress = (id) => api.delete(`/users/addresses/${id}`);
export const apiGetMyUserKyc = () => api.get('/users/kyc');
export const apiSubmitMyUserKyc = (formData) =>
  api.post('/users/kyc', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// ── USER ORDERS ───────────────────────────────
export const apiCreateOrder = (data) => api.post('/orders', data);
export const apiGetMyOrders = () => api.get('/orders/my');
export const apiCreateRazorpayOrder = (amount) =>
  api.post('/orders/razorpay/create-order', { amount });
export const apiVerifyRazorpayPayment = (data) =>
  api.post('/orders/razorpay/verify', data);

export const apiCreateReview = (productId, formData) =>
  api.post(`/reviews/${productId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const apiGetMyReview = (productId, orderId) =>
  api.get(`/reviews/my/${productId}/${orderId}`);

export const apiGetRentProductReviews = (productId) =>
  api.get(`/reviews/rent-product/${productId}`);

// export const apiGetMyOrderById = (id) => api.get(`/orders/my/ ${id}`);
// export const apiCancelMyOrder = (id) => api.put(`/orders/my/${id}/cancel`);

export const apiGetMyOrderById = (id) => api.get(`/orders/my/${id}`);
// export const apiCancelMyOrder = (id) => api.put(`/orders/my/${id}/cancel`);
// export const apiCancelMyOrder = (id, productId) =>
//   api.put(`/orders/my/${id}/cancel`, productId ? { productId } : {});
export const apiCancelMyOrder = (id, productId, refundDetails) =>
  api.put(`/orders/my/${id}/cancel`, {
    ...(productId ? { productId } : {}),
    ...(refundDetails ? { refundDetails } : {}),
  });

export const apiExtendMyOrderTenure = (id, data) =>
  api.put(`/orders/my/${id}/extend`, data);

// export const apiPayNextMonth = (orderId) =>
//   api.post(`/orders/${orderId}/pay-next-month`);
// export const apiGetNextMonthDue = (orderId) =>
//   api.get(`/orders/${orderId}/next-month-due`);
export const apiPayNextMonth = (orderId, productId) =>
  api.post(`/orders/${orderId}/pay-next-month`, { productId });

export const apiGetNextMonthDue = (orderId, productId) =>
  api.get(`/orders/${orderId}/next-month-due`, { params: { productId } });
export const apiSubmitMyReturnRequest = (id, data) => {
  const isFormData =
    typeof FormData !== 'undefined' && data instanceof FormData;
  return api.put(
    `/orders/my/${id}/return-request`,
    data,
    isFormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : undefined,
  );
};
export const apiSubmitMyRelocationRequest = (id, data) =>
  api.put(`/orders/my/${id}/relocation-request`, data);
export const apiSubmitMyIssueReport = (id, data) => {
  const isFormData =
    typeof FormData !== 'undefined' && data instanceof FormData;
  return api.put(
    `/orders/my/${id}/report-issue`,
    data,
    isFormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : undefined,
  );
};

// ── USER NOTIFICATIONS ───────────────────────
export const apiGetUserNotifications = () => api.get('/users/notifications');
export const apiRequestStockNotify = (productId) =>
  api.post('/users/notifications/stock-notify', { productId });

// ── HELP CENTER (support tickets from my orders) ───────────────────────────
export const apiGetMySupportTickets = () => api.get('/users/support-tickets');
export const apiGetMyInvoices = () => api.get('/users/my-invoices');

// ── WISHLIST ────────────────────────────────
export const apiGetMyWishlist = () => api.get('/users/wishlist');
export const apiToggleWishlist = (productId) =>
  api.post('/users/wishlist/toggle', { productId });

// Validate & apply a coupon code
export const apiValidateCoupon = (payload) =>
  api.post('/users/coupons/validate', payload);

export const apiGetActiveCoupons = () => api.get('/users/coupons/active');
export const apiGetActiveBanners = () => api.get('/admin/banners/active');
export const apiGetActiveRentaBanners = () =>
  api.get('/admin/rentas-banners/active');
export const apiGetActiveBuyBanners = () =>
  api.get('/admin/buy-banners/active');
export const apiGetActiveRentBanners = () =>
  api.get('/admin/rent-banners/active');
export const apiGetActiveAdvertisements = () =>
  api.get('/admin/advertisements/active');
export const apiGetActiveBuyAdvertisements = () =>
  api.get('/admin/buy-advertisements/active');
export const apiGetActiveServiceAdvertisements = () =>
  api.get('/admin/service-advertisements/active');

export const apiGetActiveRentOffers = () =>
  api.get('/admin/rent-offers/active');

// export const apiGetServiceProducts = (queryString = '') =>
//   api.get(`/service-products${queryString ? `?${queryString}` : ''}`);
export const apiGetServiceProducts = (queryString = '') => {
  let locationPart = '';
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('rn_delivery_location');
      const parsed = raw ? JSON.parse(raw) : null;
      const lat = Number(parsed?.lat);
      const lon = Number(parsed?.lon);
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        locationPart = `&userLat=${encodeURIComponent(lat)}&userLng=${encodeURIComponent(lon)}`;
      }
    } catch {
      /* ignore local parse errors */
    }
  }
  return api.get(
    `/service-products${queryString ? `?${queryString}` : '?'}${locationPart}`,
  );
};

export const apiGetServiceProductById = (id) =>
  api.get(`/service-products/${id}`);

export const apiGetServiceAvailability = (id, date) =>
  api.get(`/service-products/${id}/availability`, {
    params: { date },
  });

export const apiCreateBooking = (data) => api.post('/bookings', data);

export const apiGetMyBookings = () => api.get('/bookings/my');

export const apiGetMyBookingById = (id) => api.get(`/bookings/my/${id}`);

export const apiCancelMyBooking = (id) => api.put(`/bookings/my/${id}/cancel`);
export const apiRescheduleServiceBooking = (id, data) =>
  api.patch(`/bookings/${id}/reschedule`, data);
export const apiGetServiceById = (id) => api.get(`/service-products/${id}`);

export const apiCreateServiceReview = (serviceProductId, formData) =>
  api.post(`/service-products/${serviceProductId}/reviews`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const apiGetMyServiceReview = (serviceProductId) =>
  api.get(`/service-products/${serviceProductId}/my-review`);

export const apiGetRelatedServices = (id) =>
  api.get(`/service-products/${id}/related`);
// export const apiGetRelatedServices = (id, queryString = '') =>
//   api.get(
//     `/service-products/${id}/related${queryString ? `?${queryString}` : ''}`,
//   );

/** GET user's referral dashboard data */
export const fetchReferralDashboard = () =>
  api.get(USER_AUTH.referralDashboard);

/** POST save/update bank details */
export const saveBankDetails = (data) =>
  api.post(USER_AUTH.updateBankDetails, data);

/** POST request withdrawal */
export const requestWithdraw = (amount) =>
  api.post(USER_AUTH.withdraw, {
    amount,
  });
export const apiSendOrderConfirmationEmail = (orderId) =>
  api.post(`/users/orders/${orderId}/send-confirmation-email`);
export const apiSendBookingConfirmationEmail = (bookingId) =>
  api.post(`/users/bookings/${bookingId}/send-confirmation-email`);

export const apiDeleteAccount = (emailAddress) =>
  api.delete('/users/delete-account', { data: { emailAddress } });
export const apiGetGlobalTax = () => api.get('/admin/global-tax/public');

export const apiSubmitContact = (payload) =>
  api.post('/users/submit-contact', payload);

// export const apiPayServiceBooking = (id, payload) =>
//   api.put(`/bookings/service-bookings/my/${id}/pay`, payload);
export const apiPayServiceBooking = (id, payload) =>
  api.put(`/bookings/my/${id}/pay`, payload);

export const apiGetActiveBoosts = () => api.get('/vendor/public/active-boosts');
