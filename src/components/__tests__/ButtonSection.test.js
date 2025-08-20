import React from 'react';
import Peaks from 'peaks';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderWithRedux, testSmData } from '../../services/testing-helpers';
import ButtonSection from '../ButtonSection';
import * as hooks from '../../services/sme-hooks';

// Mock react-error-boundary library
jest.mock('react-error-boundary', () => ({
  useErrorBoundary: jest.fn(() => ({
    showBoundary: jest.fn(),
  }))
}));

describe('ButtonSection component', () => {
  test('does not render when structure/waveform data is not present', () => {
    const { queryByTestId } = renderWithRedux(<ButtonSection />);
    expect(queryByTestId('button-row')).toBeNull();
  });

  describe('renders', () => {
    let buttonSection = null,
      initialState;
    beforeEach(() => {
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

      initialState = {
        forms: {
          waveformRetrieved: true,
          streamInfo: {
            // stream URL works
            streamMediaError: false,
            streamMediaLoading: false,
          },
          structureInfo: {
            structureRetrieved: true,
          },
          alerts: [],
        },
        peaksInstance: {
          peaks: peaksInst,
          duration: 1738.945,
        },
        structuralMetadata: { smData: testSmData },
      };
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
      buttonSection = renderWithRedux(<ButtonSection />, {
        initialState,
      });
    });

    test('2 buttons for adding headings and timespans', () => {
      expect(buttonSection.getByTestId('button-row')).toBeInTheDocument();
      expect(buttonSection.getByText(/add a heading/i)).toBeInTheDocument();
      expect(buttonSection.getByText(/Add a Timespan/i)).toBeInTheDocument();
    });

    describe('\'Add a Heading\' button that renders a collapsible form', () => {
      test('when clicked', () => {
        const { getByTestId } = buttonSection;
        // Form is not shown on initial render
        expect(getByTestId('heading-form-wrapper')).not.toHaveClass('show');

        fireEvent.click(getByTestId('add-heading-button'));

        // Immediately set the class to collapsing
        expect(getByTestId('heading-form-wrapper')).toHaveClass('collapsing');

        // Then change to 'collapse show'
        waitFor(() => {
          expect(getByTestId('heading-form-wrapper')).toHaveClass('collapse show');
        });

        expect(getByTestId('heading-form-save-button')).toBeDisabled();
        expect(getByTestId('heading-form-cancel-button')).not.toBeDisabled();
      });

      test('that closes when clicked on cancel button', () => {
        const { getByTestId } = buttonSection;

        fireEvent.click(getByTestId('heading-form-cancel-button'));

        expect(getByTestId('heading-form-wrapper')).not.toHaveClass('show');
      });
    });

    describe('\'Add a Timespan\' button that', () => {
      describe('renders a collapsible form', () => {
        test('with default values when clicked', () => {
          const { getByTestId } = buttonSection;

          // Form is not shown on initial render
          expect(getByTestId('timespan-form-wrapper')).not.toHaveClass('show');

          fireEvent.click(getByTestId('add-timespan-button'));

          // Immediately set the class to collapsing
          expect(getByTestId('timespan-form-wrapper')).toHaveClass('collapsing');

          // Then change to 'collapse show'
          waitFor(() => {
            expect(getByTestId('timespan-form-wrapper')).toHaveClass('collapse show');
          });

          // Begin Time and End Time is already filled with default values
          expect(getByTestId('timespan-form-begintime').value).toBe('00:00:00.000');
          expect(getByTestId('timespan-form-endtime').value).toBe('00:00:03.321');
          // Save button is disabled
          expect(getByTestId('timespan-form-save-button')).toBeDisabled();
        });

        test('that closes when clicked on cancel button', () => {
          const { getByTestId } = buttonSection;

          fireEvent.click(getByTestId('timespan-form-cancel-button'));

          expect(getByTestId('timespan-form-wrapper')).not.toHaveClass('show');
        });
      });

      test('is disabled when there is an error in fetching stream media file', () => {
        const nextState = {
          ...initialState,
          forms: {
            ...initialState.forms,
            streamInfo: {
              streamMediaError: true,
              streamMediaLoading: false,
            },
          },
        };
        buttonSection.rerenderWithRedux(<ButtonSection />, nextState);
        expect(buttonSection.getByTestId('add-timespan-button')).toBeDisabled();
      });
    });

    test('forms that operate in tandem with each other', () => {
      const { getByTestId } = buttonSection;

      // Both forms are not displaying on initial render
      expect(getByTestId('heading-form-wrapper')).not.toHaveClass('show');
      expect(getByTestId('timespan-form-wrapper')).not.toHaveClass('show');

      // Click 'Add a Heading' button
      fireEvent.click(getByTestId('add-heading-button'));
      expect(getByTestId('heading-form-wrapper')).toHaveClass('collapsing');
      waitFor(() => {
        expect(getByTestId('heading-form-wrapper')).toHaveClass('collapse show');
      });
      expect(getByTestId('timespan-form-wrapper')).not.toHaveClass('show');

      // Click 'Add a Timespan' button
      fireEvent.click(getByTestId('add-timespan-button'));
      expect(getByTestId('timespan-form-wrapper')).toHaveClass('collapsing');
      waitFor(() => {
        expect(getByTestId('timespan-form-wrapper')).toHaveClass('collapse show');
      });
      expect(getByTestId('heading-form-wrapper')).not.toHaveClass('show');

      // Click 'Add a Heading' button again
      fireEvent.click(getByTestId('add-heading-button'));
      expect(getByTestId('heading-form-wrapper')).toHaveClass('collapsing');
      waitFor(() => {
        expect(getByTestId('heading-form-wrapper')).toHaveClass('collapse show');
      });
      expect(getByTestId('timespan-form-wrapper')).not.toHaveClass('show');
    });

    describe('and allows to add 2 timespans in a row', () => {
      let timespanButton, beginTime, endTime;
      beforeEach(() => {
        const { getByTestId } = buttonSection;
        timespanButton = getByTestId('add-timespan-button');
        beginTime = getByTestId('timespan-form-begintime');
        endTime = getByTestId('timespan-form-endtime');
      });

      describe('after saving the first timespan', () => {
        test('and without moving the playhead to a different time', () => {
          const { getByTestId } = buttonSection;
          // Add first timespan
          fireEvent.click(timespanButton);

          // Form is filled with default values
          expect(getByTestId('timespan-form-begintime').value).toBe('00:00:00.000');
          expect(getByTestId('timespan-form-endtime').value).toBe('00:00:03.321');

          // Fill the form
          fireEvent.change(beginTime, { target: { value: '00:00:01.000' } });
          fireEvent.change(getByTestId('timespan-form-title'), {
            target: { value: 'Title' },
          });
          fireEvent.change(getByTestId('timespan-form-childof'), {
            target: { value: '123a-456b-789c-1d' },
          });
          // Saving the timespan closes the form
          fireEvent.click(getByTestId('timespan-form-save-button'));
          expect(getByTestId('timespan-form-wrapper')).not.toHaveClass('show');

          // Open the timespan form again to add a second timespan
          fireEvent.click(timespanButton);

          // Form is filled with time values nested within the newly created timespan
          expect(getByTestId('timespan-form-begintime').value).toBe('00:00:00.000');
          expect(getByTestId('timespan-form-endtime').value).toBe('00:00:03.321');
        });

        test('and moving playhead to a different time', () => {
          const { getByTestId } = buttonSection;
          // Add first timespan
          fireEvent.click(timespanButton);
          // Form is filled with default values
          expect(getByTestId('timespan-form-begintime').value).toBe('00:00:00.000');
          expect(getByTestId('timespan-form-endtime').value).toBe('00:00:03.321');

          // Fill the form
          fireEvent.change(beginTime, { target: { value: '00:00:01.000' } });
          fireEvent.change(getByTestId('timespan-form-title'), {
            target: { value: 'Title' },
          });
          fireEvent.change(getByTestId('timespan-form-childof'), {
            target: { value: '123a-456b-789c-1d' },
          });
          // Saving the timespan closes the form
          fireEvent.click(getByTestId('timespan-form-save-button'));
          expect(getByTestId('timespan-form-wrapper')).not.toHaveClass('show');

          // Move playhead to 00:00:11.231 time marker
          initialState.peaksInstance.peaks.player.seek(11.231);

          // Update mocked neighbor calculation from hooks
          jest.spyOn(hooks, 'useFindNeighborSegments').mockImplementation(() => ({
            prevSiblingRef: {
              current: {
                type: 'span', label: 'Segment 1.1', id: '123a-456b-789c-3d',
                begin: '00:00:03.321', end: '00:00:10.321', valid: true,
                timeRange: { start: 3.321, end: 10.321 }
              },
            },
            nextSiblingRef: {
              current: {
                type: 'span', label: 'Segment 2.1', id: '123a-456b-789c-8d',
                begin: '00:09:03.241', end: '00:15:00.001', valid: true,
                timeRange: { start: 543.241, end: 900.001 }
              }
            }, parentTimespanRef: {
              current: {
                type: 'span', label: 'Segment 1.2', id: '123a-456b-789c-4d',
                begin: '00:00:11.231', end: '00:08:00.001', valid: true,
                timeRange: { start: 11.231, end: 480.001 }
              },
            }
          }));
          // Open the timespan form again to add a second timespan
          fireEvent.click(timespanButton);

          // Form is filled with time values nested within the current timespan
          // ranging from 00:00:11.231 -> 00:01:11.231
          expect(getByTestId('timespan-form-begintime').value).toBe('00:00:11.231');
          expect(getByTestId('timespan-form-endtime').value).toBe('00:01:11.231');
        });
      });

      describe('without saving first timespan', () => {
        test('and moving playhead to a times inside an existing timespan', () => {
          const { getByTestId } = buttonSection;
          expect(getByTestId('timespan-form-wrapper')).not.toHaveClass('show');

          // Open timespan form to add the first timespan
          fireEvent.click(timespanButton);
          // Form is filled with default values
          expect(getByTestId('timespan-form-begintime').value).toBe('00:00:00.000');
          expect(getByTestId('timespan-form-endtime').value).toBe('00:00:03.321');
          // Change the given values
          fireEvent.change(beginTime, { target: { value: '00:00:01.000' } });
          // Close the form without saving
          fireEvent.click(getByTestId('timespan-form-cancel-button'));
          expect(getByTestId('timespan-form-wrapper')).not.toHaveClass('show');

          // Move playhead to 00:07:00.00 time marker
          initialState.peaksInstance.peaks.player.seek(420.0);

          // Update mocked neighbor calculation from hooks
          jest.spyOn(hooks, 'useFindNeighborSegments').mockImplementation(() => ({
            prevSiblingRef: {
              current: {
                type: 'span', label: 'Segment 1.1', id: '123a-456b-789c-3d',
                begin: '00:00:03.321', end: '00:00:10.321', valid: true,
                timeRange: { start: 3.321, end: 10.321 }
              },
            },
            nextSiblingRef: {
              current: {
                type: 'span', label: 'Segment 2.1', id: '123a-456b-789c-8d',
                begin: '00:09:03.241', end: '00:15:00.001', valid: true,
                timeRange: { start: 543.241, end: 900.001 }
              }
            }, parentTimespanRef: {
              current: {
                type: 'span', label: 'Segment 1.2', id: '123a-456b-789c-4d',
                begin: '00:00:11.231', end: '00:08:00.001', valid: true,
                timeRange: { start: 11.231, end: 480.001 }
              },
            }
          }));

          // Open the timespan form again to add a timspan
          fireEvent.click(timespanButton);
          // Form is filled with time values that are nested within the current timespan
          // ranging from 00:07:00.000 -> 00:08.00.000 (60 seconds)
          expect(getByTestId('timespan-form-begintime').value).toBe('00:07:00.000');
          expect(getByTestId('timespan-form-endtime').value).toBe('00:08:00.000');
        });

        test('and moving playhead to a time outside any existing timespan', () => {
          const { getByTestId } = buttonSection;
          expect(getByTestId('timespan-form-wrapper')).not.toHaveClass('show');

          // Open timespan form to add the first timespan
          fireEvent.click(timespanButton);
          // Form is filled with default values
          expect(getByTestId('timespan-form-begintime').value).toBe('00:00:00.000');
          expect(getByTestId('timespan-form-endtime').value).toBe('00:00:03.321');

          // Close the form without saving
          fireEvent.click(getByTestId('timespan-form-cancel-button'));
          expect(getByTestId('timespan-form-wrapper')).not.toHaveClass('show');

          // Move playhead to 00:15:20.00 time marker
          initialState.peaksInstance.peaks.player.seek(920.0);

          // Update mocked neighbor calculation from hooks
          jest.spyOn(hooks, 'useFindNeighborSegments').mockImplementation(() => ({
            prevSiblingRef: {
              current: {
                type: 'span', label: 'Segment 2.1', id: '123a-456b-789c-8d',
                begin: '00:09:03.241', end: '00:15:00.001', valid: true,
                timeRange: { start: 543.241, end: 900.001 }
              },
            },
            nextSiblingRef: { current: null }, parentTimespanRef: { current: null }
          }));

          // Open the timespan form again to add a timspan
          fireEvent.click(timespanButton);
          // Form is filled with time values starting at the current playhead time -> + 60 seconds
          expect(getByTestId('timespan-form-begintime').value).toBe('00:15:20.000');
          expect(getByTestId('timespan-form-endtime').value).toBe('00:16:20.000');
        });
      });
    });
  });
});
