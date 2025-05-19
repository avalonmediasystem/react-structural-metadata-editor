import React from 'react';
import ListItem from '../ListItem';
import { fireEvent } from '@testing-library/react';
import { renderWithRedux, testSmData } from '../../services/testing-helpers';
import Peaks from 'peaks';

const peaksOptions = {
  container: null,
  mediaElement: null,
  dataUri: null,
  dataUriDefaultFormat: 'json',
  keyboard: true,
  _zoomLevelIndex: 0,
  _zoomLevels: [512, 1024, 2048, 4096],
};

let peaksInst = null;
Peaks.init(peaksOptions, (err, peaks) => {
  peaksInst = peaks;
});

const initialState = {
  structuralMetadata: {
    smData: testSmData,
  },
  peaksInstance: {
    peaks: peaksInst,
    isDragging: false,
    segment: {
      startTime: 0,
      endTime: 3.321,
      label: '',
      id: 'temp-segment',
      editable: true,
      color: '#FBB040',
    },
    events: null,
  },
  forms: {
    alerts: [],
  },
};
const divItem = {
  type: 'div',
  label: 'Sub-Segment 1.1',
  id: '123a-456b-789c-2d',
  items: [],
  valid: true,
};
const rootItem = {
  type: 'root',
  label: 'Ima Title',
  id: '123a-456b-789c-0d',
  items: [],
  valid: true,
};
const spanItem = {
  type: 'span',
  label: 'Segment 1.1',
  id: '123a-456b-789c-3d',
  begin: '00:00:03.321',
  end: '00:00:10.321',
  valid: true,
};
const invalidItem = {
  type: 'span',
  label: 'Invalid Item',
  id: '123a-456b-789c-10d',
  begin: '00:03:02.333',
  end: '00:02:03.333',
  valid: false,
};
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

// Mock react-dnd library
jest.mock('react-dnd', () => ({
  useDrag: jest.fn(() => [{ isDragging: false }, jest.fn()]),
}));
// Mock react-error-boundary library
jest.mock('react-error-boundary', () => ({
  useErrorBoundary: jest.fn(() => ({
    showBoundary: jest.fn(),
  }))
}));

describe('ListItem component', () => {
  describe('renders', () => {
    test('successfully', () => {
      const utils = renderWithRedux(<ListItem item={divItem} />, {
        initialState,
      });
      expect(utils.queryByTestId('heading-label')).toBeInTheDocument();
      expect(utils.getByText(/^Sub-Segment 1.1$/)).toBeInTheDocument();
    });

    test('without any edit forms', () => {
      const utils = renderWithRedux(<ListItem item={divItem} />, {
        initialState,
      });
      expect(utils.queryByTestId('heading-label')).toBeInTheDocument();
      expect(
        utils.queryByTestId('inline-heading-title-form-control')
      ).not.toBeInTheDocument();
      expect(
        utils.queryByTestId('timespan-inline-form')
      ).not.toBeInTheDocument();
    });

    test('an invalid timespan', () => {
      const utils = renderWithRedux(<ListItem item={invalidItem} />, {
        initialState,
      });
      expect(utils.queryByTestId('timespan-label')).toBeInTheDocument();
      expect(utils.getByTestId('list-item')).toHaveClass('invalid');
    });
  });

  describe('renders correct item based on type', () => {
    test('type == div', () => {
      const utils = renderWithRedux(<ListItem item={divItem} />, {
        initialState,
      });

      expect(utils.getByTestId('heading-label')).toBeInTheDocument();
      expect(utils.queryByTestId('timespan-label')).not.toBeInTheDocument();
    });

    test('type == root', () => {
      const utils = renderWithRedux(<ListItem item={rootItem} />, {
        initialState,
      });
      expect(utils.getByTestId('heading-label')).toBeInTheDocument();
      expect(utils.getByTestId('list-item-edit-btn')).toBeInTheDocument();
      expect(
        utils.queryByTestId('list-item-delete-btn')
      ).not.toBeInTheDocument();
    });

    test('type == span', () => {
      const utils = renderWithRedux(<ListItem item={spanItem} />, {
        initialState,
      });
      expect(utils.queryByTestId('heading-label')).not.toBeInTheDocument();
      expect(utils.getByTestId('timespan-label')).toBeInTheDocument();
    });
  });

  describe('timespan item', () => {
    test('displays a begin and end time with its label', () => {
      const utils = renderWithRedux(<ListItem item={spanItem} />, {
        initialState,
      });

      expect(
        utils.getByText(spanItem.begin, { exact: false })
      ).toBeInTheDocument();
      expect(
        utils.getByText(spanItem.end, { exact: false })
      ).toBeInTheDocument();
      expect(
        utils.getByText(spanItem.label, { exact: false })
      ).toBeInTheDocument();
    });
  });

  describe('heading item', () => {
    test('displays a div item without children', () => {
      const utils = renderWithRedux(<ListItem item={divItem} />, {
        initialState,
      });
      expect(utils.queryAllByTestId('list-item')).toHaveLength(1);
    });

    test('displays a div item with children', () => {
      const utils = renderWithRedux(
        <ListItem item={divItemWithChildren} />,
        initialState
      );
      expect(utils.queryAllByTestId('list-item')).toHaveLength(1);
    });
  });

  test('adds .active to an active list item', () => {
    const utils = renderWithRedux(<ListItem item={divItem} />, {
      initialState,
    });
    expect(utils.container.querySelector('.active')).toBeNull();

    const item = { ...divItem, active: true };
    utils.rerenderWithRedux(<ListItem item={item} />, initialState);
    expect(utils.container.querySelector('.active')).toBeInTheDocument();
  });

  describe('editing an item', () => {
    let utils = null;
    let editButton = null;

    // Need to use an item from the mock Redux store to be able to use
    // real action creators and reducers.  Pulling out a simple one for this test
    const testItem = testSmData[0].items[0].items[0];
    const label = /^Sub-Segment 1.1$/;

    beforeEach(() => {
      utils = renderWithRedux(<ListItem item={testItem} />, {
        initialState,
      });
      editButton = utils.getByTestId('list-item-edit-btn');
    });

    it('shows list item edit form and form text input', () => {
      fireEvent.click(editButton);

      expect(
        utils.getByTestId('inline-heading-title-form-control')
      ).toBeInTheDocument();
      expect(utils.getByLabelText('Title')).toBeInTheDocument();
      expect(utils.getByDisplayValue(label)).toBeInTheDocument();
    });

    it('shows the save and cancel buttons', () => {
      expect(
        utils.queryByTestId('inline-form-save-button')
      ).not.toBeInTheDocument();
      expect(
        utils.queryByTestId('inline-form-cancel-button')
      ).not.toBeInTheDocument();

      fireEvent.click(editButton);

      expect(
        utils.queryByTestId('inline-form-save-button')
      ).toBeInTheDocument();
      expect(
        utils.queryByTestId('inline-form-cancel-button')
      ).toBeInTheDocument();
    });

    it('cancels an edit', () => {
      fireEvent.click(editButton);

      const cancelButton = utils.getByTestId('inline-form-cancel-button');
      const input = utils.getByLabelText(/^Title$/);

      expect(cancelButton).toBeInTheDocument();

      fireEvent.change(input, {
        target: { value: 'foobar' },
      });
      expect(input.value).toEqual('foobar');
      expect(utils.queryByText(label)).not.toBeInTheDocument();

      fireEvent.click(cancelButton);
      expect(utils.queryByText(label)).toBeInTheDocument();
      expect(utils.getByTestId('list-item-edit-btn')).toBeInTheDocument();
    });

    it('shows the proper controls when saving a list item', async () => {
      fireEvent.click(editButton);

      const input = utils.getByLabelText(/^Title$/);

      fireEvent.change(input, {
        target: { value: 'foobar' },
      });
      expect(input.value).toEqual('foobar');

      fireEvent.click(utils.getByTestId('inline-form-save-button'));
      expect(utils.getByTestId('list-item-edit-btn')).toBeInTheDocument();
    });
  });
});
