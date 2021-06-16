import React from 'react';
import { cleanup, wait, fireEvent } from 'react-testing-library';
import 'jest-dom/extend-expect';
import App from './App';
import './App.css';
import { renderWithRedux, testSmData } from './services/testing-helpers';
import mockAxios from 'axios';

const mockStructureIsSaved = jest.fn();
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

const mockPeaks = jest.genMockFromModule('peaks.js');
mockPeaks.init = jest.fn((options) => {
  return {
    options: options,
  };
});

const peaksOptions = {
  container: null,
  mediaElement: null,
  dataUri: null,
  dataUriDefaultFormat: 'json',
  keyboard: true,
  _zoomLevelIndex: 0,
  _zoomLevels: [512, 1024, 2048, 4096],
};
// Set up Redux store for tests
const initialState = {
  forms: {
    structureInfo: {
      structureRetrieved: true,
      structureStatus: null,
    },
  },
  structuralMetadata: {
    smData: testSmData,
  },
};

const props = {
  baseURL: 'https://mockurl.edu',
  masterFileID: '3421d4fg',
  initStructure: initStructure,
  streamDuration: 1738945,
  structureIsSaved: mockStructureIsSaved,
};

afterEach(cleanup);

describe('App component', () => {
  // test('Alert integration', () => {
  //   const app = renderWithRedux(<App {...props} />, baseState);
  //   expect(app.queryByTestId('alert-container')).not.toBeInTheDocument();

  //   const updatedProps = {
  //     ...baseState,
  //     forms: {
  //       ...baseState.forms,
  //       alerts: [
  //         {
  //           alertStyle: 'danger',
  //           message: 'Error message',
  //           id: '1234-5678-90ab',
  //         },
  //       ],
  //     },
  //   };

  //   app.rerenderWithRedux(<App {...props} />, updatedProps);
  //   expect(app.getByTestId('alert-container')).toBeInTheDocument();
  //   expect(app.getByTestId('alert-message').innerHTML).toBe('Error message');
  // });

  // test('shows a persistent alert when waveform is empty', async () => {
  //   mockAxios.head.mockImplementationOnce(() => {
  //     return Promise.reject({
  //       response: {
  //         status: 404,
  //       },
  //     });
  //   });

  //   mockAxios.get.mockImplementationOnce(() => {
  //     return Promise.resolve({
  //       status: 200,
  //       request: {
  //         responseURL:
  //           'https://mockurl.edu/master_files/3421d4fg/waveform.json?empty=true',
  //       },
  //     });
  //   });

  //   const app = renderWithRedux(<App {...props} />, baseState);
  //   await wait(() => {
  //     expect(app.getByTestId('waveform-container')).toBeInTheDocument();
  //     expect(app.getByTestId('persistent-alert-container')).toBeInTheDocument();
  //     expect(app.getByTestId('alert-message').innerHTML).toBe(
  //       'Requested waveform data is not available.'
  //     );
  //   });
  // });

  // test('shows an error message when there is an error in fetching structure.json', async () => {
  //   mockAxios.get.mockImplementationOnce(() => {
  //     return Promise.reject({
  //       response: {
  //         status: 404,
  //       },
  //     });
  //   });

  //   const app = renderWithRedux(<App {...props} />, baseState);
  //   await wait(() => {
  //     expect(app.getByTestId('alert-container')).toBeInTheDocument();
  //     expect(app.getByTestId('alert-message').innerHTML).toBe(
  //       'Requested data is not available.'
  //     );
  //   });
  // });

  describe('saving structure back to server', () => {
    describe('save request is successful', () => {
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

      test('shows success alert', async () => {
        expect(mockAxios.post).toHaveBeenCalledTimes(1);

        await wait(() => {
          expect(app.getByTestId('alert-container')).toBeInTheDocument();
          expect(app.getByTestId('alert-message').innerHTML).toBe(
            'Saved successfully.'
          );
        });
      });

      test('alert closes after 2000ms', async () => {
        await wait(() => {
          expect(app.getByTestId('alert-container')).toBeInTheDocument();
        });

        setTimeout(() => {
          expect(app.getByTestId('alert-container')).not.toBeInTheDocument();
        }, 2000);
      });

      // TO FIX: Final test
      // test('alert closes when structure is edited again', async () => {
      //   await wait(() => {
      //     expect(app.getByTestId('alert-container')).toBeInTheDocument();

      //     fireEvent.click(app.queryAllByTestId('list-item-edit-btn')[0]);
      //   });

      //   expect(app.queryByTestId('alert-container')).not.toBeInTheDocument();
      // });
    });
  });
  test('save request is failing', async () => {
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
