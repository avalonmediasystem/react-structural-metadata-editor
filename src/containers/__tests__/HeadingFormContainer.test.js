import React from 'react';
import HeadingFormContainer from '../HeadingFormContainer';
import { renderWithRedux, testSmData } from '../../services/testing-helpers';

// Set up Redux store for tests
const initialState = {
  structuralMetadata: { smData: testSmData }
};

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
