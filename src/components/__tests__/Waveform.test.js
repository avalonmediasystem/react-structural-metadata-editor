import React from 'react';
import { cleanup, fireEvent } from 'react-testing-library';
import 'jest-dom/extend-expect';
import Waveform from '../Waveform';
import { renderWithRedux } from '../../services/testing-helpers';
import Peaks from 'peaks';

// Set up a redux store for the tests
const peaksOptions = {
  container: null,
  mediaElement: null,
  dataUri: null,
  dataUriDefaultFormat: 'json',
  keyboard: true,
  _zoomLevelIndex: 0,
  _zoomLevels: [512, 1024, 2048, 4096]
};

const initialState = {
  forms: {
    streamMediaRetrieved: true
  },
  peaksInstance: {
    peaks: Peaks.init(peaksOptions)
  }
};

// Variables to contain the refs for container and mediaElement
let waveformContainer = null,
  mediaElement = null;

afterEach(cleanup);

test('Waveform renders', () => {
  const { container, getByTestId, queryByTestId } = renderWithRedux(
    <Waveform
      waveformRef={ref => (waveformContainer = ref)}
      mediaPlayerRef={ref => (mediaElement = ref)}
    />,
    { initialState }
  );

  expect(container.querySelector('#waveform-container')).toBeInTheDocument();
  expect(getByTestId('waveform-toolbar')).toBeInTheDocument();
  // No error alerts
  expect(queryByTestId('alert-container')).not.toBeInTheDocument();
});

test('renders play/pause buttons in the toolbar and enabled', () => {
  const { getByTestId } = renderWithRedux(
    <Waveform
      waveformRef={ref => (waveformContainer = ref)}
      mediaPlayerRef={ref => (mediaElement = ref)}
    />,
    { initialState }
  );
  expect(getByTestId('waveform-play-button')).toBeInTheDocument();
  expect(getByTestId('waveform-play-button')).toBeEnabled();
  expect(getByTestId('waveform-pause-button')).toBeInTheDocument();
  expect(getByTestId('waveform-pause-button')).toBeEnabled();
});

test('renders zoom in/out buttons in the toolbar and enabled', () => {
  const { getByTestId } = renderWithRedux(
    <Waveform
      waveformRef={ref => (waveformContainer = ref)}
      mediaPlayerRef={ref => (mediaElement = ref)}
    />,
    { initialState }
  );
  expect(getByTestId('waveform-zoomin-button')).toBeInTheDocument();
  expect(getByTestId('waveform-zoomin-button')).toBeEnabled();
  expect(getByTestId('waveform-zoomout-button')).toBeInTheDocument();
  expect(getByTestId('waveform-zoomout-button')).toBeEnabled();
});

test('simulate waveform toolbar buttons', () => {
  const { getByTestId } = renderWithRedux(
    <Waveform
      waveformRef={ref => (waveformContainer = ref)}
      mediaPlayerRef={ref => (mediaElement = ref)}
    />,
    { initialState }
  );

  const { zoom, player } = initialState.peaksInstance.peaks;
  fireEvent.click(getByTestId('waveform-zoomin-button'));
  expect(zoom.zoomIn).toHaveBeenCalledTimes(1);
  fireEvent.click(getByTestId('waveform-zoomout-button'));
  expect(zoom.zoomOut).toHaveBeenCalledTimes(1);

  fireEvent.click(getByTestId('waveform-play-button'));
  expect(player.play).toHaveBeenCalledTimes(1);
  fireEvent.click(getByTestId('waveform-pause-button'));
  expect(player.pause).toHaveBeenCalledTimes(1);
});

test('play/pause buttons are disabled when the stream URL does not work', () => {
  const { rerenderWithRedux, getByTestId } = renderWithRedux(
    <Waveform
      waveformRef={ref => (waveformContainer = ref)}
      mediaPlayerRef={ref => (mediaElement = ref)}
    />,
    { initialState }
  );

  // Buttons are enabled when streamMediaRetreived = true, at initial load
  expect(getByTestId('waveform-play-button')).toBeEnabled();
  expect(getByTestId('waveform-pause-button')).toBeEnabled();

  const nextState = {
    forms: {
      streamMediaRetrieved: false
    }
  };

  rerenderWithRedux(<Waveform />, nextState);

  // Buttons are disabled with streamMediaRetreived = false, when stream URL does not work
  expect(getByTestId('waveform-play-button')).toBeDisabled();
  expect(getByTestId('waveform-pause-button')).toBeDisabled();
});

test('alert is displayed when stream URL does not work', () => {
  // TODO: after changing the stream URL loading
});
