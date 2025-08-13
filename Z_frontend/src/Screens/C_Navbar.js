import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/authSlice"; // 👈 make sure this is correctly imported

const C_Navbar = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout()); // Clear Redux state       // Optional: clear all localStorage
    navigate("/login"); // Redirect to login or homepage
  };

  if (!user) return null; // 👈 Don't show navbar if not logged in

  return (
    <nav className="navbar">
      <div className="navbar__logo">CertificateTraning</div>

      <ul className="navbar__links">
        <li>
          <Link to="/show">Home</Link>
        </li>
        <li>
          <Link to="/upload">Upload</Link>
        </li>
        <li>
          <Link to="/convert">Convert_Udemy</Link>
        </li>
      </ul>

      <div className="navbar__user">
        <span>👤 {user.username}</span>
        <button onClick={handleLogout} className="navbar__logout">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default C_Navbar;
