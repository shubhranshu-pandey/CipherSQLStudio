import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Signup.scss";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    const { confirmPassword, ...signupData } = formData;
    const result = await signup(signupData);

    setIsLoading(false);

    if (result.success) {
      navigate("/");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__container">
        <div className="auth-page__header">
          <h1>Create Account</h1>
          <p>Start your SQL learning journey today</p>
        </div>

        <form className="auth-page__form" onSubmit={handleSubmit}>
          <div className="auth-page__field">
            <label htmlFor="username" className="auth-page__label">
              Username *
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="auth-page__input"
              value={formData.username}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={30}
              pattern="[a-zA-Z0-9_]+"
              placeholder="username_123"
            />
            <small className="auth-page__hint">
              Only letters, numbers, and underscores (3-30 characters)
            </small>
          </div>

          <div className="auth-page__field">
            <label htmlFor="email" className="auth-page__label">
              Email *
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

          <div className="auth-page__row">
            <div className="auth-page__field">
              <label htmlFor="firstName" className="auth-page__label">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className="auth-page__input"
                value={formData.firstName}
                onChange={handleChange}
                maxLength={50}
                placeholder="John"
              />
            </div>

            <div className="auth-page__field">
              <label htmlFor="lastName" className="auth-page__label">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className="auth-page__input"
                value={formData.lastName}
                onChange={handleChange}
                maxLength={50}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="auth-page__field">
            <label htmlFor="password" className="auth-page__label">
              Password *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="auth-page__input"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="At least 6 characters"
            />
          </div>

          <div className="auth-page__field">
            <label htmlFor="confirmPassword" className="auth-page__label">
              Confirm Password *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="auth-page__input"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Re-enter your password"
            />
          </div>

          <button
            type="submit"
            className="auth-page__submit"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="auth-page__footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="auth-page__link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

