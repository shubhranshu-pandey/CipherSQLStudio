import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Login.scss";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(formData.email, formData.password);

    setIsLoading(false);

    if (result.success) {
      navigate("/");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__container">
        <div className="auth-page__header">
          <h1>Welcome Back</h1>
          <p>Sign in to continue your SQL learning journey</p>
        </div>

        <form className="auth-page__form" onSubmit={handleSubmit}>
          <div className="auth-page__field">
            <label htmlFor="email" className="auth-page__label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="auth-page__input"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your.email@example.com"
            />
          </div>

          <div className="auth-page__field">
            <label htmlFor="password" className="auth-page__label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="auth-page__input"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="auth-page__submit"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-page__footer">
          <p>
            Don't have an account?{" "}
            <Link to="/signup" className="auth-page__link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

