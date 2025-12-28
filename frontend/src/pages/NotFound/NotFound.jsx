import React from "react";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import "./NotFound.scss";

const NotFound = () => {
  return (
    <div className="container">
      <div className="not-found">
        <div className="not-found__content">
          <FaSearch className="not-found__icon" size={64} />
          <h1>404 - Page Not Found</h1>
          <p>The page you're looking for doesn't exist or has been moved.</p>
          <div className="not-found__actions">
            <Link
              to="/assignments"
              className="not-found__btn not-found__btn--primary"
            >
              Browse Assignments
            </Link>
            <Link to="/" className="not-found__btn not-found__btn--secondary">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
