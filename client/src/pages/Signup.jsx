import React from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore.js";
import AuthForm from "../components/AuthForm.jsx";

const Signup = () => {
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  const handleSignup = async (credentials) => {
    await register(credentials);
    navigate("/login", { replace: true });
  };

  return (
    <AuthForm
      onSubmit={handleSignup}
      buttonLabel="Create Account"
      autocompletePassword="new-password"
      heading="Create account"
      subheading="Get started with your free account"
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkTo="/login"
    />
  );
};

export default Signup;
