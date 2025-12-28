import React, { useRef, useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { FaSun, FaMoon, FaPlay } from "react-icons/fa";
import "./SQLEditor.scss";

const SQLEditor = ({ value, onChange, onExecute, isExecuting }) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get theme preference from localStorage, default to light
    const savedTheme = localStorage.getItem("sqlEditorTheme");
    return savedTheme === "dark";
  });

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure SQL language
    monaco.languages.setLanguageConfiguration("sql", {
      comments: {
        lineComment: "--",
        blockComment: ["/*", "*/"],
      },
      brackets: [
        ["(", ")"],
        ["[", "]"],
      ],
      autoClosingPairs: [
        { open: "(", close: ")" },
        { open: "[", close: "]" },
        { open: "'", close: "'" },
        { open: '"', close: '"' },
      ],
    });

    // Set initial theme
    const theme = isDarkMode ? "vs-dark" : "vs-light";
    monaco.editor.setTheme(theme);

    // Add keyboard shortcut for execution
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (!isExecuting) {
        onExecute();
      }
    });
  };

  // Update theme when isDarkMode changes
  useEffect(() => {
    if (monacoRef.current) {
      const theme = isDarkMode ? "vs-dark" : "vs-light";
      monacoRef.current.editor.setTheme(theme);
    }
  }, [isDarkMode]);

  const handleExecuteClick = () => {
    if (!isExecuting) {
      onExecute();
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("sqlEditorTheme", newTheme ? "dark" : "light");
  };

  return (
    <div className="sql-editor">
      <div className="sql-editor__header">
        <h2>SQL Editor</h2>
        <div className="sql-editor__actions">
          <button
            onClick={toggleTheme}
            className="sql-editor__theme-toggle"
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
          </button>
          <button
            onClick={handleExecuteClick}
            disabled={isExecuting}
            className="sql-editor__execute-btn"
          >
            {isExecuting ? (
              <>
                <span className="sql-editor__spinner"></span>
                Executing...
              </>
            ) : (
              <>
                <FaPlay size={12} />
                Execute Query
              </>
            )}
          </button>
        </div>
      </div>

      <div className="sql-editor__content">
        <Editor
          key={isDarkMode ? "dark" : "light"}
          height="100%"
          defaultLanguage="sql"
          value={value}
          onChange={onChange}
          onMount={handleEditorDidMount}
          theme={isDarkMode ? "vs-dark" : "vs-light"}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: "on",
            contextmenu: true,
            selectOnLineNumbers: true,
            glyphMargin: false,
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            renderLineHighlight: "line",
            scrollbar: {
              vertical: "auto",
              horizontal: "auto",
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
          }}
        />
      </div>

      <div className="sql-editor__footer">
        <span className="sql-editor__hint">
          Press Ctrl+Enter (Cmd+Enter on Mac) to execute query
        </span>
      </div>
    </div>
  );
};

export default SQLEditor;
