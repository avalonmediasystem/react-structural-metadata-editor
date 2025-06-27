import React from 'react';
import { fireEvent } from '@testing-library/react';
import StructureOutputContainer from '../StructureOutputContainer';
import { renderWithRedux, testSmData } from '../../services/testing-helpers';
import Peaks from 'peaks';

// Set up a redux store for the tests
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


// Set up Redux store for tests
const initialState = {
  structuralMetadata: {
    smData: testSmData,
  },
  manifest: {
    manifestFetched: true
  },
  peaksInstance: {
    peaks: peaksInst
  }
};
const mockStructureIsSaved = jest.fn();

// Mock react-dnd and related libraries
jest.mock('react-dnd', () => ({
  useDrag: jest.fn(() => [{ isDragging: false }, jest.fn()]),
  useDrop: jest.fn(() => [{ isOver: false }, jest.fn()]),
}));
jest.mock('react-dnd-html5-backend', () => ({
  HTML5Backend: jest.fn(),
}));
jest.mock('react-error-boundary', () => ({
  useErrorBoundary: jest.fn(() => ({
    showBoundary: jest.fn(),
  }))
}));

describe('StructureOutputContainer component', () => {
  test('renders successfully', () => {
    const { getByTestId } = renderWithRedux(
      <StructureOutputContainer structureIsSaved={mockStructureIsSaved} />,
      {
        initialState,
      }
    );
    expect(getByTestId('structure-output-section')).toBeInTheDocument();
  });

  test('shows structure list when fetching manifest.json is successful', () => {
    const { getByTestId, queryByTestId } = renderWithRedux(
      <StructureOutputContainer structureIsSaved={mockStructureIsSaved} />,
      { initialState }
    );

    expect(getByTestId('structure-output-list')).toBeInTheDocument();
    expect(getByTestId('structure-save-button')).toBeInTheDocument();
    // Alert is not present in the DOM
    expect(queryByTestId('alert-container')).not.toBeInTheDocument();
  });

  describe('displays updated structure tree after', () => {
    test('deleting a timespan', () => {
      const { getByTestId, queryAllByTestId } = renderWithRedux(
        <StructureOutputContainer structureIsSaved={mockStructureIsSaved} />,
        { initialState }
      );

      expect(getByTestId('structure-output-list')).toBeInTheDocument();
      let timespanToDelete = queryAllByTestId('list-item')[4];
      expect(
        timespanToDelete.children[0].innerHTML).toEqual(
          ' Segment 1.2 (00:00:11.231 - 00:08:00.001)'
        );
      // Get the delete button from the list item controls
      let deleteButton = timespanToDelete.children[1].children[2];
      fireEvent.click(deleteButton);

      expect(getByTestId('delete-confirmation-popup')).toBeInTheDocument();
      expect(
        getByTestId('delete-confirmation-message').innerHTML).toEqual(
          'Are you sure you\'d like to delete <strong>Segment 1.2</strong>?'
        );
      // Confirm delete action
      fireEvent.click(getByTestId('delete-confirmation-confirm-btn'));
      expect(timespanToDelete).not.toBeInTheDocument();
    });

    test('deleting a heading without children', () => {
      const { getByTestId, queryAllByTestId } = renderWithRedux(
        <StructureOutputContainer structureIsSaved={mockStructureIsSaved} />,
        { initialState }
      );

      expect(getByTestId('structure-output-list')).toBeInTheDocument();
      let headingToDelete = queryAllByTestId('list-item')[2];
      expect(
        headingToDelete.children[0].innerHTML).toEqual(
          'Sub-Segment 1.1'
        );
      // Get the delete button from the list item controls
      let deleteButton = headingToDelete.children[1].children[1];
      fireEvent.click(deleteButton);

      expect(getByTestId('delete-confirmation-popup')).toBeInTheDocument();
      expect(
        getByTestId('delete-confirmation-message').innerHTML).toEqual(
          'Are you sure you\'d like to delete <strong>Sub-Segment 1.1</strong>?'
        );
      // Confirm delete action
      fireEvent.click(getByTestId('delete-confirmation-confirm-btn'));
      expect(headingToDelete).not.toBeInTheDocument();
    });

    test('deleting a heading with children', () => {
      const { getByTestId, queryAllByTestId } = renderWithRedux(
        <StructureOutputContainer structureIsSaved={mockStructureIsSaved} />,
        { initialState }
      );

      expect(getByTestId('structure-output-list')).toBeInTheDocument();
      let headingToDelete = queryAllByTestId('list-item')[5];
      expect(
        headingToDelete.children[0].innerHTML).toEqual(
          'Second segment'
        );
      // Get the delete button from the list item controls
      let deleteButton = headingToDelete.children[1].children[1];
      fireEvent.click(deleteButton);

      expect(getByTestId('delete-confirmation-popup')).toBeInTheDocument();
      expect(
        getByTestId('delete-confirmation-message').innerHTML).toEqual(
          'Are you sure you\'d like to delete <strong>Second segment</strong> and it\'s <strong>1</strong> child item?'
        );
      // Confirm delete action
      fireEvent.click(getByTestId('delete-confirmation-confirm-btn'));
      expect(headingToDelete).not.toBeInTheDocument();
    });
  });
});
