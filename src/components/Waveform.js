import React, { Component } from 'react';
import { Button, ButtonToolbar, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { configureAlert } from '../services/alert-status';
import { retrieveStreamMedia, setAlert } from '../actions/forms';
import VolumeSlider from './Slider';
import LoadingSpinner from '../services/LoadingSpinner';

// Content of aria-label for UI components
const waveformLabel = `Two interactive waveforms, plotted one after the other using data from a masterfile in a back-end server.
There are time-based visual sections plotted in these 2 waveforms representing each timespan in the structure below.`;
const zoomViewLabel = `A detailed portion of the waveform data, the level of details shown can be changed with zoom in/out buttons in the waveform toolbar`;
const overViewLabel = `An overview of the waveform data of the media file used. This shows all the time-based segments from the structure`;

class Waveform extends Component {
  constructor(props) {
    super(props);
    this.state = {
      audioFile: this.props.audioStreamURL,
      volume: 100,
      streamMediaStatus: this.props.streamInfo.streamMediaStatus,
      readyPeaks: this.props.peaksInstance.readyPeaks,
    };

    // Create `refs`
    this.zoomView = React.createRef();
    this.overView = React.createRef();
    this.mediaPlayer = React.createRef();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.peaksInstance) {
      return {
        readyPeaks: nextProps.peaksInstance.readyPeaks,
      };
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.streamInfo.streamMediaStatus !=
      this.props.streamInfo.streamMediaStatus
    ) {
      const alert = configureAlert(this.props.streamInfo.streamMediaStatus);
      this.props.setAlert(alert);
    }
  }

  componentDidMount = () => {
    const { audioFile } = this.state;
    this.props.retrieveStreamMedia(audioFile, this.mediaPlayer, {
      withCredentials: this.props.withCredentials,
    });

    // Grab the React `refs` now the component is mounted
    this.props.zoomViewRef(this.zoomView.current);
    this.props.overViewRef(this.overView.current);
    this.props.mediaPlayerRef(this.mediaPlayer.current);

    // Add a listener to keydown event
    document.addEventListener('keydown', this.handleKeyPress);
  };

  handleKeyPress = (event) => {
    // When structure is not being edited play/pause audio when spacebar is pressed
    if (event.keyCode == 32 && !this.props.editingDisabled) {
      event.preventDefault();
      this.mediaPlayer.current.paused ? this.playAudio() : this.pauseAudio();
    }
  };

  componentWillUnmount() {
    // Remove event listener when component is unmounting
    document.removeEventListener('keydown', this.handleKeyPress);
  }

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

  setVolume = (volume) => {
    this.mediaPlayer.current.volume = volume / 100;
    this.setState({ volume });
  };

  render() {
    const { volume, readyPeaks } = this.state;
    const { streamMediaError, streamMediaLoading } = this.props.streamInfo;
    const stillLoading =
      (streamMediaLoading && !streamMediaError) || !readyPeaks;
    return (
      <React.Fragment>
        <div
          id="waveform-container"
          tabIndex="0"
          data-testid="waveform"
          aria-label={waveformLabel}
        >
          <div
            id="zoomview-container"
            ref={this.zoomView}
            tabIndex="0"
            data-testid="zoom-view"
            aria-label={zoomViewLabel}
          />
          <div
            id="overview-container"
            ref={this.overView}
            tabIndex="0"
            data-testid="over-view"
            aria-label={overViewLabel}
          />
        </div>
        {stillLoading && (
          <div data-testid="loading-spinner">
            <LoadingSpinner isLoading={stillLoading} />
          </div>
        )}
        <audio
          ref={this.mediaPlayer}
          hidden={true}
          src={this.state.audioFile}
          data-testid="waveform-media"
        >
          Your browser does not support the audio element.
        </audio>
        {!streamMediaLoading && !streamMediaError && (
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

const mapStateToProps = (state) => ({
  peaksInstance: state.peaksInstance,
  streamInfo: state.forms.streamInfo,
  editingDisabled: state.forms.editingDisabled,
});

const mapDispatchToProps = {
  retrieveStreamMedia: retrieveStreamMedia,
  setAlert: setAlert,
};

export default connect(mapStateToProps, mapDispatchToProps)(Waveform);
