import React from 'react';
import { act, waitFor } from '@testing-library/react';
import WaveformContainer from '../WaveformContainer';
import { manifest, renderWithRedux, testSmData } from '../../services/testing-helpers';
import mockAxios from 'axios';

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
};

// Mock react-error-boundary library
jest.mock('react-error-boundary', () => ({
  useErrorBoundary: jest.fn(() => ({
    showBoundary: jest.fn(),
  }))
}));

describe('WaveformContainer component', () => {
  test('renders', async () => {
    mockAxios.get.mockImplementationOnce(() => {
      return Promise.resolve({
        status: 200,
        data: manifest,
      });
    });

    const { getByTestId } = renderWithRedux(
      <WaveformContainer
        canvasIndex={0}
        withCredentials={false}
        manifestURL="https://example.com/manifest.json"
        structureURL="https://mockurl.edu/structure.json"
      />,
      { initialState }
    );

    await act(() => Promise.resolve());

    expect(mockAxios.get).toHaveBeenCalledTimes(1);
    expect(getByTestId('waveform-container')).toBeInTheDocument();
    expect(getByTestId('zoomview-view')).toBeInTheDocument();
    expect(getByTestId('overview-view')).toBeInTheDocument();

  });

  test('waveform renders when manifest.json has waveform info', async () => {
    mockAxios.get.mockImplementationOnce(() => {
      return Promise.resolve({
        status: 200,
        data: manifest,
      });
    });

    const { getByTestId } = renderWithRedux(
      <WaveformContainer
        manifestURL="https://example.com/manifest.json"
        canvasIndex={0}
      />,
      { initialState }
    );

    await act(() => Promise.resolve());

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledTimes(1);
      expect(mockAxios.get).toHaveBeenCalledWith(
        'https://example.com/manifest.json',
        { headers: { 'Content-Type': 'application/json' } }
      );
      expect(getByTestId('waveform-container')).toBeInTheDocument();
      expect(getByTestId('waveform-container')).toBeInTheDocument();
      expect(getByTestId('zoomview-view')).toBeInTheDocument();
      expect(getByTestId('overview-view')).toBeInTheDocument();
    });
  });
});
