import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import Peaks from 'peaks.js';

import APIUtils from '../api/Utils';
import { retrieveWaveformSuccess, setAlert } from '../actions/forms';
import { initializeSMDataPeaks } from '../actions/peaks-instance';

import { configureAlert } from '../services/alert-status';
import { getWaveformInfo } from '../services/iiif-parser';

import Waveform from '../components/Waveform';

const apiUtils = new APIUtils();

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
  let peaksInstance = null;

  const {
    manifest,
    mediaInfo,
    manifestFetched
  } = useSelector((state) => state.manifest);
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
  }, []);

  React.useEffect(() => {
    if (manifest != null && manifestFetched) {
      const waveformInfo = getWaveformInfo(manifest, props.canvasIndex);
      if (waveformInfo.length > 0) {
        initializePeaksInstance(waveformInfo[0]);
      }
    }
  }, [manifestFetched]);

  const initializePeaksInstance = async (waveformURL) => {
    try {
      // Check whether the waveform.json exists in the server
      await apiUtils.headRequest(waveformURL);

      // Set waveform URI
      peaksOptions.dataUri = {
        json: waveformURL,
      };

      // Update redux-store flag for waveform file retrieval
      dispatch(retrieveWaveformSuccess());
    } catch (error) {
      // Enable the flash message alert
      handleError(waveformURL, error);
    }

    // Initialize Peaks intance with the given options
    Peaks.init(peaksOptions, (err, peaks) => {
      if (err)
        console.error(
          'TCL: WaveformContainer -> initializePeaksInstance -> Peaks.init ->',
          err
        );
      peaksInstance = peaks;

      dispatch(
        initializeSMDataPeaks(peaksInstance, mediaInfo.duration)
      );
    });
  };

  const handleError = (waveformURL, error) => {
    console.log('TCL: WaveformContainer -> handleError -> error', error);
    let status = null;

    // Pull status code out of error response/request
    if (error.response !== undefined) {
      status = error.response.status;
      if (status == 404) {
        peaksOptions.dataUri = {
          json: `${waveformURL}?empty=true`,
        };
        status = -7; // for persistent missing waveform data alert
      }
    } else if (error.request !== undefined) {
      status = -3;
    }

    const alert = configureAlert(status);
    dispatch(setAlert(alert));
  };

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
  initStructure: PropTypes.object,
  withCredentials: PropTypes.bool,
};

export default WaveformContainer;
