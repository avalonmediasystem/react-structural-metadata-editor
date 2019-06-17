import React from 'react';
import { cleanup, fireEvent } from 'react-testing-library';
import 'jest-dom/extend-expect';
import Waveform from '../Waveform';
import { renderWithRedux } from '../../services/testing-helpers';

// Mock Peaks library
const mockZoomIn = jest.fn();
const mockZoomOut = jest.fn();
const mockPlay = jest.fn();
const mockPause = jest.fn();
const mockPeaks = jest.genMockFromModule('peaks.js');
mockPeaks.init = jest.fn(opts => {
  return {
    options: opts,
    zoom: {
      zoomIn: mockZoomIn,
      zoomOut: mockZoomOut
    },
    player: {
      play: mockPlay,
      pause: mockPause
    }
  };
});

// Set up initial Redux store
const initialState = {
  forms: {
    streamInfo: {
      streamMediaError: false,
      streamMediaLoading: true,
      streamMediaStatus: -5
    }
  }
};

// Variables to contain the refs for container and mediaElement
let waveformContainer, mediaElement, waveform;

beforeEach(() => {
  waveformContainer = null;
  mediaElement = null;
  waveform = renderWithRedux(
    <Waveform
      waveformRef={ref => (waveformContainer = ref)}
      mediaPlayerRef={ref => (mediaElement = ref)}
    />,
    { initialState }
  );
});

afterEach(cleanup);

test('Waveform renders', () => {
  expect(
    waveform.container.querySelector('#waveform-container')
  ).toBeInTheDocument();
  expect(waveform.getByTestId('waveform-toolbar')).toBeInTheDocument();
});

test('renders play/pause buttons in the toolbar and enabled', () => {
  expect(waveform.getByTestId('waveform-play-button')).toBeInTheDocument();
  expect(waveform.getByTestId('waveform-pause-button')).toBeInTheDocument();

  expect(waveform.getByTestId('waveform-play-button')).toBeDisabled();
  expect(waveform.getByTestId('waveform-pause-button')).toBeDisabled();

  const nextState = {
    forms: {
      streamInfo: {
        streamMediaError: false,
        streamMediaLoading: false
      }
    }
  };
  waveform.rerenderWithRedux(<Waveform />, nextState);

  expect(waveform.getByTestId('waveform-play-button')).toBeEnabled();
  expect(waveform.getByTestId('waveform-pause-button')).toBeEnabled();
});

test('renders zoom in/out buttons in the toolbar and enabled', () => {
  const nextState = {
    forms: {
      streamInfo: {
        streamMediaError: false,
        streamMediaLoading: false
      }
    }
  };
  waveform.rerenderWithRedux(<Waveform />, nextState);

  expect(waveform.getByTestId('waveform-zoomin-button')).toBeInTheDocument();
  expect(waveform.getByTestId('waveform-zoomin-button')).toBeEnabled();
  expect(waveform.getByTestId('waveform-zoomout-button')).toBeInTheDocument();
  expect(waveform.getByTestId('waveform-zoomout-button')).toBeEnabled();
});

test('simulate waveform toolbar buttons', () => {
  const peaksOptions = {
    container: waveformContainer,
    mediaElement: mediaElement,
    dataUri: null,
    dataUriDefaultFormat: 'json',
    keyboard: true,
    _zoomLevelIndex: 0,
    _zoomLevels: [512, 1024, 2048, 4096]
  };

  const nextState = {
    forms: {
      streamInfo: {
        streamMediaError: false,
        streamMediaLoading: false
      }
    },
    peaksInstance: {
      peaks: mockPeaks.init(peaksOptions)
    }
  };
  waveform.rerenderWithRedux(<Waveform />, nextState);

  fireEvent.click(waveform.getByTestId('waveform-zoomin-button'));
  expect(mockZoomIn).toHaveBeenCalledTimes(1);
  fireEvent.click(waveform.getByTestId('waveform-zoomout-button'));
  expect(mockZoomOut).toHaveBeenCalledTimes(1);

  fireEvent.click(waveform.getByTestId('waveform-play-button'));
  expect(mockPlay).toHaveBeenCalledTimes(1);
  fireEvent.click(waveform.getByTestId('waveform-pause-button'));
  expect(mockPause).toHaveBeenCalledTimes(1);
});

test('play/pause buttons are disabled when the stream URL does not work', () => {
  // Buttons are enabled at initial load
  expect(waveform.getByTestId('waveform-play-button')).toBeDisabled();
  expect(waveform.getByTestId('waveform-pause-button')).toBeDisabled();

  const nextState = {
    forms: {
      streamInfo: {
        streamMediaError: true,
        streamMediaLoading: false
      }
    }
  };
  waveform.rerenderWithRedux(<Waveform />, nextState);

  // Buttons are disabled with streamMediaRetreived = false, when stream URL does not work
  expect(waveform.getByTestId('waveform-play-button')).toBeDisabled();
  expect(waveform.getByTestId('waveform-pause-button')).toBeDisabled();
});

test('alert is displayed when stream URL does not work', () => {
  const nextState = {
    forms: {
      streamInfo: {
        streamMediaError: true,
        streamMediaLoading: false,
        streamMediaStatus: -6
      }
    }
  };
  waveform.rerenderWithRedux(<Waveform />, nextState);

  expect(waveform.getByTestId('alert-container')).toBeInTheDocument();
  expect(waveform.getByTestId('alert-message').innerHTML).toBe(
    'There was an error retrieving the media stream.'
  );
});

test('alert is not displayed when stream URL works', () => {
  const nextState = {
    forms: {
      streamInfo: {
        streamMediaError: false,
        streamMediaLoading: false,
        streamMediaStatus: null
      }
    }
  };
  waveform.rerenderWithRedux(<Waveform />, nextState);

  expect(waveform.queryByTestId('alert-container')).not.toBeInTheDocument();
});
