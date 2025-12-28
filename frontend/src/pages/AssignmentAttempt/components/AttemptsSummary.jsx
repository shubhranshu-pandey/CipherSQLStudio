import React from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaHistory } from "react-icons/fa";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import "./AttemptsSummary.scss";

const AttemptsSummary = ({ attemptsData, isLoading, error, assignmentId }) => {
  if (isLoading) {
    return (
      <div className="attempts-summary">
        <LoadingSpinner size="small" text="Loading..." />
      </div>
    );
  }

  if (error) {
    // Don't show anything if user is not logged in (401)
    if (error.status === 401) {
      return null;
    }
    return null;
  }

  const attempts = attemptsData?.data?.attempts || [];
  const statistics = attemptsData?.data?.statistics || {};

  // If no attempts, don't show the summary
  if (!attempts || attempts.length === 0) {
    return null;
  }

  // Get the latest attempt
  const latestAttempt = attempts[0]; // Attempts are sorted by createdAt descending
  const totalAttempts = statistics.totalAttempts || attempts.length;

  // Get the ordinal suffix (1st, 2nd, 3rd, etc.)
  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };

  const attemptNumber = latestAttempt.attemptNumber || totalAttempts;
  const ordinalSuffix = getOrdinalSuffix(attemptNumber);
  const attemptLabel = `${attemptNumber}${ordinalSuffix}`;

  return (
    <div className="attempts-summary">
      <div className="attempts-summary__info">
        <span className="attempts-summary__label">Latest Attempt:</span>
        <span className="attempts-summary__number">#{attemptLabel}</span>
        {latestAttempt.isCorrect ? (
          <span className="attempts-summary__status attempts-summary__status--correct">
            <FaCheckCircle size={16} />
            Correct
          </span>
        ) : (
          <span className="attempts-summary__status attempts-summary__status--incorrect">
            <FaTimesCircle size={16} />
            Incorrect
          </span>
        )}
      </div>
      <Link
        to={`/assignment/${assignmentId}/attempts`}
        className="attempts-summary__link"
      >
        <FaHistory size={14} />
        Show Attempts
      </Link>
    </div>
  );
};

export default AttemptsSummary;

