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
mockPeaks.init = jest.fn((opts) => {
  return {
    options: opts,
    zoom: {
      zoomIn: mockZoomIn,
      zoomOut: mockZoomOut,
    },
    player: {
      _isPlaying: false,
      play: mockPlay,
      pause: mockPause,
    },
  };
});

afterEach(cleanup);

describe('Waveform component', () => {
  // Variables to contain the refs for container and mediaElement
  let zoomView, overView, mediaElement, waveform;

  // Set up initial Redux store
  const initialState = {
    forms: {
      streamInfo: {
        streamMediaError: false,
        streamMediaLoading: true,
        streamMediaStatus: -5,
      },
      waveformRetrieved: false,
    },
    peaksInstance: {
      readyPeaks: true,
    },
  };

  beforeEach(() => {
    zoomView = null;
    overView = null;
    mediaElement = null;
    waveform = renderWithRedux(
      <Waveform
        zoomViewRef={(ref) => (zoomView = ref)}
        overViewRef={(ref) => (overView = ref)}
        mediaPlayerRef={(ref) => (mediaElement = ref)}
      />,
      { initialState }
    );
  });

  test('renders', () => {
    expect(
      waveform.container.querySelector('#waveform-container')
    ).toBeInTheDocument();
    expect(waveform.queryByTestId('waveform-toolbar')).not.toBeInTheDocument();
  });

  describe('when stream URL works', () => {
    beforeEach(() => {
      const peaksOptions = {
        containers: { zoomview: zoomView, overview: overView },
        mediaElement: mediaElement,
        dataUri: null,
        dataUriDefaultFormat: 'json',
        keyboard: true,
        _zoomLevelIndex: 0,
        _zoomLevels: [512, 1024, 2048, 4096],
      };

      const nextState = {
        forms: {
          streamInfo: {
            streamMediaError: false,
            streamMediaLoading: false,
            streamMediaStatus: null,
          },
          waveformRetrieved: true,
        },
        peaksInstance: {
          peaks: mockPeaks.init(peaksOptions),
        },
      };
      waveform.rerenderWithRedux(<Waveform />, nextState);
    });
    test('renders play/pause buttons in the toolbar and enabled', () => {
      expect(waveform.getByTestId('waveform-toolbar')).toBeInTheDocument();
      expect(waveform.getByTestId('waveform-play-button')).toBeEnabled();

      expect(waveform.getByTestId('waveform-play-button')).toBeInTheDocument();
      expect(waveform.getByTestId('waveform-pause-button')).toBeEnabled();
    });

    test('renders zoom in/out buttons in the toolbar and enabled', () => {
      expect(
        waveform.getByTestId('waveform-zoomin-button')
      ).toBeInTheDocument();
      expect(waveform.getByTestId('waveform-zoomin-button')).toBeEnabled();

      expect(
        waveform.getByTestId('waveform-zoomout-button')
      ).toBeInTheDocument();
      expect(waveform.getByTestId('waveform-zoomout-button')).toBeEnabled();
    });

    test('simulate waveform toolbar buttons', () => {
      fireEvent.click(waveform.getByTestId('waveform-zoomin-button'));
      expect(mockZoomIn).toHaveBeenCalledTimes(1);
      fireEvent.click(waveform.getByTestId('waveform-zoomout-button'));
      expect(mockZoomOut).toHaveBeenCalledTimes(1);

      fireEvent.click(waveform.getByTestId('waveform-play-button'));
      expect(mockPlay).toHaveBeenCalledTimes(1);
      fireEvent.click(waveform.getByTestId('waveform-pause-button'));
      expect(mockPause).toHaveBeenCalledTimes(1);
    });

    test('error alert is not displayed', () => {
      expect(waveform.queryByTestId('alert-container')).not.toBeInTheDocument();
    });

    describe('when spacebar is pressed', () => {
      test('while editing an item', () => {
        const nextState = {
          forms: {
            streamInfo: {
              streamMediaError: false,
              streamMediaLoading: false,
              streamMediaStatus: null,
            },
            editingDisabled: true,
          },
        };
        waveform.rerenderWithRedux(<Waveform />, nextState);

        fireEvent.keyDown(waveform.getByTestId('waveform-toolbar'), {
          key: 'Space',
          code: 'Space',
          keyCode: 32,
        });
        expect(mockPlay).toHaveBeenCalledTimes(0);
      });

      test('while not editing an item', () => {
        fireEvent.keyDown(waveform.getByTestId('waveform-toolbar'), {
          key: 'Space',
          code: 'Space',
          keyCode: 32,
        });
        expect(mockPlay).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('when stream URL does not work', () => {
    test('play/pause buttons are not dispalyed', () => {
      // Buttons are not displayed intially
      expect(
        waveform.queryByTestId('waveform-play-button')
      ).not.toBeInTheDocument();
      expect(
        waveform.queryByTestId('waveform-pause-button')
      ).not.toBeInTheDocument();

      const nextState = {
        forms: {
          streamInfo: {
            streamMediaError: true,
            streamMediaLoading: false,
          },
        },
      };
      waveform.rerenderWithRedux(<Waveform />, nextState);

      // Buttons are not displayed after stream media loading has stopped
      expect(
        waveform.queryByTestId('waveform-play-button')
      ).not.toBeInTheDocument();
      expect(
        waveform.queryByTestId('waveform-pause-button')
      ).not.toBeInTheDocument();
    });

    test('alert is displayed', () => {
      const nextState = {
        forms: {
          streamInfo: {
            streamMediaError: true,
            streamMediaLoading: false,
            streamMediaStatus: -6,
          },
        },
      };
      waveform.rerenderWithRedux(<Waveform />, nextState);

      expect(waveform.getByTestId('alert-container')).toBeInTheDocument();
      expect(waveform.getByTestId('alert-message').innerHTML).toBe(
        'There was an error retrieving the media stream.'
      );
    });
  });
});
