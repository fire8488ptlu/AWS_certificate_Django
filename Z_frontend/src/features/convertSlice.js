import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import ENV from "../env";

export const convertFile = createAsyncThunk(
  "convert/file",
  //           👇 receive one object
  async ({ file, CID, random }, { rejectWithValue }) => {
    try {
      const isDev = ENV.MODE === "dev";
      const accessToken = localStorage.getItem("access");

      const formData = new FormData();
      formData.append("file", file, file.name);
      if (CID !== undefined && CID !== null)
        formData.append("CID", String(CID));
      if (random !== undefined && random !== null)
        formData.append("random", String(random));

      const response = await axios.post(
        `${isDev ? ENV.BACKEND_URL_DEV : ENV.BACKEND}/api/question-convert/`,
        formData,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          // your API returns a FileResponse -> download blob
          responseType: "blob",
        }
      );

      const cd = response.headers?.["content-disposition"] || "";
      const m = cd.match(/filename="?([^"]+)"?/i);
      const filename = m?.[1] || "output.json";

      // 🔽 side-effect here is OK in a thunk
      const url = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      return { filename };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || "Unknown error"
      );
    }
  }
);

const convertSlice = createSlice({
  name: "convert",
  initialState: {
    status: "idle",
    responseMsg: null,
  },
  reducers: {
    clearConvertStatus: (state) => {
      state.status = "idle";
      state.responseMsg = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(convertFile.pending, (state) => {
        state.status = "loading";
        state.responseMsg = null;
      })
      .addCase(convertFile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.responseMsg = `✅ converted: ${action.payload.filename}`;

        // Trigger download in the reducer? No — do it in the component after dispatch,
        // or use middleware. Reducers must stay pure.
      })
      .addCase(convertFile.rejected, (state, action) => {
        state.status = "failed";
        state.responseMsg = `❌ convert failed: ${action.payload}`;
      });
  },
});

export const { clearConvertStatus } = convertSlice.actions;
export default convertSlice.reducer;
