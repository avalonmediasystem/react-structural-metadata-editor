import React from 'react';
import { cleanup, wait, fireEvent } from 'react-testing-library';
import 'jest-dom/extend-expect';
import App from './App';
import './App.css';
import { renderWithRedux, testSmData } from './services/testing-helpers';
import mockAxios from 'axios';
import Peaks from 'peaks';

const mockStructureIsSaved = jest.fn();

let peaksInst = null;
const peaksOptions = {
  container: null,
  mediaElement: null,
  dataUri: null,
  dataUriDefaultFormat: 'json',
  keyboard: true,
  _zoomLevelIndex: 0,
  _zoomLevels: [512, 1024, 2048, 4096],
};
Peaks.init(peaksOptions, (err, peaks) => {
  peaksInst = peaks;
});

const baseState = {
  structuralMetadata: {
    smData: testSmData,
  },
  forms: {
    streamInfo: {
      streamMediaError: false,
      streamMediaLoading: true,
      streamMediaStatus: null,
    },
    alerts: [],
    structureInfo: {
      structureRetrieved: false,
      structureStatus: null,
      structureSaved: true,
    },
  },
  peaksInstance: {
    peaks: peaksInst,
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

const props = {
  initStructure: initStructure,
  streamDuration: 1738945,
  structureIsSaved: mockStructureIsSaved,
};

afterEach(cleanup);

describe('App component', () => {
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

  describe('Alert integration', () => {
    test('alert renders successfully with props', () => {
      const app = renderWithRedux(<App {...props} />, baseState);
      expect(app.queryByTestId('alert-container')).not.toBeInTheDocument();

      const updatedProps = {
        ...baseState,
        forms: {
          ...baseState.forms,
          alerts: [
            {
              alertStyle: 'danger',
              message: 'Error message',
              id: '1234-5678-90ab',
            },
          ],
        },
        peaksInstance: {
          readyPeaks: true,
          peaks: peaksInst,
        },
      };

      app.rerenderWithRedux(<App {...props} />, updatedProps);
      expect(app.getByTestId('alert-container')).toBeInTheDocument();
      expect(app.getByTestId('alert-message').innerHTML).toBe('Error message');
    });

    test('shows a persistent alert when waveform is empty', async () => {
      mockAxios.head.mockImplementationOnce(() => {
        return Promise.reject({
          response: {
            status: 404,
          },
        });
      });

      mockAxios.get.mockImplementationOnce(() => {
        return Promise.resolve({
          status: 200,
          request: {
            responseURL: 'https://mockurl.edu/waveform.json?empty=true',
          },
        });
      });

      const app = renderWithRedux(<App {...props} />, baseState);
      await wait(() => {
        expect(app.getByTestId('waveform-container')).toBeInTheDocument();
        expect(
          app.getByTestId('persistent-alert-container')
        ).toBeInTheDocument();
        expect(app.getByTestId('alert-message').innerHTML).toBe(
          'Requested waveform data is not available.'
        );
      });
    });

    test('shows an error message when there is an error in fetching structure.json', async () => {
      mockAxios.get.mockImplementationOnce(() => {
        return Promise.reject({
          response: {
            status: 404,
          },
        });
      });

      const app = renderWithRedux(<App {...props} />, baseState);
      await wait(() => {
        expect(app.getByTestId('alert-container')).toBeInTheDocument();
        expect(app.getByTestId('alert-message').innerHTML).toBe(
          'Requested data is not available.'
        );
      });
    });

    describe('saving structure back to server', () => {
      describe('when save is successful', () => {
        let app, saveButton;
        beforeEach(() => {
          mockAxios.post.mockImplementationOnce(() => {
            return Promise.resolve({
              status: 200,
            });
          });

          app = renderWithRedux(<App {...props} />, { baseState });
          saveButton = app.getByTestId('structure-save-button');

          fireEvent.click(saveButton);
        });

        test('shows a success alert', async () => {
          expect(mockAxios.post).toHaveBeenCalledTimes(1);

          await wait(() => {
            expect(app.getByTestId('alert-container')).toBeInTheDocument();
            expect(app.getByTestId('alert-message').innerHTML).toBe(
              'Saved successfully.'
            );
          });
        });

        test('closes the alert after 2000ms', async () => {
          await wait(() => {
            expect(app.getByTestId('alert-container')).toBeInTheDocument();
          });

          setTimeout(() => {
            expect(app.getByTestId('alert-container')).not.toBeInTheDocument();
          }, 2000);
        });

        test('alert closes when structure is edited again', async () => {
          await wait(() => {
            expect(app.getByTestId('alert-container')).toBeInTheDocument();

            fireEvent.click(app.queryAllByTestId('list-item-edit-btn')[0]);
          });

          expect(app.queryByTestId('alert-container')).not.toBeInTheDocument();
        });
      });
    });
    test('when save fails', async () => {
      mockAxios.post.mockImplementationOnce(() => {
        return Promise.reject({
          response: {
            status: 404,
          },
        });
      });

      const app = renderWithRedux(<App {...props} />, { baseState });
      fireEvent.click(app.getByTestId('structure-save-button'));

      expect(mockAxios.post).toHaveBeenCalledTimes(1);

      await wait(() => {
        expect(app.getByTestId('alert-container')).toBeInTheDocument();
        expect(app.getByTestId('alert-message').innerHTML).toBe(
          'Requested data is not available.'
        );
      });
    });
  });
});
