import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import APIUtils from '../api/Utils';
import { connect } from 'react-redux';
import { initializeSMDataPeaks } from '../actions/peaks-instance';
import { handleEditingTimespans } from '../actions/forms';
import Waveform from '../components/Waveform';
import AlertContainer from '../containers/AlertContainer';
import { configureAlert } from '../services/alert-status';
import { retrieveWaveformSuccess } from '../actions/forms';
import WaveformDataUtils from '../services/WaveformDataUtils';

const waveformUtils = new WaveformDataUtils();

const apiUtils = new APIUtils();

// Peaks options
let peaksOptions = {
  container: null,
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
    // this.waveformContainer = null;
    this.zoomView = null;
    this.overView = null;
    this.mediaPlayer = null;
  }

  state = {
    alertObj: null,
    streamAlert: {},
    hasError: false,
    masterFileID: this.props.masterFileID,
    baseURL: this.props.baseURL,
    initStructure: this.props.initStructure,
    streamLength: this.props.streamDuration,
  };

  componentDidMount() {
    // peaksOptions.container = this.waveformContainer;
    peaksOptions.containers = {
      zoomview: this.zoomView,
      overview: this.overView,
    };
    peaksOptions.mediaElement = this.mediaPlayer;
    this.initializePeaksInstance();
  }

  clearAlert = () => {
    this.setState({
      alertObj: null,
    });
  };

  clearStreamAlert = () => {
    this.setState({
      streamAlert: null,
    });
  };

  async initializePeaksInstance() {
    const { baseURL, masterFileID, initStructure, streamLength } = this.state;
    try {
      // Check whether the waveform.json exists in the server
      const response = await apiUtils.headRequest(
        baseURL,
        masterFileID,
        'waveform.json'
      );

      // Set the masterfile URL as the URI for the waveform data file
      if (response.status >= 200 && response.status < 400) {
        peaksOptions.dataUri = response.request.responseURL;
      }

      // Initialize Peaks
      this.props.fetchDataAndBuildPeaks(
        baseURL,
        masterFileID,
        initStructure,
        peaksOptions,
        streamLength
      );
      // Update redux-store flag for waveform file retrieval
      this.props.retrieveWaveformSuccess();
    } catch (error) {
      // Enable the flash message alert
      this.handleError(error);

      // Provide an empty waveform dataset for Peaks to build on
      peaksOptions = {
        ...peaksOptions,
        waveformData: {
          json: waveformUtils.generateEmptyWaveform(streamLength),
        },
      };

      // Fetch structure.json and build Peaks
      this.props.fetchDataAndBuildPeaks(
        baseURL,
        masterFileID,
        initStructure,
        peaksOptions,
        streamLength
      );
    }
  }

  handleError(error) {
    console.log('TCL: WaveformContainer -> handleError -> error', error);
    let status = null;

    // Pull status code out of error response/request
    if (error.response) {
      const statusCode = error.response.status;
      if (statusCode > 400 && statusCode < 500) {
        // Use non-dismissible alert and use dummy waveform data
        status = -7;
      } else {
        status = statusCode;
      }
    } else if (error.request !== undefined) {
      status = -3;
    }

    const alertObj = configureAlert(status, this.clearAlert);
    this.setState({ alertObj, hasError: true });
  }

  render() {
    const { alertObj, streamAlert } = this.state;
    const { audioStreamURL } = this.props;

    return (
      <section className="waveform-section" data-testid="waveform-container">
        <Waveform
          zoomViewRef={(ref) => (this.zoomView = ref)}
          overViewRef={(ref) => (this.overView = ref)}
          mediaPlayerRef={(ref) => (this.mediaPlayer = ref)}
          audioStreamURL={audioStreamURL}
          alertObj={streamAlert}
          clearAlert={this.clearStreamAlert}
        />{' '}
        <AlertContainer {...alertObj} />
      </section>
    );
  }
}

const mapStateToProps = (state) => ({
  smData: state.structuralMetadata.smData,
});

const mapDispatchToProps = {
  fetchDataAndBuildPeaks: initializeSMDataPeaks,
  retrieveWaveformSuccess: retrieveWaveformSuccess,
  handleEditingTimespans: handleEditingTimespans,
};

export default connect(mapStateToProps, mapDispatchToProps)(WaveformContainer);
