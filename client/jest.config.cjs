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
};
