import React, { useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "react-query";
import { toast } from "react-hot-toast";
import { assignmentAPI, queryAPI, hintAPI } from "../../services/api";
import DifficultyBadge from "../../components/DifficultyBadge/DifficultyBadge";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import QuestionPanel from "./components/QuestionPanel";
import SampleDataViewer from "./components/SampleDataViewer";
import SQLEditor from "./components/SQLEditor";
import ResultsPanel from "./components/ResultsPanel";
import HintPanel from "./components/HintPanel";
import AttemptsSummary from "./components/AttemptsSummary";
import "./AssignmentAttempt.scss";

const AssignmentAttempt = () => {
  const { id } = useParams();
  const [sqlQuery, setSqlQuery] = useState("");
  const [queryResult, setQueryResult] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showHints, setShowHints] = useState(false);

  // Fetch assignment data
  const {
    data: assignmentData,
    isLoading: assignmentLoading,
    error: assignmentError,
  } = useQuery(["assignment", id], () => assignmentAPI.getById(id), {
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch sample data
  const { data: sampleData, isLoading: sampleLoading } = useQuery(
    ["sampleData", id],
    () => assignmentAPI.getSampleData(id),
    {
      enabled: !!id,
      staleTime: 15 * 60 * 1000, // 15 minutes
    }
  );

  // Fetch user attempts for this assignment
  const {
    data: attemptsData,
    isLoading: attemptsLoading,
    error: attemptsError,
    refetch: refetchAttempts,
  } = useQuery(
    ["attempts", id],
    () => queryAPI.getAttempts(id, { limit: 20 }),
    {
      enabled: !!id,
      staleTime: 30 * 1000, // 30 seconds
      retry: false, // Don't retry if user is not logged in
      // Don't show error toast for 401 (user not logged in)
      onError: (error) => {
        if (error.status !== 401) {
          console.error("Failed to load attempts:", error);
        }
      },
    }
  );

  // Execute query mutation
  const executeQueryMutation = useMutation(
    ({ query, assignmentId }) => queryAPI.execute(query, assignmentId),
    {
      onMutate: () => {
        setIsExecuting(true);
        setQueryResult(null);
      },
      onSuccess: (data) => {
        setQueryResult({
          success: true,
          data: data.data,
        });
        toast.success(
          `Query executed successfully! ${data.data.rowCount} rows returned.`
        );
        // Refetch attempts to show the new attempt
        refetchAttempts();
      },
      onError: (error) => {
        console.error("Query execution error:", error);
        setQueryResult({
          success: false,
          error: {
            message: error.message || "Query execution failed",
            details: error.details,
          },
        });
        toast.error(error.message || "Query execution failed");
        // Refetch attempts to show the failed attempt
        refetchAttempts();
      },
      onSettled: () => {
        setIsExecuting(false);
      },
    }
  );

  // Generate hint mutation
  const generateHintMutation = useMutation(
    ({ assignmentId, currentQuery, hintLevel }) =>
      hintAPI.generate(assignmentId, currentQuery, hintLevel),
    {
      onSuccess: () => {
        toast.success("Hint generated!");
      },
      onError: (error) => {
        toast.error(`Failed to generate hint: ${error.message}`);
      },
    }
  );

  const handleExecuteQuery = useCallback(() => {
    if (!sqlQuery.trim()) {
      toast.error("Please enter a SQL query");
      return;
    }

    if (!id) {
      toast.error("Assignment ID is missing");
      return;
    }

    executeQueryMutation.mutate({
      query: sqlQuery.trim(),
      assignmentId: id,
    });
  }, [sqlQuery, id, executeQueryMutation]);

  const handleGetHint = useCallback(
    (hintLevel = 1) => {
      if (!id) {
        toast.error("Assignment ID is missing");
        return;
      }

      generateHintMutation.mutate({
        assignmentId: id,
        currentQuery: sqlQuery.trim(),
        hintLevel,
      });
    },
    [id, sqlQuery, generateHintMutation]
  );

  const handleQueryChange = useCallback((value) => {
    setSqlQuery(value);
  }, []);

  if (assignmentLoading) {
    return <LoadingSpinner size="large" text="Loading assignment..." />;
  }

  if (assignmentError) {
    return (
      <div className="container">
        <div className="assignment-attempt__error">
          <h2>Assignment not found</h2>
          <p>{assignmentError.message}</p>
          <Link to="/assignments" className="assignment-attempt__back-btn">
            Back to Assignments
          </Link>
        </div>
      </div>
    );
  }

  const assignment = assignmentData?.data;
  const tables = sampleData?.data?.tables || [];

  return (
    <div className="assignment-attempt">
      <div className="container">
        {/* Header */}
        <div className="assignment-attempt__header">
          <div className="assignment-attempt__breadcrumb">
            <Link to="/assignments">Assignments</Link>
            <span className="assignment-attempt__breadcrumb-separator">›</span>
            <span>{assignment?.title}</span>
          </div>

          <div className="assignment-attempt__title-section">
            <div className="assignment-attempt__title-row">
              <h1>{assignment?.title}</h1>
              <DifficultyBadge difficulty={assignment?.difficulty} />
            </div>

            <div className="assignment-attempt__actions">
              <button
                onClick={() => setShowHints(!showHints)}
                className="assignment-attempt__hint-toggle"
              >
                {showHints ? "Hide Hints" : "Show Hints"}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="assignment-attempt__content">
          {/* Left Column - Question & Sample Data */}
          <div className="assignment-attempt__left-column">
            <QuestionPanel assignment={assignment} />
            <SampleDataViewer tables={tables} isLoading={sampleLoading} />
            <AttemptsSummary
              attemptsData={attemptsData}
              isLoading={attemptsLoading}
              error={attemptsError}
              assignmentId={id}
            />
          </div>

          {/* Right Column - Editor & Results */}
          <div className="assignment-attempt__right-column">
            <div className="assignment-attempt__editor-section">
              <SQLEditor
                value={sqlQuery}
                onChange={handleQueryChange}
                onExecute={handleExecuteQuery}
                isExecuting={isExecuting}
              />
            </div>

            <div className="assignment-attempt__results-section">
              <ResultsPanel result={queryResult} isExecuting={isExecuting} />
            </div>
          </div>
        </div>

        {/* Hints Panel */}
        {showHints && (
          <div className="assignment-attempt__hints">
            <HintPanel
              assignmentId={id}
              currentQuery={sqlQuery}
              onGetHint={handleGetHint}
              hintData={generateHintMutation.data}
              isGenerating={generateHintMutation.isLoading}
              error={generateHintMutation.error}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentAttempt;
