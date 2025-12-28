import React from "react";
import classNames from "classnames";
import "./LoadingSpinner.scss";

const LoadingSpinner = ({ size = "medium", className, text }) => {
  const spinnerClass = classNames(
    "loading-spinner",
    `loading-spinner--${size}`,
    className
  );

  return (
    <div className="loading-spinner-container">
      <div className={spinnerClass}>
        <div className="loading-spinner__circle"></div>
      </div>
      {text && <p className="loading-spinner__text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
