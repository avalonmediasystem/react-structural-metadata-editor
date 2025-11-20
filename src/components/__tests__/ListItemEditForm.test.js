import React from 'react';
import Peaks from 'peaks';
import { fireEvent } from '@testing-library/react';
import { renderWithRedux, testSmData } from '../../services/testing-helpers';
import ListItemEditForm from '../ListItemEditForm';

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

const initialState = {
  structuralMetadata: {
    smData: testSmData,
  },
  peaksInstance: {
    peaks: peaksInst,
  },
};

const handleCancelMock = jest.fn();

// Mock react-error-boundary library
jest.mock('react-error-boundary', () => ({
  useErrorBoundary: jest.fn(() => ({
    showBoundary: jest.fn(),
  }))
}));

describe('ListItemEditForm component', () => {
  describe('renders', () => {
    test("HeadingInlineForm for item type 'div'", () => {
      const itemProp = {
        type: 'div',
        label: 'Sub-Segment 1.1',
        id: '123a-456b-789c-2d',
        items: [],
      };

      const { getByTestId } = renderWithRedux(
        <ListItemEditForm item={itemProp} />,
        {
          initialState,
        }
      );
      expect(getByTestId('heading-inline-form')).toBeInTheDocument();
      expect(getByTestId('inline-form-save-button')).toBeEnabled();
    });

    test("TimespanInlineForm for item type 'span'", () => {
      const itemProp = {
        type: 'span', label: 'Segment 1.2', id: '123a-456b-789c-4d',
        begin: '00:00:11.231', end: '00:08:00.001',
        timeRange: { start: 11.231, end: 480.001 }
      };

      const { getByTestId } = renderWithRedux(
        <ListItemEditForm item={itemProp} />,
        {
          initialState,
        }
      );
      expect(getByTestId('timespan-inline-form')).toBeInTheDocument();
      expect(getByTestId('inline-form-save-button')).toBeEnabled();
    });
  });

  test('clicking on cancel button closes the form', async () => {
    const itemProp = {
      type: 'span', label: 'Segment 1.2', id: '123a-456b-789c-4d',
      begin: '00:00:11.231', end: '00:08:00.001',
      timeRange: { start: 11.231, end: 480.001 }
    };

    const { getByTestId } = renderWithRedux(
      <ListItemEditForm
        item={itemProp}
        handleEditFormCancel={handleCancelMock}
      />,
      { initialState }
    );
    fireEvent.click(getByTestId('inline-form-cancel-button'));
    expect(handleCancelMock).toHaveBeenCalledTimes(1);
  });
});
