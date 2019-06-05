import React from 'react';
import { cleanup } from 'react-testing-library';
import 'jest-dom/extend-expect';
import List from '../List';
import { renderWithRedux, testSmData } from '../../services/testing-helpers';
import { wrapInTestContext } from 'react-dnd-test-utils';

const initialState = {
  smData: testSmData
};

let ListContext = wrapInTestContext(List);

beforeEach(() => {
  ListContext;
});
afterEach(cleanup);

test('List component renders successfully', () => {
  const { getByText } = renderWithRedux(<ListContext items={testSmData} />, {
    initialState
  });
  expect(getByText('Title')).toBeInTheDocument();
});

test('List component displays its list items successfully', () => {
  const { getByText, queryByText } = renderWithRedux(
    <ListContext items={testSmData} />,
    {
      initialState
    }
  );
  // Just test for some random items
  expect(getByText(/^First segment$/)).toBeInTheDocument();
  expect(getByText(/^Sub-Segment 1.1$/)).toBeInTheDocument();
  expect(getByText(/^Segment 1.1/)).toBeInTheDocument();
  expect(getByText(/^Second segment$/)).toBeInTheDocument();
  expect(queryByText(/^foobar$/)).not.toBeInTheDocument();
});

describe('List drop items', () => {
  test('do not show on initial load', () => {
    const { queryByTestId } = renderWithRedux(
      <ListContext items={testSmData} />,
      {
        initialState
      }
    );
    expect(queryByTestId('drop-list-item')).not.toBeInTheDocument();
  });

  test('appear if an item has a type value of optional', () => {
    const smWithOption = [
      {
        type: 'div',
        label: 'Title',
        id: '123a-456b-789c-0d',
        items: [
          {
            type: 'optional',
            id: 'asdfasdzz53443'
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

    const { queryByTestId } = renderWithRedux(
      <ListContext items={smWithOption} />,
      {
        initialState
      }
    );
    expect(queryByTestId('drop-list-item')).toBeInTheDocument();
  });
});
