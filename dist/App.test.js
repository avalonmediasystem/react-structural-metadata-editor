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
  manifestWoStructure,
  manifestWithInvalidStruct,
} from './services/testing-helpers';
import mockAxios from 'axios';

jest.mock('peaks.js');
const mockStructureIsSaved = jest.fn();

const baseState = {
  structuralMetadata: {
    smData: testSmData,
    smDataIsValid: true,
  },
  forms: {
    streamInfo: {
      streamMediaStatus: null,
    },
    structureInfo: {
      structureSaved: true,
    },
  },
  manifest: {
    manifest: manifestWithStructure,
    mediaInfo: {
      src: 'https://example.com/volleyball-for-boys/volleyball-for-boys.mp4',
      duration: 662.037
    },
    manifestFetched: true,
  },
  peaksInstance: {
    readyPeaks: true
  }
};

const props = {
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
    };

    app.rerenderWithRedux(<App {...props} />, updatedProps);
    expect(app.getByTestId('alert-container')).toBeInTheDocument();
    expect(app.getByTestId('alert-message').innerHTML).toBe('Error message');
    expect(mockAxios.get).toHaveBeenCalledTimes(1);
  });

  describe('renders alerts', () => {
    describe('with valid manifest', () => {
      test('with empty waveform, shows a persistent alert', async () => {
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
          // HEAD request is called twice for given waveform URL and empty waveform URL
          expect(mockAxios.head).toHaveBeenCalledTimes(2);
          expect(
            app.queryByTestId('persistent-alert-container')
          ).not.toBeInTheDocument();
        });
      }, 10000);

      test('without waveform as a resource in canvas', async () => {
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
              src: 'http://example.com/volleyball/high/volleyball-for-boys.mp4',
              duration: 572.4,
            }
          },
        };
        const app = renderWithRedux(<App {...props} />, { initialState });

        await wait(() => {
          expect(app.queryByTestId('waveform-container')).toBeInTheDocument();
          expect(mockAxios.head).toHaveBeenCalledTimes(0);
          expect(app.queryByTestId('alert-container')).not.toBeInTheDocument();
        });
      }, 10000);

      // test('without wavefrom in canvas with large media file', async () => {
      //   mockAxios.get.mockImplementationOnce(() => {
      //     return Promise.resolve({
      //       status: 200,
      //       data: manifestWithStructure
      //     });
      //   });

      //   const initialState = {
      //     manifest: {
      //       manifestFetched: true,
      //       manifest: manifestWithStructure,
      //       mediaInfo: {
      //         src: 'http://example.com/volleyball/high/volleyball-for-boys.mp4',
      //         duration: 672.4,
      //       }
      //     },
      //   };
      //   const app = renderWithRedux(<App {...props} />, { initialState });

      //   await wait(() => {
      //     expect(app.queryByTestId('waveform-container')).toBeInTheDocument();
      //     expect(mockAxios.head).toHaveBeenCalledTimes(0);
      //     expect(app.getByTestId('persistent-alert-container')).toBeInTheDocument();
          // expect(app.getByTestId('alert-message').innerHTML).toBe(
          //   'Requested waveform data is not available.'
          // );
      //   });
      // }, 10000);
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
            'Requested resources in IIIF Manifest were not found.'
          );
        });
      }, 10000);
    });
  });

  describe('renders structure related alerts', () => {
    const initialState = {
      manifest: {
        manifestFetched: true,
        manifest: manifestWithStructure,
        mediaInfo: {
          src: 'http://example.com/volleyball-for-boys/high/volleyball-for-boys.mp4',
          duration: 662.037,
        },
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
      mockAxios.get.mockImplementationOnce(() => {
        return Promise.resolve({
          status: 200,
          data: manifest
        });
      });
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
    }, 10000);

    test('when structure has invalid timespans', async () => {
      mockAxios.get.mockImplementationOnce(() => {
        return Promise.resolve({
          status: 200,
          data: manifestWithInvalidStruct
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
        ...initialState,
        manifest: {
          ...initialState.manifest,
          manifest: manifestWithInvalidStruct
        }
      };
      const app = renderWithRedux(<App {...props} />, { nextState });

      await wait(() => {
        expect(app.queryAllByTestId('list-item').length).toBeGreaterThan(0);
        expect(app.getAllByTestId('heading-label')[0].innerHTML).toEqual('Lunchroom Manners');
        expect(app.getByTestId('alert-container')).toBeInTheDocument();
        expect(app.getByTestId('alert-message').innerHTML)
          .toEqual('Please check start/end times of the marked invalid timespan(s).');
      });
    }, 10000);
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

    test('from dummy computed structure when manifest\'s structures is empty', async () => {
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
        expect(app.getAllByTestId('heading-label')[0].innerHTML)
          .toEqual('Beginning Responsibility: Lunchroom Manners');
      });
    });

    test('as empty with alert when manifest is invalid', async () => {
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
      const app = renderWithRedux(<App {...props} />, { initialState });

      await wait(() => {
        expect(app.queryAllByTestId('alert-container').length).toBeGreaterThan(0);
        expect(app.getAllByTestId('alert-message')[0].innerHTML)
          .toEqual('No structure information was found. Please check your Manifest.');
      });
    }, 10000);
  });
});
