import React from 'react';
import Peaks from 'peaks';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderWithRedux, testSmData } from '../../services/testing-helpers';
import ButtonSection from '../ButtonSection';

// Mock react-error-boundary library
jest.mock('react-error-boundary', () => ({
  useErrorBoundary: jest.fn(() => ({
    showBoundary: jest.fn(),
  }))
}));

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
      test('opens add new heading form', () => {
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

      test('add new heading form cancel button closes the form', () => {
        const { getByTestId } = buttonSection;

        fireEvent.click(getByTestId('heading-form-cancel-button'));

        expect(getByTestId('heading-form-wrapper')).not.toHaveClass('show');
      });
    });

    describe('timespan button', () => {
      test('opens add new timespan form with default values', () => {
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
        expect(getByTestId('timespan-form-begintime').value).toBe(
          '00:00:00.000'
        );
        expect(getByTestId('timespan-form-endtime').value).toBe(
          '00:00:03.321'
        );
        // Save button is disabled
        expect(getByTestId('timespan-form-save-button')).toBeDisabled();
      });

      test('add new timespan form cancel button closes the form', () => {
        const { getByTestId } = buttonSection;

        fireEvent.click(getByTestId('timespan-form-cancel-button'));

        expect(getByTestId('timespan-form-wrapper')).not.toHaveClass('show');
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

    test('forms operate in tandem with each other', () => {
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
    });

    describe('add 2 timespans in a row', () => {
      let timespanButton, beginTime, endTime;
      beforeEach(() => {
        const { getByTestId } = buttonSection;
        timespanButton = getByTestId('add-timespan-button');
        beginTime = getByTestId('timespan-form-begintime');
        endTime = getByTestId('timespan-form-endtime');
      });

      test('after saving first timespan', () => {
        const { getByTestId } = buttonSection;
        // Add first timespan
        fireEvent.click(timespanButton);
        // Form is filled with default values
        expect(beginTime.value).toBe('00:00:00.000');
        expect(endTime.value).toBe('00:00:03.321');

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

        // Form is filled with next possible time values
        expect(beginTime.value).toBe('00:00:10.321');
        expect(endTime.value).toBe('00:00:11.231');
      });

      test('without saving first timespan', () => {
        const { getByTestId } = buttonSection;

        expect(getByTestId('timespan-form-wrapper')).not.toHaveClass('show');

        // Open timespan form to add the first timespan
        fireEvent.click(timespanButton);
        // Form is filled with default values
        expect(beginTime.value).toBe('00:00:00.000');
        expect(endTime.value).toBe('00:00:03.321');
        // Change the given values
        fireEvent.change(beginTime, { target: { value: '00:00:01.000' } });
        // Close the form without saving
        fireEvent.click(getByTestId('timespan-form-cancel-button'));
        expect(getByTestId('timespan-form-wrapper')).not.toHaveClass('show');

        // Move playhead to 00:07:00.00 time marker
        initialState.peaksInstance.peaks.player.seek(420.0);

        // Open the timespan form again to add a timspan
        fireEvent.click(timespanButton);
        // Form is filled with next possible time values
        expect(beginTime.value).toBe('00:08:00.001');
        expect(endTime.value).toBe('00:09:00.001');
      });
    });
  });
});
