import React from 'react';
import { cleanup, fireEvent } from '@testing-library/react';
import Waveform from '../Waveform';
import { renderWithRedux, manifest } from '../../services/testing-helpers';
import Peaks from 'peaks';

afterEach(cleanup);

describe('Waveform component', () => {
  let originalError;
  beforeEach(() => {
    originalError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  // Variables to contain the refs for container and mediaElement
  let zoomView, overView, mediaElement, waveform;
  let peaksInst = null;

  const peaksOptions = {
    containers: { zoomview: zoomView, overview: overView },
    mediaElement: mediaElement,
    dataUri: null,
    dataUriDefaultFormat: 'json',
    keyboard: true,
    _zoomLevelIndex: 0,
    _zoomLevels: [512, 1024, 2048, 4096],
  };

  Peaks.init(peaksOptions, (err, peaks) => {
    peaksInst = peaks;
  });

  // Set up initial Redux store
  const initialState = {
    forms: {
      streamInfo: {
        streamMediaError: false,
        streamMediaLoading: false,
        streamMediaStatus: null,
      },
      waveformRetrieved: true,
      editingDisabled: true,
    },
    peaksInstance: {
      readyPeaks: true,
      peaks: peaksInst,
    },
    manifest: {
      manifest: manifest,
      mediaInfo: {
        src: 'https://example.com/volleyball-for-boys/volleyball-for-boys.mp3',
        duration: 662.037,
        isStream: false,
        isVideo: false,
      }
    }
  };

  describe('with a working media URL', () => {
    beforeEach(() => {
      mediaElement = React.createRef();
      waveform = renderWithRedux(
        <Waveform
          ref={{
            zoomViewRef: zoomView,
            overViewRef: overView,
            mediaPlayerRef: mediaElement,
          }}
        />,
        { initialState }
      );
    });

    test('renders successfully', () => {
      expect(waveform.queryByTestId('waveform')).toBeInTheDocument();
      expect(waveform.queryByTestId('waveform-toolbar')).toBeInTheDocument();
    });

    test('does not render video with audio manifest', () => {
      expect(waveform.queryByTestId('waveform')).toBeInTheDocument();
      expect(waveform.queryByTestId('waveform-audio-player')).toBeInTheDocument();
      expect(waveform.queryByTestId('waveform-video-player')).not.toBeInTheDocument();
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
      expect(peaksInst.zoom.zoomIn).toHaveBeenCalledTimes(1);
      fireEvent.click(waveform.getByTestId('waveform-zoomout-button'));
      expect(peaksInst.zoom.zoomOut).toHaveBeenCalledTimes(1);

      fireEvent.click(waveform.getByTestId('waveform-play-button'));
      expect(peaksInst.player.play).toHaveBeenCalledTimes(1);
      fireEvent.click(waveform.getByTestId('waveform-pause-button'));
      expect(peaksInst.player.pause).toHaveBeenCalledTimes(1);
    });

    test('error alert is not displayed', () => {
      expect(waveform.queryByTestId('alert-container')).not.toBeInTheDocument();
    });

    describe('when spacebar is pressed', () => {
      test('while editing an item', () => {
        fireEvent.keyDown(waveform.getByTestId('waveform-toolbar'), {
          key: 'Space',
          code: 'Space',
          keyCode: 32,
        });
        expect(peaksInst.player.play).not.toHaveBeenCalledTimes(1);
      });

      test('while not editing an item', () => {
        const nextState = {
          forms: {
            streamInfo: {
              streamMediaError: false,
              streamMediaLoading: false,
            },
            editingDisabled: false,
          },
          peaksInstance: {
            readyPeaks: true,
            peaks: peaksInst,
          },
          manifest: {
            manifest: manifest,
            mediaInfo: {
              src: 'https://example.com/volleyball-for-boys/volleyball-for-boys.mp3',
              duration: 662.037,
              isStream: false,
              isVideo: false,
            }
          }
        };
        waveform.rerenderWithRedux(
          <Waveform
            ref={{
              zoomViewRef: zoomView,
              overViewRef: overView,
              mediaPlayerRef: mediaElement,
            }}
          />,
          nextState
        );
        fireEvent.keyDown(waveform.getByTestId('waveform-toolbar'), {
          key: 'Space',
          code: 'Space',
          keyCode: 32,
        });
        expect(peaksInst.player.play).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('with a broken media URL', () => {
    beforeEach(() => {
      mediaElement = React.createRef();
      waveform = renderWithRedux(
        <Waveform
          ref={{
            zoomViewRef: zoomView,
            overViewRef: overView,
            mediaPlayerRef: mediaElement,
          }}
        />,
        { initialState }
      );
    });
    test('does not render play/pause buttons', () => {
      // Buttons are displayed intially
      expect(
        waveform.queryByTestId('waveform-play-button')
      ).toBeInTheDocument();
      expect(
        waveform.queryByTestId('waveform-pause-button')
      ).toBeInTheDocument();

      // Re-render with broken status
      const nextState = {
        forms: {
          streamInfo: {
            streamMediaError: true,
            streamMediaLoading: false,
          },
        },
        peaksInstance: {
          readyPeaks: true,
          peaks: null
        },
        manifest: {
          manifest: manifest,
          mediaInfo: {
            src: 'https://example.com/volleyball-for-boys/volleyball-for-boys.mp4',
            duration: 662.037,
            isStream: false,
            isVideo: false,
          }
        }
      };
      waveform.rerenderWithRedux(
        <Waveform
          ref={{
            zoomViewRef: zoomView,
            overViewRef: overView,
            mediaPlayerRef: mediaElement,
          }}
        />,
        nextState
      );
      // Buttons are not displayed after stream media loading has stopped
      expect(
        waveform.queryByTestId('waveform-play-button')
      ).not.toBeInTheDocument();
      expect(
        waveform.queryByTestId('waveform-pause-button')
      ).not.toBeInTheDocument();
    });
  });

  describe('with a video manifest', () => {
    beforeEach(() => {
      const stateWithVideo = {
        ...initialState,
        manifest: {
          ...initialState.manifest,
          mediaInfo: {
            src: 'https://example.com/volleyball-for-boys/volleyball-for-boys.mp4',
            duration: 662.037,
            isStream: false,
            isVideo: true
          }
        }
      };
      mediaElement = React.createRef();
      waveform = renderWithRedux(
        <Waveform
          ref={{
            zoomViewRef: zoomView,
            overViewRef: overView,
            mediaPlayerRef: mediaElement,
          }}
        />,
        { initialState: stateWithVideo }
      );
    });
    test('renders video element', () => {
      expect(waveform.queryByTestId('waveform')).toBeInTheDocument();
      expect(waveform.queryByTestId('waveform-video-player')).toBeInTheDocument();
      expect(waveform.queryByTestId('waveform-audio-player')).not.toBeInTheDocument();
    });
  });
});
