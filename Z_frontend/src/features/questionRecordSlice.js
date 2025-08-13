// src/features/questionRecordSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import ENV from "../env";
export const submitQuestionRecord = createAsyncThunk(
  'questionRecord/submit',
  async ({ QHID, QCID, IsCorrect }, thunkAPI) => {
    try {
      const isDev = ENV.MODE === "dev";
      const accessToken = localStorage.getItem('access');
      const res = await axios.post(`${isDev ? ENV.BACKEND_URL_DEV : ENV.BACKEND}/api/questionRecord/`, {
        QHID,
        QCID,
        IsCorrect,
      },
      {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
    );
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const questionRecordSlice = createSlice({
  name: 'questionRecord',
  initialState: {
    loading: false,
    error: null,
    message: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitQuestionRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitQuestionRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message || 'Submitted';
      })
      .addCase(submitQuestionRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Submission failed';
      });
  },
});

export default questionRecordSlice.reducer;
