import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import AssignmentList from "./pages/AssignmentList/AssignmentList";
import AssignmentAttempt from "./pages/AssignmentAttempt/AssignmentAttempt";
import AttemptsHistory from "./pages/AttemptsHistory/AttemptsHistory";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import NotFound from "./pages/NotFound/NotFound";
import { useAuth } from "./contexts/AuthContext";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="container"
        style={{ padding: "2rem", textAlign: "center" }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <div className="app">
      <Header />
      <main className="app__main">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<AssignmentList />} />
          <Route path="/assignments" element={<AssignmentList />} />
          <Route
            path="/assignment/:id"
            element={
              <ProtectedRoute>
                <AssignmentAttempt />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignment/:id/attempts"
            element={
              <ProtectedRoute>
                <AttemptsHistory />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
