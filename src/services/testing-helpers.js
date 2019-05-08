import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { render } from 'react-testing-library';
import reducer from '../reducers';

/**
 * Helper function for providing a Redux connected component for testing.
 *
 * Taken from Testing Library:  https://testing-library.com/docs/example-react-redux
 *
 * @param {React Component} ui
 * @param {object} param1
 */
export function renderWithRedux(
  ui,
  { initialState, store = createStore(reducer, initialState) } = {}
) {
  return {
    ...render(<Provider store={store}>{ui}</Provider>),
    store
  };
}
