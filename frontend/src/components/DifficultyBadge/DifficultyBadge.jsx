import React from "react";
import classNames from "classnames";
import "./DifficultyBadge.scss";

const DifficultyBadge = ({ difficulty, className }) => {
  const badgeClass = classNames(
    "difficulty-badge",
    `difficulty-badge--${difficulty.toLowerCase()}`,
    className
  );

  return <span className={badgeClass}>{difficulty}</span>;
};

export default DifficultyBadge;
