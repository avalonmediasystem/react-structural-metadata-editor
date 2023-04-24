import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { initializePeaks } from '../actions/peaks-instance';
import { initManifest } from '../actions/manifest';
import { retrieveStreamMedia } from '../actions/forms';
import Waveform from '../components/Waveform';

const WaveformContainer = (props) => {
  const zoomView = React.createRef();
  const overView = React.createRef();
  const mediaPlayer = React.createRef();

  const { streamMediaLoading } = useSelector((state) => state.forms.streamInfo);
  const mediaInfo = useSelector((state) => state.manifest.mediaInfo);

  const smData = useSelector((state) => state.structuralMetadata.smData);

  const dispatch = useDispatch();

  React.useEffect(() => {
    if(props.manifestURL) {
      dispatch(initManifest(props.manifestURL, props.canvasIndex));
    }
  }, []);


  React.useEffect(() => {
    // When given a .m3u8 playlist, use HLS to stream media
    if (mediaInfo.isStream) {
      dispatch(
        retrieveStreamMedia(mediaInfo.src, mediaPlayer.current, {
          withCredentials: props.withCredentials,
        })
      );
    }
  }, [mediaInfo]);

  React.useEffect(() => {
    let peaksOptions = {
      keyboard: true,
      pointMarkerColor: '#006eb0',
      showPlayheadTime: true,
      timeLabelPrecision: 3,
      zoomview: {
        container: zoomView.current,
        waveformColor: 'rgba(117, 117, 117, 1)',
      },
      overview: {
        container: overView.current,
        waveformColor: 'rgba(117, 117, 117, 1)',
      },
      mediaElement: mediaPlayer.current,
      withCredentials: props.withCredentials,
      player: null,
    };
    if(!streamMediaLoading && smData != []) {
      dispatch(initializePeaks(
        peaksOptions,
        smData,
        props.canvasIndex,));
    }
  }, [streamMediaLoading, smData]);

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
};

export default WaveformContainer;
