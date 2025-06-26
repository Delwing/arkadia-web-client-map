module.exports = {
  testEnvironment: 'jsdom',
  roots: [
    '<rootDir>/test',
  ],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {},
    ],
  },
}
