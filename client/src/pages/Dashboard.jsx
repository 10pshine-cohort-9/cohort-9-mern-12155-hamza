import React from "react";
import useAuthStore from "../store/useAuthStore.js";

const Dashboard = () => {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the protected dashboard!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;
