module.exports = {
  testEnvironment: "jest-environment-jsdom",
  setupFiles: ["<rootDir>/src/setupEnv.js"],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/__tests__/**",
    "!src/main.jsx",
    "!src/setupEnv.js",
    "!src/setupTests.js",
  ],
};
