import React, { Component } from 'react';
import APIUtils from '../api/Utils';
import { connect } from 'react-redux';
import { initializeSMDataPeaks } from '../actions/peaks-instance';
import { handleEditingTimespans } from '../actions/forms';
import Waveform from '../components/Waveform';
import AlertContainer from '../containers/AlertContainer';
import { configureAlert } from '../services/alert-status';
import { retrieveWaveformSuccess } from '../actions/forms';

const apiUtils = new APIUtils();

// Peaks options
const peaksOptions = {
  container: null,
  mediaElement: null,
  dataUri: null,
  dataUriDefaultFormat: 'json',
  keyboard: true,
  pointMarkerColor: '#006eb0',
  showPlayheadTime: true,
  zoomWaveformColor: 'rgba(117, 117, 117, 1)',
  overviewWaveformColor: 'rgba(117, 117, 117, 1)'
};

class WaveformContainer extends Component {
  constructor(props) {
    super(props);
    this.waveformContainer = null;
    this.mediaPlayer = null;
  }

  state = {
    alertObj: null,
    streamAlert: {},
    hasError: false,
    masterFileID: this.props.masterFileID,
    baseURL: this.props.baseURL,
    initStructure: this.props.initStructure,
    streamLength: this.props.streamDuration
  };

  componentDidMount() {
    peaksOptions.container = this.waveformContainer;
    peaksOptions.mediaElement = this.mediaPlayer;
    this.initializePeaksInstance();
  }

  clearAlert = () => {
    this.setState({
      alertObj: null
    });
  };

  clearStreamAlert = () => {
    this.setState({
      streamAlert: null
    });
  };

  async initializePeaksInstance() {
    const { baseURL, masterFileID, initStructure, streamLength } = this.state;
    let isError = false;
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
        streamLength,
        isError
      );
      // Update redux-store flag for waveform file retrieval
      this.props.retrieveWaveformSuccess();
    } catch (error) {
      isError = true;
      this.handleError(error);

      // Disable edting when waveform is missing
      this.props.handleEditingTimespans(1);

      // Fetch structure.json when waveform.json is
      this.props.fetchDataAndBuildPeaks(
        baseURL,
        masterFileID,
        initStructure,
        peaksOptions,
        streamLength,
        isError
      );
    }
  }

  handleError(error) {
    console.log('TCL: WaveformContainer -> handleError -> error', error);
    let status = null;

    // Pull status code out of error response/request
    if (error.response !== undefined) {
      status = error.response.status;
    } else if (error.request !== undefined) {
      status = -3;
    }

    const alertObj = configureAlert(status, this.clearAlert);
    this.setState({ alertObj, hasError: true });
  }

  render() {
    const { alertObj, hasError, streamAlert } = this.state;
    const { forms, audioStreamURL } = this.props;

    return (
      <section className="waveform-section" data-testid="waveform-container">
        {!forms.waveformRetrieved && hasError ? (
          <AlertContainer {...alertObj} />
        ) : (
          <Waveform
            waveformRef={ref => (this.waveformContainer = ref)}
            mediaPlayerRef={ref => (this.mediaPlayer = ref)}
            audioStreamURL={audioStreamURL}
            alertObj={streamAlert}
            clearAlert={this.clearStreamAlert}
          />
        )}
      </section>
    );
  }
}

const mapStateToProps = state => ({
  smData: state.structuralMetadata.smData,
  forms: state.forms
});

const mapDispatchToProps = {
  fetchDataAndBuildPeaks: initializeSMDataPeaks,
  retrieveWaveformSuccess: retrieveWaveformSuccess,
  handleEditingTimespans: handleEditingTimespans
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WaveformContainer);
