import React, { Component } from 'react';
import PropTypes from 'prop-types';
import APIUtils from '../api/Utils';
import { connect } from 'react-redux';
import { initializeSMDataPeaks, peaksReady } from '../actions/peaks-instance';
import { setAlert } from '../actions/forms';
import Waveform from '../components/Waveform';
import { configureAlert } from '../services/alert-status';
import { retrieveWaveformSuccess } from '../actions/forms';
import Peaks from 'peaks.js';

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

class WaveformContainer extends Component {
  constructor(props) {
    super(props);
    this.zoomView = React.createRef();
    this.overView = React.createRef();
    this.mediaPlayer = React.createRef();
    this.peaks = null;
  }

  state = {
    streamAlert: {},
    structureURL: this.props.structureURL,
    waveformURL: this.props.waveformURL,
    initStructure: this.props.initStructure,
    streamLength: this.props.streamDuration,
    manifestURL: this.props.manifestURL,
    dataUri: null,
  };

  componentDidMount() {
    peaksOptions = {
      ...peaksOptions,
      containers: {
        zoomview: this.zoomView.current,
        overview: this.overView.current,
      },
      mediaElement: this.mediaPlayer.current,
      withCredentials: this.props.withCredentials,
    };
    this.initializePeaksInstance();
  }

  async initializePeaksInstance() {
    const { structureURL, manifestURL, waveformURL, initStructure, streamLength } =
      this.state;
    try {
      // Check whether the waveform.json exists in the server
      await apiUtils.headRequest(waveformURL);

      // Set waveform URI
      peaksOptions.dataUri = {
        json: waveformURL,
      };

      // Update redux-store flag for waveform file retrieval
      this.props.retrieveWaveformSuccess();
    } catch (error) {
      // Enable the flash message alert
      this.handleError(error);
    }

    // Initialize Peaks intance with the given options
    Peaks.init(peaksOptions, (err, peaks) => {
      if (err)
        console.error(
          'TCL: WaveformContainer -> initializePeaksInstance -> Peaks.init ->',
          err
        );
      this.peaks = peaks;

      this.props.fetchDataAndBuildPeaks(
        this.peaks,
        structureURL,
        manifestURL,
        initStructure,
        streamLength
      );
    });
  }

  handleError(error) {
    console.log('TCL: WaveformContainer -> handleError -> error', error);
    let status = null;
    const { waveformURL } = this.state;

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
    this.props.setAlert(alert);
  }

  render() {
    return (
      <section className="waveform-section" data-testid="waveform-container">
        <Waveform
          audioURL={this.props.audioURL}
          withCredentials={this.props.withCredentials}
          ref={{
            zoomViewRef: this.zoomView,
            overViewRef: this.overView,
            mediaPlayerRef: this.mediaPlayer,
          }}
        />{' '}
      </section>
    );
  }
}

WaveformContainer.propTypes = {
  structureURL: PropTypes.string.isRequired,
  waveformURL: PropTypes.string.isRequired,
  audioURL: PropTypes.string.isRequired,
  streamDuration: PropTypes.number.isRequired,
  initStructure: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  smData: state.structuralMetadata.smData,
  alert: state.forms.alert,
});

const mapDispatchToProps = {
  fetchDataAndBuildPeaks: initializeSMDataPeaks,
  peaksReady: peaksReady,
  retrieveWaveformSuccess: retrieveWaveformSuccess,
  setAlert: setAlert,
};

export default connect(mapStateToProps, mapDispatchToProps)(WaveformContainer);
