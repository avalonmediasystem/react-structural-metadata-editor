import React, { Component } from 'react';
import APIUtils from '../api/Utils';
import { connect } from 'react-redux';
import * as peaksActions from '../actions/peaks-instance';
import * as actions from '../actions/forms';
import Waveform from '../components/Waveform';
import AlertContainer from '../containers/AlertContainer';
import { configureAlert } from '../services/alert-status';
import { handleWaveformMasterFile } from '../actions/forms';

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
  zoomWaveformColor: 'rgba(217, 217, 217, 1)'
};

class WaveformContainer extends Component {
  constructor(props) {
    super(props);
    this.waveformContainer = null;
    this.mediaPlayer = null;
  }

  state = {
    alertObj: null,
    hasError: false
  };

  componentDidMount() {
    peaksOptions.container = this.waveformContainer;
    peaksOptions.mediaElement = this.mediaPlayer;
    this.initializePeaks();
  }

  clearAlert = () => {
    this.setState({
      alertObj: null
    });
  };

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

  async initializePeaks() {
    try {
      const response = await apiUtils.getRequest('waveform.json');
      // Set the masterfile URL as the URI for the waveform data file
      peaksOptions.dataUri = response.request.responseURL;

      // Initialize Peaks
      this.props.initPeaks(this.props.smData, peaksOptions);

      // Update redux-store flag for waveform file retrieval
      this.props.handleWaveformFile(0);
    } catch (error) {
      this.handleError(error);
    }
  }

  render() {
    const { alertObj, hasError } = this.state;
    const { forms } = this.props;

    return (
      <section className="waveform-section">
        {!forms.waveformRetrieved && hasError ? (
          <AlertContainer {...alertObj} />
        ) : (
          <Waveform
            waveformRef={ref => (this.waveformContainer = ref)}
            mediaPlayerRef={ref => (this.mediaPlayer = ref)}
          />
        )}
      </section>
    );
  }
}

// For testing purposes
export { WaveformContainer as PureWaveformContainer };

const mapStateToProps = state => ({
  smData: state.smData,
  forms: state.forms
});

const mapDispatchToProps = dispatch => ({
  ...actions,
  initPeaks: (smData, options) =>
    dispatch(peaksActions.initPeaksInstance(smData, options)),
  handleWaveformFile: code => dispatch(handleWaveformMasterFile(code))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WaveformContainer);
