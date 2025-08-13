// src/features/questionHistorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import ENV from "../env";

export const fetchQuestionHistory = createAsyncThunk(
  'history/fetch',
  async (qhid) => {
    const isDev = ENV.MODE === "dev";
    const accessToken = localStorage.getItem('access');
    const res = await axios.get(
      `${isDev ? ENV.BACKEND_URL_DEV : ENV.BACKEND}/api/questionRecord/?QHID=${qhid}`
      ,{
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
    );
    return res.data.RecordHistory || [];
  }
);

const questionHistorySlice = createSlice({
  name: 'history',
  initialState: {
    data: {},
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestionHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestionHistory.fulfilled, (state, action) => {
        state.loading = false;
        const qhid = action.meta.arg;
        state.data[qhid] = action.payload;
      })
      .addCase(fetchQuestionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Fetch failed';
      });
  }
});

export default questionHistorySlice.reducer;
