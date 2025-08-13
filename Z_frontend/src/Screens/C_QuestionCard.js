import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitQuestionRecord } from '../features/questionRecordSlice'; // ✅ import it
import { submitQuestionStatus } from '../features/questionStatusSlice'; // ✅ import it
import { fetchQuestionHistory } from '../features/questionHistorySlice'; // ✅

const C_QuestionCard = ({ item, collapsed, toggleCollapse }) => {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const history = useSelector((state) => state.history.data[item.QHID] || []);

  const { data: thList } = useSelector((state) => state.tagHeader);
  const { data: certifiedList } = useSelector((state) => state.certified);

  const [filterValues, setFilterValues] = useState({
    QHID: item.QHID?.toString() || "",
    IsDone: item.IsDone?.toString() || "",
    IsCorrect: item.IsCorrect?.toString() || "",
    IsTag: item.IsTag?.toString() || "",
    THID: item.THID?.toString() || "",
    CID: item.CID?.toString() || "",
  });

  const [updateStatus, setUpdateStatus] = useState(null);  // { success: true|false, statusCode: number }
  const [lastSubmittedQHID, setLastSubmittedQHID] = useState(null);  // tracks which card just submitted




  const handleFilterChange = (e) => {
  const { name, value } = e.target;
  setFilterValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };



  const handleChange = (qcid) => {
    setSelected(item.QHMultiple
      ? selected.includes(qcid) ? selected.filter(id => id !== qcid) : [...selected, qcid]
      : [qcid]);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const correctIds = item.OptionList.filter((opt) => opt.QCIsCorrect).map((opt) => opt.QCID);
    const isCorrect =
      correctIds.length === selected.length &&
      correctIds.every((id) => selected.includes(id));
    setResult(isCorrect);
  
    // Send to backend
    dispatch(submitQuestionRecord({
      QHID: item.QHID,
      QCID: selected,
      IsCorrect: isCorrect ? 1 : 0,
    }));
  };

  const handleSubmit2 = async () => {
    try {
      const result = await dispatch(submitQuestionStatus(filterValues)).unwrap();
      setLastSubmittedQHID(item.QHID);  // set current QHID
      setUpdateStatus({ success: true, statusCode: 200 });
    } catch (error) {
      const code = error?.response?.status || 400;
      setLastSubmittedQHID(item.QHID);
      setUpdateStatus({ success: false, statusCode: code });
    }
  };


  const handleShowHistory = () => {
    dispatch(fetchQuestionHistory(item.QHID));
    setShowHistory((prev) => !prev);
  };

  return (
    <div className="question-card">
      
      <p className="question-title"><strong>QHID {item.QHID}</strong></p>
      <p><strong>Title:</strong> {item.QHTitle}</p>

      <div className="options">
        <strong>Options:</strong>
        {item.OptionList.map((opt, i) => (
          <label key={i} className={`option ${submitted ? (opt.QCIsCorrect ? 'correct' : 'wrong') : ''}`}>
            <input
              type="checkbox"
              disabled={submitted}
              checked={selected.includes(opt.QCID)}
              onChange={() => handleChange(opt.QCID)}
            />
            <span className="icon">{submitted ? (opt.QCIsCorrect ? '✅' : '❌') : ''}</span>
            {opt.QCTitle}
          </label>
        ))}
      </div>

      {!submitted && (
        <button className="submit-btn" onClick={handleSubmit}>✅ Submit Answer</button>
      )}

      {submitted && (
        <p className="answer-result" style={{ fontWeight: 'bold', color: result ? 'green' : 'red' }}>
          {result ? '✅ You are correct!' : '❌ Incorrect, try reviewing the explanation.'}
        </p>
      )}

      <p><strong>Correct:</strong> {item.IsCorrect ? '✅' : '❌'}</p>
      <p><strong>Tag:</strong> {item.IsTag ? '✅' : '❌'}</p>
      <p><strong>Multiple Choice:</strong> {item.QHMultiple ? 'Yes' : 'No'}</p>

      <button className="collapse-toggle" onClick={() => toggleCollapse(item.QHID)}>
        {collapsed[item.QHID] ? '➖ Hide Details' : '➕ Show Details'}
      </button>

      {collapsed[item.QHID] && (
        <div className="collapse-box">
          <p><strong>Explain:</strong> {item.Explain}</p>
          <p><strong>Created:</strong> {item.CreDateTime}</p>
        </div>
      )}

      <button className="history-btn" onClick={handleShowHistory}>
        {showHistory ? '📉 Hide History' : '📈 Show History'}
      </button>

      {showHistory && (
        <div className="history-box">
          {history.length === 0 ? (
            <p>No history found.</p>
          ) : (
            history.map((h, idx) => (
              <div key={idx} className="history-record">
                <p><strong>🕓 {h.CreDateTime}</strong></p>
                <p><strong>Result:</strong> {h.IsCorrect ? '✅ Correct' : '❌ Incorrect'}</p>
                <p><strong>Answer:</strong> {h.OptionList}</p>
              </div>
            ))
          )}
        </div>
      )}

      <div className="filter-panel">
        <label>
          IsDone:
          <select name="IsDone" value={filterValues.IsDone} onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="1">✅</option>
            <option value="0">❌</option>
          </select>
        </label>

        <label>
          IsCorrect:
          <select name="IsCorrect" value={filterValues.IsCorrect} onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="1">✅</option>
            <option value="0">❌</option>
          </select>
        </label>

        <label>
          IsTag:
          <select name="IsTag" value={filterValues.IsTag} onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="1">✅</option>
            <option value="0">❌</option>
          </select>
        </label>

        <label>
          THID:
          <select name="THID" value={filterValues.THID} onChange={handleFilterChange}>
      
            {thList.map((th) => (
              <option key={th.THID} value={th.THID}>
                {`${th.TagTitle} (THID:${th.THID})`}
              </option>
            ))}
          </select>
        </label>

        <label>
          CID:
          <select name="CID" value={filterValues.CID} onChange={handleFilterChange}>
            {certifiedList.map((c) => (
              <option key={c.CID} value={c.CID}>
                {`${c.CTitle} (CID:${c.CID})`}
              </option>
            ))}
          </select>
        </label>

        <button onClick={handleSubmit2}> Update</button>
        {updateStatus && lastSubmittedQHID === item.QHID && (
          <div style={{ marginTop: "10px", fontWeight: "bold", color: updateStatus.success ? 'green' : 'red' }}>
            Server Response: {updateStatus.success ? '✅ Success' : `❌ Error (${updateStatus.statusCode})`}
          </div>
        )}

      </div>

    </div>
  );
};

export default C_QuestionCard;
