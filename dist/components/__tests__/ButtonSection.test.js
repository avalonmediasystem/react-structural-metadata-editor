import React from 'react';
import Peaks from 'peaks';
import { fireEvent, cleanup, wait } from 'react-testing-library';
import 'jest-dom/extend-expect';
import { renderWithRedux, testSmData } from '../../services/testing-helpers';
import ButtonSection from '../ButtonSection';
import mockAxios from 'axios';

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
  forms: {
    structureInfo: {
      structureRetrieved: true,
    },
    streamInfo: {
      streamMediaError: false,
    },
  },
  peaksInstance: {
    peaks: Peaks.init(peaksOptions),
    duration: 1738.945,
  },
  structuralMetadata: { smData: testSmData },
};

afterEach(cleanup);

describe('ButtonSection class', () => {
  test('loads and displays initial add heading and timespan buttons', () => {
    const { getByTestId, getByText } = renderWithRedux(<ButtonSection />, {
      initialState,
    });

    expect(getByTestId('button-row')).toBeInTheDocument();
    expect(getByText(/add a heading/i)).toBeInTheDocument();
    expect(getByText(/Add a Timespan/i)).toBeInTheDocument();
  });

  describe('add heading button', () => {
    let buttonSection;
    beforeEach(() => {
      buttonSection = renderWithRedux(<ButtonSection />, { initialState });
      fireEvent.click(buttonSection.getByTestId('add-heading-button'));
    });

    test('opens the heading form with a disabled save button', async () => {
      await wait(() => {
        expect(buttonSection.getByTestId('heading-form-wrapper')).toHaveClass(
          'in'
        );
      });
      expect(
        buttonSection.getByTestId('heading-form-save-button')
      ).toBeDisabled();
    });

    test('clicking the cancel button closes the form', async () => {
      await wait(() => {
        expect(
          buttonSection.getByTestId('heading-form-wrapper')
        ).not.toHaveClass('in');
      });
    });
  });

  describe('add timespan button', () => {
    let buttonSection;
    beforeEach(() => {
      buttonSection = renderWithRedux(<ButtonSection />, { initialState });
      fireEvent.click(buttonSection.getByTestId('add-timespan-button'));
    });

    test('opens a timespan form with default times and disabled save button', async () => {
      await wait(() => {
        expect(buttonSection.getByTestId('timespan-form-wrapper')).toHaveClass(
          'in'
        );
      });
      expect(
        buttonSection.getByTestId('timespan-form-save-button')
      ).toBeDisabled();
    });

    test('clicking the cancel button closes the form', async () => {
      await wait(() => {
        expect(
          buttonSection.getByTestId('timespan-form-wrapper')
        ).not.toHaveClass('in');
      });
    });

    test('is disabled when fetching stream fails', async () => {
      mockAxios.get.mockImplementationOnce(() => {
        return Promise.reject({ error: 'Network Error' });
      });
      const nextState = {
        ...initialState,
        forms: {
          structureInfo: {
            structureRetrieved: true,
          },
          streamInfo: {
            streamMediaError: true,
          },
        },
      };
      buttonSection.rerenderWithRedux(<ButtonSection />, nextState);
      await wait(() => {
        expect(buttonSection.getByTestId('add-timespan-button')).toBeDisabled();
      });
    });
  });

  test('heading and timespan forms operate in tandem with each other', async () => {
    const { getByTestId } = renderWithRedux(<ButtonSection />, {
      initialState,
    });

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
});
