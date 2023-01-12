import React from 'react';
import { fireEvent, cleanup } from 'react-testing-library';
import 'jest-dom/extend-expect';
import ListItemControls from '../ListItemControls';
import { renderWithRedux } from '../../services/testing-helpers';

const initialState = {
  forms: {
    editingDisabled: false,
    alerts: [],
  },
};

afterEach(cleanup);

const handleDeleteMock = jest.fn();
const handleEditMock = jest.fn();
const showDropTargetsMock = jest.fn();
const itemDiv = {
  childrenCount: 2,
  label: 'Sub-Segment 2.1',
  type: 'div',
  active: false,
};

const itemSpan = {
  childrenCount: 0,
  label: 'Segment 1.2',
  type: 'span',
  active: false,
};

const itemRoot = {
  childrenCount: 3,
  label: 'Title',
  type: 'root',
  active: false,
};

describe('ListItemControls component', () => {
  test('renders successfully', () => {
    const { getByTestId } = renderWithRedux(
      <ListItemControls
        handleDelete={handleDeleteMock}
        handleEditClick={handleEditMock}
        item={itemDiv}
        handleShowDropTargetsClick={showDropTargetsMock}
      />,
      { initialState }
    );
    expect(getByTestId('list-item-controls')).toBeInTheDocument();
  });

  test('renders for timespan item with edit, dnd, and delete actions', () => {
    const { getByTestId } = renderWithRedux(
      <ListItemControls
        handleDelete={handleDeleteMock}
        handleEditClick={handleEditMock}
        item={itemSpan}
        handleShowDropTargetsClick={showDropTargetsMock}
      />,
      { initialState }
    );
    expect(getByTestId('list-item-edit-btn')).toBeInTheDocument();
    expect(getByTestId('list-item-dnd-btn')).toBeInTheDocument();
    expect(getByTestId('list-item-delete-btn')).toBeInTheDocument();
    expect(getByTestId('list-item-edit-btn')).toBeEnabled();
  });

  test('renders for root item without delete, and dnd actions', () => {
    const { getByTestId, queryByTestId } = renderWithRedux(
      <ListItemControls
        handleDelete={handleDeleteMock}
        handleEditClick={handleEditMock}
        item={itemRoot}
        handleShowDropTargetsClick={showDropTargetsMock}
      />,
      { initialState }
    );
    expect(getByTestId('list-item-edit-btn')).toBeInTheDocument();
    expect(queryByTestId('list-item-delete-btn')).toBeNull;
    expect(queryByTestId('list-item-dnd-btn')).toBeNull();
    expect(getByTestId('list-item-edit-btn')).toBeEnabled();
  });

  test('renders for header item with edit, and delete actions', () => {
    const { getByTestId, queryByTestId } = renderWithRedux(
      <ListItemControls
        handleDelete={handleDeleteMock}
        handleEditClick={handleEditMock}
        handleShowDropTargetsClick={showDropTargetsMock}
        item={itemDiv}
      />,
      { initialState }
    );
    expect(getByTestId('list-item-edit-btn')).toBeInTheDocument();
    expect(getByTestId('list-item-delete-btn')).toBeInTheDocument();
    expect(queryByTestId('list-item-dnd-btn')).toBeNull();
    expect(getByTestId('list-item-edit-btn')).toBeEnabled();
  });

  describe('using controls', () => {
    test('triggers actions upon clicking edit/dnd buttons', () => {
      const { getByTestId } = renderWithRedux(
        <ListItemControls
          handleDelete={handleDeleteMock}
          handleEditClick={handleEditMock}
          handleShowDropTargetsClick={showDropTargetsMock}
          item={itemSpan}
        />,
        { initialState }
      );

      // Simulate clicking on edit button
      fireEvent.click(getByTestId('list-item-edit-btn'));
      expect(handleEditMock).toHaveBeenCalledTimes(1);

      // Simulate clicking on drag-n-drop button
      fireEvent.click(getByTestId('list-item-dnd-btn'));
      expect(showDropTargetsMock).toHaveBeenCalledTimes(1);
    });

    describe('delete action', () => {
      let listItemControls;
      beforeEach(() => {
        listItemControls = renderWithRedux(
          <ListItemControls
            handleDelete={handleDeleteMock}
            handleEditClick={handleEditMock}
            handleShowDropTargetsClick={showDropTargetsMock}
            item={itemDiv}
          />,
          { initialState }
        );
        fireEvent.click(listItemControls.getByTestId('list-item-delete-btn'));
      });

      test('shows a delete confirmation popover', () => {
        expect(
          listItemControls.getByTestId('delete-confirmation-popup')
        ).toBeInTheDocument();
        expect(
          listItemControls.getByTestId('delete-confirmation-message')
            .textContent
        ).toBe(
          "Are you sure you'd like to delete Sub-Segment 2.1 and it's 2 child items?"
        );
      });
      test('confirm delete', () => {
        fireEvent.click(
          listItemControls.getByTestId('delete-confirmation-confirm-btn')
        );
        expect(handleDeleteMock).toHaveBeenCalledTimes(1);
      });
      test('cancel delete', () => {
        fireEvent.click(
          listItemControls.getByTestId('delete-confirmation-cancel-btn')
        );
        expect(handleDeleteMock).toHaveBeenCalledTimes(0);
      });
    });
  });
});
