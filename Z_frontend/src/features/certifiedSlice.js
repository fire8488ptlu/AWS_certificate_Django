// src/features/certifiedSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import ENV from "../env";

export const fetchCertifiedData = createAsyncThunk(
  'certified/fetch',
  async () => {
    const isDev = ENV.MODE === "dev";
    const accessToken = localStorage.getItem('access');
    const res = await axios.get(
      `${isDev ? ENV.BACKEND_URL_DEV : ENV.BACKEND}/api/C/CertifiedShowAll/`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    // const res = await axios.get(`${isDev ? ENV.BACKEND_URL_DEV : ENV.BACKEND}/api/C/CertifiedShowAll/`);
    return res.data.Certified || [];
  }
);

const certifiedSlice = createSlice({
  name: 'certified',
  initialState: { data: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCertifiedData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCertifiedData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCertifiedData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default certifiedSlice.reducer;
