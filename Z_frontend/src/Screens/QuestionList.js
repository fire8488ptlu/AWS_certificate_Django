// src/components/QuestionList.js
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import C_QuestionCard from './C_QuestionCard';

const QuestionList = () => {
  const { data: questionHeaders, loading } = useSelector((state) => state.questionHeader);
  const [collapsed, setCollapsed] = useState({});

  const toggleCollapse = (qhid) => {
    setCollapsed((prev) => ({
      ...prev,
      [qhid]: !prev[qhid],
    }));
  };

  if (loading) return <p className="loading">Loading...</p>;

  return (
    <>
      {questionHeaders.map((item, index) => (
        <C_QuestionCard
          key={index}
          item={item}
          collapsed={collapsed}
          toggleCollapse={toggleCollapse}
        />
      ))}
    </>
  );
};

export default QuestionList;
