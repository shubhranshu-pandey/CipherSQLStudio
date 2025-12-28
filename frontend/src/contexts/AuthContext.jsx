import React, { createContext, useState, useEffect, useContext } from "react";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          // Verify token is still valid
          const response = await authAPI.getCurrentUser();
          setUser(response.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { user: userData, token } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);

      toast.success("Login successful!");
      return { success: true };
    } catch (error) {
      toast.error(error.message || "Login failed");
      return { success: false, error: error.message };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      const { user: newUser, token } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
      setIsAuthenticated(true);

      toast.success("Account created successfully!");
      return { success: true };
    } catch (error) {
      const errorMessage = error.details
        ? error.details.map((d) => d.msg).join(", ")
        : error.message || "Signup failed";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    toast.success("Logged out successfully");
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

