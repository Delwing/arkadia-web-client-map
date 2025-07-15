module.exports = {
  testEnvironment: 'jsdom',
  roots: [
    '<rootDir>/test',
  ],
  setupFiles: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {},
    ],
  },
}
