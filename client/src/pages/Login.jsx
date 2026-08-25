import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/useAuthStore.js";
import AuthForm from "../components/AuthForm.jsx";

const Login = () => {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (credentials) => {
    await login(credentials);
    const destination = location.state?.from?.pathname || "/dashboard";
    navigate(destination, { replace: true });
  };

  return (
    <AuthForm
      onSubmit={handleLogin}
      buttonLabel="Sign In"
      autocompletePassword="current-password"
      heading="Welcome back"
      subheading="Sign in to your account to continue"
      footerText="Don't have an account?"
      footerLinkText="Create one"
      footerLinkTo="/signup"
    />
  );
};

export default Login;
