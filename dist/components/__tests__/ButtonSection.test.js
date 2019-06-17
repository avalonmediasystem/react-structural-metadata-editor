import React from 'react';
import Peaks from 'peaks';
import { fireEvent, cleanup, wait } from 'react-testing-library';
import 'jest-dom/extend-expect';
import { renderWithRedux, testSmData } from '../../services/testing-helpers';
import ButtonSection from '../ButtonSection';

// Set up a redux store for the tests
const peaksOptions = {
  container: null,
  mediaElement: null,
  dataUri: null,
  dataUriDefaultFormat: 'json',
  keyboard: true,
  _zoomLevelIndex: 0,
  _zoomLevels: [512, 1024, 2048, 4096]
};
const initialState = {
  forms: {
    structureRetrieved: true,
    waveformRetrieved: true,
    streamInfo: {
      // stream URL works
      streamMediaError: false,
      streamMediaLoading: false
    }
  },
  peaksInstance: {
    peaks: Peaks.init(peaksOptions)
  },
  smData: testSmData
};

afterEach(cleanup);

test('loads and displays initial add heading and timespan buttons', () => {
  // Arrange
  const { getByTestId, getByText } = renderWithRedux(<ButtonSection />, {
    initialState
  });

  // Assert
  expect(getByTestId('button-row')).toBeInTheDocument();
  expect(getByText(/add a heading/i)).toBeInTheDocument();
  expect(getByText(/Add a Timespan/i)).toBeInTheDocument();
});

test('heading and timespan buttons do not display when structural or waveform data is not present', () => {
  // Arrange
  const { queryByTestId } = renderWithRedux(<ButtonSection />);

  // Assert
  expect(queryByTestId('button-row')).toBeNull();
});

describe('heading button', () => {
  test('clicking the heading button opens the heading form with a disabled save button on initial load', async () => {
    // Arrange
    const { getByTestId } = renderWithRedux(<ButtonSection />, {
      initialState
    });

    // Act
    fireEvent.click(getByTestId('add-heading-button'));

    // Assert
    await wait(() => {
      expect(getByTestId('heading-form-wrapper')).toHaveClass('collapse in');
    });
    expect(getByTestId('heading-form-save-button')).toBeDisabled();
  });

  test('clicking the cancel button closes the form', async () => {
    const { getByTestId } = renderWithRedux(<ButtonSection />, {
      initialState
    });

    fireEvent.click(getByTestId('heading-form-cancel-button'));
    await wait(() => {
      expect(getByTestId('heading-form-wrapper')).not.toHaveClass('in');
    });
  });
});

describe('timespan button', () => {
  let buttonSection;
  beforeEach(() => {
    buttonSection = renderWithRedux(<ButtonSection />, {
      initialState
    });
    fireEvent.click(buttonSection.getByTestId('add-timespan-button'));
  });
  test('clicking timespan button opens a timespan form with default values for begin/end times and disabled save button', async () => {
    await wait(() => {
      expect(buttonSection.getByTestId('timespan-form-wrapper')).toHaveClass(
        'collapse in'
      );
    });
    // Begin Time and End Time is already filled with default values
    expect(buttonSection.getAllByPlaceholderText('00:00:00')[0].value).toBe(
      '00:00:00.00'
    );
    expect(buttonSection.getAllByPlaceholderText('00:00:00')[1].value).toBe(
      '00:00:03.32'
    );
    // Save button is disabled
    expect(
      buttonSection.getByTestId('timespan-form-save-button')
    ).toBeDisabled();
  });
  test('clicking cancel button closes the timespan form', async () => {
    fireEvent.click(buttonSection.getByTestId('timespan-form-cancel-button'));
    await wait(() => {
      expect(
        buttonSection.getByTestId('timespan-form-wrapper')
      ).not.toHaveClass('in');
    });
  });
  test('disabled when there is an error in fetching stream media file', () => {
    const nextState = {
      ...initialState,
      forms: {
        ...initialState.forms,
        streamInfo: {
          streamMediaError: true,
          streamMediaLoading: false
        }
      }
    };
    buttonSection.rerenderWithRedux(<ButtonSection />, nextState);

    expect(buttonSection.getByTestId('add-timespan-button')).toBeDisabled();
  });
});

test('when one form is open, clicking the button for the other form closes current form and opens the new form', async () => {
  const { getByTestId, getByText } = renderWithRedux(<ButtonSection />, {
    initialState
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
