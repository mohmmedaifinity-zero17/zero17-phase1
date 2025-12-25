/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  transform: { "^.+\\.tsx?$": ["ts-jest", {}] },

  // ✅ Map "@/..." to your src folder (cross-platform)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // ✅ Keep Jest away from Playwright tests
  testPathIgnorePatterns: ["/node_modules/", "/tests/e2e/", "/tests/a11y/"],

  // (optional) quicker Windows perf
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
