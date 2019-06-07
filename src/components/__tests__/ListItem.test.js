import React from 'react';
import ListItem from '../ListItem';
import { cleanup, fireEvent } from 'react-testing-library';
import { renderWithRedux, testSmData } from '../../services/testing-helpers';
import { simpleItem } from './test-data/items';
import 'jest-dom/extend-expect';
import { wrapInTestContext } from 'react-dnd-test-utils';

const initialState = {
  smData: testSmData
};

let ListItemContext = null;

beforeEach(() => {
  ListItemContext = wrapInTestContext(ListItem);
});
afterEach(cleanup);

describe('initial ListItem render', () => {
  it('renders a basic ListItem', () => {
    const { getByText } = renderWithRedux(
      <ListItemContext item={simpleItem} />,
      { initialState }
    );
    expect(getByText(/^Planet Earth - BBC$/)).toBeInTheDocument();
  });

  it('is not in edit mode', () => {});

  it('displays ListItem control buttons', () => {
    const { queryAllByTestId } = renderWithRedux(
      <ListItemContext item={simpleItem} />,
      { initialState }
    );
    // The test object should render 5 list items, all with controls
    expect(queryAllByTestId('list-item-controls')).toHaveLength(5);
    expect(queryAllByTestId('list-item-edit-btn')).toHaveLength(5);

    // Root item doesn't have delete button
    expect(queryAllByTestId('list-item-delete-btn')).toHaveLength(4);
  });
});

describe('editing a list item', () => {
  let utils = null;
  let editButton = null;

  // Need to use an item from the mock Redux store to be able to use
  // real action creators and reducers.  Pulling out a simple one for this test
  const testItem = testSmData[0].items[0].items[0];
  const label = /^Sub-Segment 1.1$/;

  beforeEach(() => {
    utils = renderWithRedux(<ListItemContext item={testItem} />, {
      initialState
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

    expect(utils.queryByTestId('inline-form-save-button')).toBeInTheDocument();
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
      target: { value: 'foobar' }
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
      target: { value: 'foobar' }
    });
    expect(input.value).toEqual('foobar');

    fireEvent.click(utils.getByTestId('inline-form-save-button'));
    expect(utils.getByTestId('list-item-edit-btn')).toBeInTheDocument();
  });
});
