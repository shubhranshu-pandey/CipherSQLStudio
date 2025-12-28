import React, { useState } from "react";
import { FaExclamationTriangle, FaLightbulb, FaBullseye, FaRobot, FaFileAlt } from "react-icons/fa";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import "./HintPanel.scss";

const HintPanel = ({
  assignmentId,
  currentQuery,
  onGetHint,
  hintData,
  isGenerating,
  error,
}) => {
  const [selectedLevel, setSelectedLevel] = useState(1);

  const handleGetHint = () => {
    onGetHint(selectedLevel);
  };

  return (
    <div className="hint-panel">
      <div className="hint-panel__header">
        <h2>
          <FaLightbulb style={{ marginRight: "0.5rem", verticalAlign: "middle" }} />
          Hints
        </h2>
        <p>Get strategic guidance without revealing the solution</p>
      </div>

      <div className="hint-panel__content">
        <div className="hint-panel__controls">
          <div className="hint-panel__level-selector">
            <label htmlFor="hint-level">Hint Level:</label>
            <select
              id="hint-level"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(parseInt(e.target.value))}
              className="hint-panel__level-select"
            >
              <option value={1}>Level 1 - General Strategy</option>
              <option value={2}>Level 2 - SQL Concepts</option>
              <option value={3}>Level 3 - Detailed Guidance</option>
            </select>
          </div>

          <button
            onClick={handleGetHint}
            disabled={isGenerating}
            className="hint-panel__get-hint-btn"
          >
            {isGenerating ? (
              <>
                <LoadingSpinner size="small" />
                Generating...
              </>
            ) : (
              "Get Hint"
            )}
          </button>
        </div>

        <div className="hint-panel__result">
          {isGenerating && (
            <div className="hint-panel__loading">
              <LoadingSpinner size="medium" text="Generating hint..." />
            </div>
          )}

          {error && (
            <div className="hint-panel__error">
              <div className="hint-panel__error-header">
                <FaExclamationTriangle className="hint-panel__error-icon" size={24} />
                <h3>Unable to generate hint</h3>
              </div>
              <p>{error.message}</p>
              {error.fallbackHint && (
                <div className="hint-panel__fallback">
                  <strong>Here's a general tip:</strong>
                  <p>{error.fallbackHint}</p>
                </div>
              )}
            </div>
          )}

          {hintData && hintData.success && (
            <div className="hint-panel__hint">
              <div className="hint-panel__hint-header">
                <div className="hint-panel__hint-info">
                  <FaLightbulb className="hint-panel__hint-icon" size={20} />
                  <h3>Level {hintData.data.level} Hint</h3>
                </div>
                <span className="hint-panel__hint-source">
                  {hintData.data.source === "llm" ? (
                    <>
                      <FaRobot style={{ marginRight: "0.25rem" }} />
                      AI Generated
                    </>
                  ) : (
                    <>
                      <FaFileAlt style={{ marginRight: "0.25rem" }} />
                      Predefined
                    </>
                  )}
                </span>
              </div>

              <div className="hint-panel__hint-content">
                {hintData.data.hint}
              </div>

              <div className="hint-panel__hint-footer">
                <span className="hint-panel__hint-timestamp">
                  Generated at{" "}
                  {new Date(hintData.data.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          )}

          {!hintData && !isGenerating && !error && (
            <div className="hint-panel__empty">
              <FaBullseye className="hint-panel__empty-icon" size={48} />
              <h3>Ready to help!</h3>
              <p>
                Select a hint level and click "Get Hint" for guidance on your
                SQL query.
              </p>

              <div className="hint-panel__level-descriptions">
                <div className="hint-panel__level-desc">
                  <strong>Level 1:</strong> High-level strategy and approach
                </div>
                <div className="hint-panel__level-desc">
                  <strong>Level 2:</strong> Specific SQL concepts and clauses
                  needed
                </div>
                <div className="hint-panel__level-desc">
                  <strong>Level 3:</strong> Detailed conceptual guidance
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HintPanel;
