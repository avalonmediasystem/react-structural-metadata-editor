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
    this.zoomView = null;
    this.overView = null;
    this.mediaPlayer = null;
  }

  state = {
    alertObj: null,
    streamAlert: {},
    masterFileID: this.props.masterFileID,
    baseURL: this.props.baseURL,
    initStructure: this.props.initStructure,
    streamLength: this.props.streamDuration,
    dataUri: null,
  };

  componentDidMount() {
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
      await apiUtils.headRequest(baseURL, masterFileID, 'waveform.json');

      // Set waveform URI
      peaksOptions.dataUri = `${baseURL}/master_files/${masterFileID}/waveform.json`;

      // Update redux-store flag for waveform file retrieval
      this.props.retrieveWaveformSuccess();
    } catch (error) {
      // Enable the flash message alert
      this.handleError(error);
    }

    // Fetch structure.json and build Peaks
    this.props.fetchDataAndBuildPeaks(
      baseURL,
      masterFileID,
      initStructure,
      peaksOptions,
      streamLength
    );
  }

  handleError(error) {
    console.log('TCL: WaveformContainer -> handleError -> error', error);
    let status = null;
    const { baseURL, masterFileID } = this.state;

    // Pull status code out of error response/request
    if (error.response !== undefined) {
      status = error.response.status;
      if (status == 404) {
        peaksOptions.dataUri = `${baseURL}/master_files/${masterFileID}/waveform.json?empty=true`;
        status = -7; // for persistent missing waveform data alert
      }
    } else if (error.request !== undefined) {
      status = -3;
    }

    const alertObj = configureAlert(status, this.clearAlert);
    this.setState({ alertObj });
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
          withCredentials={this.props.withCredentials}
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
