import { configureStore } from '@reduxjs/toolkit';
import adminReducer from '../slices/adminSlice';
import vendorReducer from '../slices/vendorSlice';
import productReducer from '../slices/productSlice';
import adsPlanReducer from '../slices/adsPlanSlice';
import categoryReducer from '../slices/categorySlice';
import listingTemplateReducer from '../slices/listingTemplateSlice';
import vendorServiceProductReducer from '../slices/vendorServiceProductSlice';

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    vendor: vendorReducer,
    product: productReducer,
    adsPlan: adsPlanReducer,
    vendorServiceProduct: vendorServiceProductReducer,
    category: categoryReducer,
    listingTemplate: listingTemplateReducer,
  },
});

export default store;
