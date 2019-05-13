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

export const testSmData = [
  {
    type: 'root',
    label: 'Sample Video',
    items: [
      {
        type: 'div',
        label: 'Intro',
        items: [
          {
            type: 'div',
            label: 'Adam test',
            items: [],
            id: 'abc'
          },
          {
            type: 'span',
            label: 'Part I',
            begin: '00:00:00.00',
            end: '00:01:00.00',
            id: 'def'
          }
        ],
        id: 'ghij'
      }
    ],
    id: 'klmn'
  }
];
