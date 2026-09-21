// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import {
//   apiAdminLogin,
//   apiGetAllUsers,
//   apiGetAllVendors,
//   apiSubAdminRegister,
// } from '../../service/api';

// // Login
// export const adminLogin = createAsyncThunk(
//   'admin/login',
//   async (loginData, { rejectWithValue }) => {
//     try {
//       const response = await apiAdminLogin(loginData);
//       localStorage.setItem('adminToken', response.data.token);
//       localStorage.setItem('adminUser', JSON.stringify(response.data.user));
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Login failed');
//     }
//   },
// );
// export const getAllVendors = createAsyncThunk(
//   'admin/getVendors',
//   async (_, { getState, rejectWithValue }) => {
//     try {
//       const token =
//         getState().admin.token ||
//         (typeof window !== 'undefined'
//           ? localStorage.getItem('adminToken')
//           : null);
//       if (!token) {
//         return rejectWithValue('Please login again to continue.');
//       }
//       const res = await apiGetAllVendors(token);
//       return res.data.vendors;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || 'Failed to get vendors',
//       );
//     }
//   },
// );

// export const subAdminRegister = createAsyncThunk(
//   'admin/subAdminRegister',
//   async (data, { rejectWithValue }) => {
//     try {
//       const response = await apiSubAdminRegister(data);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || 'Registration failed',
//       );
//     }
//   },
// );

// export const getAllUsers = createAsyncThunk(
//   'admin/getUsers',
//   async (_, { getState, rejectWithValue }) => {
//     try {
//       const token =
//         getState().admin.token ||
//         (typeof window !== 'undefined'
//           ? localStorage.getItem('adminToken')
//           : null);
//       if (!token) {
//         return rejectWithValue('Please login again to continue.');
//       }
//       const res = await apiGetAllUsers(token);
//       return res.data.users;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || 'Failed to get users',
//       );
//     }
//   },
// );

// // Logout (no need to call backend unless session exists server-side)
// export const adminLogout = createAsyncThunk('admin/logout', async () => {
//   localStorage.removeItem('adminToken');
//   localStorage.removeItem('adminUser');
//   return true;
// });

// function readAdminAuthFromStorage() {
//   if (typeof window === 'undefined') {
//     return { isAuthenticated: false, token: null, user: null };
//   }
//   const token = localStorage.getItem('adminToken');
//   return {
//     isAuthenticated: !!token,
//     token,
//     user: JSON.parse(localStorage.getItem('adminUser') || 'null'),
//   };
// }

// const initialState = {
//   ...readAdminAuthFromStorage(),
//   vendors: [],
//   users: [],
//   usersLoading: false,
//   vendorsLoading: false,
//   authLoading: false,
//   error: null,
// };

// const adminSlice = createSlice({
//   name: 'admin',
//   initialState,
//   reducers: {
//     clearError: (state) => {
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(adminLogin.pending, (state) => {
//         state.authLoading = true;
//         state.error = null;
//       })
//       .addCase(adminLogin.fulfilled, (state, action) => {
//         state.authLoading = false;
//         state.isAuthenticated = true;
//         state.token = action.payload.token;
//         state.user = action.payload.user;
//       })
//       .addCase(adminLogin.rejected, (state, action) => {
//         state.authLoading = false;
//         state.isAuthenticated = false;
//         state.token = null;
//         state.user = null;
//         state.error = action.payload;
//       })
//       .addCase(adminLogout.fulfilled, (state) => {
//         state.isAuthenticated = false;
//         state.token = null;
//         state.user = null;
//         state.error = null;
//       })
//       .addCase(getAllVendors.pending, (state) => {
//         state.vendorsLoading = true;
//         state.error = null;
//       })
//       .addCase(getAllVendors.fulfilled, (state, action) => {
//         state.vendorsLoading = false;
//         state.vendors = action.payload;
//       })
//       .addCase(getAllVendors.rejected, (state, action) => {
//         state.vendorsLoading = false;
//         state.error = action.payload;
//       })
//       .addCase(getAllUsers.pending, (state) => {
//         state.usersLoading = true;
//         state.error = null;
//       })
//       .addCase(getAllUsers.fulfilled, (state, action) => {
//         state.usersLoading = false;
//         state.users = action.payload;
//       })
//       .addCase(getAllUsers.rejected, (state, action) => {
//         state.usersLoading = false;
//         state.error = action.payload;
//       })
//       .addCase(subAdminRegister.pending, (state) => {
//         state.authLoading = true;
//         state.error = null;
//       })
//       .addCase(subAdminRegister.fulfilled, (state) => {
//         state.authLoading = false;
//       })
//       .addCase(subAdminRegister.rejected, (state, action) => {
//         state.authLoading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { clearError } = adminSlice.actions;
// export default adminSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  apiAdminLogin,
  apiGetAllUsers,
  apiGetAllVendors,
  apiSubAdminRegister,
  apiAdminForgotPassword,
  apiAdminVerifyOtp,
  apiAdminResetPassword,
  apiGetAdminSettings,
  apiSendEmailChangeOtp,
  apiVerifyEmailChangeOtp,
  apiChangeAdminSettingsPassword,
} from '../../service/api';

// Login
export const adminLogin = createAsyncThunk(
  'admin/login',
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await apiAdminLogin(loginData);
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  },
);
export const getAllVendors = createAsyncThunk(
  'admin/getVendors',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token =
        getState().admin.token ||
        (typeof window !== 'undefined'
          ? localStorage.getItem('adminToken')
          : null);
      if (!token) {
        return rejectWithValue('Please login again to continue.');
      }
      const res = await apiGetAllVendors(token);
      return res.data.vendors;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get vendors',
      );
    }
  },
);

export const adminForgotPassword = createAsyncThunk(
  'admin/forgotPassword',
  async (data, { rejectWithValue }) => {
    try {
      const res = await apiAdminForgotPassword(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to send OTP',
      );
    }
  },
);

export const adminVerifyOtp = createAsyncThunk(
  'admin/verifyOtp',
  async (data, { rejectWithValue }) => {
    try {
      const res = await apiAdminVerifyOtp(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Invalid OTP');
    }
  },
);

export const adminResetPassword = createAsyncThunk(
  'admin/resetPassword',
  async (data, { rejectWithValue }) => {
    try {
      const res = await apiAdminResetPassword(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to reset password',
      );
    }
  },
);
export const changeAdminSettingsPassword = createAsyncThunk(
  'admin/changeSettingsPassword',
  async (data, { getState, rejectWithValue }) => {
    try {
      const token =
        getState().admin.token ||
        (typeof window !== 'undefined'
          ? localStorage.getItem('adminToken')
          : null);
      if (!token) return rejectWithValue('Please login again');
      const res = await apiChangeAdminSettingsPassword(data, token);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update password',
      );
    }
  },
);

export const sendEmailChangeOtp = createAsyncThunk(
  'admin/sendEmailChangeOtp',
  async (data, { getState, rejectWithValue }) => {
    try {
      const token =
        getState().admin.token ||
        (typeof window !== 'undefined'
          ? localStorage.getItem('adminToken')
          : null);
      if (!token) return rejectWithValue('Please login again');
      const res = await apiSendEmailChangeOtp(data, token);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to send OTP',
      );
    }
  },
);

export const verifyEmailChangeOtp = createAsyncThunk(
  'admin/verifyEmailChangeOtp',
  async (data, { getState, rejectWithValue }) => {
    try {
      const token =
        getState().admin.token ||
        (typeof window !== 'undefined'
          ? localStorage.getItem('adminToken')
          : null);
      if (!token) return rejectWithValue('Please login again');
      const res = await apiVerifyEmailChangeOtp(data, token);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to verify OTP',
      );
    }
  },
);

export const getAdminSettings = createAsyncThunk(
  'admin/getSettings',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token =
        getState().admin.token ||
        (typeof window !== 'undefined'
          ? localStorage.getItem('adminToken')
          : null);
      if (!token) return rejectWithValue('Please login again to continue.');
      const res = await apiGetAdminSettings(token);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load settings',
      );
    }
  },
);

export const subAdminRegister = createAsyncThunk(
  'admin/subAdminRegister',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiSubAdminRegister(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed',
      );
    }
  },
);

export const getAllUsers = createAsyncThunk(
  'admin/getUsers',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token =
        getState().admin.token ||
        (typeof window !== 'undefined'
          ? localStorage.getItem('adminToken')
          : null);
      if (!token) {
        return rejectWithValue('Please login again to continue.');
      }
      const res = await apiGetAllUsers(token);
      return res.data.users;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get users',
      );
    }
  },
);

// Logout (no need to call backend unless session exists server-side)
export const adminLogout = createAsyncThunk('admin/logout', async () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  return true;
});

function readAdminAuthFromStorage() {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, token: null, user: null };
  }
  const token = localStorage.getItem('adminToken');
  return {
    isAuthenticated: !!token,
    token,
    user: JSON.parse(localStorage.getItem('adminUser') || 'null'),
  };
}

// const initialState = {
//   ...readAdminAuthFromStorage(),
//   vendors: [],
//   users: [],
//   usersLoading: false,
//   vendorsLoading: false,
//   authLoading: false,
//   error: null,
// };

const initialState = {
  ...readAdminAuthFromStorage(),
  vendors: [],
  users: [],
  usersLoading: false,
  vendorsLoading: false,
  authLoading: false,
  error: null,
  settings: null,
  settingsLoading: false,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => {
        state.authLoading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.authLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.authLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload;
      })
      .addCase(adminLogout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = null;
      })
      .addCase(getAllVendors.pending, (state) => {
        state.vendorsLoading = true;
        state.error = null;
      })
      .addCase(getAllVendors.fulfilled, (state, action) => {
        state.vendorsLoading = false;
        state.vendors = action.payload;
      })
      .addCase(getAllVendors.rejected, (state, action) => {
        state.vendorsLoading = false;
        state.error = action.payload;
      })
      .addCase(getAllUsers.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload;
      })
      .addCase(subAdminRegister.pending, (state) => {
        state.authLoading = true;
        state.error = null;
      })
      .addCase(subAdminRegister.fulfilled, (state) => {
        state.authLoading = false;
      })
      .addCase(subAdminRegister.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload;
      })
      .addCase(adminForgotPassword.pending, (state) => {
        state.authLoading = true;
        state.error = null;
      })
      .addCase(adminForgotPassword.fulfilled, (state) => {
        state.authLoading = false;
      })
      .addCase(adminForgotPassword.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload;
      })
      .addCase(adminVerifyOtp.pending, (state) => {
        state.authLoading = true;
        state.error = null;
      })
      .addCase(adminVerifyOtp.fulfilled, (state) => {
        state.authLoading = false;
      })
      .addCase(adminVerifyOtp.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload;
      })
      .addCase(adminResetPassword.pending, (state) => {
        state.authLoading = true;
        state.error = null;
      })
      .addCase(adminResetPassword.fulfilled, (state) => {
        state.authLoading = false;
      })
      .addCase(adminResetPassword.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload;
      })
      .addCase(getAdminSettings.pending, (state) => {
        state.settingsLoading = true;
      })
      .addCase(getAdminSettings.fulfilled, (state, action) => {
        state.settingsLoading = false;
        state.settings = action.payload;
      })
      .addCase(getAdminSettings.rejected, (state) => {
        state.settingsLoading = false;
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;
