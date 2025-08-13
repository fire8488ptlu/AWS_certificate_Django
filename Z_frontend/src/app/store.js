import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer, { logout } from "../features/authSlice";
import questionHeaderReducer from "../features/questionHeaderSlice";
import tagHeaderReducer from "../features/tagHeaderSlice";
import certifiedReducer from "../features/certifiedSlice";
import questionRecordReducer from "../features/questionRecordSlice";
import questionHistoryReducer from "../features/questionHistorySlice";
import questionStatusReducer from "../features/questionStatusSlice";
import uploadReducer from "../features/uploadSlice";
import convertReducer from "../features/convertSlice";

// when logout clearn all state , not only for authSlice
const appReducer = combineReducers({
  auth: authReducer,
  questionHeader: questionHeaderReducer,
  tagHeader: tagHeaderReducer,
  certified: certifiedReducer,
  questionRecord: questionRecordReducer,
  history: questionHistoryReducer,
  questionStatus: questionStatusReducer,
  upload: uploadReducer,
  convert: convertReducer,
});

const rootReducer = (state, action) => {
  if (action.type === logout.type) {
    // Global wipe of Redux state on logout
    try {
      localStorage.clear();
    } catch (e) {}
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});
