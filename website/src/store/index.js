// import { configureStore } from '@reduxjs/toolkit';
// import authReducer from './slices/authSlice';
// import cartReducer from './slices/cartSlice';

// export const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     cart: cartReducer
//   }
// });

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import { cartSyncMiddleware } from '@/middleware/cartSyncMiddleware';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(cartSyncMiddleware),
});
