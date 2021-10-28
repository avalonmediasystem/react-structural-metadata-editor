import React from 'react';
import Peaks from 'peaks';
import { cleanup, wait, getByText, fireEvent } from 'react-testing-library';
import 'jest-dom/extend-expect';
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

afterEach(cleanup);

test("ListItemEditForm renders HeadingInlineForm for item with type 'div'", () => {
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

test("ListItemEditForm renders TimespanInlineForm for item with type 'span'", () => {
  const itemProp = {
    type: 'span',
    label: 'Segment 1.2',
    id: '123a-456b-789c-4d',
    begin: '00:00:11.231',
    end: '00:08:00.001',
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

test('clicking on cancel button calls the mock function for cancelling the form', async () => {
  const itemProp = {
    type: 'span',
    label: 'Segment 1.2',
    id: '123a-456b-789c-4d',
    begin: '00:00:11.231',
    end: '00:08:00.001',
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
