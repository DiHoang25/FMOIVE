module.exports = {
    testEnvironment: 'jsdom',
    moduleDirectories: ['node_modules', 'src'],
    moduleNameMapper: {
      '\\.(css|scss)$': 'identity-obj-proxy', // để tránh lỗi import file css
    },
    transform: {
      '^.+\\.[jt]sx?$': 'babel-jest',
    },
    setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  };
  