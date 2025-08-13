import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import ENV from "../env";

// Async login action
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ username, password }, thunkAPI) => {
    try {
      const isDev = ENV.MODE === "dev";
      const res = await axios.post(
        `${isDev ? ENV.BACKEND_URL_DEV : ENV.BACKEND}/api/token/`,
        {
          username,
          password,
        }
      );

      // Save tokens (optional: you can also use cookies)
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { detail: "Login failed" }
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem("access") || null,
    refresh: localStorage.getItem("refresh") || null,
    user: JSON.parse(localStorage.getItem("user")) || null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: () => {}, // rootReducer will handle the actual reset
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.access;
        state.refresh = action.payload.refresh;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || "Login failed";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
