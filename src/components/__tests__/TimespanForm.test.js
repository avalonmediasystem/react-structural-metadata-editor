import React from 'react';
import { cleanup, fireEvent } from 'react-testing-library';
import 'jest-dom/extend-expect';
import TimespanForm from '../TimespanForm';
import { renderWithRedux, testSmData } from '../../services/testing-helpers';

import mockPeaks from '../../../__mocks__/peaks.js';

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

const initialState = {
  structuralMetadata: {
    smData: testSmData,
  },
  peaksInstance: {
    peaks: mockPeaks.init(peaksOptions),
    isDragging: false,
    segment: {
      startTime: 0,
      endTime: 3.321,
      labelText: '',
      id: 'temp-segment',
      editable: true,
      color: '#FBB040',
    },
  },
};

// Setting up props for the tests
const setTypingMock = jest.fn();
const setInitializeMock = jest.fn();
const onSubmitMock = jest.fn();
const cancelMock = jest.fn();

const props = {
  initSegment: {
    startTime: 0,
    endTime: 3.321,
    editable: true,
    color: '#FBB040',
    id: 'temp-segment',
  },
  timespanOpen: true,
  isTyping: false,
  isInitializing: true,
  setIsTyping: setTypingMock,
  setIsInitializing: setInitializeMock,
  onSubmit: onSubmitMock,
  cancelClick: cancelMock,
};

afterEach(cleanup);

test('TimespanForm renders', () => {
  const { getByTestId } = renderWithRedux(<TimespanForm />, { initialState });

  expect(getByTestId('timespan-form')).toBeInTheDocument();
  expect(getByTestId('timespan-form-cancel-button')).toBeInTheDocument();
  expect(getByTestId('timespan-form-save-button')).toBeInTheDocument();
});

test('initial render with default begin/end time and save button disabled', () => {
  const {
    container,
    getByTestId,
    getAllByPlaceholderText,
  } = renderWithRedux(<TimespanForm {...props} />, { initialState });

  expect(getByTestId('timespan-form-save-button')).toBeDisabled();

  // Begin Time and End Time is filled with default values
  expect(getAllByPlaceholderText('00:00:00')[0].value).toBe('00:00:00.000');
  expect(getAllByPlaceholderText('00:00:00')[1].value).toBe('00:00:03.321');

  // Child Of options list is filled with valid headings
  const childOfSelect = container.querySelector('#timespanChildOf');
  expect(childOfSelect.children.length).toBe(4);
  expect(childOfSelect.children[1].value).toBe('123a-456b-789c-0d');
});

test('shows proper validation messages for title and save button is disabled/enabled', () => {
  const { getByTestId, getByLabelText } = renderWithRedux(
    <TimespanForm {...props} />,
    { initialState }
  );
  const saveButton = getByTestId('timespan-form-save-button');

  const titleInput = getByLabelText(/title/i);

  fireEvent.change(titleInput, { target: { value: 'N' } });
  expect(
    getByTestId('timespan-form-title').classList.contains('has-error')
  ).toBeTruthy();
  expect(saveButton).toBeDisabled();

  fireEvent.change(titleInput, { target: { value: 'New Timespan' } });
  expect(
    getByTestId('timespan-form-title').classList.contains('has-error')
  ).toBeFalsy();
  expect(
    getByTestId('timespan-form-title').classList.contains('has-success')
  ).toBeTruthy();
  expect(saveButton).toBeDisabled();

  const childOfSelect = getByLabelText(/child of/i);
  fireEvent.change(childOfSelect, {
    target: {
      value: '123a-456b-789c-2d',
    },
  });
  expect(saveButton).toBeEnabled();
});

describe('shows proper validation messages for begin/end time changes and save button is disabled/enabled', () => {
  let timespanForm, saveButton;
  beforeEach(() => {
    timespanForm = renderWithRedux(<TimespanForm {...props} />, {
      initialState,
    });
    saveButton = timespanForm.getByTestId('timespan-form-save-button');
    // Make the other values valid, so that form status depends on the changes to times
    const titleInput = timespanForm.getByLabelText(/title/i);
    const childOfSelect = timespanForm.getByLabelText(/child of/i);
    fireEvent.change(titleInput, { target: { value: 'New timespan' } });
    fireEvent.change(childOfSelect, { target: { value: '123a-456b-789c-2d' } });
  });
  test('begin and end times at initial render', () => {
    expect(
      timespanForm
        .getByTestId('timespan-form-begintime')
        .classList.contains('has-success')
    ).toBeTruthy();
    expect(
      timespanForm
        .getByTestId('timespan-form-endtime')
        .classList.contains('has-success')
    ).toBeTruthy();
    expect(saveButton).toBeEnabled();
  });
  test('end time overlaps next segment', () => {
    // Change props to allow changes to go through as user input from the forms
    const updatedProps = {
      ...props,
      isInitializing: false,
      isTyping: true,
    };

    timespanForm.rerenderWithRedux(
      <TimespanForm {...updatedProps} />,
      initialState
    );

    const endTimeInput = timespanForm.getByLabelText(/end time/i);
    fireEvent.change(endTimeInput, {
      target: { value: '00:00:04.001' },
    });

    expect(
      timespanForm
        .getByTestId('timespan-form-endtime')
        .classList.contains('has-error')
    ).toBeTruthy();
    expect(saveButton).toBeDisabled();
  });

  test('begin time > end time', () => {
    const updatedProps = {
      ...props,
      isInitializing: false,
      isTyping: true,
    };

    timespanForm.rerenderWithRedux(
      <TimespanForm {...updatedProps} />,
      initialState
    );

    const beginTimeInput = timespanForm.getByLabelText(/begin time/i);
    fireEvent.change(beginTimeInput, {
      target: { value: '00:00:05.001' },
    });

    expect(
      timespanForm
        .getByTestId('timespan-form-endtime')
        .classList.contains('has-error')
    ).toBeTruthy();
    expect(
      timespanForm
        .getByTestId('timespan-form-begintime')
        .classList.contains('has-error')
    ).toBeTruthy();
    expect(saveButton).toBeDisabled();
  });
});

test('enable save button by selecting a parent element for the timespan', () => {
  const { getByTestId, getByLabelText } = renderWithRedux(
    <TimespanForm {...props} />,
    { initialState }
  );

  const saveButton = getByTestId('timespan-form-save-button');

  const titleInput = getByLabelText(/title/i);
  fireEvent.change(titleInput, { target: { value: 'New timespan' } });
  expect(saveButton).toBeDisabled();

  const childOfSelect = getByLabelText(/child of/i);
  fireEvent.change(childOfSelect, { target: { value: '123a-456b-789c-2d' } });
  expect(saveButton).toBeEnabled();
});

describe('submitting the form', () => {
  let timespanForm;
  beforeEach(() => {
    timespanForm = renderWithRedux(<TimespanForm {...props} />, {
      initialState,
    });
    fireEvent.change(timespanForm.getByLabelText(/title/i), {
      target: { value: 'New Timespan' },
    });
    fireEvent.change(timespanForm.getByLabelText(/child of/i), {
      target: { value: '123a-456b-789c-2d' },
    });
  });
  test('save the new timespan', () => {
    const expectedPayload = {
      beginTime: '00:00:00.000',
      endTime: '00:00:03.321',
      timespanChildOf: '123a-456b-789c-2d',
      timespanTitle: 'New Timespan',
    };
    fireEvent.click(timespanForm.getByTestId('timespan-form-save-button'));
    expect(onSubmitMock).toHaveBeenCalledWith(expectedPayload);
    expect(onSubmitMock).toHaveBeenCalledTimes(1);
  });
  test('saving the form clears the form', () => {
    fireEvent.click(timespanForm.getByTestId('timespan-form-save-button'));
    expect(timespanForm.getByLabelText(/title/i).value).toBe('');
  });
  test('cancelling the form does not clear the form', () => {
    fireEvent.click(timespanForm.getByTestId('timespan-form-cancel-button'));
    expect(timespanForm.getByLabelText(/title/i).value).toBe('New Timespan');
  });
});
