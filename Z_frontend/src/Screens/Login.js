import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../features/authSlice";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ username: "", password: "" });

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
    if (token && !isTokenExpired(token)) {
      navigate("/show");
    }
  }, [token, navigate, dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (result.meta.requestStatus === "fulfilled") {
      navigate("/show");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="username"
            onChange={handleChange}
            placeholder="Username"
          />
          <input
            name="password"
            type="password"
            onChange={handleChange}
            placeholder="Password"
          />
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          {error && <p>{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
