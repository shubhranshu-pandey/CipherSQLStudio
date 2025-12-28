import React from "react";
import "./QuestionPanel.scss";

const QuestionPanel = ({ assignment }) => {
  if (!assignment) {
    return (
      <div className="question-panel">
        <div className="question-panel__header">
          <h2>Problem Statement</h2>
        </div>
        <div className="question-panel__content">
          <div className="question-panel__loading">
            Loading problem statement...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="question-panel">
      <div className="question-panel__header">
        <h2>Problem Statement</h2>
      </div>

      <div className="question-panel__content">
        <div className="question-panel__section">
          <h3>Description</h3>
          <p className="question-panel__description">
            {assignment.description}
          </p>
        </div>

        <div className="question-panel__section">
          <h3>Problem</h3>
          <div className="question-panel__problem">
            {assignment.problemStatement}
          </div>
        </div>

        {assignment.requirements && assignment.requirements.length > 0 && (
          <div className="question-panel__section">
            <h3>Requirements</h3>
            <ul className="question-panel__requirements">
              {assignment.requirements.map((requirement, index) => (
                <li key={index}>{requirement}</li>
              ))}
            </ul>
          </div>
        )}

        {assignment.constraints && assignment.constraints.length > 0 && (
          <div className="question-panel__section">
            <h3>Constraints</h3>
            <ul className="question-panel__constraints">
              {assignment.constraints.map((constraint, index) => (
                <li key={index}>{constraint}</li>
              ))}
            </ul>
          </div>
        )}

        {assignment.expectedResultStructure && (
          <div className="question-panel__section">
            <h3>Expected Output</h3>
            <div className="question-panel__expected-output">
              {assignment.expectedResultStructure.description && (
                <p>{assignment.expectedResultStructure.description}</p>
              )}
              {assignment.expectedResultStructure.columns &&
                assignment.expectedResultStructure.columns.length > 0 && (
                  <div className="question-panel__expected-columns">
                    <strong>Expected columns:</strong>
                    <ul>
                      {assignment.expectedResultStructure.columns.map(
                        (column, index) => (
                          <li key={index}>
                            <code>{column}</code>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
            </div>
          </div>
        )}

        {assignment.tags && assignment.tags.length > 0 && (
          <div className="question-panel__section">
            <h3>Topics</h3>
            <div className="question-panel__tags">
              {assignment.tags.map((tag, index) => (
                <span key={index} className="question-panel__tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionPanel;
