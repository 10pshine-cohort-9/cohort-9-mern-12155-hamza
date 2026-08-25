import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Auth.css";

const AuthForm = ({
  onSubmit,
  buttonLabel,
  autocompletePassword,
  heading,
  subheading,
  footerText,
  footerLinkText,
  footerLinkTo,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ email, password });
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__side">
        <div className="auth__side-content">
          <div className="auth__side-logo">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <line x1="10" y1="9" x2="8" y2="9" />
            </svg>
            <span>Notes App</span>
          </div>
          <h2 className="auth__side-heading">
            Capture your ideas,<br />organize your thoughts.
          </h2>
          <p className="auth__side-text">
            A beautiful rich-text editor to write, edit, and manage your notes from anywhere.
          </p>
          <div className="auth__side-features">
            <div className="auth__feature">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Rich text editing</span>
            </div>
            <div className="auth__feature">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Secure & private</span>
            </div>
            <div className="auth__feature">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Access from any device</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth__main">
        <form className="auth__form" onSubmit={handleSubmit}>
          <h1 className="auth__heading">{heading}</h1>
          <p className="auth__subheading">{subheading}</p>

          {error && (
            <div className="auth__error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </div>
          )}

          <div className="auth__field">
            <label className="auth__label" htmlFor="auth-email">
              Email address
            </label>
            <div className="auth__input-wrapper">
              <svg className="auth__input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <input
                id="auth-email"
                className="auth__input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="auth__field">
            <label className="auth__label" htmlFor="auth-password">
              Password
            </label>
            <div className="auth__input-wrapper">
              <svg className="auth__input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="auth-password"
                className="auth__input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                autoComplete={autocompletePassword}
              />
              <button
                type="button"
                className="auth__toggle-pw"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth__submit"
            disabled={submitting}
          >
            {submitting ? (
              <span className="auth__submit-loading">
                <span className="auth__submit-spinner" />
                Please wait...
              </span>
            ) : (
              buttonLabel
            )}
          </button>

          <p className="auth__footer">
            {footerText}{" "}
            <Link to={footerLinkTo} className="auth__link">
              {footerLinkText}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
