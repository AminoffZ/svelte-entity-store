module.exports = {
  silent: false,
  verbose: true,
  projects: [
    {
      preset: 'ts-jest',
      displayName: 'dom',
      testEnvironment: 'jsdom',
      testMatch: ['**/dom-tests/**/*.test.ts'],
      transform: {
        '^.+\\.ts$': ['ts-jest', {
          tsconfig: './tsconfig.jest.json'
        }],
      }
    },
    {
      preset: 'ts-jest',
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: ['**/node-tests/**/*.test.ts'],
      transform: {
        '^.+\\.ts$': ['ts-jest', {
          tsconfig: './tsconfig.jest.json'
        }],
      }
    },
  ],
  
};
