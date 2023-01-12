import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { initializePeaks } from '../actions/peaks-instance';
import Waveform from '../components/Waveform';

// Peaks options
let peaksOptions = {
  mediaElement: null,
  dataUri: null,
  dataUriDefaultFormat: 'json',
  keyboard: true,
  pointMarkerColor: '#006eb0',
  showPlayheadTime: true,
  zoomWaveformColor: 'rgba(117, 117, 117, 1)',
  overviewWaveformColor: 'rgba(117, 117, 117, 1)',
  timeLabelPrecision: 3,
};

const WaveformContainer = (props) => {
  const zoomView = React.createRef();
  const overView = React.createRef();
  const mediaPlayer = React.createRef();

  const [manifestURL, setManifestURL] = React.useState(props.manifestURL);
  const [canvasIndex, setCanvasIndex] = React.useState(props.canvasIndex);

  const dispatch = useDispatch();

  React.useEffect(() => {
    peaksOptions = {
      ...peaksOptions,
      containers: {
        zoomview: zoomView.current,
        overview: overView.current,
      },
      mediaElement: mediaPlayer.current,
      withCredentials: props.withCredentials,
    };

    dispatch(initializePeaks(
      peaksOptions,
      manifestURL,
      canvasIndex,
      props.initStructure));
  }, []);

  return (
    <section className="waveform-section" data-testid="waveform-container">
      <Waveform
        withCredentials={props.withCredentials}
        ref={{
          zoomViewRef: zoomView,
          overViewRef: overView,
          mediaPlayerRef: mediaPlayer,
        }}
      />{' '}
    </section>
  );
};

WaveformContainer.propTypes = {
  manifestURL: PropTypes.string.isRequired,
  initStructure: PropTypes.object.isRequired,
};

export default WaveformContainer;