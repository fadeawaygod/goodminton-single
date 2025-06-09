/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  moduleNameMapper: {},
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  transformIgnorePatterns: [
    "node_modules/(?!(react-dnd|react-dnd-html5-backend|react-dnd-touch-backend|react-dnd-multi-backend|dnd-core)/)",
  ],
};
