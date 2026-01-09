import React from 'react';
import '@testing-library/jest-dom';

// Mock react-error-boundary for all tests
jest.mock('react-error-boundary', () => ({
  ErrorBoundary: ({ children }) => {
    return <>{children}</>;
  },
  useErrorBoundary: jest.fn(() => ({
    showBoundary: jest.fn(),
  }))
}));
