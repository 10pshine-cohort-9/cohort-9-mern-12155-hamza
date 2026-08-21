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
    <div>
      <h1>Login</h1>
      <AuthForm
        onSubmit={handleLogin}
        buttonLabel="Login"
        autocompletePassword="current-password"
      />
    </div>
  );
};

export default Login;
