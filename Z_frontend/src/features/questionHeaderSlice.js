// src/features/questionHeaderSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import ENV from "../env";

export const fetchQuestionHeaderData = createAsyncThunk(
  'questionHeader/fetch',
  async (params = '') => {
    // console.log(params)
    const isDev = ENV.MODE === "dev";
    const accessToken = localStorage.getItem('access');
    const res = await axios.post(
      `${isDev ? ENV.BACKEND_URL_DEV : ENV.BACKEND}/api/question-headershowAll/`, params
      ,{
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
    return res.data.map(q => ({
      ...q,
      OptionList: Array.isArray(q.OptionList) ? q.OptionList : []
    }));
  }
);

const questionHeaderSlice = createSlice({
  name: 'questionHeader',
  initialState: { data: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestionHeaderData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestionHeaderData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchQuestionHeaderData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default questionHeaderSlice.reducer;