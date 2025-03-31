import React from 'react';
import { cleanup, fireEvent } from '@testing-library/react';
import TimespanForm from '../TimespanForm';
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
      labelText: '',
      id: 'temp-segment',
      editable: true,
      color: '#FBB040',
    },
    duration: 1738.945,
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

describe('Timespan component', () => {
  describe('renders', () => {
    test('successfully', () => {
      const { getByTestId } = renderWithRedux(<TimespanForm />, {
        initialState,
      });

      expect(getByTestId('timespan-form')).toBeInTheDocument();
      expect(getByTestId('timespan-form-cancel-button')).toBeInTheDocument();
      expect(getByTestId('timespan-form-save-button')).toBeInTheDocument();
    });

    test('with default begin/end time and save button disabled', () => {
      const { container, getByTestId, getAllByPlaceholderText } =
        renderWithRedux(<TimespanForm {...props} />, { initialState });

      expect(getByTestId('timespan-form-save-button')).toBeDisabled();

      // Begin Time and End Time is filled with default values
      expect(getAllByPlaceholderText('00:00:00')[0].value).toBe('00:00:00.000');
      expect(getAllByPlaceholderText('00:00:00')[1].value).toBe('00:00:03.321');

      // Child Of options list is filled with valid headings
      const childOfSelect = container.querySelector('#timespanChildOf');
      expect(childOfSelect.children.length).toBe(4);
      expect(childOfSelect.children[1].value).toBe('123a-456b-789c-0d');
    });
  });

  describe('validates', () => {
    test('timespan title', () => {
      const { container, getByTestId, getByLabelText } = renderWithRedux(
        <TimespanForm {...props} />,
        { initialState }
      );
      const saveButton = getByTestId('timespan-form-save-button');

      const titleInput = getByLabelText(/title/i);

      fireEvent.change(titleInput, { target: { value: 'N' } });
      expect(
        getByTestId('timespan-form-title').className.includes('is-invalid')
      ).toBeTruthy();
      expect(saveButton).toBeDisabled();

      fireEvent.change(titleInput, { target: { value: 'New Timespan' } });
      expect(
        getByTestId('timespan-form-title').className.includes('is-invalid')
      ).toBeFalsy();
      expect(
        getByTestId('timespan-form-title').className.includes('is-valid')
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

    describe('begin/end times', () => {
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
        fireEvent.change(childOfSelect, {
          target: { value: '123a-456b-789c-2d' },
        });
      });

      test('when form opens', () => {
        expect(
          timespanForm
            .getByTestId('timespan-form-begintime')
            .classList.contains('is-valid')
        ).toBeTruthy();
        expect(
          timespanForm
            .getByTestId('timespan-form-endtime')
            .classList.contains('is-valid')
        ).toBeTruthy();
        expect(saveButton).toBeEnabled();
      });

      test('when end time overlaps next segment', () => {
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
            .classList.contains('is-invalid')
        ).toBeTruthy();
        expect(saveButton).toBeDisabled();
      });

      test('when begin time overlaps end time', () => {
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
            .className.includes('is-invalid')
        ).toBeTruthy();
        expect(
          timespanForm
            .getByTestId('timespan-form-begintime')
            .className.includes('is-invalid')
        ).toBeTruthy();
        expect(saveButton).toBeDisabled();
      });
    });
  });

  test('with parent element selection', () => {
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

  describe('closes the form', () => {
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
      fireEvent.click(timespanForm.getByTestId('timespan-form-cancel-button'));
    });

    test('by saving the new timespan', () => {
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

    test('clears fields', () => {
      fireEvent.click(timespanForm.getByTestId('timespan-form-save-button'));
      expect(timespanForm.getByLabelText(/title/i).value).toBe('');
    });

    test('by cancelling without clearing the fields', () => {
      fireEvent.click(timespanForm.getByTestId('timespan-form-cancel-button'));
      expect(timespanForm.getByLabelText(/title/i).value).toBe('New Timespan');
    });
  });
});
