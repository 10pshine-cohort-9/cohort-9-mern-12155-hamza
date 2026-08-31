import axios from "axios";

// Mock axios before axiosClient is imported by the store
jest.mock("axios", () => {
  const mockInstance = {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };
  return {
    __esModule: true,
    default: {
      create: jest.fn(() => mockInstance),
      ...mockInstance,
    },
  };
});

// We need to get the mocked axiosClient instance that the store will use
let axiosClient;
let useAuthStore;

beforeAll(async () => {
  // Import after mocks are set up
  const axiosMod = await import("../api/axiosClient.js");
  axiosClient = axiosMod.default;
  const storeMod = await import("../store/useAuthStore.js");
  useAuthStore = storeMod.default;
});

describe("useAuthStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  });

  describe("initial state", () => {
    it("has null user, null token, and isAuthenticated false", () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe("login", () => {
    it("sets user, token, and isAuthenticated on successful login", async () => {
      axiosClient.post.mockResolvedValueOnce({
        data: {
          data: { token: "jwt-token-123", id: "user-1", email: "test@example.com" },
        },
      });

      await useAuthStore.getState().login({ email: "test@example.com", password: "pass123" });

      const state = useAuthStore.getState();
      expect(state.user).toEqual({ id: "user-1", email: "test@example.com" });
      expect(state.token).toBe("jwt-token-123");
      expect(state.isAuthenticated).toBe(true);
      expect(axiosClient.post).toHaveBeenCalledWith("/auth/login", {
        email: "test@example.com",
        password: "pass123",
      });
    });

    it("resets state and throws on login failure", async () => {
      const error = new Error("Invalid credentials");
      axiosClient.post.mockRejectedValueOnce(error);

      // Set some pre-existing state to verify it gets cleared
      useAuthStore.setState({ user: { id: "old" }, token: "old-token", isAuthenticated: true });

      await expect(
        useAuthStore.getState().login({ email: "bad@test.com", password: "wrong" })
      ).rejects.toThrow("Invalid credentials");

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe("register", () => {
    it("calls axiosClient.post with /auth/signup", async () => {
      axiosClient.post.mockResolvedValueOnce({ data: { message: "ok" } });

      await useAuthStore.getState().register({ email: "new@test.com", password: "pass123" });

      expect(axiosClient.post).toHaveBeenCalledWith("/auth/signup", {
        email: "new@test.com",
        password: "pass123",
      });
    });

    it("does not change authentication state on successful register", async () => {
      axiosClient.post.mockResolvedValueOnce({ data: { message: "ok" } });

      await useAuthStore.getState().register({ email: "new@test.com", password: "pass123" });

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it("resets state and throws on register failure", async () => {
      const error = new Error("Email taken");
      axiosClient.post.mockRejectedValueOnce(error);

      useAuthStore.setState({ user: { id: "old" }, token: "old-token", isAuthenticated: true });

      await expect(
        useAuthStore.getState().register({ email: "dup@test.com", password: "pass" })
      ).rejects.toThrow("Email taken");

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe("logout", () => {
    it("clears user, token, and isAuthenticated", () => {
      useAuthStore.setState({
        user: { id: "user-1", email: "test@example.com" },
        token: "jwt-token",
        isAuthenticated: true,
      });

      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
