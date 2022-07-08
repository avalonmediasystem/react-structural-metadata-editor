import React from 'react';
import { cleanup, fireEvent } from 'react-testing-library';
import 'jest-dom/extend-expect';
import Waveform from '../Waveform';
import { renderWithRedux } from '../../services/testing-helpers';
import Peaks from 'peaks';

afterEach(cleanup);

describe('Waveform component', () => {
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
      mediaInfo: {
        src: 'http://example.com/auto.m3u8',
        duration: 572.43,
      }
    }
  };

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

  test('renders', () => {
    expect(
      waveform.container.querySelector('#waveform-container')
    ).toBeInTheDocument();
    expect(waveform.queryByTestId('waveform-toolbar')).toBeInTheDocument();
  });

  describe('when stream URL works', () => {
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
            peaks: null
          },
          manifest: {
            mediaInfo: {
              src: 'http://example.com/auto.mp4',
              duration: 572.4,
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

  describe('when stream URL does not work', () => {
    test('play/pause buttons are not dispalyed', () => {
      // Buttons are displayed intially
      expect(
        waveform.queryByTestId('waveform-play-button')
      ).toBeInTheDocument();
      expect(
        waveform.queryByTestId('waveform-pause-button')
      ).toBeInTheDocument();

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
          mediaInfo: {
            src: 'http://example.com/auto.mp4',
            duration: 572.4,
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
});
