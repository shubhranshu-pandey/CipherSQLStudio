import React, { useState } from "react";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import "./SampleDataViewer.scss";

const SampleDataViewer = ({ tables, isLoading }) => {
  const [activeTable, setActiveTable] = useState(0);

  if (isLoading) {
    return (
      <div className="sample-data-viewer">
        <div className="sample-data-viewer__header">
          <h2>Sample Data</h2>
        </div>
        <div className="sample-data-viewer__content">
          <LoadingSpinner size="medium" text="Loading sample data..." />
        </div>
      </div>
    );
  }

  if (!tables || tables.length === 0) {
    return (
      <div className="sample-data-viewer">
        <div className="sample-data-viewer__header">
          <h2>Sample Data</h2>
        </div>
        <div className="sample-data-viewer__content">
          <div className="sample-data-viewer__empty">
            <p>No sample data available</p>
          </div>
        </div>
      </div>
    );
  }

  const currentTable = tables[activeTable];

  return (
    <div className="sample-data-viewer">
      <div className="sample-data-viewer__header">
        <h2>Sample Data</h2>
        {tables.length > 1 && (
          <div className="sample-data-viewer__table-selector">
            <select
              value={activeTable}
              onChange={(e) => setActiveTable(parseInt(e.target.value))}
              className="sample-data-viewer__table-select"
            >
              {tables.map((table, index) => (
                <option key={index} value={index}>
                  {table.tableName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="sample-data-viewer__content">
        {currentTable && (
          <>
            <div className="sample-data-viewer__table-info">
              <h3>{currentTable.tableName}</h3>
              <span className="sample-data-viewer__row-count">
                {currentTable.rowCount} rows total
              </span>
            </div>

            <div className="sample-data-viewer__schema">
              <h4>Schema</h4>
              <div className="sample-data-viewer__schema-table">
                <table>
                  <thead>
                    <tr>
                      <th>Column</th>
                      <th>Type</th>
                      <th>Nullable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTable.schema?.map((column, index) => (
                      <tr key={index}>
                        <td>
                          <code>{column.column_name}</code>
                        </td>
                        <td>
                          <span className="sample-data-viewer__data-type">
                            {column.data_type}
                            {column.character_maximum_length &&
                              `(${column.character_maximum_length})`}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`sample-data-viewer__nullable ${
                              column.is_nullable === "YES"
                                ? "sample-data-viewer__nullable--yes"
                                : "sample-data-viewer__nullable--no"
                            }`}
                          >
                            {column.is_nullable === "YES" ? "Yes" : "No"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {currentTable.sampleRows && currentTable.sampleRows.length > 0 && (
              <div className="sample-data-viewer__sample-rows">
                <h4>Sample Rows</h4>
                <div className="sample-data-viewer__data-table">
                  <table>
                    <thead>
                      <tr>
                        {Object.keys(currentTable.sampleRows[0]).map(
                          (column) => (
                            <th key={column}>{column}</th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {currentTable.sampleRows.map((row, index) => (
                        <tr key={index}>
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex}>
                              {value === null ? (
                                <span className="sample-data-viewer__null-value">
                                  NULL
                                </span>
                              ) : (
                                String(value)
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="sample-data-viewer__sample-note">
                  Showing first {currentTable.sampleRows.length} rows
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SampleDataViewer;
