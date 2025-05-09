import React from 'react';
import HeadingFormContainer from '../HeadingFormContainer';
import { renderWithRedux, testSmData } from '../../services/testing-helpers';

// Set up Redux store for tests
const initialState = {
  structuralMetadata: { smData: testSmData }
};

// Mock react-error-boundary library
jest.mock('react-error-boundary', () => ({
  useErrorBoundary: jest.fn(() => ({
    showBoundary: jest.fn(),
  }))
}));

test('HeadingFormContainer renders without props', () => {
  const { getByTestId } = renderWithRedux(<HeadingFormContainer />);
  expect(getByTestId('heading-form')).toBeInTheDocument();
});

test('HeadingFormContainer renders with props', () => {
  const { getByTestId } = renderWithRedux(<HeadingFormContainer />, {
    initialState
  });
  expect(getByTestId('heading-form')).toBeInTheDocument();
});
