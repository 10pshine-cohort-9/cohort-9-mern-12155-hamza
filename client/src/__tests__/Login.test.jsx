import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockNavigate = jest.fn();
const mockLocation = { state: null, pathname: "/login" };

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
  Link: ({ to, children, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  BrowserRouter: ({ children }) => <div>{children}</div>,
}));

const mockLogin = jest.fn();

jest.mock("../store/useAuthStore.js", () => {
  const store = jest.fn((selector) => {
    const state = {
      user: null,
      token: null,
      isAuthenticated: false,
      login: mockLogin,
      register: jest.fn(),
      logout: jest.fn(),
    };
    return selector(state);
  });
  store.getState = () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    login: mockLogin,
    register: jest.fn(),
    logout: jest.fn(),
  });
  return { __esModule: true, default: store };
});

import Login from "../pages/Login.jsx";

describe("Login Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.state = null;
    mockLocation.pathname = "/login";
  });

  it("renders the login heading and subheading", () => {
    render(<Login />);
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(
      screen.getByText("Sign in to your account to continue")
    ).toBeInTheDocument();
  });

  it("renders the email and password input fields", () => {
    render(<Login />);
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your password")
    ).toBeInTheDocument();
  });

  it("renders the Sign In button", () => {
    render(<Login />);
    expect(
      screen.getByRole("button", { name: "Sign In" })
    ).toBeInTheDocument();
  });

  it("renders the footer link to signup", () => {
    render(<Login />);
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    const link = screen.getByText("Create one");
    expect(link).toBeInTheDocument();
    expect(link.getAttribute("href")).toBe("/signup");
  });

  it("calls login action and navigates on successful form submission", async () => {
    mockLogin.mockResolvedValueOnce();
    const user = userEvent.setup();

    render(<Login />);

    await user.type(screen.getByPlaceholderText("you@example.com"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Enter your password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
    });
  });

  it("navigates to the location from state when available", async () => {
    mockLogin.mockResolvedValueOnce();
    mockLocation.state = { from: { pathname: "/dashboard" } };
    const user = userEvent.setup();

    render(<Login />);

    await user.type(screen.getByPlaceholderText("you@example.com"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Enter your password"), "pass");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
    });
  });

  it("displays an error message when login fails", async () => {
    mockLogin.mockRejectedValueOnce({
      response: { data: { message: "Invalid credentials" } },
    });
    const user = userEvent.setup();

    render(<Login />);

    await user.type(screen.getByPlaceholderText("you@example.com"), "bad@example.com");
    await user.type(screen.getByPlaceholderText("Enter your password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  it("displays fallback error when no message in response", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Network Error"));
    const user = userEvent.setup();

    render(<Login />);

    await user.type(screen.getByPlaceholderText("you@example.com"), "bad@example.com");
    await user.type(screen.getByPlaceholderText("Enter your password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(screen.getByText("An error occurred")).toBeInTheDocument();
    });
  });

  it("shows 'Please wait...' text while submitting", async () => {
    let resolveLogin;
    mockLogin.mockImplementation(
      () => new Promise((resolve) => { resolveLogin = resolve; })
    );
    const user = userEvent.setup();

    render(<Login />);

    await user.type(screen.getByPlaceholderText("you@example.com"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Enter your password"), "pass");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(screen.getByText("Please wait...")).toBeInTheDocument();

    resolveLogin();

    await waitFor(() => {
      expect(screen.queryByText("Please wait...")).not.toBeInTheDocument();
    });
  });
});
