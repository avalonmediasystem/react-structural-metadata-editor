import React, { Component } from 'react';
import {
  Button,
  ButtonToolbar,
  FormControl,
  FormGroup,
  Form,
  Row,
  Col
} from 'react-bootstrap';
import soundMP3 from '../data/utah_phillips_one.mp3';
import { connect } from 'react-redux';

// Content of aria-label for UI components
const waveformLabel = `Two interactive waveforms, plotted one after the other using data from a masterfile in the back-end server.
There are time-based visual sections plotted in these 2 waveforms representing each timespan in the structure below.
First one contains a selected zoomed-in section from the entire waveform, while the second waveform shows an overview of the entire audio file.
There are multiple zoom levels, which can be changed using the zoom-in and zoom-out buttons in the waveform toolbar.
These time-based visual sections will be updated by editing the matching timespans in the structure.`;
const audioControlsLabel = `Audio controls; play, seek, and adjust volume of the audio file`;
const waveformControlsLabel = `Waveform toolbar with zoom-in, zoom-out, and seek functionalities to view and traverse the waveform`;

class Waveform extends Component {
  constructor(props) {
    super(props);
    this.state = {
      seekTime: ''
    };

    // Create `refs`
    this.waveformContainer = React.createRef();
    this.mediaPlayer = React.createRef();

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    // Grab the React `refs` now the component is mounted
    this.props.waveformRef(this.waveformContainer.current);
    this.props.mediaPlayerRef(this.mediaPlayer.current);
  }

  zoomIn = () => {
    this.props.peaksInstance.peaks.zoom.zoomIn();
  };

  zoomOut = () => {
    this.props.peaksInstance.peaks.zoom.zoomOut();
  };

  handleSubmit(event) {
    this.seekTime();
    event.preventDefault();
  }

  handleChange(event) {
    this.setState({
      seekTime: event.target.value
    });
  }

  seekTime = () => {
    const timeInSeconds = parseFloat(this.state.seekTime);
    if (!Number.isNaN(timeInSeconds)) {
      this.props.peaksInstance.peaks.player.seek(timeInSeconds);
    }
  };

  render() {
    return (
      <div>
        <div
          id="waveform-container"
          ref={this.waveformContainer}
          aria-label={waveformLabel}
          tabIndex="0"
        />
        <Row>
          <Col xs={12} md={6}>
            <audio
              controls
              ref={this.mediaPlayer}
              src={soundMP3}
              type="audio/mp3"
              aria-label={audioControlsLabel}
            >
              Your browser does not support the audio element.
            </audio>
          </Col>
          <Col
            xs={12}
            md={6}
            className="text-right"
            tabIndex="0"
            aria-label={waveformControlsLabel}
          >
            <Form inline onSubmit={this.handleSubmit} role="form">
              <FormGroup>
                <ButtonToolbar>
                  <Button
                    className="glyphicon glyphicon-zoom-in"
                    aria-label="Zoom in"
                    onClick={this.zoomIn}
                  />
                  <Button
                    className="glyphicon glyphicon-zoom-out"
                    aria-label="Zoom out"
                    onClick={this.zoomOut}
                  />
                </ButtonToolbar>
              </FormGroup>{' '}
              <FormGroup>
                <FormControl
                  className="form-control"
                  type="text"
                  value={this.state.seekTime}
                  onChange={this.handleChange}
                  placeholder="0"
                  aria-label="Seek time in seconds"
                />
              </FormGroup>{' '}
              <Button onClick={this.seekTime}>Seek</Button>
            </Form>
          </Col>
        </Row>
      </div>
    );
  }
}

// To use in tests as a disconnected component (to access state)
export { Waveform as PureWaveform };

const mapStateToProps = state => ({
  peaksInstance: state.peaksInstance
});
// To use in the app
export default connect(mapStateToProps)(Waveform);
