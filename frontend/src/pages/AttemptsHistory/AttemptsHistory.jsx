import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "react-query";
import { queryAPI, assignmentAPI } from "../../services/api";
import { FaCheckCircle, FaTimesCircle, FaClock, FaCode, FaArrowLeft } from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import DifficultyBadge from "../../components/DifficultyBadge/DifficultyBadge";
import "./AttemptsHistory.scss";

const AttemptsHistory = () => {
  const { id } = useParams();

  // Fetch assignment data
  const {
    data: assignmentData,
    isLoading: assignmentLoading,
    error: assignmentError,
  } = useQuery(["assignment", id], () => assignmentAPI.getById(id), {
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

  // Fetch user attempts
  const {
    data: attemptsData,
    isLoading: attemptsLoading,
    error: attemptsError,
  } = useQuery(
    ["attempts", id],
    () => queryAPI.getAttempts(id, { limit: 100 }),
    {
      enabled: !!id,
      staleTime: 30 * 1000,
      retry: false,
    }
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatExecutionTime = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };

  if (assignmentLoading || attemptsLoading) {
    return <LoadingSpinner size="large" text="Loading attempts..." />;
  }

  if (assignmentError) {
    return (
      <div className="container">
        <div className="attempts-history__error">
          <h2>Assignment not found</h2>
          <p>{assignmentError.message}</p>
          <Link to="/assignments" className="attempts-history__back-btn">
            Back to Assignments
          </Link>
        </div>
      </div>
    );
  }

  if (attemptsError) {
    return (
      <div className="container">
        <div className="attempts-history__error">
          <h2>Unable to load attempts</h2>
          <p>
            {attemptsError.status === 401
              ? "Please login to view your attempts"
              : attemptsError.message || "Failed to load attempts"}
          </p>
          <Link to={`/assignment/${id}`} className="attempts-history__back-btn">
            Back to Assignment
          </Link>
        </div>
      </div>
    );
  }

  const assignment = assignmentData?.data;
  const attempts = attemptsData?.data?.attempts || [];
  const statistics = attemptsData?.data?.statistics || {};

  return (
    <div className="attempts-history">
      <div className="container">
        {/* Header */}
        <div className="attempts-history__header">
          <Link to={`/assignment/${id}`} className="attempts-history__back-link">
            <FaArrowLeft size={16} />
            Back to Assignment
          </Link>

          <div className="attempts-history__title-section">
            <div className="attempts-history__title-row">
              <h1>{assignment?.title || "Attempts History"}</h1>
              {assignment?.difficulty && (
                <DifficultyBadge difficulty={assignment.difficulty} />
              )}
            </div>
            <p className="attempts-history__subtitle">Your SQL query attempts</p>
          </div>

          {statistics.totalAttempts > 0 && (
            <div className="attempts-history__stats">
              <div className="attempts-history__stat-card">
                <span className="attempts-history__stat-label">Total Attempts</span>
                <span className="attempts-history__stat-value">
                  {statistics.totalAttempts}
                </span>
              </div>
              <div className="attempts-history__stat-card">
                <span className="attempts-history__stat-label">Correct</span>
                <span className="attempts-history__stat-value attempts-history__stat-value--success">
                  {statistics.successfulAttempts || 0}
                </span>
              </div>
              {statistics.bestExecutionTime && (
                <div className="attempts-history__stat-card">
                  <span className="attempts-history__stat-label">Best Time</span>
                  <span className="attempts-history__stat-value">
                    {formatExecutionTime(statistics.bestExecutionTime)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Attempts List */}
        <div className="attempts-history__content">
          {attempts.length === 0 ? (
            <div className="attempts-history__empty">
              <FaCode size={64} className="attempts-history__empty-icon" />
              <h3>No attempts yet</h3>
              <p>Start solving the assignment to see your attempts here</p>
              <Link to={`/assignment/${id}`} className="attempts-history__start-btn">
                Start Assignment
              </Link>
            </div>
          ) : (
            <div className="attempts-history__list">
              {attempts.map((attempt) => {
                const ordinalSuffix = getOrdinalSuffix(attempt.attemptNumber);
                const attemptLabel = `${attempt.attemptNumber}${ordinalSuffix}`;

                return (
                  <div
                    key={attempt._id || attempt.attemptNumber}
                    className={`attempts-history__attempt ${
                      attempt.isCorrect
                        ? "attempts-history__attempt--success"
                        : "attempts-history__attempt--error"
                    }`}
                  >
                    <div className="attempts-history__attempt-header">
                      <div className="attempts-history__attempt-info">
                        <span className="attempts-history__attempt-number">
                          Attempt #{attemptLabel}
                        </span>
                        <span className="attempts-history__attempt-date">
                          {formatDate(attempt.createdAt)}
                        </span>
                      </div>
                      <div className="attempts-history__attempt-status">
                        {attempt.isCorrect ? (
                          <span className="attempts-history__status-badge attempts-history__status-badge--success">
                            <FaCheckCircle size={18} />
                            Correct
                          </span>
                        ) : (
                          <span className="attempts-history__status-badge attempts-history__status-badge--error">
                            <FaTimesCircle size={18} />
                            Incorrect
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="attempts-history__attempt-meta">
                      <div className="attempts-history__meta-item">
                        <FaClock size={14} />
                        <span>{formatExecutionTime(attempt.executionTime)}</span>
                      </div>
                      {attempt.resultRows !== null &&
                        attempt.resultRows !== undefined && (
                          <div className="attempts-history__meta-item">
                            <span>
                              {attempt.resultRows} row
                              {attempt.resultRows !== 1 ? "s" : ""}
                            </span>
                          </div>
                        )}
                    </div>

                    <div className="attempts-history__attempt-query">
                      <div className="attempts-history__query-header">
                        <span className="attempts-history__query-label">SQL Query:</span>
                      </div>
                      <pre>{attempt.sqlQuery}</pre>
                    </div>

                    {attempt.errorMessage && (
                      <div className="attempts-history__attempt-error">
                        <strong>Error:</strong> {attempt.errorMessage}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttemptsHistory;

