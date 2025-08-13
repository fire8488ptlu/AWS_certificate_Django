// src/redux/uploadSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import ENV from "../env";

export const uploadFile = createAsyncThunk(
  "upload/file",
  async (file, { rejectWithValue }) => {
    const isDev = ENV.MODE === "dev";
    const accessToken = localStorage.getItem("access");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${
          isDev ? ENV.BACKEND_URL_DEV : ENV.BACKEND
        }/api/question-headerInsert/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data; // success payload
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || "Unknown error"
      );
    }
  }
);

const uploadSlice = createSlice({
  name: "upload",
  initialState: {
    status: "idle", // idle | loading | succeeded | failed
    responseMsg: null,
  },
  reducers: {
    clearUploadStatus: (state) => {
      state.status = "idle";
      state.responseMsg = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadFile.pending, (state) => {
        state.status = "loading";
        state.responseMsg = null;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.responseMsg = `✅ Uploaded: ${
          action.payload.filename || "Success"
        }`;
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.status = "failed";
        state.responseMsg = `❌ Upload failed: ${action.payload}`;
      });
  },
});

export const { clearUploadStatus } = uploadSlice.actions;
export default uploadSlice.reducer;
