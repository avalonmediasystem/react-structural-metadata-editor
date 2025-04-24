import React, { createRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { initializePeaks } from '../actions/peaks-instance';
import { initManifest } from '../actions/manifest';
import { retrieveStreamMedia } from '../actions/forms';
import Waveform from '../components/Waveform';

const WaveformContainer = ({ canvasIndex, manifestURL, withCredentials }) => {
  const { zoomView, overView, mediaPlayer } = useWaveform({ canvasIndex, manifestURL, withCredentials });

  return (
    <section className="waveform-section" data-testid="waveform-container">
      <Waveform
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
  canvasIndex: PropTypes.number.isRequired,
  manifestURL: PropTypes.string.isRequired,
  withCredentials: PropTypes.bool,
};

export default WaveformContainer;

/**
 * Handle state interactions for the WaveformContainer component
 * @param {Object} obj 
 * @param {number} obj.canvasIndex
 * @param {string} param0.manifestURL
 * @param {boolean} param0.withCredentials
 * @returns {Object}
 */
const useWaveform = ({ canvasIndex, manifestURL, withCredentials }) => {
  const zoomView = createRef();
  const overView = createRef();
  const mediaPlayer = createRef();

  const { streamMediaLoading } = useSelector((state) => state.forms.streamInfo);
  const mediaInfo = useSelector((state) => state.manifest.mediaInfo);
  const readyPeaks = useSelector((state) => state.peaksInstance.readyPeaks);
  const manifest = useSelector((state) => state.manifest.manifest);

  const smData = useSelector((state) => state.structuralMetadata.smData);

  const dispatch = useDispatch();

  useEffect(() => {
    if (manifestURL) {
      dispatch(initManifest(manifestURL, canvasIndex));
    }
  }, []);

  useEffect(() => {
    if (manifest != null) {
      // When given a .m3u8 playlist, use HLS to stream media
      if (mediaInfo.isStream) {
        dispatch(
          retrieveStreamMedia(mediaInfo.src, mediaPlayer.current, {
            withCredentials: withCredentials,
          })
        );
      }
    }
  }, [manifest, mediaInfo]);

  useEffect(() => {
    let peaksOptions = {
      keyboard: true,
      pointMarkerColor: '#006eb0',
      showPlayheadTime: true,
      timeLabelPrecision: 3,
      withCredentials: withCredentials,
      zoomview: {
        container: zoomView.current,
        waveformColor: 'rgba(117, 117, 117, 1)',
      },
      overview: {
        container: overView.current,
        waveformColor: 'rgba(117, 117, 117, 1)',
      },
      mediaElement: mediaPlayer.current,
      player: null,
    };
    if (!streamMediaLoading && smData != [] && !readyPeaks) {
      dispatch(initializePeaks(peaksOptions, smData));
    }
  }, [streamMediaLoading]);
  return { zoomView, overView, mediaPlayer };
};
