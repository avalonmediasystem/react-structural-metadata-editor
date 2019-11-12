import React from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { render } from 'react-testing-library';
import reducer from '../reducers';
import thunk from 'redux-thunk';

/**
 * Helper function for providing a Redux connected component for testing.
 * Taken from Testing Library:  https://testing-library.com/docs/example-react-redux
 *
 * Providing re-render when props gets updated.
 * Taken from: https://gist.github.com/darekzak/0c56bd9f1ad6e876fd21837feee79c50
 *
 * @param {React Component} ui
 * @param {object} param1
 * @param {function} param2
 */
export function renderWithRedux(
  ui,
  {
    initialState,
    store = createStore(reducer, initialState, applyMiddleware(thunk))
  } = {},
  renderFn = render
) {
  const obj = {
    ...renderFn(<Provider store={store}>{ui}</Provider>),
    store
  };
  obj.rerenderWithRedux = (el, nextState) => {
    if (nextState) {
      store.replaceReducer(() => nextState);
      store.dispatch({ type: '__TEST_ACTION_REPLACE_STATE__' });
      store.replaceReducer(reducer);
    }
    return renderWithRedux(el, { store }, obj.rerender);
  };
  return obj;
}

export const testSmData = [
  {
    type: 'root',
    label: 'Ima Title',
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
            begin: '00:00:03.321',
            end: '00:00:10.321'
          },
          {
            type: 'span',
            label: 'Segment 1.2',
            id: '123a-456b-789c-4d',
            begin: '00:00:11.231',
            end: '00:08:00.001'
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
                begin: '00:09:03.241',
                end: '00:15:00.001'
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

export const testDataFromServer = [
  {
    type: 'root',
    label: 'Ima Title',
    id: '123a-456b-789c-0d',
    items: [
      {
        type: 'span',
        label: 'First segment',
        id: '123a-456b-789c-1d',
        begin: '3',
        end: '10.42'
      },
      {
        type: 'span',
        label: 'Middle segment',
        id: '123a-456b-789c-2d',
        begin: '00:10:42',
        end: '00:15:00.23'
      },
      {
        type: 'span',
        label: 'Final segment',
        id: '123a-456b-789c-3d',
        begin: '15.30',
        end: '00:38:58'
      }
    ]
  }
];

export const testEmptyHeaderBefore = [
  {
    type: 'div',
    label: 'Title',
    id: '123a-456b-789c-0d',
    items: [
      {
        type: 'div',
        label: 'Scene 1',
        id: '123a-456b-789c-1d',
        items: []
      },
      {
        type: 'div',
        label: 'Scene 2',
        id: '123a-456b-789c-2d',
        items: [
          {
            type: 'span',
            label: 'Act 1',
            id: '123a-456b-789c-3d',
            begin: '00:10:00.001',
            end: '00:15:00.001'
          }
        ]
      }
    ]
  }
];

export const testEmptyHeaderAfter = [
  {
    type: 'div',
    label: 'Title',
    id: '123a-456b-789c-0d',
    items: [
      {
        type: 'div',
        label: 'Scene 1',
        id: '123a-456b-789c-1d',
        items: [
          {
            type: 'span',
            label: 'Act 1',
            id: '123a-456b-789c-2d',
            begin: '00:00:00.000',
            end: '00:09:00.001'
          }
        ]
      },
      {
        type: 'div',
        label: 'Scene 2',
        id: '123a-456b-789c-3d',
        items: []
      }
    ]
  }
];
