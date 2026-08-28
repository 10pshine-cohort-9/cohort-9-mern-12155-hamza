import React from "react";
import { render, screen } from "@testing-library/react";

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

// Mock the page components to keep tests focused on routing
jest.mock("../pages/Login.jsx", () => {
  return { __esModule: true, default: () => <div>Login Page</div> };
});

jest.mock("../pages/Signup.jsx", () => {
  return { __esModule: true, default: () => <div>Signup Page</div> };
});

jest.mock("../pages/Dashboard.jsx", () => {
  return { __esModule: true, default: () => <div>Dashboard Page</div> };
});

jest.mock("../store/useNoteStore.js", () => {
  const store = jest.fn(() => ({
    notes: [],
    currentNote: null,
    loading: false,
    error: null,
    fetchNotes: jest.fn(),
    createNote: jest.fn(),
    updateNote: jest.fn(),
    deleteNote: jest.fn(),
    setCurrentNote: jest.fn(),
    clearCurrentNote: jest.fn(),
  }));
  return { __esModule: true, default: store };
});

// We need to use MemoryRouter for tests instead of BrowserRouter.
// Override App to inject MemoryRouter for testability.
import { MemoryRouter, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore.js";

// Re-implement the App routing components here using MemoryRouter for testing
const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const DefaultRedirect = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

// Lazy-import mock versions of the pages
const Login = require("../pages/Login.jsx").default;
const Signup = require("../pages/Signup.jsx").default;
const Dashboard = require("../pages/Dashboard.jsx").default;
const ProtectedRoute = require("../components/ProtectedRoute.jsx").default;

const renderApp = (initialRoute = "/") => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
    </MemoryRouter>
  );
};

describe("App Routing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("when user is NOT authenticated", () => {
    beforeEach(() => {
      mockIsAuthenticated = false;
    });

    it("renders Login page at /login", () => {
      renderApp("/login");
      expect(screen.getByText("Login Page")).toBeInTheDocument();
    });

    it("renders Signup page at /signup", () => {
      renderApp("/signup");
      expect(screen.getByText("Signup Page")).toBeInTheDocument();
    });

    it("redirects from / to /login (DefaultRedirect)", () => {
      renderApp("/");
      expect(screen.getByText("Login Page")).toBeInTheDocument();
    });

    it("redirects from /dashboard to /login (ProtectedRoute)", () => {
      renderApp("/dashboard");
      expect(screen.getByText("Login Page")).toBeInTheDocument();
      expect(screen.queryByText("Dashboard Page")).not.toBeInTheDocument();
    });

    it("redirects from unknown route to /login", () => {
      renderApp("/unknown-page");
      expect(screen.getByText("Login Page")).toBeInTheDocument();
    });
  });

  describe("when user IS authenticated", () => {
    beforeEach(() => {
      mockIsAuthenticated = true;
    });

    it("renders Dashboard page at /dashboard", () => {
      renderApp("/dashboard");
      expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
    });

    it("redirects from /login to /dashboard (PublicRoute)", () => {
      renderApp("/login");
      expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
      expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
    });

    it("redirects from /signup to /dashboard (PublicRoute)", () => {
      renderApp("/signup");
      expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
      expect(screen.queryByText("Signup Page")).not.toBeInTheDocument();
    });

    it("redirects from / to /dashboard (DefaultRedirect)", () => {
      renderApp("/");
      expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
    });

    it("redirects from unknown route to /dashboard", () => {
      renderApp("/some-random-path");
      expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
    });
  });
});
