import React from "react";
import { FaChartBar, FaTimesCircle, FaCheckCircle } from "react-icons/fa";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import "./ResultsPanel.scss";

const ResultsPanel = ({ result, isExecuting }) => {
  const renderContent = () => {
    if (isExecuting) {
      return (
        <div className="results-panel__loading">
          <LoadingSpinner size="medium" text="Executing query..." />
        </div>
      );
    }

    if (!result) {
      return (
        <div className="results-panel__empty">
          <FaChartBar className="results-panel__empty-icon" size={48} />
          <h3>Ready to execute</h3>
          <p>Write your SQL query and click "Execute Query" to see results</p>
        </div>
      );
    }

    if (!result.success) {
      return (
        <div className="results-panel__error">
          <div className="results-panel__error-header">
            <FaTimesCircle className="results-panel__error-icon" size={24} />
            <h3>Query Error</h3>
          </div>
          <div className="results-panel__error-message">
            {result.error.message}
          </div>
          {result.error.details && (
            <div className="results-panel__error-details">
              <strong>Details:</strong>
              <pre>{JSON.stringify(result.error.details, null, 2)}</pre>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="results-panel__success">
        <div className="results-panel__success-header">
          <div className="results-panel__success-info">
            <FaCheckCircle className="results-panel__success-icon" size={24} />
            <h3>Query Results</h3>
          </div>
          <div className="results-panel__stats">
            <span className="results-panel__stat">
              {result.data.rowCount} rows
            </span>
            <span className="results-panel__stat">
              {result.data.executionTime}ms
            </span>
          </div>
        </div>

        {result.data.rows && result.data.rows.length > 0 ? (
          <ResultsTable data={result.data} />
        ) : (
          <div className="results-panel__no-data">
            <p>Query executed successfully but returned no rows.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="results-panel">
      <div className="results-panel__header">
        <h2>Results</h2>
      </div>

      <div className="results-panel__content">{renderContent()}</div>
    </div>
  );
};

const ResultsTable = ({ data }) => {
  if (!data.rows || data.rows.length === 0) {
    return null;
  }

  const columns = Object.keys(data.rows[0]);

  return (
    <div className="results-table">
      <div className="results-table__wrapper">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column}>
                    {row[column] === null ? (
                      <span className="results-table__null">NULL</span>
                    ) : (
                      String(row[column])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsPanel;
