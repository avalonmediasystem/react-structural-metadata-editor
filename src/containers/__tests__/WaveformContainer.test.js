import React from 'react';
import { cleanup, wait } from 'react-testing-library';
import 'jest-dom/extend-expect';
import WaveformContainer from '../WaveformContainer';
import { renderWithRedux, testSmData } from '../../services/testing-helpers';
import mockAxios from 'axios';
import Peaks from 'peaks';

// Mocking the external libraries used in the component execution
jest.mock('rxjs');

let peaksInst = null;
Peaks.init({}, (err, peaks) => {
  peaksInst = peaks;
});

// Setup Redux store for tests
const initialState = {
  structuralMetadata: {
    smData: testSmData,
  },
};

const initStructure = {
  type: 'root',
  label: 'Ima Title',
  id: '123a-456b-789c-0d',
  items: [
    {
      type: 'div',
      label: 'First segment',
      id: '123a-456b-789c-1d',
      items: [
        {
          type: 'div',
          label: 'Sub-Segment 1.1',
          id: '123a-456b-789c-2d',
          items: [],
        },
      ],
    },
  ],
};

afterEach(cleanup);

describe('WaveformContainer component', () => {
  let originalError;
  beforeEach(() => {
    /** Mock console.error function with empty jest.fn().
     *  This avoids multiple console.error outputs from within Peaks.init() function
     *  while the Waveform component (child of WaveformContainer) gets rendered.
     */
    originalError = console.error;
    console.error = jest.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  test('renders', async () => {
    mockAxios.head.mockImplementationOnce(() => {
      return Promise.resolve({
        status: 200,
        request: {
          responseURL: 'https://mockurl.edu/waveform.json',
        },
      });
    });

    mockAxios.get.mockImplementationOnce(() => {
      return Promise.resolve({
        data: testSmData[0],
      });
    });

    const { getByTestId } = renderWithRedux(
      <WaveformContainer
        initStructure={initStructure}
      />,
      { initialState }
    );

    await wait(() => {
      expect(getByTestId('waveform-container')).toBeInTheDocument();
      expect(getByTestId('zoomview-view')).toBeInTheDocument();
      expect(getByTestId('overview-view')).toBeInTheDocument();
    });
  });

  test('waveform doesn\'t render when fetching manifest fails', async () => {
    mockAxios.head.mockImplementationOnce(() => {
      return Promise.resolve({
        status: 200,
        request: {
          responseURL: 'https://mockurl.edu/manifest.json',
        },
        headers: {
          'content-disposition': 'attachment; filename="manifest.json"',
        },
      });
    });
    mockAxios.get.mockImplementationOnce(() => {
      return Promise.reject({
        error: 'Network Error',
      });
    });

    const { getByTestId } = renderWithRedux(
      <WaveformContainer
        initStructure={initStructure}
      />,
      { initialState }
    );

    await wait(() => {
      expect(mockAxios.get).toHaveBeenCalledTimes(1);
      expect(mockAxios.get).toHaveBeenCalledWith(
        'https://mockurl.edu/structure.json',
        { headers: { 'Content-Type': 'application/json' } }
      );
      expect(getByTestId('waveform-container')).toBeInTheDocument();
    });
  });
});
