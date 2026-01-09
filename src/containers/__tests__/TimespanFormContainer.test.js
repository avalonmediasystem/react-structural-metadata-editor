import React from 'react';
import TimespanFormContainer from '../TimespanFormContainer';
import { renderWithRedux, testSmData } from '../../services/testing-helpers';

// Set up Redux store for tests
const initialState = {
  structuralMetadata: {
    smData: testSmData
  }
};

const props = {
  isInitializing: true,
  setIsInitializing: jest.fn(),
};

test('TimespanFormContainer renders without props', () => {
  const { getByTestId } = renderWithRedux(<TimespanFormContainer {...props} />);
  expect(getByTestId('timespan-form')).toBeInTheDocument();
});

test('TimespanFormContainer renders with props', () => {
  const { getByTestId } = renderWithRedux(<TimespanFormContainer {...props} />, {
    initialState
  });
  expect(getByTestId('timespan-form')).toBeInTheDocument();
});
