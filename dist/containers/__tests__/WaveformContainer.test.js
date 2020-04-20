import React from 'react';
import { cleanup, wait } from 'react-testing-library';
import 'jest-dom/extend-expect';
import { WaveformContainer } from '../WaveformContainer';
import { renderWithRedux, testSmData } from '../../services/testing-helpers';
import mockAxios from 'axios';
import mockPeaks from '../../../__mocks__/peaks';

const initializeSMDataPeaksMock = jest.fn((opts) => {
  mockPeaks.init(opts);
});
const handleEditingMock = jest.fn();

// Setup Redux store for tests
const initialState = {
  structuralMetadata: {
    smData: testSmData,
  },
  forms: {
    waveformRetrieved: true,
    streamInfo: {
      streamMediaStatus: null,
    },
  },
};

const initProps = {
  baseURL: 'https://mockurl.edu',
  masterFileID: '3421d4fg',
  fetchDataAndBuildPeaks: initializeSMDataPeaksMock,
  handleEditingTimespans: handleEditingMock,
  ...initialState,
};

afterEach(cleanup);

test('WaveformContainer renders', async () => {
  const { getByTestId } = renderWithRedux(
    <WaveformContainer {...initProps} />,
    {}
  );

  await wait(() => {
    expect(getByTestId('waveform-container')).toBeInTheDocument();
    expect(getByTestId('waveform')).toBeInTheDocument();
  });
});

test('shows alert when there is an error fetching waveform.json', async () => {
  mockAxios.head.mockImplementationOnce(() => {
    return Promise.reject({
      response: { status: 404 },
    });
  });

  mockAxios.get.mockImplementationOnce(() => {
    return Promise.resolve({
      data: testSmData[0],
    });
  });

  const nextProps = {
    ...initProps,
    forms: {
      waveformRetrieved: false,
    },
  };

  const { getByTestId, queryByTestId } = renderWithRedux(
    <WaveformContainer {...nextProps} />,
    {}
  );

  await wait(() => {
    expect(mockAxios.head).toHaveBeenCalledTimes(1);
    expect(
      mockAxios.head
    ).toHaveBeenCalledWith(
      'https://mockurl.edu/master_files/3421d4fg/waveform.json',
      { headers: { 'Content-Type': 'application/json' } }
    );
    expect(queryByTestId('waveform')).not.toBeInTheDocument();
    // Shows the error message
    expect(getByTestId('alert-container')).toBeInTheDocument();
    expect(getByTestId('alert-message').innerHTML).toBe(
      'Requested data not available.'
    );
  });
});

test('waveform renders when there is an error in fetching structure.json', async () => {
  const nextProps = {
    ...initProps,
    forms: {
      waveformRetrieved: true,
    },
  };

  const { getByTestId } = renderWithRedux(
    <WaveformContainer {...nextProps} />,
    {}
  );

  await wait(() => {
    expect(getByTestId('waveform')).toBeInTheDocument();
  });
});
