import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  apiCreateServiceProduct,
  apiGetMyServiceProducts,
  apiUpdateServiceProduct,
  apiDeleteServiceProduct,
  apiPatchVendorServiceListingVisibility,
  apiGetVendorServiceListingTemplates,
  apiGetVendorServiceListingTemplateById,
} from '../../service/api';

export const createServiceProduct = createAsyncThunk(
  'vendorServiceProduct/create',
  async (formData, { getState, rejectWithValue }) => {
    try {
      const token = getState().vendor.token;
      const res = await apiCreateServiceProduct(formData, token);
      return res.data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Create failed');
    }
  },
);

export const getMyServiceProducts = createAsyncThunk(
  'vendorServiceProduct/getMy',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().vendor.token;
      const res = await apiGetMyServiceProducts(token);
      return res.data.products;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Fetch failed');
    }
  },
);

export const updateServiceProduct = createAsyncThunk(
  'vendorServiceProduct/update',
  async ({ id, formData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().vendor.token;
      const res = await apiUpdateServiceProduct(id, formData, token);
      return res.data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Update failed');
    }
  },
);

export const deleteServiceProduct = createAsyncThunk(
  'vendorServiceProduct/delete',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().vendor.token;
      await apiDeleteServiceProduct(id, token);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Delete failed');
    }
  },
);

export const patchVendorServiceListingVisibility = createAsyncThunk(
  'vendorServiceProduct/patchVendorListing',
  async ({ id, vendorListingEnabled }, { getState, rejectWithValue }) => {
    try {
      const token = getState().vendor.token;
      const res = await apiPatchVendorServiceListingVisibility(
        id,
        { vendorListingEnabled },
        token,
      );
      return res.data.product;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Visibility update failed',
      );
    }
  },
);

// Optional: service template fetching helpers (used in modal)
export const fetchServiceListingTemplates = createAsyncThunk(
  'serviceTemplates/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().vendor.token;
      const res = await apiGetVendorServiceListingTemplates(token);
      return res.data.serviceListingTemplates || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Fetch failed');
    }
  },
);

export const fetchServiceListingTemplateById = createAsyncThunk(
  'serviceTemplates/fetchById',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().vendor.token;
      const res = await apiGetVendorServiceListingTemplateById(id, token);
      return res.data.serviceListingTemplate;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Fetch failed');
    }
  },
);

const initialState = {
  serviceProducts: [],
  loading: false,
  error: null,
};

const vendorServiceProductSlice = createSlice({
  name: 'vendorServiceProduct',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createServiceProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createServiceProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.serviceProducts.unshift(action.payload);
      })
      .addCase(createServiceProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getMyServiceProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyServiceProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.serviceProducts = action.payload || [];
      })
      .addCase(getMyServiceProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateServiceProduct.fulfilled, (state, action) => {
        const idx = state.serviceProducts.findIndex(
          (p) => p._id === action.payload._id,
        );
        if (idx !== -1) state.serviceProducts[idx] = action.payload;
      })
      .addCase(deleteServiceProduct.fulfilled, (state, action) => {
        state.serviceProducts = state.serviceProducts.filter(
          (p) => p._id !== action.payload,
        );
      })
      .addCase(
        patchVendorServiceListingVisibility.fulfilled,
        (state, action) => {
          const idx = state.serviceProducts.findIndex(
            (p) => p._id === action.payload._id,
          );
          if (idx !== -1) state.serviceProducts[idx] = action.payload;
        },
      );
  },
});

export default vendorServiceProductSlice.reducer;

