import React from 'react';
import { cleanup, wait } from 'react-testing-library';
import 'jest-dom/extend-expect';
import WaveformContainer from '../WaveformContainer';
import { renderWithRedux, testSmData } from '../../services/testing-helpers';
import mockAxios from 'axios';

// Mocking the external libraries used in the component execution
jest.mock('rxjs');

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
  test('renders', async () => {
    mockAxios.head.mockImplementationOnce(() => {
      return Promise.resolve({
        status: 200,
        request: {
          responseURL:
            'https://mockurl.edu/master_files/3421d4fg/waveform.json',
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
        baseURL={'https://mockurl.edu'}
        masterFileID={'3421d4fg'}
        initStructure={initStructure}
        streamDuration={1738945}
      />,
      { initialState }
    );

    await wait(() => {
      expect(getByTestId('waveform-container')).toBeInTheDocument();
      expect(getByTestId('zoom-view')).toBeInTheDocument();
      expect(getByTestId('over-view')).toBeInTheDocument();
    });
  });

  test('waveform renders when fetching structure.json fails', async () => {
    mockAxios.head.mockImplementationOnce(() => {
      return Promise.resolve({
        status: 200,
        request: {
          responseURL:
            'https://mockurl.edu/master_files/3421d4fg/waveform.json',
        },
        headers: {
          'content-disposition': 'attachment; filename="waveform.json"',
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
        baseURL={'https://mockurl.edu'}
        masterFileID={'3421d4fg'}
        initStructure={initStructure}
        streamDuration={1738945}
      />,
      { initialState }
    );

    await wait(() => {
      expect(mockAxios.get).toHaveBeenCalledTimes(1);
      expect(
        mockAxios.get
      ).toHaveBeenCalledWith(
        'https://mockurl.edu/master_files/3421d4fg/structure.json',
        { headers: { 'Content-Type': 'application/json' } }
      );
      expect(getByTestId('waveform-container')).toBeInTheDocument();
    });
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
          responseURL:
            'https://mockurl.edu/master_files/3421d4fg/waveform.json?empty=true',
        },
      });
    });

    const { getByTestId } = renderWithRedux(
      <WaveformContainer
        baseURL={'https://mockurl.edu'}
        masterFileID={'3421d4fg'}
        initStructure={initStructure}
        streamDuration={1738945}
      />,
      { initialState }
    );

    await wait(() => {
      expect(getByTestId('waveform-container')).toBeInTheDocument();
      expect(getByTestId('persistent-alert-container')).toBeInTheDocument();
      expect(getByTestId('alert-message').innerHTML).toBe(
        'Requested waveform data is not available.'
      );
    });
  });
});
