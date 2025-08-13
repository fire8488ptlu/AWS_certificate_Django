import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { convertFile } from "../features/convertSlice"; // ✅ import thunk
import { useNavigate } from "react-router-dom";
import { logout } from "../features/authSlice";
import { fetchCertifiedData } from "../features/certifiedSlice";

const Convert = () => {
  const { token } = useSelector((state) => state.auth);
  const { responseMsg, status } = useSelector((state) => state.convert);
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
  const [convertedFile, setconvertedFile] = useState(null);

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
      setconvertedFile(e.dataTransfer.files[0]);
    }
  }, []);

  const [filters, setFilters] = useState({
    CID: "",
    random: "",
  });

  const { data: certifiedList } = useSelector((state) => state.certified);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSend = async () => {
    if (!convertedFile) return;
    if (!filters.CID) {
      alert("not CID select");
      return;
    }
    // dispatch with one object
    dispatch(
      convertFile({
        file: convertedFile,
        CID: filters.CID,
        random: filters.random, // add if you have it in UI
      })
    );
  };

  useEffect(() => {
    dispatch(fetchCertifiedData());
  }, [dispatch]);

  return (
    <>
      <div className="filter-panel">
        <label>
          CID:
          <select name="CID" value={filters.CID} onChange={handleChange}>
            <option value="">All</option>
            {certifiedList.map((c) => (
              <option key={c.CID} value={c.CID}>
                {`${c.CTitle} (CID:${c.CID})`}
              </option>
            ))}
          </select>
        </label>
      </div>
      <section
        className={`Convert ${dragActive ? "active" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="Convert-box">
          {convertedFile ? (
            <>
              <p>📄 File: {convertedFile.name}</p>
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
    </>
  );
};

export default Convert;
