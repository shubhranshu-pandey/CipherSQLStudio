import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Header.scss";

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header__content">
          <Link to="/" className="header__logo">
            <div className="header__logo-icon">
              <img
                src="/CSlogo.png"
                alt="CipherSQLStudio"
                className="header__logo-image"
              />
            </div>
            <span className="header__logo-text">CipherSQLStudio</span>
          </Link>

          <div className="header__auth">
            {isAuthenticated ? (
              <>
                <span className="header__user">
                  {user?.firstName || user?.username || "User"}
                </span>
                <button onClick={handleLogout} className="header__logout-btn">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="header__auth-link">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="header__auth-link header__auth-link--primary"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
