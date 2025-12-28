import { useState } from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { assignmentAPI } from "../../services/api";
import DifficultyBadge from "../../components/DifficultyBadge/DifficultyBadge";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import "./AssignmentList.scss";

const AssignmentList = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error, refetch } = useQuery(
    ["assignments", selectedDifficulty, currentPage],
    () =>
      assignmentAPI.getAll({
        difficulty: selectedDifficulty || undefined,
        page: currentPage,
        limit: 12,
      }),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const handleDifficultyFilter = (difficulty) => {
    setSelectedDifficulty(difficulty === selectedDifficulty ? "" : difficulty);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading && !data) {
    return (
      <div className="container">
        <div className="assignment-list__loading">
          <LoadingSpinner size="large" text="Loading assignments..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="assignment-list__error">
          <h2>Unable to load assignments</h2>
          <p>{error.message}</p>
          <button
            onClick={() => refetch()}
            className="assignment-list__retry-btn"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const assignments = data?.data?.assignments || [];
  const pagination = data?.data?.pagination || {};

  return (
    <div className="container">
      <div className="assignment-list">
        <div className="assignment-list__header">
          <div className="assignment-list__title-section">
            <h1>SQL Assignments</h1>
            <p>Practice your SQL skills with hands-on challenges</p>
          </div>

          <div className="assignment-list__filters">
            <div className="assignment-list__filter-group">
              <span className="assignment-list__filter-label">
                Filter by difficulty:
              </span>
              <div className="assignment-list__difficulty-filters">
                {["Easy", "Medium", "Hard"].map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => handleDifficultyFilter(difficulty)}
                    className={`assignment-list__filter-btn ${
                      selectedDifficulty === difficulty
                        ? "assignment-list__filter-btn--active"
                        : ""
                    }`}
                  >
                    <DifficultyBadge difficulty={difficulty} />
                  </button>
                ))}
                {selectedDifficulty && (
                  <button
                    onClick={() => handleDifficultyFilter("")}
                    className="assignment-list__clear-filter"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {assignments.length === 0 ? (
          <div className="assignment-list__empty">
            <h3>No assignments found</h3>
            <p>
              {selectedDifficulty
                ? `No ${selectedDifficulty.toLowerCase()} assignments available.`
                : "No assignments are currently available."}
            </p>
          </div>
        ) : (
          <>
            <div className="assignment-list__grid">
              {assignments.map((assignment) => (
                <AssignmentCard key={assignment._id} assignment={assignment} />
              ))}
            </div>

            {pagination.total > 1 && (
              <Pagination
                current={pagination.current}
                total={pagination.total}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}

        {isLoading && data && (
          <div className="assignment-list__loading-overlay">
            <LoadingSpinner size="medium" />
          </div>
        )}
      </div>
    </div>
  );
};

const AssignmentCard = ({ assignment }) => {
  return (
    <Link to={`/assignment/${assignment._id}`} className="assignment-card">
      <div className="assignment-card__header">
        <h3 className="assignment-card__title">{assignment.title}</h3>
        <DifficultyBadge difficulty={assignment.difficulty} />
      </div>

      <p className="assignment-card__description">{assignment.description}</p>

      <div className="assignment-card__footer">
        <div className="assignment-card__tags">
          {assignment.tags?.slice(0, 3).map((tag, index) => (
            <span key={index} className="assignment-card__tag">
              {tag}
            </span>
          ))}
          {assignment.tags?.length > 3 && (
            <span className="assignment-card__tag assignment-card__tag--more">
              +{assignment.tags.length - 3} more
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

const Pagination = ({ current, total, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    let start = Math.max(1, current - Math.floor(showPages / 2));
    let end = Math.min(total, start + showPages - 1);

    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(current - 1)}
        disabled={current === 1}
        className="pagination__btn pagination__btn--prev"
      >
        Previous
      </button>

      <div className="pagination__numbers">
        {current > 3 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="pagination__number"
            >
              1
            </button>
            {current > 4 && <span className="pagination__ellipsis">...</span>}
          </>
        )}

        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`pagination__number ${
              page === current ? "pagination__number--active" : ""
            }`}
          >
            {page}
          </button>
        ))}

        {current < total - 2 && (
          <>
            {current < total - 3 && (
              <span className="pagination__ellipsis">...</span>
            )}
            <button
              onClick={() => onPageChange(total)}
              className="pagination__number"
            >
              {total}
            </button>
          </>
        )}
      </div>

      <button
        onClick={() => onPageChange(current + 1)}
        disabled={current === total}
        className="pagination__btn pagination__btn--next"
      >
        Next
      </button>
    </div>
  );
};

export default AssignmentList;
