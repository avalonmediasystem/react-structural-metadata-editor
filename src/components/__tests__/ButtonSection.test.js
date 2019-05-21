import React from 'react';
import Peaks from 'peaks';
import { fireEvent, cleanup, wait } from 'react-testing-library';
import 'jest-dom/extend-expect';
import { renderWithRedux } from '../../services/testing-helpers';
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
    streamMediaRetrieved: true
  },
  peaksInstance: {
    peaks: Peaks.init(peaksOptions)
  }
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
    const { getByTestId, getByText } = renderWithRedux(<ButtonSection />, {
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
  // TODO: Fill these in
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
