import React, { useState } from "react";

const AuthForm = ({ onSubmit, buttonLabel, autocompletePassword }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
    <form onSubmit={handleSubmit}>
      {error && <p role="alert">{error}</p>}
      <label htmlFor="auth-email">Email</label>
      <input
        id="auth-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="Email"
        autoComplete="username"
      />
      <label htmlFor="auth-password">Password</label>
      <input
        id="auth-password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        placeholder="Password"
        autoComplete={autocompletePassword}
      />
      <button type="submit" disabled={submitting}>
        {submitting ? "Please wait..." : buttonLabel}
      </button>
    </form>
  );
};

export default AuthForm;
