import React from 'react';
import { cleanup } from 'react-testing-library';
import 'jest-dom/extend-expect';
import TimespanFormContainer from '../TimespanFormContainer';
import { renderWithRedux, testSmData } from '../../services/testing-helpers';

// Set up Redux store for tests
const initialState = {
  smData: testSmData
};

afterEach(cleanup);

test('TimespanFormContainer renders without props', () => {
  const { getByTestId } = renderWithRedux(<TimespanFormContainer />);
  expect(getByTestId('timespan-form')).toBeInTheDocument();
});

test('TimespanFormContainer renders with props', () => {
  const { getByTestId } = renderWithRedux(<TimespanFormContainer />, {
    initialState
  });
  expect(getByTestId('timespan-form')).toBeInTheDocument();
});
