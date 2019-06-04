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
    type: 'div',
    label: 'Title',
    id: '123a-456b-789c-0d',
    items: [
      {
        type: 'div',
        label: 'First segment',
        id: '123a-456b-789c-1d',
        items: [
          {
            type: 'div',
            label: 'Sub-Segment 1.1',
            id: '123a-456b-789c-2d',
            items: []
          },
          {
            type: 'span',
            label: 'Segment 1.1',
            id: '123a-456b-789c-3d',
            begin: '00:00:03.32',
            end: '00:00:10.32'
          },
          {
            type: 'span',
            label: 'Segment 1.2',
            id: '123a-456b-789c-4d',
            begin: '00:00:11.23',
            end: '00:08:00.00'
          }
        ]
      },
      {
        type: 'div',
        label: 'Second segment',
        id: '123a-456b-789c-5d',
        items: [
          {
            type: 'div',
            label: 'Sub-Segment 2.1',
            id: '123a-456b-789c-6d',
            items: [
              {
                type: 'div',
                label: 'Sub-Segment 2.1.1',
                id: '123a-456b-789c-7d',
                items: []
              },
              {
                type: 'span',
                label: 'Segment 2.1',
                id: '123a-456b-789c-8d',
                begin: '00:09:03.24',
                end: '00:15:00.00'
              }
            ]
          }
        ]
      },
      {
        type: 'div',
        label: 'A ',
        id: '123a-456b-789c-9d',
        items: []
      }
    ]
  }
];
