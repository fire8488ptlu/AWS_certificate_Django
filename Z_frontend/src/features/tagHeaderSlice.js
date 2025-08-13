// src/features/tagHeaderSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import ENV from "../env";

export const fetchTagHeaderData = createAsyncThunk(
  'tagHeader/fetch',
  async () => {
    const isDev = ENV.MODE === "dev";
    const accessToken = localStorage.getItem('access');
    const res = await axios.get(
      `${isDev ? ENV.BACKEND_URL_DEV : ENV.BACKEND}/api/C/tagHeaderShowAll/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
    );
    return res.data.tagheader || [];
  }
);

const tagHeaderSlice = createSlice({
  name: 'tagHeader',
  initialState: { data: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTagHeaderData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTagHeaderData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchTagHeaderData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default tagHeaderSlice.reducer;
