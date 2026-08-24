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
    <div>
      <h1>Signup</h1>
      <AuthForm
        onSubmit={handleSignup}
        buttonLabel="Signup"
        autocompletePassword="new-password"
      />
    </div>
  );
};

export default Signup;
