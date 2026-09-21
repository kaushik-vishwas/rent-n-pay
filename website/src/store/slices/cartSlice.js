// import { createSlice } from '@reduxjs/toolkit';

// function getCartStorageKey() {
//   if (typeof window === 'undefined') return 'rentpay_cart_guest';
//   try {
//     // Your current auth persistence uses `userToken` + `userData`.
//     // Cart should follow the logged-in user stored in `userData`.
//     const userStr = localStorage.getItem('userData');
//     if (!userStr) return 'rentpay_cart_guest';
//     const user = JSON.parse(userStr);
//     const userId = user?.id || user?._id;
//     return userId ? `rentpay_cart_${userId}` : 'rentpay_cart_guest';
//   } catch {
//     return 'rentpay_cart_guest';
//   }
// }

// const loadCart = () => {
//   if (typeof window === 'undefined') return [];
//   try {
//     const key = getCartStorageKey();

//     // Backward compatibility:
//     // Old cart stored rental months in `quantity`.
//     // New cart stores:
//     // - `quantity` = number of units (stock units)
//     // - `rentalMonths` = tenure selected on product page
//     const normalizeItem = (it) => {
//       if (!it) return it;
//       let next = it;
//       if (it.rentalMonths == null && it.quantity != null) {
//         const rentalMonths = it.quantity;
//         next = { ...it, rentalMonths: rentalMonths || 1, quantity: 1 };
//       }
//       const tu = next.tenureUnit;
//       if (tu !== 'day' && tu !== 'month') {
//         next = { ...next, tenureUnit: 'month' };
//       }
//       return next;
//     };

//     const normalizeList = (list) =>
//       Array.isArray(list) ? list.map(normalizeItem) : [];

//     // If we were using the guest cart and the user just logged in,
//     // merge guest items into the user cart so checkout doesn't lose items.
//     if (key !== 'rentpay_cart_guest') {
//       const guestStr = localStorage.getItem('rentpay_cart_guest');
//       if (guestStr) {
//         const guestItems = JSON.parse(guestStr) || [];
//         const userStr = localStorage.getItem(key);
//         const userItems = userStr ? JSON.parse(userStr) : [];

//         if (Array.isArray(guestItems) && guestItems.length > 0) {
//           const merged = [...userItems];
//           guestItems.forEach((gi) => {
//             const existing = merged.find((mi) => mi.productId === gi.productId);
//             if (existing)
//               existing.quantity = (existing.quantity || 0) + (gi.quantity || 1);
//             else merged.push(gi);
//           });

//           localStorage.setItem(key, JSON.stringify(merged));
//           localStorage.removeItem('rentpay_cart_guest');
//           return normalizeList(merged);
//         }
//       }
//     }

//     const s = localStorage.getItem(key);
//     return s ? normalizeList(JSON.parse(s)) : [];
//   } catch {
//     return [];
//   }
// };

// const saveCart = (cart) => {
//   if (typeof window !== 'undefined') {
//     const key = getCartStorageKey();
//     localStorage.setItem(key, JSON.stringify(cart));
//   }
// };

// const initialState = { items: loadCart(), appliedCoupon: null };

// const cartSlice = createSlice({
//   name: 'cart',
//   initialState,
//   reducers: {
//     addToCart: (state, { payload }) => {
//       // const {
//       //   productId,
//       //   variantId = null,
//       //   variantName = '',
//       //   quantity = 1,
//       //   rentalMonths = 1,
//       //   pricePerDay,
//       //   title,
//       //   image,
//       //   tenureUnit = 'month',
//       //   productType = 'Rental',
//       //   refundableDeposit = 0,
//       //   condition = '',
//       //   offer = null,
//       // } = payload;

//       // const {
//       //   productId,
//       //   variantId = null,
//       //   variantName = '',
//       //   quantity = 1,
//       //   rentalMonths = 1,
//       //   pricePerDay,
//       //   title,
//       //   image,
//       //   tenureUnit = 'month',
//       //   productType = 'Rental',
//       //   refundableDeposit = 0,
//       //   condition = '',
//       //   offer = null,
//       //   defaultGst = null,
//       //   defaultCareTax = null,
//       //   defaultRepairWarranty = null,
//       //   defaultRelocationWarranty = null,
//       //   defaultDeliveryPackaging = null,
//       //   defaultInstallationFee = null,
//       //   defaultPlatformFee = null,
//       //   taxBlocked = false,
//       //   startDate = null,
//       //   endDate = null,
//       //   dailyRate = null,
//       // } = payload;
//       const {
//         productId,
//         variantId = null,
//         variantName = '',
//         quantity = 1,
//         rentalMonths = 1,
//         pricePerDay,
//         title,
//         image,
//         tenureUnit = 'month',
//         productType = 'Rental',
//         refundableDeposit = 0,
//         condition = '',
//         offer = null,
//         defaultGst = null,
//         defaultCareTax = null,
//         defaultRepairWarranty = null,
//         defaultRelocationWarranty = null,
//         defaultDeliveryPackaging = null,
//         defaultInstallationFee = null,
//         defaultPlatformFee = null,
//         taxBlocked = false,
//         startDate = null,
//         endDate = null,
//         dailyRate = null,
//       } = payload;

//       console.log('CART PAYLOAD:', payload);
//       console.log('variantId received:', variantId);
//       const tu = tenureUnit === 'day' ? 'day' : 'month';
//       // const existing = state.items.find((i) => i.productId === productId);
//       const existing = state.items.find(
//         (i) =>
//           i.productId === productId &&
//           String(i.variantId || '') === String(variantId || ''),
//       );
//       if (existing) existing.quantity += quantity;
//       // else
//       //   state.items.push({
//       //     productId,
//       //     variantId: variantId || null,
//       //     variantName: variantName || '',
//       //     quantity,
//       //     rentalMonths,
//       //     pricePerDay,
//       //     title,
//       //     image,
//       //     tenureUnit: tu,
//       //     productType: String(productType || 'Rental'),
//       //     refundableDeposit: Number(refundableDeposit || 0),
//       //     rentalConfigurations: Array.isArray(payload.rentalConfigurations)
//       //       ? payload.rentalConfigurations
//       //       : [],
//       //   });
//       // else
//       //   state.items.push({
//       //     productId,
//       //     variantId: variantId || null,
//       //     variantName: variantName || '',
//       //     quantity,
//       //     rentalMonths,
//       //     pricePerDay,
//       //     title,
//       //     image,
//       //     tenureUnit: tu,
//       //     productType: String(productType || 'Rental'),
//       //     refundableDeposit: Number(refundableDeposit || 0),
//       //     condition: condition || '',
//       //     offer: offer || null,
//       //     rentalConfigurations: Array.isArray(payload.rentalConfigurations)
//       //       ? payload.rentalConfigurations
//       //       : [],
//       //   });
//       // else
//       //   state.items.push({
//       //     productId,
//       //     variantId: variantId || null,
//       //     variantName: variantName || '',
//       //     quantity,
//       //     rentalMonths,
//       //     pricePerDay,
//       //     title,
//       //     image,
//       //     tenureUnit: tu,
//       //     productType: String(productType || 'Rental'),
//       //     refundableDeposit: Number(refundableDeposit || 0),
//       //     condition: condition || '',
//       //     offer: offer || null,
//       //     defaultGst,
//       //     defaultCareTax,
//       //     defaultRepairWarranty,
//       //     defaultRelocationWarranty,
//       //     defaultDeliveryPackaging,
//       //     defaultInstallationFee,
//       //     defaultPlatformFee,
//       //     taxBlocked,
//       //     startDate,
//       //     endDate,
//       //     dailyRate,
//       //     rentalConfigurations: Array.isArray(payload.rentalConfigurations)
//       //       ? payload.rentalConfigurations
//       //       : [],
//       //   });
//       else
//         state.items.push({
//           productId,
//           variantId: variantId || null,
//           variantName: variantName || '',
//           quantity,
//           rentalMonths,
//           pricePerDay,
//           title,
//           image,
//           tenureUnit: tu,
//           productType: String(productType || 'Rental'),
//           refundableDeposit: Number(refundableDeposit || 0),
//           condition: condition || '',
//           offer: offer || null,
//           defaultGst,
//           defaultCareTax,
//           defaultRepairWarranty,
//           defaultRelocationWarranty,
//           defaultDeliveryPackaging,
//           defaultInstallationFee,
//           defaultPlatformFee,
//           taxBlocked,
//           startDate,
//           endDate,
//           dailyRate,
//           rentalConfigurations: Array.isArray(payload.rentalConfigurations)
//             ? payload.rentalConfigurations
//             : [],
//         });

//       // if (existing) {
//       //   existing.variantId = variantId || null;
//       //   existing.variantName = variantName || '';
//       //   existing.rentalMonths = rentalMonths;
//       //   existing.tenureUnit = tu;
//       //   existing.pricePerDay = pricePerDay;
//       //   existing.title = title;
//       //   existing.image = image;
//       //   existing.productType = String(
//       //     productType || existing.productType || 'Rental',
//       //   );
//       //   existing.refundableDeposit = Number(refundableDeposit || 0);
//       //   existing.condition = condition || existing.condition || '';
//       //   existing.offer = offer || existing.offer || null;
//       //   if (Array.isArray(payload.rentalConfigurations)) {
//       //     existing.rentalConfigurations = payload.rentalConfigurations;
//       //   }
//       // }
//       if (existing) {
//         existing.variantId = variantId || null;
//         existing.variantName = variantName || '';
//         existing.rentalMonths = rentalMonths;
//         existing.tenureUnit = tu;
//         existing.pricePerDay = pricePerDay;
//         existing.title = title;
//         existing.image = image;
//         existing.productType = String(
//           productType || existing.productType || 'Rental',
//         );
//         existing.refundableDeposit = Number(refundableDeposit || 0);
//         existing.condition = condition || existing.condition || '';
//         existing.offer = offer || existing.offer || null;
//         existing.defaultGst = defaultGst ?? existing.defaultGst ?? null;
//         existing.defaultCareTax =
//           defaultCareTax ?? existing.defaultCareTax ?? null;
//         existing.defaultRepairWarranty =
//           defaultRepairWarranty ?? existing.defaultRepairWarranty ?? null;
//         existing.defaultRelocationWarranty =
//           defaultRelocationWarranty ??
//           existing.defaultRelocationWarranty ??
//           null;
//         existing.defaultDeliveryPackaging =
//           defaultDeliveryPackaging ?? existing.defaultDeliveryPackaging ?? null;
//         existing.defaultInstallationFee =
//           defaultInstallationFee ?? existing.defaultInstallationFee ?? null;
//         existing.defaultPlatformFee =
//           defaultPlatformFee ?? existing.defaultPlatformFee ?? null;
//         existing.taxBlocked = taxBlocked ?? existing.taxBlocked ?? false;
//         if (startDate) existing.startDate = startDate;
//         if (endDate) existing.endDate = endDate;
//         if (dailyRate != null) existing.dailyRate = dailyRate;
//         if (Array.isArray(payload.rentalConfigurations)) {
//           existing.rentalConfigurations = payload.rentalConfigurations;
//         }
//       }
//       saveCart(state.items);
//     },
//     removeFromCart: (state, { payload }) => {
//       state.items = state.items.filter((i) => i.productId !== payload);
//       saveCart(state.items);
//     },
//     updateQuantity: (state, { payload }) => {
//       const item = state.items.find((i) => i.productId === payload.productId);
//       if (!item) return;
//       if (payload.quantity <= 0) {
//         state.items = state.items.filter(
//           (i) => i.productId !== payload.productId,
//         );
//       } else item.quantity = payload.quantity;
//       saveCart(state.items);
//     },
//     // Reload cart from localStorage for the currently logged-in user.
//     syncCart: (state) => {
//       state.items = loadCart();
//     },
//     clearCart: (state) => {
//       state.items = [];
//       saveCart([]);
//     },
//     setAppliedCoupon(state, action) {
//       state.appliedCoupon = action.payload;
//       // payload: { couponId, code, discountType, discountValue, discountAmount, finalAmount }
//     },

//     // updateTenure(state, action) {
//     //   const { productId, rentalMonths, pricePerDay } = action.payload;
//     //   const item = state.items.find((i) => i.productId === productId);
//     //   if (!item) return;
//     //   item.rentalMonths = rentalMonths;
//     //   item.pricePerDay = pricePerDay;
//     //   saveCart(state.items);
//     // },

//     updateTenure(state, action) {
//       const { productId, rentalMonths, pricePerDay, tenureUnit } =
//         action.payload;
//       const item = state.items.find((i) => i.productId === productId);
//       if (!item) return;
//       item.rentalMonths = rentalMonths;
//       item.pricePerDay = pricePerDay;
//       if (tenureUnit) item.tenureUnit = tenureUnit === 'day' ? 'day' : 'month';
//       saveCart(state.items);
//     },
//     updateRentalDates(state, action) {
//       const { productId, startDate, endDate, rentalMonths, pricePerDay } =
//         action.payload;
//       const item = state.items.find((i) => i.productId === productId);
//       if (!item) return;
//       item.startDate = startDate;
//       item.endDate = endDate;
//       if (rentalMonths != null) item.rentalMonths = rentalMonths;
//       if (pricePerDay != null) item.pricePerDay = pricePerDay;
//       saveCart(state.items);
//     },
//     clearAppliedCoupon(state) {
//       state.appliedCoupon = null;
//     },

//     clearAppliedCoupon(state) {
//       state.appliedCoupon = null;
//     },
//   },
// });

// export const {
//   addToCart,
//   removeFromCart,
//   updateQuantity,
//   updateTenure,
//   updateRentalDates,
//   setAppliedCoupon,
//   clearAppliedCoupon,
//   syncCart,
//   clearCart,
// } = cartSlice.actions;
// export default cartSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';

function getCartStorageKey() {
  if (typeof window === 'undefined') return 'rentpay_cart_guest';
  try {
    // Your current auth persistence uses `userToken` + `userData`.
    // Cart should follow the logged-in user stored in `userData`.
    const userStr = localStorage.getItem('userData');
    if (!userStr) return 'rentpay_cart_guest';
    const user = JSON.parse(userStr);
    const userId = user?.id || user?._id;
    return userId ? `rentpay_cart_${userId}` : 'rentpay_cart_guest';
  } catch {
    return 'rentpay_cart_guest';
  }
}

const loadCart = () => {
  if (typeof window === 'undefined') return [];
  try {
    const key = getCartStorageKey();

    // Backward compatibility:
    // Old cart stored rental months in `quantity`.
    // New cart stores:
    // - `quantity` = number of units (stock units)
    // - `rentalMonths` = tenure selected on product page
    const normalizeItem = (it) => {
      if (!it) return it;
      let next = it;
      if (it.rentalMonths == null && it.quantity != null) {
        const rentalMonths = it.quantity;
        next = { ...it, rentalMonths: rentalMonths || 1, quantity: 1 };
      }
      const tu = next.tenureUnit;
      if (tu !== 'day' && tu !== 'month') {
        next = { ...next, tenureUnit: 'month' };
      }
      return next;
    };

    const normalizeList = (list) =>
      Array.isArray(list) ? list.map(normalizeItem) : [];

    // If we were using the guest cart and the user just logged in,
    // merge guest items into the user cart so checkout doesn't lose items.
    if (key !== 'rentpay_cart_guest') {
      const guestStr = localStorage.getItem('rentpay_cart_guest');
      if (guestStr) {
        const guestItems = JSON.parse(guestStr) || [];
        const userStr = localStorage.getItem(key);
        const userItems = userStr ? JSON.parse(userStr) : [];

        if (Array.isArray(guestItems) && guestItems.length > 0) {
          const merged = [...userItems];
          guestItems.forEach((gi) => {
            const existing = merged.find((mi) => mi.productId === gi.productId);
            if (existing)
              existing.quantity = (existing.quantity || 0) + (gi.quantity || 1);
            else merged.push(gi);
          });

          localStorage.setItem(key, JSON.stringify(merged));
          localStorage.removeItem('rentpay_cart_guest');
          return normalizeList(merged);
        }
      }
    }

    const s = localStorage.getItem(key);
    return s ? normalizeList(JSON.parse(s)) : [];
  } catch {
    return [];
  }
};

const saveCart = (cart) => {
  if (typeof window !== 'undefined') {
    const key = getCartStorageKey();
    localStorage.setItem(key, JSON.stringify(cart));
  }
};

const initialState = { items: loadCart(), appliedCoupon: null };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, { payload }) => {
      // const {
      //   productId,
      //   variantId = null,
      //   variantName = '',
      //   quantity = 1,
      //   rentalMonths = 1,
      //   pricePerDay,
      //   title,
      //   image,
      //   tenureUnit = 'month',
      //   productType = 'Rental',
      //   refundableDeposit = 0,
      //   condition = '',
      //   offer = null,
      // } = payload;

      // const {
      //   productId,
      //   variantId = null,
      //   variantName = '',
      //   quantity = 1,
      //   rentalMonths = 1,
      //   pricePerDay,
      //   title,
      //   image,
      //   tenureUnit = 'month',
      //   productType = 'Rental',
      //   refundableDeposit = 0,
      //   condition = '',
      //   offer = null,
      //   defaultGst = null,
      //   defaultCareTax = null,
      //   defaultRepairWarranty = null,
      //   defaultRelocationWarranty = null,
      //   defaultDeliveryPackaging = null,
      //   defaultInstallationFee = null,
      //   defaultPlatformFee = null,
      //   taxBlocked = false,
      //   startDate = null,
      //   endDate = null,
      //   dailyRate = null,
      // } = payload;
      const {
        productId,
        variantId = null,
        variantName = '',
        quantity = 1,
        rentalMonths = 1,
        pricePerDay,
        title,
        image,
        tenureUnit = 'month',
        productType = 'Rental',
        refundableDeposit = 0,
        condition = '',
        offer = null,
        defaultGst = null,
        defaultCareTax = null,
        defaultRepairWarranty = null,
        defaultRelocationWarranty = null,
        defaultDeliveryPackaging = null,
        defaultInstallationFee = null,
        defaultPlatformFee = null,
        taxBlocked = false,
        startDate = null,
        endDate = null,
        dailyRate = null,
        originalPricePerDay = null,
      } = payload;

      console.log('CART PAYLOAD:', payload);
      console.log('variantId received:', variantId);
      const tu = tenureUnit === 'day' ? 'day' : 'month';
      // const existing = state.items.find((i) => i.productId === productId);
      const existing = state.items.find(
        (i) =>
          i.productId === productId &&
          String(i.variantId || '') === String(variantId || ''),
      );
      if (existing) existing.quantity += quantity;
      // else
      //   state.items.push({
      //     productId,
      //     variantId: variantId || null,
      //     variantName: variantName || '',
      //     quantity,
      //     rentalMonths,
      //     pricePerDay,
      //     title,
      //     image,
      //     tenureUnit: tu,
      //     productType: String(productType || 'Rental'),
      //     refundableDeposit: Number(refundableDeposit || 0),
      //     rentalConfigurations: Array.isArray(payload.rentalConfigurations)
      //       ? payload.rentalConfigurations
      //       : [],
      //   });
      // else
      //   state.items.push({
      //     productId,
      //     variantId: variantId || null,
      //     variantName: variantName || '',
      //     quantity,
      //     rentalMonths,
      //     pricePerDay,
      //     title,
      //     image,
      //     tenureUnit: tu,
      //     productType: String(productType || 'Rental'),
      //     refundableDeposit: Number(refundableDeposit || 0),
      //     condition: condition || '',
      //     offer: offer || null,
      //     rentalConfigurations: Array.isArray(payload.rentalConfigurations)
      //       ? payload.rentalConfigurations
      //       : [],
      //   });
      // else
      //   state.items.push({
      //     productId,
      //     variantId: variantId || null,
      //     variantName: variantName || '',
      //     quantity,
      //     rentalMonths,
      //     pricePerDay,
      //     title,
      //     image,
      //     tenureUnit: tu,
      //     productType: String(productType || 'Rental'),
      //     refundableDeposit: Number(refundableDeposit || 0),
      //     condition: condition || '',
      //     offer: offer || null,
      //     defaultGst,
      //     defaultCareTax,
      //     defaultRepairWarranty,
      //     defaultRelocationWarranty,
      //     defaultDeliveryPackaging,
      //     defaultInstallationFee,
      //     defaultPlatformFee,
      //     taxBlocked,
      //     startDate,
      //     endDate,
      //     dailyRate,
      //     rentalConfigurations: Array.isArray(payload.rentalConfigurations)
      //       ? payload.rentalConfigurations
      //       : [],
      //   });
      else
        state.items.push({
          productId,
          variantId: variantId || null,
          variantName: variantName || '',
          quantity,
          rentalMonths,
          pricePerDay,
          originalPricePerDay:
            originalPricePerDay != null ? originalPricePerDay : pricePerDay,
          title,
          image,
          tenureUnit: tu,
          productType: String(productType || 'Rental'),
          refundableDeposit: Number(refundableDeposit || 0),
          condition: condition || '',
          offer: offer || null,
          defaultGst,
          defaultCareTax,
          defaultRepairWarranty,
          defaultRelocationWarranty,
          defaultDeliveryPackaging,
          defaultInstallationFee,
          defaultPlatformFee,
          taxBlocked,
          startDate,
          endDate,
          dailyRate,
          rentalConfigurations: Array.isArray(payload.rentalConfigurations)
            ? payload.rentalConfigurations
            : [],
        });

      // if (existing) {
      //   existing.variantId = variantId || null;
      //   existing.variantName = variantName || '';
      //   existing.rentalMonths = rentalMonths;
      //   existing.tenureUnit = tu;
      //   existing.pricePerDay = pricePerDay;
      //   existing.title = title;
      //   existing.image = image;
      //   existing.productType = String(
      //     productType || existing.productType || 'Rental',
      //   );
      //   existing.refundableDeposit = Number(refundableDeposit || 0);
      //   existing.condition = condition || existing.condition || '';
      //   existing.offer = offer || existing.offer || null;
      //   if (Array.isArray(payload.rentalConfigurations)) {
      //     existing.rentalConfigurations = payload.rentalConfigurations;
      //   }
      // }
      if (existing) {
        existing.variantId = variantId || null;
        existing.variantName = variantName || '';
        existing.rentalMonths = rentalMonths;
        existing.tenureUnit = tu;
        existing.pricePerDay = pricePerDay;
        existing.originalPricePerDay =
          originalPricePerDay != null
            ? originalPricePerDay
            : (existing.originalPricePerDay ?? pricePerDay);
        existing.title = title;
        existing.image = image;
        existing.productType = String(
          productType || existing.productType || 'Rental',
        );
        existing.refundableDeposit = Number(refundableDeposit || 0);
        existing.condition = condition || existing.condition || '';
        existing.offer = offer || existing.offer || null;
        existing.defaultGst = defaultGst ?? existing.defaultGst ?? null;
        existing.defaultCareTax =
          defaultCareTax ?? existing.defaultCareTax ?? null;
        existing.defaultRepairWarranty =
          defaultRepairWarranty ?? existing.defaultRepairWarranty ?? null;
        existing.defaultRelocationWarranty =
          defaultRelocationWarranty ??
          existing.defaultRelocationWarranty ??
          null;
        existing.defaultDeliveryPackaging =
          defaultDeliveryPackaging ?? existing.defaultDeliveryPackaging ?? null;
        existing.defaultInstallationFee =
          defaultInstallationFee ?? existing.defaultInstallationFee ?? null;
        existing.defaultPlatformFee =
          defaultPlatformFee ?? existing.defaultPlatformFee ?? null;
        existing.taxBlocked = taxBlocked ?? existing.taxBlocked ?? false;
        if (startDate) existing.startDate = startDate;
        if (endDate) existing.endDate = endDate;
        if (dailyRate != null) existing.dailyRate = dailyRate;
        if (Array.isArray(payload.rentalConfigurations)) {
          existing.rentalConfigurations = payload.rentalConfigurations;
        }
      }
      saveCart(state.items);
    },
    removeFromCart: (state, { payload }) => {
      state.items = state.items.filter((i) => i.productId !== payload);
      saveCart(state.items);
    },
    updateQuantity: (state, { payload }) => {
      const item = state.items.find((i) => i.productId === payload.productId);
      if (!item) return;
      if (payload.quantity <= 0) {
        state.items = state.items.filter(
          (i) => i.productId !== payload.productId,
        );
      } else item.quantity = payload.quantity;
      saveCart(state.items);
    },
    // Reload cart from localStorage for the currently logged-in user.
    syncCart: (state) => {
      state.items = loadCart();
    },
    clearCart: (state) => {
      state.items = [];
      saveCart([]);
    },
    setAppliedCoupon(state, action) {
      state.appliedCoupon = action.payload;
      // payload: { couponId, code, discountType, discountValue, discountAmount, finalAmount }
    },

    // updateTenure(state, action) {
    //   const { productId, rentalMonths, pricePerDay } = action.payload;
    //   const item = state.items.find((i) => i.productId === productId);
    //   if (!item) return;
    //   item.rentalMonths = rentalMonths;
    //   item.pricePerDay = pricePerDay;
    //   saveCart(state.items);
    // },

    updateTenure(state, action) {
      const {
        productId,
        rentalMonths,
        pricePerDay,
        tenureUnit,
        originalPricePerDay,
      } = action.payload;
      const item = state.items.find((i) => i.productId === productId);
      if (!item) return;
      item.rentalMonths = rentalMonths;
      item.pricePerDay = pricePerDay;
      item.originalPricePerDay =
        originalPricePerDay != null ? originalPricePerDay : pricePerDay;
      if (tenureUnit) item.tenureUnit = tenureUnit === 'day' ? 'day' : 'month';
      saveCart(state.items);
    },
    updateRentalDates(state, action) {
      const {
        productId,
        startDate,
        endDate,
        rentalMonths,
        pricePerDay,
        originalPricePerDay,
      } = action.payload;
      const item = state.items.find((i) => i.productId === productId);
      if (!item) return;
      item.startDate = startDate;
      item.endDate = endDate;
      if (rentalMonths != null) item.rentalMonths = rentalMonths;
      if (pricePerDay != null) item.pricePerDay = pricePerDay;
      if (originalPricePerDay != null)
        item.originalPricePerDay = originalPricePerDay;
      saveCart(state.items);
    },
    clearAppliedCoupon(state) {
      state.appliedCoupon = null;
    },

    clearAppliedCoupon(state) {
      state.appliedCoupon = null;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  updateTenure,
  updateRentalDates,
  setAppliedCoupon,
  clearAppliedCoupon,
  syncCart,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
