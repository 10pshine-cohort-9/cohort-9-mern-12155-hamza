import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

let mockIsAuthenticated = false;

jest.mock("../store/useAuthStore.js", () => {
  const store = jest.fn((selector) => {
    const state = {
      isAuthenticated: mockIsAuthenticated,
      user: mockIsAuthenticated ? { id: "1", email: "test@test.com" } : null,
      token: mockIsAuthenticated ? "mock-token" : null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    };
    return selector(state);
  });
  store.getState = () => ({
    isAuthenticated: mockIsAuthenticated,
    token: mockIsAuthenticated ? "mock-token" : null,
    logout: jest.fn(),
  });
  return { __esModule: true, default: store };
});

import ProtectedRoute from "../components/ProtectedRoute.jsx";

const renderWithRouter = (initialRoute = "/dashboard") => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Dashboard Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
};

describe("ProtectedRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to /login when user is not authenticated", () => {
    mockIsAuthenticated = false;
    renderWithRouter("/dashboard");

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard Content")).not.toBeInTheDocument();
  });

  it("renders the child route (Outlet) when user is authenticated", () => {
    mockIsAuthenticated = true;
    renderWithRouter("/dashboard");

    expect(screen.getByText("Dashboard Content")).toBeInTheDocument();
    expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
  });
});
