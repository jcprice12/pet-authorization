module.exports = {
  preset: 'ts-jest',
  rootDir: 'src',
  collectCoverageFrom: ['**/*.ts'],
  coverageDirectory: '../coverage',
  clearMocks: true,
};
