import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchQuestionHeaderData } from "../features/questionHeaderSlice";
import { fetchTagHeaderData } from "../features/tagHeaderSlice";
import { fetchCertifiedData } from "../features/certifiedSlice";
import { logout } from "../features/authSlice"; // 👈 make sure this is correctly imported

import QuestionList from "./QuestionList";
import { useNavigate } from "react-router-dom";

const Show = () => {
  const { token } = useSelector((state) => state.auth);
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

  const [filters, setFilters] = useState({
    IsDone: "",
    IsCorrect: "",
    IsTag: "",
    THID: "",
    CID: "",
  });

  //   const { data: questionHeaders, loading } = useSelector((state) => state.questionHeader);
  const { data: thList } = useSelector((state) => state.tagHeader);
  const { data: certifiedList } = useSelector((state) => state.certified);

  //   const [collapsed, setCollapsed] = useState({});
  //   const toggleCollapse = (qhid) => {
  //     setCollapsed((prev) => ({
  //       ...prev,
  //       [qhid]: !prev[qhid],
  //     }));
  //   };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilter = () => {
    dispatch(fetchQuestionHeaderData(filters));
  };

  useEffect(() => {
    //dispatch(fetchQuestionHeaderData(filters));
    dispatch(fetchTagHeaderData());
    dispatch(fetchCertifiedData());
  }, [dispatch]);

  //   if (loading) return <p className="loading">Loading...</p>;

  return (
    <div className="show-container">
      <h2 className="title">Question Header + Choose</h2>

      <div className="filter-panel">
        <label>
          IsDone:
          <select name="IsDone" value={filters.IsDone} onChange={handleChange}>
            <option value="">All</option>
            <option value="1">✅</option>
            <option value="0">❌</option>
          </select>
        </label>

        <label>
          IsCorrect:
          <select
            name="IsCorrect"
            value={filters.IsCorrect}
            onChange={handleChange}
          >
            <option value="">All</option>
            <option value="1">✅</option>
            <option value="0">❌</option>
          </select>
        </label>

        <label>
          IsTag:
          <select name="IsTag" value={filters.IsTag} onChange={handleChange}>
            <option value="">All</option>
            <option value="1">✅</option>
            <option value="0">❌</option>
          </select>
        </label>

        <label>
          THID:
          <select name="THID" value={filters.THID} onChange={handleChange}>
            <option value="">All</option>
            {thList.map((th) => (
              <option key={th.THID} value={th.THID}>
                {`${th.TagTitle} (THID:${th.THID})`}
              </option>
            ))}
          </select>
        </label>

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

        <button onClick={handleFilter}>🔍 Filter</button>
      </div>

      <QuestionList />

      {/* {questionHeaders.map((item, index) => (
            <C_QuestionCard
            key={index}
            item={item}
            collapsed={collapsed}
            toggleCollapse={toggleCollapse}
            />
        ))} */}
    </div>
  );
};

export default Show;
