import React from 'react';
import { cleanup, wait } from 'react-testing-library';
import 'jest-dom/extend-expect';
import WaveformContainer from '../WaveformContainer';
import { manifest, renderWithRedux, testSmData } from '../../services/testing-helpers';
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
  manifest: {
    manifest: manifest,
    mediaInfo: {
      duraion: 662.037,
      src: 'https://example.com/volleyball-for-boys/volleyball-for-boys.mp4'
    }
  },
  peaksInstance: {
    peaks: peaksInst,
    duration: 662.037
  }
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
  let originalError, originalLogger;
  beforeEach(() => {
    /** Mock console.error and console.log functions with empty jest.fn().
     *  This avoids multiple console outputs from within Peaks.init() function
     *  while the Waveform component (child of WaveformContainer) gets rendered.
     */
    originalError = console.error;
    console.error = jest.fn();
    originalLogger = console.log;
    console.log = jest.fn();
  });
  afterEach(() => {
    console.error = originalError;
    console.log = originalLogger;
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
        manifestURL="https://example.com/manifest.json"
        structureURL="https://mockurl.edu/structure.json"
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

  test('waveform renders when manifest.json is valid', async () => {
    mockAxios.get.mockImplementationOnce(() => {
      return Promise.resolve({
        status: 200,
        data: manifest,
      });
    });
    mockAxios.head.mockImplementationOnce(() => {
      return Promise.resolve({
        status: 200,
        request: {
          responseURL: 'https://example.com/volleyball-for-boys/waveform.json',
        },
        headers: {
          'content-disposition': 'attachment; filename="waveform.json"',
        },
      });
    });
    const { getByTestId } = renderWithRedux(
      <WaveformContainer
        initStructure={initStructure}
        manifestURL="https://example.com/manifest.json"
        canvasIndex={0}
      />,
      { initialState }
    );

    await wait(() => {
      expect(mockAxios.get).toHaveBeenCalledTimes(1);
      expect(mockAxios.get).toHaveBeenCalledWith(
        'https://example.com/manifest.json',
        { headers: { 'Content-Type': 'application/json' } }
      );
      expect(getByTestId('waveform-container')).toBeInTheDocument();
    });
  });
});
