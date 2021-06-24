import React from 'react';
import Peaks from 'peaks';
import { fireEvent, cleanup, wait } from 'react-testing-library';
import 'jest-dom/extend-expect';
import { renderWithRedux, testSmData } from '../../services/testing-helpers';
import ButtonSection from '../ButtonSection';
import mockAxios from 'axios';

afterEach(cleanup);

describe('ButtonSection component', () => {
  describe('does not render', () => {
    test('when structural or waveform data is not present', () => {
      const { queryByTestId } = renderWithRedux(<ButtonSection />);
      expect(queryByTestId('button-row')).toBeNull();
    });
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
          peaks: Peaks.init(peaksOptions),
          duration: 1738945.306,
        },
        structuralMetadata: { smData: testSmData },
      };
      buttonSection = renderWithRedux(<ButtonSection />, {
        initialState,
      });
    });

    test('displays 2 buttons for adding headings and timespans', () => {
      expect(buttonSection.getByTestId('button-row')).toBeInTheDocument();
      expect(buttonSection.getByText(/add a heading/i)).toBeInTheDocument();
      expect(buttonSection.getByText(/Add a Timespan/i)).toBeInTheDocument();
    });

    describe('heading button', () => {
      test('opens add new heading form', async () => {
        const { getByTestId } = buttonSection;
        fireEvent.click(getByTestId('add-heading-button'));

        await wait(() => {
          expect(getByTestId('heading-form-wrapper')).toHaveClass(
            'collapse in'
          );
        });
        expect(getByTestId('heading-form-save-button')).toBeDisabled();
      });

      test('add new heading form cancel button closes the form', async () => {
        const { getByTestId } = buttonSection;
        fireEvent.click(getByTestId('heading-form-cancel-button'));
        await wait(() => {
          expect(getByTestId('heading-form-wrapper')).not.toHaveClass('in');
        });
      });
    });

    describe('timespan button', () => {
      test('opens add new timespan form with default values for begin/end times and disabled save button', async () => {
        const { getByTestId } = buttonSection;
        fireEvent.click(getByTestId('add-timespan-button'));

        await wait(() => {
          expect(getByTestId('timespan-form-wrapper')).toHaveClass('in');
          // Begin Time and End Time is already filled with default values
          expect(
            getByTestId('timespan-form-begintime').querySelector('input').value
          ).toBe('00:00:00.000');
          expect(
            getByTestId('timespan-form-endtime').querySelector('input').value
          ).toBe('00:00:03.321');
          // Save button is disabled
          expect(getByTestId('timespan-form-save-button')).toBeDisabled();
        });
      });

      test('add new timespan form cancel button closes the form', async () => {
        const { getByTestId } = buttonSection;
        fireEvent.click(getByTestId('add-timespan-button'));

        fireEvent.click(getByTestId('timespan-form-cancel-button'));
        await wait(() => {
          expect(getByTestId('timespan-form-wrapper')).not.toHaveClass('in');
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

    test('forms operate in tandem with each other', async () => {
      const { getByTestId } = buttonSection;
      fireEvent.click(getByTestId('add-heading-button'));
      await wait(() => {
        expect(getByTestId('heading-form-wrapper')).toHaveClass('in');
      });

      fireEvent.click(getByTestId('add-timespan-button'));
      await wait(() => {
        expect(getByTestId('heading-form-wrapper')).not.toHaveClass('in');
        expect(getByTestId('timespan-form-wrapper')).toHaveClass('in');
      });
    });

    describe('add 2 timespans in a row', () => {
      let timespanButton, beginTime, endTime;
      beforeEach(() => {
        const { getByTestId } = buttonSection;
        timespanButton = getByTestId('add-timespan-button');
        beginTime = getByTestId('timespan-form-begintime').querySelector(
          'input'
        );
        endTime = getByTestId('timespan-form-endtime').querySelector('input');
      });

      test('after saving first timespan', async () => {
        const { getByTestId } = buttonSection;
        // Add first timespan
        fireEvent.click(timespanButton);
        await wait(() => {
          expect(beginTime.value).toBe('00:00:00.000');
          expect(endTime.value).toBe('00:00:03.321');
        });

        // Fill the form
        fireEvent.change(beginTime, { target: { value: '00:00:01.000' } });
        fireEvent.change(
          getByTestId('timespan-form-title').querySelector('input'),
          {
            target: { value: 'Title' },
          }
        );
        fireEvent.change(
          getByTestId('timespan-form-childof').querySelector('select'),
          {
            target: { value: '123a-456b-789c-1d' },
          }
        );
        fireEvent.click(getByTestId('timespan-form-save-button'));

        // Adding second timespan
        fireEvent.click(timespanButton);
        await wait(() => {
          // Form is filled with next possible time values
          expect(beginTime.value).toBe('00:00:10.321');
          expect(endTime.value).toBe('00:00:11.231');
        });
      });

      test('without saving first timespan', async () => {
        const { getByTestId } = buttonSection;
        fireEvent.click(timespanButton);

        await wait(() => {
          expect(beginTime.value).toBe('00:00:00.000');
          expect(endTime.value).toBe('00:00:03.321');
        });

        fireEvent.change(beginTime, { target: { value: '00:00:01.000' } });
        fireEvent.click(getByTestId('timespan-form-cancel-button'));

        // Move playhead to 00:07:00.00 time marker
        initialState.peaksInstance.peaks.player.seek(420.0);

        // Adding second timespan
        fireEvent.click(timespanButton);
        await wait(() => {
          // Form is filled with next possible time values
          expect(beginTime.value).toBe('00:08:00.001');
          expect(endTime.value).toBe('00:09:00.001');
        });
      });
    });
  });
});
