import React from 'react';
import { cleanup, wait } from 'react-testing-library';
import 'jest-dom/extend-expect';
import WaveformContainer from '../WaveformContainer';
import { manifestWithStructure, manifestWoStructure, renderWithRedux, testSmData } from '../../services/testing-helpers';
import mockAxios from 'axios';
import Peaks from 'peaks';

// Mocking the external libraries used in the component execution
jest.mock('rxjs');

let peaksInst = null;
Peaks.init({}, (err, peaks) => {
  peaksInst = peaks;
});

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

  describe('renders successfully', () => {
    let waveformContainer;

    const initialState = {
      manifest: {
        manifestFetched: true,
        mediaInfo: {
          src: 'https://example.com/manifest/high/lunchroom_manners_1024kb.mp4',
          duration: 572.4,
        },
        manifest: manifestWoStructure
      }
    };

    beforeEach(() => {
      waveformContainer = renderWithRedux(
        <WaveformContainer
          initStructure={initStructure}
        />,
        { initialState }
      );
    });

    test('with manifest', async () => {
      await wait(() => {
        expect(waveformContainer.getByTestId('waveform-container')).toBeInTheDocument();
        expect(waveformContainer.getByTestId('zoomview-view')).toBeInTheDocument();
        expect(waveformContainer.getByTestId('overview-view')).toBeInTheDocument();
      });
    });

    test('when manifest has a wavefrom resource', async () => {
      mockAxios.head.mockImplementationOnce(() => {
        return Promise.resolve({
          status: 200,
          request: {
            responseURL: 'https://example.com/lunchroom_manners/waveform.json',
          },
        });
      });

      await wait(() => {
        expect(mockAxios.head).toHaveBeenCalledTimes(1);
        expect(waveformContainer.getByTestId('waveform-container')).toBeInTheDocument();
        expect(waveformContainer.getByTestId('zoomview-view')).toBeInTheDocument();
        expect(waveformContainer.getByTestId('overview-view')).toBeInTheDocument();
      });
    });
  });

  describe('doesn\'t render', () => {
    beforeEach(() => {
      mockAxios.head.mockImplementationOnce(() => {
        return Promise.resolve({
          status: 200,
          request: {
            responseURL: 'https://example.com/lunchroom_manners/waveform.json',
          },
        });
      });
    });
    test('without manifest', async () => {
      const initialState = {
        manifest: {
          manifestFetched: false,
          mediaInfo: {
            src: '',
            duration: 0,
          },
          manifest: null
        },
      };

      const { getByTestId } = renderWithRedux(
        <WaveformContainer
          initStructure={initStructure}
        />,
        { initialState }
      );
      await wait(() => {
        expect(getByTestId('waveform-container')).toBeInTheDocument();
        expect(mockAxios.head).toHaveBeenCalledTimes(0);
      });
    });

    test('without waveform as a resource in manifest', async () => {
      const initialState = {
        manifest: {
          manifestFetched: true,
          manifest: manifestWithStructure,
          mediaInfo: {
            src: 'http://dlib.indiana.edu/iiif_av/volleyball/high/volleyball-for-boys.mp4',
            duration: 572.4,
          }
        },
      };
      const { getByTestId, queryByTestId } = renderWithRedux(
        <WaveformContainer
          initStructure={initStructure}
        />,
        { initialState }
      );

      await wait(() => {
        expect(getByTestId('waveform-container')).toBeInTheDocument();
        expect(mockAxios.head).toHaveBeenCalledTimes(0);
      });
    });
  });
});
