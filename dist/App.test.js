import React from 'react';
import { cleanup, wait, fireEvent } from 'react-testing-library';
import 'jest-dom/extend-expect';
import App from './App';
import './App.css';
import {
  manifestWithStructure,
  manifest,
  renderWithRedux,
  testSmData,
  manifestWoStructure
} from './services/testing-helpers';
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
    smDataIsValid: true,
  },
  forms: {
    streamInfo: {
      streamMediaError: false,
      streamMediaLoading: true,
      streamMediaStatus: null,
    },
    structureInfo: {
      structureRetrieved: false,
      structureError: null,
      structureSaved: true,
    },
  },
  peaksInstance: {
    peaks: peaksInst,
    duration: 662.037
  },
  manifest: {
    manifest: manifestWithStructure,
    structure: testSmData,
    mediaInfo: {
      src: 'https://example.com/volleyball-for-boys/volleyball-for-boys.mp4',
      duration: 662.037
    },
    manifestFetched: true,
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
  structureIsSaved: mockStructureIsSaved,
  canvasIndex: 0,
  manifestURL: 'https://example.com/manifest.json',
  structureURL: 'https://example.com/structure.json'
};

describe('App component', () => {
  let originalError, originalLogger;
  beforeEach(() => {
    /** Mock console.error and console.log functions with empty jest.fn().
     *  This avoids multiple console.error/console.log outputs from within 
     *  Peaks.init() function and other modules the children components 
     *  are populated for the tests.
     */
    originalError = console.error;
    console.error = jest.fn();
    originalLogger = console.log;
    console.log = jest.fn();
  });
  afterEach(() => {
    console.error = originalError;
    console.log = originalLogger;
    cleanup();
  });

  test('generic alert renders successfully', () => {
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
    expect(mockAxios.get).toHaveBeenCalledTimes(1);
  });

  describe('renders alerts', () => {
    describe('with valid manifest', () => {
      test('with empty waveform, shows persistent alert', async () => {
        mockAxios.get.mockImplementationOnce(() => {
          return Promise.resolve({
            status: 200,
            data: manifest
          });
        });
        mockAxios.head.mockImplementationOnce(() => {
          return Promise.reject({
            response: {
              status: 404,
            },
          });
        });

        const app = renderWithRedux(<App {...props} />, { baseState });
        await wait(() => {
          expect(app.getByTestId('waveform-container')).toBeInTheDocument();
          expect(mockAxios.get).toHaveBeenCalledTimes(1);
          expect(mockAxios.head).toHaveBeenCalledTimes(1);
          expect(
            app.getByTestId('persistent-alert-container')
          ).toBeInTheDocument();
          expect(app.getByTestId('alert-message').innerHTML).toBe(
            'Requested waveform data is not available.'
          );
        });
      }, 10000);

      test('without waveform as a resource in manifest', async () => {
        mockAxios.get.mockImplementationOnce(() => {
          return Promise.resolve({
            status: 200,
            data: manifestWithStructure
          });
        });

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
        const app = renderWithRedux(<App {...props} />, { initialState });

        await wait(() => {
          expect(app.queryByTestId('waveform-container')).toBeInTheDocument();
          expect(mockAxios.head).toHaveBeenCalledTimes(0);
          expect(app.getByTestId('alert-container')).toBeInTheDocument();
          expect(app.getByTestId('alert-message')).toBeInTheDocument();
          expect(app.getByTestId('alert-message').innerHTML).toBe(
            'There was an error building the waveform. Please check your Manifest.'
          );
        });
      }, 10000);
    });

    describe('without manifest', () => {
      test('shows an error message', async () => {
        mockAxios.get.mockImplementationOnce(() => {
          return Promise.reject({
            response: { status: 404, }
          });
        });
        mockAxios.head.mockImplementationOnce(() => {
          return Promise.resolve({
            status: 200,
            request: {
              responseURL: 'https://example.com/lunchroom_manners/waveform.json',
            },
          });
        });

        const nextState = {
          ...baseState,
          manifest: {
            manifest: null,
            mediaInfo: {
              src: '',
              duration: 0
            },
            manifestError: 404,
            manifestFetched: false,
          }
        };
        const app = renderWithRedux(<App {...props} />, { nextState });
        await wait(() => {
          expect(mockAxios.get).toHaveBeenCalledTimes(1);
          expect(mockAxios.head).toHaveBeenCalledTimes(0);
          expect(app.getByTestId('alert-container')).toBeInTheDocument();
          expect(app.getByTestId('alert-message').innerHTML).toBe(
            'Requested IIIF Manifest was not found.'
          );
        });
      }, 10000);
    });
  });

  describe('renders structure related alerts', () => {
    const initialState = {
      manifest: {
        manifestFetched: true,
        manifest: manifest,
        mediaInfo: {
          src: 'http://example.com/volleyball-for-boys/high/volleyball-for-boys.mp4',
          duration: 662.037,
        },
        structure: [
          {
            type: 'root',
            label: 'Volleyball for Boys',
            valid: true,
            items: [
              {
                type: 'span',
                valid: true,
                label: 'Volleyball for Boys',
                begin: '00:00:00.000',
                end: '00:11:02.037'
              }
            ]
          }
        ]
      },
    };
    describe('when saving structure is successful', () => {
      let app, saveButton;
      beforeEach(() => {
        mockAxios.get.mockImplementationOnce(() => {
          return Promise.resolve({
            status: 200,
            data: manifest
          });
        });
        mockAxios.post.mockImplementationOnce(() => {
          return Promise.resolve({
            status: 200,
          });
        });

        app = renderWithRedux(<App {...props} />, { initialState });
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
      }, 10000);

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

    test('when saving structure fails', async () => {
      mockAxios.post.mockImplementationOnce(() => {
        return Promise.reject({
          response: {
            status: 404,
          },
        });
      });

      const app = renderWithRedux(<App {...props} />, { initialState });
      fireEvent.click(app.getByTestId('structure-save-button'));

      expect(mockAxios.post).toHaveBeenCalledTimes(1);

      await wait(() => {
        expect(app.getByTestId('alert-container')).toBeInTheDocument();
        expect(app.getByTestId('alert-message').innerHTML).toBe(
          'Failed to save structure successfully.'
        );
      });
    });

    test('when structure has invalid timespans', async () => {
      const updatedProps = {
        ...props,
        initStructure: {
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
                  type: 'span',
                  label: 'Sub-Segment 1.1',
                  id: '123a-456b-789c-2d',
                  begin: '00:04:00.000',
                  end: '00:03:00.30'
                },
              ],
            },
          ],
        }
      };
      const app = renderWithRedux(<App {...updatedProps} />, { initialState });

      await wait(() => {
        expect(app.queryAllByTestId('list-item').length).toBeGreaterThan(0);
        expect(app.getAllByTestId('heading-label')[0].innerHTML).toEqual('Ima Title');
        expect(app.getByTestId('alert-container')).toBeInTheDocument();
        expect(app.getByTestId('alert-message').innerHTML)
          .toEqual('Please check start/end times of the marked invalid timespan(s).');
      });
    });
  });

  describe('renders structure', () => {
    test('from manifest\'s structures', async () => {
      mockAxios.get.mockImplementationOnce(() => {
        return Promise.resolve({
          status: 200,
          data: manifestWithStructure
        });
      });

      const initialState = {
        structuralMetadata: {
          smData: testSmData,
          smDataIsValid: true,
        },
        manifest: {
          manifestFetched: true,
          manifest: manifestWithStructure,
          mediaInfo: {
            src: 'http://dlib.indiana.edu/iiif_av/volleyball/high/volleyball-for-boys.mp4',
            duration: 572.4,
          }
        },
      };
      const app = renderWithRedux(<App {...props} />, { initialState });

      await wait(() => {
        expect(app.getByTestId('structure-output-list')).toBeInTheDocument();
        expect(app.getByTestId('structure-save-button')).toBeInTheDocument();
        expect(app.queryAllByTestId('list-item').length).toBeGreaterThan(0);
        expect(app.queryAllByTestId('heading-label')[0].innerHTML).toEqual('Volleyball for Boys');
      });
    }, 10000);

    test('from initStructure when manifest\'s structures is empty', async () => {
      mockAxios.get.mockImplementationOnce(() => {
        return Promise.resolve({
          status: 200,
          data: manifestWoStructure
        });
      });

      const initialState = {
        structuralMetadata: {
          smData: testSmData,
          smDataIsValid: true,
        },
        manifest: {
          manfiest: manifestWoStructure,
          mediaInfo: {
            src: 'http://example.com/lunchroom-manners/high/lunchroom_manners_1024kb.mp4',
            duration: 660
          },
          manifestFetched: true,
          structure: null
        }
      };
      const app = renderWithRedux(<App {...props} />, { initialState });

      await wait(() => {
        expect(app.queryByTestId('structure-output-list')).toBeInTheDocument();
        expect(app.queryByTestId('structure-save-button')).toBeInTheDocument();
        expect(app.queryAllByTestId('list-item').length).toBeGreaterThan(0);
        expect(app.getAllByTestId('heading-label')[0].innerHTML).toEqual('Ima Title');
      });
    });

    test('from dummy computed structure when \
      both manifest\'s structures & initiStructure is empty', async () => {
      mockAxios.get.mockImplementationOnce(() => {
        return Promise.resolve({
          status: 200,
          data: manifestWoStructure
        });
      });

      const initialState = {
        structuralMetadata: {
          smData: testSmData,
          smDataIsValid: true,
        },
        manifest: {
          manfiest: manifestWoStructure,
          mediaInfo: {
            src: 'http://example.com/lunchroom-manners/high/lunchroom_manners_1024kb.mp4',
            duration: 660
          },
          manifestFetched: true,
          structure: null
        }
      };
      const updatedProps = {
        ...props,
        initStructure: {}
      };
      const app = renderWithRedux(<App {...updatedProps} />, { initialState });

      await wait(() => {
        expect(app.queryByTestId('structure-output-list')).toBeInTheDocument();
        expect(app.queryByTestId('structure-save-button')).toBeInTheDocument();
        expect(app.queryAllByTestId('list-item').length).toBeGreaterThan(0);
        expect(app.getAllByTestId('heading-label')[0].innerHTML)
          .toEqual('Beginning Responsibility: Lunchroom Manners');
      });
    });

    test('as empty with alert when both manifest in invalid \
    & initiStructure is empty', async () => {
      mockAxios.get.mockImplementationOnce(() => {
        return Promise.resolve({
          status: 200,
          data: undefined
        });
      });

      const initialState = {
        manifest: {
          manfiest: undefined,
          mediaInfo: {
            src: '',
            duration: 0
          },
          manifestFetched: false,
        }
      };
      const updatedProps = {
        ...props,
        initStructure: {}
      };
      const app = renderWithRedux(<App {...updatedProps} />, { initialState });

      await wait(() => {
        expect(app.getByTestId('alert-container')).toBeInTheDocument();
        expect(app.getByTestId('alert-message').innerHTML)
          .toEqual('No structure information found. Please check your Manifest.');
      });
    });

    // test('with rebuilt structure when new structure item is added', async () => {
    //   mockAxios.get.mockImplementationOnce(() => {
    //     return Promise.resolve({
    //       status: 200,
    //       data: manifestWithStructure
    //     });
    //   });
    //   mockAxios.head.mockImplementationOnce(() => {
    //     return Promise.resolve({
    //       status: 200,
    //       request: {
    //         responseURL: 'https://example.com/lunchroom_manners/waveform.json',
    //       },
    //     });
    //   });
    //   const updatedProps = { ...props, canvasIndex: 1 };
    //   const app = renderWithRedux(<App {...updatedProps} />, { baseState });

    //   await wait(() => {
    //     expect(app.getByTestId('structure-output-list')).toBeInTheDocument();
    //     expect(app.getByTestId('add-timespan-button')).toBeInTheDocument();
    //     expect(app.queryByTestId('structure-save-button')).toBeInTheDocument();

    //     const addTimespanBtn = app.getByTestId('add-timespan-button');
    //     fireEvent.click(addTimespanBtn);
    //     // console.log(app.getByTestId('timespan-form'));
    //     // Begin Time and End Time is already filled with default values
    //     // expect(app.getByTestId('timespan-form-begintime').value).toBe(
    //     //   '00:00:00.000'
    //     // );
    //     // expect(app.getByTestId('timespan-form-endtime').value).toBe(
    //     //   '00:00:03.321'
    //     // );


    //     expect(app.queryAllByTestId('list-item').length).toBeGreaterThan(0);
    //     expect(app.queryAllByTestId('heading-label')[0].innerHTML).toEqual('Volleyball for Boys');
    //   });
    // }, 10000);
  });

});
