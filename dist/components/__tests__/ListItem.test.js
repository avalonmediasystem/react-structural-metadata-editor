import React from 'react';
import ListItem from '../ListItem';
import { cleanup, fireEvent } from 'react-testing-library';
import { renderWithRedux, testSmData } from '../../services/testing-helpers';
import 'jest-dom/extend-expect';
import { wrapInTestContext } from 'react-dnd-test-utils';
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

const initialState = {
  structuralMetadata: {
    smData: testSmData,
  },
  peaksInstance: {
    peaks: Peaks.init(peaksOptions),
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
};
const rootItem = {
  type: 'root',
  label: 'Ima Title',
  id: '123a-456b-789c-0d',
  items: [],
};
const spanItem = {
  type: 'span',
  label: 'Segment 1.1',
  id: '123a-456b-789c-3d',
  begin: '00:00:03.321',
  end: '00:00:10.321',
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

let ListItemContext = null;

beforeEach(() => {
  ListItemContext = wrapInTestContext(ListItem);
});
afterEach(cleanup);

describe('ListItem component', () => {
  describe('initial ListItem render', () => {
    let utils = null;

    beforeEach(() => {
      utils = renderWithRedux(<ListItemContext item={divItem} />, {
        initialState,
      });
    });

    it('renders a basic ListItem', () => {
      expect(utils.getByText(/^Sub-Segment 1.1$/)).toBeInTheDocument();
    });

    it('does not show any edit forms', () => {
      expect(
        utils.queryByTestId('inline-heading-title-form-group')
      ).not.toBeInTheDocument();
      expect(
        utils.queryByTestId('timespan-inline-form')
      ).not.toBeInTheDocument();
    });
  });

  it('ListItem renders the correct html element based on item.type', () => {
    const utils = renderWithRedux(<ListItemContext item={divItem} />, {
      initialState,
    });

    expect(utils.getByTestId('heading-label')).toBeInTheDocument();
    expect(utils.queryByTestId('timespan-label')).not.toBeInTheDocument();

    utils.rerenderWithRedux(<ListItemContext item={rootItem} />, initialState);
    expect(utils.getByTestId('heading-label')).toBeInTheDocument();

    utils.rerenderWithRedux(<ListItemContext item={spanItem} />, initialState);
    expect(utils.queryByTestId('heading-label')).not.toBeInTheDocument();
    expect(utils.getByTestId('timespan-label')).toBeInTheDocument();
  });

  it('timespan item displays a begin and end time with its label', () => {
    const utils = renderWithRedux(<ListItemContext item={spanItem} />, {
      initialState,
    });

    expect(
      utils.getByText(spanItem.begin, { exact: false })
    ).toBeInTheDocument();
    expect(utils.getByText(spanItem.end, { exact: false })).toBeInTheDocument();
    expect(
      utils.getByText(spanItem.label, { exact: false })
    ).toBeInTheDocument();
  });

  it('heading item displays a submenu list if the item object contains items', () => {
    const utils = renderWithRedux(<ListItemContext item={divItem} />, {
      initialState,
    });
    expect(utils.queryAllByTestId('list')).toHaveLength(0);

    utils.rerenderWithRedux(
      <ListItemContext item={divItemWithChildren} />,
      initialState
    );
    expect(utils.queryAllByTestId('list')).toHaveLength(2);
  });

  it('adds an active class to an active list item', () => {
    const utils = renderWithRedux(<ListItemContext item={divItem} />, {
      initialState,
    });
    expect(utils.container.querySelector('.active')).toBeNull();

    const item = { ...divItem, active: true };
    utils.rerenderWithRedux(<ListItemContext item={item} />, initialState);
    expect(utils.container.querySelector('.active')).toBeInTheDocument();
  });

  // TODO: move to a more suitable location once the tests are created
  // The following tests might be overreaching the scope of tests
  describe('editing a list item', () => {
    let utils = null;
    let editButton = null;

    // Need to use an item from the mock Redux store to be able to use
    // real action creators and reducers.  Pulling out a simple one for this test
    const testItem = testSmData[0].items[0].items[0];
    const label = /^Sub-Segment 1.1$/;

    beforeEach(() => {
      utils = renderWithRedux(<ListItemContext item={testItem} />, {
        initialState,
      });
      editButton = utils.getByTestId('list-item-edit-btn');
    });

    it('shows list item edit form and form text input', () => {
      fireEvent.click(editButton);

      expect(
        utils.getByTestId('inline-heading-title-form-group')
      ).toBeInTheDocument();
      expect(utils.getByLabelText('Title')).toBeInTheDocument();
      expect(utils.getByDisplayValue(label)).toBeInTheDocument();
    });

    it('shows the save and cancel buttons only after edit button clicked', () => {
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
