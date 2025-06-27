import React from 'react';
import List from '../List';
import { renderWithRedux, testSmData } from '../../services/testing-helpers';

const initialState = {
  structuralMetadata: {
    smData: testSmData,
  },
};

// Mock react-dnd library
jest.mock('react-dnd', () => ({
  useDrag: jest.fn(() => [{ isDragging: false }, jest.fn()]),
  useDrop: jest.fn(() => [{ isOver: false }, jest.fn()]),
}));
// Mock react-error-boundary library
jest.mock('react-error-boundary', () => ({
  useErrorBoundary: jest.fn(() => ({
    showBoundary: jest.fn(),
  }))
}));

describe('List component', () => {
  test('renders successfully', () => {
    const { getByText } = renderWithRedux(<List items={testSmData} />, {
      initialState,
    });
    expect(getByText(/^Ima Title$/)).toBeInTheDocument();
  });

  test('displays list items successfully', () => {
    const { getByText, queryByText } = renderWithRedux(
      <List items={testSmData} />,
      {
        initialState,
      }
    );
    // Just test for some random items
    expect(getByText(/^First segment$/)).toBeInTheDocument();
    expect(getByText(/^Sub-Segment 1.1$/)).toBeInTheDocument();
    expect(getByText(/^Segment 1.1/)).toBeInTheDocument();
    expect(getByText(/^Second segment$/)).toBeInTheDocument();
    expect(queryByText(/^foobar$/)).not.toBeInTheDocument();
  });


  test('displays children nested under the div when it contains items', () => {

    const divItemWithChildren = {
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
              items: [],
            },
            {
              type: 'span',
              label: 'Segment 2.1',
              id: '123a-456b-789c-8d',
              begin: '00:09:03.241',
              end: '00:15:00.001',
            },
          ],
        },
      ],
    };
    const utils = renderWithRedux(
      <List items={[divItemWithChildren]} />,
      initialState
    );
    // 4 list-items for the 4 nodes
    expect(utils.queryAllByTestId('list-item')).toHaveLength(4);
    // 2 lists for 2 levels of nested items
    expect(utils.queryAllByTestId('list')).toHaveLength(2);

    const lists = utils.queryAllByTestId('list');

    // list has one child for ListItem
    expect(lists[0].children).toHaveLength(1);
    expect(lists[0].children[0].tagName).toBe('LI');
    // ListItem has 2 children with the second one being another nested list
    expect(lists[0].children[0].children).toHaveLength(2);
    expect(lists[0].children[0].children[1].tagName).toBe('UL');
  });

  describe('List drop items', () => {
    test('do not show on initial load', () => {
      const { queryByTestId } = renderWithRedux(
        <List items={testSmData} />,
        {
          initialState,
        }
      );
      expect(queryByTestId('drop-list-item')).not.toBeInTheDocument();
    });

    test('appears if an item has a type value of optional', () => {
      const smWithOption = [
        {
          type: 'div',
          label: 'Title',
          id: '123a-456b-789c-0d',
          items: [
            {
              type: 'optional',
              id: 'asdfasdzz53443',
            },
            {
              type: 'div',
              label: 'A ',
              id: '123a-456b-789c-9d',
              items: [],
            },
          ],
        },
      ];

      const { queryByTestId } = renderWithRedux(
        <List items={smWithOption} />,
        {
          initialState,
        }
      );
      expect(queryByTestId('drop-list-item')).toBeInTheDocument();
    });
  });
});
