import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: null, pathname: "/signup" }),
  Link: ({ to, children, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  BrowserRouter: ({ children }) => <div>{children}</div>,
}));

const mockRegister = jest.fn();

jest.mock("../store/useAuthStore.js", () => {
  const store = jest.fn((selector) => {
    const state = {
      user: null,
      token: null,
      isAuthenticated: false,
      login: jest.fn(),
      register: mockRegister,
      logout: jest.fn(),
    };
    return selector(state);
  });
  store.getState = () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    login: jest.fn(),
    register: mockRegister,
    logout: jest.fn(),
  });
  return { __esModule: true, default: store };
});

import Signup from "../pages/Signup.jsx";

describe("Signup Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the signup heading and subheading", () => {
    render(<Signup />);
    expect(screen.getByText("Create account")).toBeInTheDocument();
    expect(
      screen.getByText("Get started with your free account")
    ).toBeInTheDocument();
  });

  it("renders the email and password input fields", () => {
    render(<Signup />);
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your password")
    ).toBeInTheDocument();
  });

  it("renders the Create Account button", () => {
    render(<Signup />);
    expect(
      screen.getByRole("button", { name: "Create Account" })
    ).toBeInTheDocument();
  });

  it("renders the footer link to login", () => {
    render(<Signup />);
    expect(screen.getByText("Already have an account?")).toBeInTheDocument();
    const link = screen.getByText("Sign in");
    expect(link).toBeInTheDocument();
    expect(link.getAttribute("href")).toBe("/login");
  });

  it("calls register action and navigates to /login on successful submission", async () => {
    mockRegister.mockResolvedValueOnce();
    const user = userEvent.setup();

    render(<Signup />);

    await user.type(screen.getByPlaceholderText("you@example.com"), "new@example.com");
    await user.type(screen.getByPlaceholderText("Enter your password"), "securepass");
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: "new@example.com",
        password: "securepass",
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
    });
  });

  it("displays an error message when registration fails", async () => {
    mockRegister.mockRejectedValueOnce({
      response: { data: { message: "Email already exists" } },
    });
    const user = userEvent.setup();

    render(<Signup />);

    await user.type(screen.getByPlaceholderText("you@example.com"), "dup@example.com");
    await user.type(screen.getByPlaceholderText("Enter your password"), "pass");
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    await waitFor(() => {
      expect(screen.getByText("Email already exists")).toBeInTheDocument();
    });
  });

  it("displays fallback error when no message in response", async () => {
    mockRegister.mockRejectedValueOnce(new Error("Network Error"));
    const user = userEvent.setup();

    render(<Signup />);

    await user.type(screen.getByPlaceholderText("you@example.com"), "bad@example.com");
    await user.type(screen.getByPlaceholderText("Enter your password"), "pass");
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    await waitFor(() => {
      expect(screen.getByText("An error occurred")).toBeInTheDocument();
    });
  });

  it("shows 'Please wait...' text while submitting", async () => {
    let resolveRegister;
    mockRegister.mockImplementation(
      () => new Promise((resolve) => { resolveRegister = resolve; })
    );
    const user = userEvent.setup();

    render(<Signup />);

    await user.type(screen.getByPlaceholderText("you@example.com"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Enter your password"), "pass");
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    expect(screen.getByText("Please wait...")).toBeInTheDocument();

    resolveRegister();

    await waitFor(() => {
      expect(screen.queryByText("Please wait...")).not.toBeInTheDocument();
    });
  });
});
