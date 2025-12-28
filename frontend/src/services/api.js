import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5002/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add JWT token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const errorMessage =
      error.response?.data?.error ||
      error.message ||
      "An unexpected error occurred";

    // Handle 401 (Unauthorized) - clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only redirect if not already on auth pages
      if (!window.location.pathname.includes("/login") && 
          !window.location.pathname.includes("/signup")) {
        window.location.href = "/login";
      }
    }

    // Log error for debugging
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: errorMessage,
    });

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      details: error.response?.data?.details,
    });
  }
);

// Assignment API
export const assignmentAPI = {
  // Get all assignments
  getAll: (params = {}) => {
    return api.get("/assignments", { params });
  },

  // Get assignment by ID
  getById: (id) => {
    return api.get(`/assignments/${id}`);
  },

  // Get assignments by difficulty
  getByDifficulty: (difficulty) => {
    return api.get(`/assignments/difficulty/${difficulty}`);
  },

  // Get sample data for assignment
  getSampleData: (id) => {
    return api.get(`/assignments/${id}/sample-data`);
  },
};

// Query API
export const queryAPI = {
  // Execute SQL query
  execute: (query, assignmentId) => {
    return api.post("/queries/execute", { query, assignmentId });
  },

  // Validate SQL query
  validate: (query, assignmentId) => {
    return api.post("/queries/validate", { query, assignmentId });
  },

  // Get user attempts for assignment
  getAttempts: (assignmentId, params = {}) => {
    return api.get(`/queries/attempts/${assignmentId}`, { params });
  },
};

// Hint API
export const hintAPI = {
  // Generate hint
  generate: (assignmentId, currentQuery, hintLevel = 1) => {
    return api.post("/hints/generate", {
      assignmentId,
      currentQuery,
      hintLevel,
    });
  },

  // Get predefined hints for assignment
  getAssignmentHints: (assignmentId) => {
    return api.get(`/hints/assignment/${assignmentId}`);
  },

  // Get hint usage statistics
  getUsageStats: (assignmentId) => {
    return api.get(`/hints/usage/${assignmentId}`);
  },
};

// Health check
export const healthAPI = {
  check: () => {
    return api.get("/health");
  },
};

// Auth API
export const authAPI = {
  // Sign up
  signup: (userData) => {
    return api.post("/auth/signup", userData);
  },

  // Login
  login: (email, password) => {
    return api.post("/auth/login", { email, password });
  },

  // Get current user
  getCurrentUser: () => {
    return api.get("/auth/me");
  },
};

// Progress API
export const progressAPI = {
  // Get all progress
  getAll: () => {
    return api.get("/progress");
  },

  // Get progress for specific assignment
  getByAssignment: (assignmentId) => {
    return api.get(`/progress/${assignmentId}`);
  },

  // Get overall statistics
  getStats: () => {
    return api.get("/progress/stats/overview");
  },

  // Update progress
  update: (assignmentId, data) => {
    return api.post(`/progress/${assignmentId}/update`, data);
  },
};

export default api;
