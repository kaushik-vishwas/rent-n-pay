import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiCreateAdsPlan, apiGetMyAdsPlans } from '../../service/api';

export const createAdsPlan = createAsyncThunk(
  'adsPlan/create',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const token = getState().vendor.token;
      const res = await apiCreateAdsPlan(token, payload);
      return res.data.adsPlan;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const getMyAdsPlans = createAsyncThunk(
  'adsPlan/getMy',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().vendor.token;
      const res = await apiGetMyAdsPlans(token);
      return res.data.adsPlans;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

const adsPlanSlice = createSlice({
  name: 'adsPlan',
  initialState: { adsPlans: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createAdsPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdsPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.adsPlans.unshift(action.payload);
      })
      .addCase(createAdsPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getMyAdsPlans.fulfilled, (state, action) => {
        state.adsPlans = action.payload;
      });
  },
});

export default adsPlanSlice.reducer;
