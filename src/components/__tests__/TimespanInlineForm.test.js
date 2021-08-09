import React from 'react';
import { cleanup, fireEvent } from 'react-testing-library';
import 'jest-dom/extend-expect';
import TimespanInlineForm from '../TimespanInlineForm';
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

const initialState = {
  structuralMetadata: {
    smData: testSmData,
  },
  peaksInstance: {
    peaks: Peaks.init(peaksOptions),
    segment: null,
    startTimeChanged: null,
  },
};

afterEach(cleanup);

// Set up props for the tests
const setTypingMock = jest.fn();
const setInitializingMock = jest.fn();
const saveFnMock = jest.fn();
const cancelFnMock = jest.fn();

let props = {
  isTyping: false,
  isInitializing: true,
  setIsTyping: setTypingMock,
  setIsInitializing: setInitializingMock,
  saveFn: saveFnMock,
  cancelFn: cancelFnMock,
};

describe('TimespanInlineForm component', () => {
  describe('renders', () => {
    let timespanInlineForm;
    beforeEach(() => {
      props = {
        ...props,
        item: {
          type: 'span',
          label: 'Segment 2.1',
          id: '123a-456b-789c-8d',
          begin: '00:09:03.241',
          end: '00:15:00.001',
        },
      };
      timespanInlineForm = renderWithRedux(<TimespanInlineForm {...props} />, {
        initialState,
      });
    });
    test('successfully with existing values', () => {
      expect(
        timespanInlineForm.getByTestId('timespan-inline-form')
      ).toBeInTheDocument();
      expect(timespanInlineForm.getByLabelText(/title/i).value).toBe(
        'Segment 2.1'
      );
      expect(timespanInlineForm.getByLabelText(/begin time/i).value).toBe(
        '00:09:03.241'
      );
      expect(timespanInlineForm.getByLabelText(/end time/i).value).toBe(
        '00:15:00.001'
      );
    });

    test('proper validation messages for title', () => {
      expect(
        timespanInlineForm
          .getByTestId('timespan-inline-form-title')
          .classList.contains('has-success')
      ).toBeTruthy();
      expect(
        timespanInlineForm.getByTestId('inline-form-save-button')
      ).toBeEnabled();
      const titleInput = timespanInlineForm.getByLabelText(/title/i);
      fireEvent.change(titleInput, { target: { value: 'a' } });
      expect(
        timespanInlineForm
          .getByTestId('timespan-inline-form-title')
          .classList.contains('has-error')
      ).toBeTruthy();
      expect(
        timespanInlineForm.getByTestId('inline-form-save-button')
      ).toBeDisabled();
    });

    test('proper validation messages for begin/end time changes and save button is disabled/enabled', () => {
      const saveButton = timespanInlineForm.getByTestId(
        'inline-form-save-button'
      );

      const beginTimeInput = timespanInlineForm.getByLabelText(/begin time/i);
      const beginTimeForm = timespanInlineForm.getByTestId(
        'timespan-inline-form-begintime'
      );
      expect(saveButton).toBeEnabled();

      timespanInlineForm.rerenderWithRedux(
        <TimespanInlineForm {...props} isTyping={true} isInitializing={false} />
      );

      fireEvent.change(beginTimeInput, {
        target: { value: '00:' },
      });
      expect(beginTimeForm.classList.contains('has-error')).toBeTruthy();
      expect(saveButton).toBeDisabled();

      fireEvent.change(beginTimeInput, {
        target: { value: '00:09:00.001' },
      });
      expect(beginTimeForm.classList.contains('has-error')).toBeFalsy();
      expect(beginTimeForm.classList.contains('has-success')).toBeTruthy();
      expect(saveButton).toBeEnabled();
    });
  });

  describe('form changes when segment in the waveform change', () => {
    let timespanInlineForm, saveButton, segment;
    beforeEach(() => {
      props = {
        ...props,
        item: {
          type: 'span',
          label: 'Segment 2.1',
          id: '123a-456b-789c-8d',
          begin: '00:09:03.241',
          end: '00:15:00.001',
        },
      };
      timespanInlineForm = renderWithRedux(<TimespanInlineForm {...props} />, {
        initialState,
      });
      saveButton = timespanInlineForm.getByTestId('inline-form-save-button');
      segment =
        initialState.peaksInstance.peaks.segments.getSegment(
          '123a-456b-789c-8d'
        );
    });

    test('move handles to overlap another segment', () => {
      // Changed from 00:09:03.241 -> 00:07:30.001
      segment.update({ startTime: 450.001 });

      // Update the redux store with new segment value
      const nextState = {
        structuralMetadata: {
          smData: testSmData,
        },
        peaksInstance: {
          peaks: Peaks.init(peaksOptions),
          segment: segment,
          isDragging: true,
          startTimeChanged: true,
        },
      };
      timespanInlineForm.rerenderWithRedux(
        <TimespanInlineForm {...props} />,
        nextState
      );

      // expects begin value to be the last possible valid value: 00:08:00.001
      expect(timespanInlineForm.getByLabelText(/begin time/i).value).toBe(
        '00:08:00.001'
      );
      // end time does not change
      expect(timespanInlineForm.getByLabelText(/end time/i).value).toBe(
        '00:15:00.001'
      );
      expect(saveButton).toBeEnabled();
    });

    test('move handles another valid time', () => {
      // Changed from 00:09:03.241 -> 00:09:00.001
      segment.update({ startTime: 540.001 });
      // Update the redux store with new segment value
      const nextState = {
        structuralMetadata: {
          smData: testSmData,
        },
        peaksInstance: {
          peaks: Peaks.init(peaksOptions),
          segment: segment,
          isDragging: true,
          startTimeChanged: true,
        },
      };
      timespanInlineForm.rerenderWithRedux(
        <TimespanInlineForm {...props} />,
        nextState
      );

      expect(timespanInlineForm.getByLabelText(/begin time/i).value).toBe(
        '00:09:00.001'
      );
      // end time does not change
      expect(timespanInlineForm.getByLabelText(/end time/i).value).toBe(
        '00:15:00.001'
      );
      expect(saveButton).toBeEnabled();
    });
  });

  describe('submit the inline timespan form', () => {
    let timespanInlineForm;
    beforeEach(() => {
      props = {
        ...props,
        item: {
          type: 'span',
          label: 'Segment 1.2',
          id: '123a-456b-789c-4d',
          begin: '00:00:11.231',
          end: '00:08:00.001',
        },
      };
      timespanInlineForm = renderWithRedux(
        <TimespanInlineForm {...props} isTyping={true} />,
        { initialState }
      );
      fireEvent.change(timespanInlineForm.getByLabelText(/end time/i), {
        target: { value: '00:09:00.001' },
      });
    });
    test('save the edited timespan', () => {
      fireEvent.click(
        timespanInlineForm.getByTestId('inline-form-save-button')
      );
      expect(saveFnMock).toHaveBeenCalledWith('123a-456b-789c-4d', {
        beginTime: '00:00:11.231',
        endTime: '00:09:00.001',
        timespanTitle: 'Segment 1.2',
      });
      expect(saveFnMock).toHaveBeenCalledTimes(1);
    });
    test('cancel form without saving', () => {
      fireEvent.click(
        timespanInlineForm.getByTestId('inline-form-cancel-button')
      );
      expect(cancelFnMock).toHaveBeenCalledTimes(1);
    });
  });
});
