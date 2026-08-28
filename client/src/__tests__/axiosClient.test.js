const mockLogout = jest.fn();
let mockToken = null;

// Mock the auth store
jest.mock("../store/useAuthStore.js", () => {
  const store = jest.fn((selector) => {
    const state = { token: mockToken, logout: mockLogout };
    return selector(state);
  });
  store.getState = () => ({ token: mockToken, logout: mockLogout });
  return { __esModule: true, default: store };
});

// Capture the interceptors that axiosClient registers
let requestFulfilled, requestRejected;
let responseFulfilled, responseRejected;

// Capture create args at mock time so clearAllMocks doesn't wipe the call history
let createCalledWith = null;

jest.mock("axios", () => {
  const mockInstance = {
    interceptors: {
      request: {
        use: jest.fn((fulfilled, rejected) => {
          requestFulfilled = fulfilled;
          requestRejected = rejected;
        }),
      },
      response: {
        use: jest.fn((fulfilled, rejected) => {
          responseFulfilled = fulfilled;
          responseRejected = rejected;
        }),
      },
    },
  };
  return {
    __esModule: true,
    default: {
      create: jest.fn((config) => {
        createCalledWith = config;
        return mockInstance;
      }),
    },
  };
});

beforeAll(async () => {
  // Importing axiosClient triggers axios.create and interceptor registration
  await import("../api/axiosClient.js");
});

describe("axiosClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToken = null;
  });

  describe("instance creation", () => {
    it("creates an axios instance with correct baseURL and timeout", () => {
      expect(createCalledWith).toEqual({
        baseURL: "/api",
        timeout: 15000,
      });
    });
  });

  describe("request interceptor", () => {
    it("adds Authorization header when token exists", () => {
      mockToken = "my-jwt-token";
      const config = { headers: {} };

      const result = requestFulfilled(config);

      expect(result.headers.Authorization).toBe("Bearer my-jwt-token");
    });

    it("does not add Authorization header when no token", () => {
      mockToken = null;
      const config = { headers: {} };

      const result = requestFulfilled(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it("rejects on request error", async () => {
      const error = new Error("Request setup failed");
      await expect(requestRejected(error)).rejects.toThrow("Request setup failed");
    });
  });

  describe("response interceptor", () => {
    it("passes through successful responses unchanged", () => {
      const response = { data: { message: "ok" }, status: 200 };
      expect(responseFulfilled(response)).toBe(response);
    });

    it("calls logout on 401 response error", async () => {
      const error = { response: { status: 401 } };

      await expect(responseRejected(error)).rejects.toBe(error);
      expect(mockLogout).toHaveBeenCalled();
    });

    it("does not call logout on non-401 errors", async () => {
      const error = { response: { status: 500 } };

      await expect(responseRejected(error)).rejects.toBe(error);
      expect(mockLogout).not.toHaveBeenCalled();
    });

    it("does not call logout when error has no response", async () => {
      const error = new Error("Network Error");

      await expect(responseRejected(error)).rejects.toThrow("Network Error");
      expect(mockLogout).not.toHaveBeenCalled();
    });
  });
});
