import React, { Component } from 'react';
import { Button, ButtonToolbar, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import Hls from 'hls.js';
import AlertContainer from '../containers/AlertContainer';
import { configureAlert } from '../services/alert-status';
import { retrieveStreamMediaError } from '../actions/forms';
import VolumeSlider from './Slider';

// Content of aria-label for UI components
const waveformLabel = `Two interactive waveforms, plotted one after the other using data from a masterfile in the back-end server.
There are time-based visual sections plotted in these 2 waveforms representing each timespan in the structure below. 
First one contains a selected zoomed-in section from the entire waveform, while the second waveform shows an overview of the entire audio file.
There are multiple zoom levels, which can be changed using the zoom-in and zoom-out buttons in the waveform toolbar. 
These time-based visual sections will be updated by editing the matching timespans in the structure.`;

class Waveform extends Component {
  constructor(props) {
    super(props);
    this.state = {
      audioFile: this.props.audioStreamURL,
      alertObj: null,
      volume: 100
    };

    // Create `refs`
    this.waveformContainer = React.createRef();
    this.mediaPlayer = React.createRef();
  }

  componentDidMount = () => {
    const { audioFile } = this.state;
    if (Hls.isSupported()) {
      const hls = new Hls();
      let self = this;
      // Bind media player
      hls.attachMedia(this.mediaPlayer.current);
      // MEDIA_ATTACHED event is fired by hls object once MediaSource is ready
      hls.on(Hls.Events.MEDIA_ATTACHED, function(event, data) {
        hls.loadSource(audioFile);
      });
      hls.on(Hls.Events.ERROR, function(event, data) {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              self.setAlert(data);
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              self.setAlert(data);
              break;
            default:
              break;
          }
        }
      });
    }
    // Grab the React `refs` now the component is mounted
    this.props.waveformRef(this.waveformContainer.current);
    this.props.mediaPlayerRef(this.mediaPlayer.current);
  };

  clearAlert = () => {
    this.setState({ alertObj: null });
  };

  setAlert = data => {
    this.props.retrieveStreamMediaError();
    if (data.response !== undefined) {
      const status = data.response.code;
      status === 0
        ? this.setState({
            alertObj: configureAlert(-5, this.clearAlert)
          })
        : this.setState({
            alertObj: configureAlert(data.response.code, this.clearAlert)
          });
    } else {
      this.setState({
        alertObj: configureAlert(-5, this.clearAlert)
      });
    }
  };

  zoomIn = () => {
    this.props.peaksInstance.peaks.zoom.zoomIn();
  };

  zoomOut = () => {
    this.props.peaksInstance.peaks.zoom.zoomOut();
  };

  playAudio = () => {
    this.props.peaksInstance.peaks.player.play();
  };

  pauseAudio = () => {
    this.props.peaksInstance.peaks.player.pause();
  };

  setVolume = volume => {
    this.mediaPlayer.current.volume = volume / 100;
    this.setState({ volume });
  };

  render() {
    const { alertObj, volume } = this.state;
    const { streamMediaRetrieved } = this.props;
    return (
      <React.Fragment>
        <div
          id="waveform-container"
          ref={this.waveformContainer}
          aria-label={waveformLabel}
          tabIndex="0"
          data-testid="waveform"
        />
        {!streamMediaRetrieved && <AlertContainer {...alertObj} />}
        <Row data-testid="waveform-toolbar">
          <audio ref={this.mediaPlayer} hidden={true}>
            Your browser does not support the audio element.
          </audio>
          <Col xs={6} md={6}>
            <VolumeSlider volume={volume} setVolume={this.setVolume} />
          </Col>
          <Col xs={12} md={6}>
            <ButtonToolbar>
              <Button
                className="glyphicon glyphicon-play"
                aria-label="Play"
                onClick={this.playAudio}
                disabled={!streamMediaRetrieved}
                data-testid="waveform-play-button"
              />
              <Button
                className="glyphicon glyphicon-pause"
                aria-label="Pause"
                onClick={this.pauseAudio}
                disabled={!streamMediaRetrieved}
                data-testid="waveform-pause-button"
              />
              <Button
                className="glyphicon glyphicon-zoom-in"
                aria-label="Zoom in"
                onClick={this.zoomIn}
                data-testid="waveform-zoomin-button"
              />
              <Button
                className="glyphicon glyphicon-zoom-out"
                aria-label="Zoom out"
                onClick={this.zoomOut}
                data-testid="waveform-zoomout-button"
              />
            </ButtonToolbar>
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  peaksInstance: state.peaksInstance,
  streamMediaRetrieved: state.forms.streamMediaRetrieved
});

const mapDispatchToProps = {
  retrieveStreamMediaError: retrieveStreamMediaError
};
// To use in the app
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Waveform);
