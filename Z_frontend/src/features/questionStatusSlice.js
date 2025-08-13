// src/features/questionStatusSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import ENV from "../env";
export const submitQuestionStatus = createAsyncThunk(
  'questionStatus/submit',
  async ({ QHID,IsDone,IsCorrect,IsTag,THID,CID }, thunkAPI) => {
    try {
      const isDev = ENV.MODE === "dev";
      const accessToken = localStorage.getItem('access');
      const res = await axios.post(`${isDev ? ENV.BACKEND_URL_DEV : ENV.BACKEND}/api/questionStatus/`, {
        QHID,
        IsDone,
        IsCorrect,
        IsTag,
        THID,
        CID
      },
      {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
    );
      return { message: res.data.message, status: res.status };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const questionStatusSlice = createSlice({
  name: 'questionStatus',
  initialState: {
    loading: false,
    error: null,
    message: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitQuestionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitQuestionStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message || 'Submitted';
        state.statusCode = action.payload.status || 200; // default to 200
      })
      .addCase(submitQuestionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Submission failed';
      });
  },
});

export default questionStatusSlice.reducer;
