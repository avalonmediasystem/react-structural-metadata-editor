import React, { Component } from 'react';
import { Button, ButtonToolbar, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import AlertContainer from '../containers/AlertContainer';
import { configureAlert } from '../services/alert-status';
import { retrieveStreamMedia } from '../actions/forms';
import VolumeSlider from './Slider';
import LoadingSpinner from '../services/LoadingSpinner';

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
      alertObj: this.props.alertObj,
      volume: 100,
      streamMediaStatus: this.props.streamInfo.streamMediaStatus
    };

    // Create `refs`
    this.waveformContainer = React.createRef();
    this.mediaPlayer = React.createRef();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { streamMediaStatus } = nextProps.streamInfo;
    if (prevState.streamMediaStatus !== streamMediaStatus) {
      return {
        streamMediaStatus: nextProps.streamInfo.streamMediaStatus,
        alertObj: configureAlert(
          nextProps.streamInfo.streamMediaStatus,
          nextProps.clearAlert
        )
      };
    }
    if (nextProps.alertObj === null) {
      return { alertObj: null };
    }
    return null;
  }

  componentDidMount = () => {
    const { audioFile } = this.state;
    this.props.retrieveStreamMedia(audioFile, this.mediaPlayer);

    // Grab the React `refs` now the component is mounted
    this.props.waveformRef(this.waveformContainer.current);
    this.props.mediaPlayerRef(this.mediaPlayer.current);
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
    const { streamMediaError, streamMediaLoading } = this.props.streamInfo;
    return (
      <React.Fragment>
        <div
          id="waveform-container"
          ref={this.waveformContainer}
          aria-label={waveformLabel}
          tabIndex="0"
          data-testid="waveform"
        />
        {(streamMediaLoading && !streamMediaError) && (
          <div data-testid="loading-spinner">
            <LoadingSpinner isLoading={streamMediaLoading} />
          </div>
        )}
        {streamMediaError &&
          <AlertContainer {...alertObj} />
        }
        <audio ref={this.mediaPlayer} hidden={true}>
          Your browser does not support the audio element.
        </audio>
        {(!streamMediaLoading && !streamMediaError) && (
          <Row data-testid="waveform-toolbar">
            <Col xs={6} md={6}>
              <VolumeSlider volume={volume} setVolume={this.setVolume} />
            </Col>
            <Col xs={12} md={6}>
              <ButtonToolbar>
                <Button
                  className="glyphicon glyphicon-play"
                  aria-label="Play"
                  onClick={this.playAudio}
                  data-testid="waveform-play-button"
                  disabled={streamMediaError || streamMediaLoading}
                />
                <Button
                  className="glyphicon glyphicon-pause"
                  aria-label="Pause"
                  onClick={this.pauseAudio}
                  data-testid="waveform-pause-button"
                  disabled={streamMediaError || streamMediaLoading}
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
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  peaksInstance: state.peaksInstance,
  streamInfo: state.forms.streamInfo
});

const mapDispatchToProps = {
  retrieveStreamMedia: retrieveStreamMedia
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Waveform);
