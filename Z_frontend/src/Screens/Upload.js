import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadFile } from "../features/uploadSlice"; // ✅ import thunk
import { useNavigate } from "react-router-dom";
import { logout } from "../features/authSlice";

const Upload = () => {
  const { token } = useSelector((state) => state.auth);
  const { responseMsg, status } = useSelector((state) => state.upload);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
      const currentTime = Math.floor(Date.now() / 1000); // current time in seconds
      return payload.exp < currentTime;
    } catch (error) {
      return true; // If decoding fails, treat as expired
    }
  };

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      dispatch(logout());
    } else if (!token) {
      navigate("/login");
    }
  }, [token, dispatch, navigate]);

  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleSend = () => {
    if (!uploadedFile) return;
    dispatch(uploadFile(uploadedFile));
  };

  return (
    <section
      className={`Upload ${dragActive ? "active" : ""}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="upload-box">
        {uploadedFile ? (
          <>
            <p>📄 File: {uploadedFile.name}</p>
            <button onClick={handleSend} disabled={status === "loading"}>
              {status === "loading" ? "Uploading..." : "Send"}
            </button>
          </>
        ) : (
          <p>🚀 Drag & drop your file here</p>
        )}
        {responseMsg && <p>{responseMsg}</p>}
      </div>
    </section>
  );
};

export default Upload;
