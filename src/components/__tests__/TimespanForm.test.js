import React from 'react';
import { act, fireEvent } from '@testing-library/react';
import TimespanForm from '../TimespanForm';
import { nestedTestSmData, renderWithRedux, testSmData } from '../../services/testing-helpers';
import Peaks from 'peaks';
import * as hooks from '../../services/sme-hooks';

// Temporary segment for testing Peaks interactions
const tempSegment = {
  startTime: 0,
  endTime: 3.321,
  labelText: '',
  id: 'temp-segment',
  editable: true,
  color: '#FBB040',
};

// Set up a redux store for the tests
const peaksOptions = {
  container: null,
  mediaElement: null,
  dataUri: null,
  dataUriDefaultFormat: 'json',
  keyboard: true,
  _zoomLevelIndex: 0,
  _zoomLevels: [512, 1024, 2048, 4096],
  tempSegment: tempSegment,
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
    segment: tempSegment,
    duration: 1738.945,
  },
};

// Setting up props for the tests
const setTypingMock = jest.fn();
const setInitializeMock = jest.fn();
const onSubmitMock = jest.fn();
const cancelMock = jest.fn();

const props = {
  initSegment: tempSegment,
  isInitializing: false,
  isTyping: true,
  setIsTyping: setTypingMock,
  setIsInitializing: setInitializeMock,
  onSubmit: onSubmitMock,
  cancelClick: cancelMock,
};

describe('Timespan component', () => {
  describe('renders', () => {
    beforeEach(() => {
      // Mock neighbor calculation from hooks
      jest.spyOn(hooks, 'useFindNeighborSegments').mockImplementation(() => ({
        prevSiblingRef: { current: null },
        nextSiblingRef: {
          current: {
            type: 'span', label: 'Segment 1.1', id: '123a-456b-789c-3d',
            begin: '00:00:03.321', end: '00:00:10.321', valid: true,
            timeRange: { start: 3.321, end: 10.321 }
          }
        }, parentTimespanRef: { current: null }
      }));
    });
    test('successfully', () => {
      const { getByTestId } = renderWithRedux(<TimespanForm  {...props} />, {
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

  describe('flat (non-nested) timespans', () => {
    describe('and validates', () => {
      test('timespan title', () => {
        const { getByTestId, getByLabelText } = renderWithRedux(
          <TimespanForm {...props} />,
          { initialState }
        );
        const saveButton = getByTestId('timespan-form-save-button');

        const titleInput = getByLabelText(/title/i);

        // Initially the title is empty and is invalid
        expect(titleInput.value).toBe('');
        expect(getByTestId('timespan-form-title').className.includes('is-invalid')).toBeTruthy();

        // Title is less than 2 characters and is invalid
        fireEvent.change(titleInput, { target: { value: 'N' } });
        expect(getByTestId('timespan-form-title').className.includes('is-invalid')).toBeTruthy();
        expect(saveButton).toBeDisabled();

        // Title is more than 2 characters and is valid
        fireEvent.change(titleInput, { target: { value: 'New Timespan' } });
        expect(getByTestId('timespan-form-title').className.includes('is-invalid')).toBeFalsy();
        expect(getByTestId('timespan-form-title').className.includes('is-valid')).toBeTruthy();
        expect(saveButton).toBeDisabled();

        const childOfSelect = getByLabelText(/child of/i);
        fireEvent.change(childOfSelect, {
          target: {
            value: '123a-456b-789c-2d',
          },
        });
        expect(saveButton).toBeEnabled();
      });

      describe('begin and end times', () => {
        let timespanForm, saveButton;
        let beginTimeInput, endTimeInput;
        beforeEach(() => {
          // Mock neighbor calculation from hooks
          jest.spyOn(hooks, 'useFindNeighborSegments').mockImplementation(() => ({
            prevSiblingRef: { current: null },
            nextSiblingRef: {
              current: {
                type: 'span', label: 'Segment 1.1', id: '123a-456b-789c-3d',
                begin: '00:00:03.321', end: '00:00:10.321', valid: true,
                timeRange: { start: 3.321, end: 10.321 }
              }
            }, parentTimespanRef: { current: null }
          }));
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

          beginTimeInput = timespanForm.getByLabelText(/begin time/i);
          endTimeInput = timespanForm.getByLabelText(/end time/i);

        });

        test('when form opens', () => {
          // Initial values for begin and end times are valid
          expect(beginTimeInput.value).toBe('00:00:00.000');
          expect(endTimeInput.value).toBe('00:00:03.321');
          expect(beginTimeInput.className.includes('is-valid')).toBeTruthy();
          expect(endTimeInput.className.includes('is-valid')).toBeTruthy();

          expect(saveButton).toBeEnabled();
        });

        test('when end time is changed to contain within an existing timespan', () => {
          // Change end time to be within an existing timespan
          fireEvent.change(endTimeInput, { target: { value: '00:00:04.001' } });

          expect(beginTimeInput.className.includes('is-valid')).toBeTruthy();
          expect(endTimeInput.classList.contains('is-invalid')).toBeTruthy();
          expect(saveButton).toBeDisabled();
        });

        test('when begin time overlaps end time', () => {
          // Change begin time to overlap with end time
          fireEvent.change(beginTimeInput, { target: { value: '00:00:05.001' } });

          expect(endTimeInput.className.includes('is-invalid')).toBeTruthy();
          expect(beginTimeInput.className.includes('is-invalid')).toBeTruthy();
          expect(saveButton).toBeDisabled();
        });

        test('when begin and end times are inside an existing timespan', () => {
          // Update the neighbor timespan relationships
          jest.spyOn(hooks, 'useFindNeighborSegments').mockImplementation(() => ({
            prevSiblingRef: { current: null },
            nextSiblingRef: { current: null },
            parentTimespanRef: {
              current: {
                type: 'span', label: 'Segment 1.1', id: '123a-456b-789c-3d',
                begin: '00:00:03.321', end: '00:00:10.321', valid: true,
                timeRange: { start: 3.321, end: 10.321 }
              }
            }
          }));

          // Change begin and end times to be inside an existing timespan
          fireEvent.change(beginTimeInput, { target: { value: '00:00:03.321' } });
          fireEvent.change(endTimeInput, { target: { value: '00:00:04.321' } });

          expect(beginTimeInput.className.includes('is-valid')).toBeTruthy();
          expect(endTimeInput.className.includes('is-valid')).toBeTruthy();
          expect(saveButton).toBeEnabled();
        });

        test('when begin time is within an existing timespan', () => {
          // Change begin time to be within an existing timespan
          fireEvent.change(beginTimeInput, { target: { value: '00:00:09.432' } });

          // Both begin and end times are marked invalid
          expect(beginTimeInput.value).toBe('00:00:09.432');
          expect(endTimeInput.value).toBe('00:00:03.321');
          expect(beginTimeInput.className.includes('is-invalid')).toBeTruthy();
          expect(endTimeInput.className.includes('is-invalid')).toBeTruthy();
          expect(saveButton).toBeDisabled();
        });

        test('when both begin and end times are outside of existing timespans', () => {
          // Update the neighbor timespan relationships
          jest.spyOn(hooks, 'useFindNeighborSegments').mockImplementation(() => ({
            prevSiblingRef: {
              current: {
                type: 'span', label: 'Segment 2.1', id: '123a-456b-789c-8d',
                begin: '00:09:03.241', end: '00:15:00.001', valid: true,
                timeRange: { start: 543.241, end: 900.001 }
              }
            },
            nextSiblingRef: { current: null },
            parentTimespanRef: { current: null }
          }));

          // Change begin time to be outside of existing timespans
          fireEvent.change(beginTimeInput, { target: { value: '00:15:00.001' } });
          fireEvent.change(endTimeInput, { target: { value: '00:16:00.001' } });

          expect(beginTimeInput.className.includes('is-valid')).toBeTruthy();
          expect(endTimeInput.className.includes('is-valid')).toBeTruthy();
          expect(saveButton).toBeEnabled();
        });

        test('when end time is greater than duration', () => {
          // Update the neighbor timespan relationships
          jest.spyOn(hooks, 'useFindNeighborSegments').mockImplementation(() => ({
            prevSiblingRef: {
              current: {
                type: 'span', label: 'Segment 2.1', id: '123a-456b-789c-8d',
                begin: '00:09:03.241', end: '00:15:00.001', valid: true,
                timeRange: { start: 543.241, end: 900.001 }
              }
            },
            nextSiblingRef: { current: null },
            parentTimespanRef: { current: null }
          }));

          // Change begin time to be outside of existing timespans
          fireEvent.change(beginTimeInput, { target: { value: '00:15:00.001' } });
          fireEvent.change(endTimeInput, { target: { value: '00:32:00.001' } });

          expect(beginTimeInput.className.includes('is-valid')).toBeTruthy();
          expect(endTimeInput.className.includes('is-invalid')).toBeTruthy();
          expect(saveButton).toBeDisabled();
        });
      });
    });
  });

  describe('nested timespans', () => {
    const nestedState = {
      structuralMetadata: {
        smData: nestedTestSmData,
      },
      peaksInstance: {
        peaks: peaksInst,
        isDragging: false,
        segment: tempSegment,
        duration: 1738.945,
      },
    };

    describe('and validates', () => {
      beforeEach(() => {
        // Mock neighbor calculation from hooks
        jest.spyOn(hooks, 'useFindNeighborSegments').mockImplementation(() => ({
          prevSiblingRef: { current: null },
          nextSiblingRef: {
            current: {
              type: 'span', label: 'Segment 1.1', id: '123a-456b-789c-3d',
              begin: '00:00:03.321', end: '00:00:10.321', valid: true,
              timeRange: { start: 3.321, end: 10.321 }
            }
          }, parentTimespanRef: { current: null }
        }));
      });

      test('timespan title', () => {
        const { getByTestId, getByLabelText } = renderWithRedux(
          <TimespanForm {...props} />,
          { initialState: nestedState }
        );
        const saveButton = getByTestId('timespan-form-save-button');

        const titleInput = getByLabelText(/title/i);

        // Initially the title is empty and is invalid
        expect(titleInput.value).toBe('');
        expect(getByTestId('timespan-form-title').className.includes('is-invalid')).toBeTruthy();

        // Title is less than 2 characters and is invalid
        fireEvent.change(titleInput, { target: { value: 'N' } });
        expect(getByTestId('timespan-form-title').className.includes('is-invalid')).toBeTruthy();
        expect(saveButton).toBeDisabled();

        // Title is more than 2 characters and is valid
        fireEvent.change(titleInput, { target: { value: 'New Timespan' } });
        expect(getByTestId('timespan-form-title').className.includes('is-invalid')).toBeFalsy();
        expect(getByTestId('timespan-form-title').className.includes('is-valid')).toBeTruthy();
        expect(saveButton).toBeDisabled();

        const childOfSelect = getByLabelText(/child of/i);
        fireEvent.change(childOfSelect, {
          target: { value: '123a-456b-789c-2d' },
        });
        expect(saveButton).toBeEnabled();
      });

      describe('begin and end times', () => {
        let timespanForm, saveButton;
        let beginTimeInput, endTimeInput;
        beforeEach(() => {
          // Mock neighbor calculation from hooks
          jest.spyOn(hooks, 'useFindNeighborSegments').mockImplementation(() => ({
            prevSiblingRef: { current: null },
            nextSiblingRef: {
              current: {
                type: 'span', label: 'Segment 1.1', id: '123a-456b-789c-3d',
                begin: '00:00:03.321', end: '00:00:10.321', valid: true,
                timeRange: { start: 3.321, end: 10.321 }
              }
            }, parentTimespanRef: { current: null }
          }));
          const updatedProps = {
            ...props,
            isInitializing: false,
            isTyping: true,
          };
          timespanForm = renderWithRedux(<TimespanForm {...updatedProps} />, { initialState: nestedState });
          saveButton = timespanForm.getByTestId('timespan-form-save-button');
          // Make the other values valid, so that form status depends on the changes to times
          const titleInput = timespanForm.getByLabelText(/title/i);
          const childOfSelect = timespanForm.getByLabelText(/child of/i);
          fireEvent.change(titleInput, { target: { value: 'New timespan' } });
          fireEvent.change(childOfSelect, {
            target: { value: '123a-456b-789c-2d' },
          });

          beginTimeInput = timespanForm.getByLabelText(/begin time/i);
          endTimeInput = timespanForm.getByLabelText(/end time/i);
        });

        test('when form opens', () => {
          // Initial values for begin and end times are valid
          expect(beginTimeInput.value).toBe('00:00:00.000');
          expect(endTimeInput.value).toBe('00:00:03.321');
          expect(beginTimeInput.className.includes('is-valid')).toBeTruthy();
          expect(endTimeInput.className.includes('is-valid')).toBeTruthy();

          expect(saveButton).toBeEnabled();
        });

        test('when end time is changed to contain within an existing timespan', () => {
          // Change end time to be within an existing timespan
          fireEvent.change(endTimeInput, { target: { value: '00:00:04.001' } });

          expect(beginTimeInput.className.includes('is-valid')).toBeTruthy();
          expect(endTimeInput.value).toBe('00:00:04.001');
          expect(endTimeInput.classList.contains('is-invalid')).toBeTruthy();
          expect(saveButton).toBeDisabled();
        });

        test('when begin time overlaps end time', () => {
          // Change begin time to overlap with end time
          fireEvent.change(beginTimeInput, { target: { value: '00:00:05.001' } });

          expect(endTimeInput.className.includes('is-invalid')).toBeTruthy();
          expect(beginTimeInput.className.includes('is-invalid')).toBeTruthy();
          expect(saveButton).toBeDisabled();
        });

        test('when begin and end times are inside an existing timespan', () => {
          // Update the neighbor timespan relationships
          jest.spyOn(hooks, 'useFindNeighborSegments').mockImplementation(() => ({
            prevSiblingRef: { current: null },
            nextSiblingRef: { current: null },
            parentTimespanRef: {
              current: {
                type: 'span', label: 'Segment 1.1', id: '123a-456b-789c-3d',
                begin: '00:00:03.321', end: '00:00:10.321', valid: true,
                timeRange: { start: 3.321, end: 10.321 }
              }
            }
          }));

          // Change begin and end times to be inside an existing timespan
          fireEvent.change(beginTimeInput, { target: { value: '00:00:03.321' } });
          fireEvent.change(endTimeInput, { target: { value: '00:00:04.321' } });

          expect(beginTimeInput.className.includes('is-valid')).toBeTruthy();
          expect(endTimeInput.className.includes('is-valid')).toBeTruthy();
          expect(saveButton).toBeEnabled();
        });

        test('when begin time is within an existing timespan', () => {
          // Update the neighbor timespan relationships
          jest.spyOn(hooks, 'useFindNeighborSegments').mockImplementation(() => ({
            prevSiblingRef: {
              current: {
                type: 'span', label: 'Segment 2.1.1', id: '123a-456b-789c-7d',
                begin: '00:09:10.241', end: '00:10:00.321', valid: true,
                timeRange: { start: 550.241, end: 660.321 }
              }
            },
            nextSiblingRef: {
              current: {
                type: 'span', label: 'Segment 2.1.2', id: '123a-456b-789c-8d',
                begin: '00:12:00.231', end: '00:13:00.001', valid: true,
                timeRange: { start: 720.231, end: 790.001 }
              }
            },
            parentTimespanRef: {
              current: {
                type: 'span', label: 'Segment 2.1', id: '123a-456b-789c-6d',
                begin: '00:09:00.241', end: '00:15:00.001', valid: true,
                timeRange: { start: 540.241, end: 900.001 },
              }
            }
          }));
          // Change begin time to be within an existing timespan
          fireEvent.change(beginTimeInput, { target: { value: '00:10:00.432' } });

          // Both begin and end times are marked invalid
          expect(beginTimeInput.value).toBe('00:10:00.432');
          expect(endTimeInput.value).toBe('00:00:03.321');
          expect(beginTimeInput.className.includes('is-invalid')).toBeTruthy();
          expect(endTimeInput.className.includes('is-invalid')).toBeTruthy();
          expect(saveButton).toBeDisabled();

          // Change end time to be within the existing timespan
          fireEvent.change(endTimeInput, { target: { value: '00:11:00.231' } });

          // Both begin and end times are now marked valid
          expect(beginTimeInput.value).toBe('00:10:00.432');
          expect(endTimeInput.value).toBe('00:11:00.231');
          expect(beginTimeInput.className.includes('is-valid')).toBeTruthy();
          expect(endTimeInput.className.includes('is-valid')).toBeTruthy();
          expect(saveButton).toBeEnabled();
        });

        test('when both begin and end times are outside of existing timespans', () => {
          // Update the neighbor timespan relationships
          jest.spyOn(hooks, 'useFindNeighborSegments').mockImplementation(() => ({
            prevSiblingRef: {
              current: {
                type: 'span', label: 'Segment 2.1', id: '123a-456b-789c-8d',
                begin: '00:09:03.241', end: '00:15:00.001', valid: true,
                timeRange: { start: 543.241, end: 900.001 }
              }
            },
            nextSiblingRef: { current: null },
            parentTimespanRef: { current: null }
          }));

          // Change begin time to be outside of existing timespans
          fireEvent.change(beginTimeInput, { target: { value: '00:15:00.001' } });
          fireEvent.change(endTimeInput, { target: { value: '00:16:00.001' } });

          expect(beginTimeInput.className.includes('is-valid')).toBeTruthy();
          expect(endTimeInput.className.includes('is-valid')).toBeTruthy();
          expect(saveButton).toBeEnabled();
        });

        test('when end time is greater than duration', () => {
          // Update the neighbor timespan relationships
          jest.spyOn(hooks, 'useFindNeighborSegments').mockImplementation(() => ({
            prevSiblingRef: {
              current: {
                type: 'span', label: 'Segment 2.1', id: '123a-456b-789c-8d',
                begin: '00:09:03.241', end: '00:15:00.001', valid: true,
                timeRange: { start: 543.241, end: 900.001 }
              }
            },
            nextSiblingRef: { current: null },
            parentTimespanRef: { current: null }
          }));

          // Change begin time to be outside of existing timespans
          fireEvent.change(beginTimeInput, { target: { value: '00:15:00.001' } });
          fireEvent.change(endTimeInput, { target: { value: '00:32:00.001' } });

          expect(beginTimeInput.className.includes('is-valid')).toBeTruthy();
          expect(endTimeInput.className.includes('is-invalid')).toBeTruthy();
          expect(saveButton).toBeDisabled();
        });
      });
    });
  });

  test('with parent element selection', () => {
    jest.spyOn(hooks, 'useFindNeighborSegments').mockImplementation(() => ({
      prevSiblingRef: { current: null },
      nextSiblingRef: {
        current: {
          type: 'span', label: 'Segment 1.1', id: '123a-456b-789c-3d',
          begin: '00:00:03.321', end: '00:00:10.321', valid: true,
          timeRange: { start: 3.321, end: 10.321 }
        }
      }, parentTimespanRef: { current: null }
    }));
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
      // Mock neighbor calculation from hooks
      jest.spyOn(hooks, 'useFindNeighborSegments').mockImplementation(() => ({
        prevSiblingRef: { current: null },
        nextSiblingRef: {
          current: {
            type: 'span', label: 'Segment 1.1', id: '123a-456b-789c-3d',
            begin: '00:00:03.321', end: '00:00:10.321', valid: true,
            timeRange: { start: 3.321, end: 10.321 }
          }
        }, parentTimespanRef: { current: null }
      }));
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
