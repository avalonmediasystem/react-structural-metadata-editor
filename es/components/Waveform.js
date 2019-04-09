function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React, { Component } from 'react';
import { Button, ButtonToolbar, FormControl, FormGroup, Form, Row, Col } from 'react-bootstrap';
import soundMP3 from '../data/utah_phillips_one.mp3';
import { connect } from 'react-redux';

// Content of aria-label for UI components
var waveformLabel = 'Two interactive waveforms, plotted one after the other using data from a masterfile in the back-end server.\nThere are time-based visual sections plotted in these 2 waveforms representing each timespan in the structure below.\nFirst one contains a selected zoomed-in section from the entire waveform, while the second waveform shows an overview of the entire audio file.\nThere are multiple zoom levels, which can be changed using the zoom-in and zoom-out buttons in the waveform toolbar.\nThese time-based visual sections will be updated by editing the matching timespans in the structure.';
var audioControlsLabel = 'Audio controls; play, seek, and adjust volume of the audio file';
var waveformControlsLabel = 'Waveform toolbar with zoom-in, zoom-out, and seek functionalities to view and traverse the waveform';

var Waveform = function (_Component) {
  _inherits(Waveform, _Component);

  function Waveform(props) {
    _classCallCheck(this, Waveform);

    var _this = _possibleConstructorReturn(this, _Component.call(this, props));

    _this.zoomIn = function () {
      _this.props.peaksInstance.peaks.zoom.zoomIn();
    };

    _this.zoomOut = function () {
      _this.props.peaksInstance.peaks.zoom.zoomOut();
    };

    _this.seekTime = function () {
      var timeInSeconds = parseFloat(_this.state.seekTime);
      if (!Number.isNaN(timeInSeconds)) {
        _this.props.peaksInstance.peaks.player.seek(timeInSeconds);
      }
    };

    _this.state = {
      seekTime: ''
    };

    // Create `refs`
    _this.waveformContainer = React.createRef();
    _this.mediaPlayer = React.createRef();

    _this.handleSubmit = _this.handleSubmit.bind(_this);
    _this.handleChange = _this.handleChange.bind(_this);
    return _this;
  }

  Waveform.prototype.componentDidMount = function componentDidMount() {
    // Grab the React `refs` now the component is mounted
    this.props.waveformRef(this.waveformContainer.current);
    this.props.mediaPlayerRef(this.mediaPlayer.current);
  };

  Waveform.prototype.handleSubmit = function handleSubmit(event) {
    this.seekTime();
    event.preventDefault();
  };

  Waveform.prototype.handleChange = function handleChange(event) {
    this.setState({
      seekTime: event.target.value
    });
  };

  Waveform.prototype.render = function render() {
    return React.createElement(
      'div',
      null,
      React.createElement('div', {
        id: 'waveform-container',
        ref: this.waveformContainer,
        'aria-label': waveformLabel,
        tabIndex: '0'
      }),
      React.createElement(
        Row,
        null,
        React.createElement(
          Col,
          { xs: 12, md: 6 },
          React.createElement(
            'audio',
            {
              controls: true,
              ref: this.mediaPlayer,
              src: soundMP3,
              type: 'audio/mp3',
              'aria-label': audioControlsLabel
            },
            'Your browser does not support the audio element.'
          )
        ),
        React.createElement(
          Col,
          {
            xs: 12,
            md: 6,
            className: 'text-right',
            tabIndex: '0',
            'aria-label': waveformControlsLabel
          },
          React.createElement(
            Form,
            { inline: true, onSubmit: this.handleSubmit, role: 'form' },
            React.createElement(
              FormGroup,
              null,
              React.createElement(
                ButtonToolbar,
                null,
                React.createElement(Button, {
                  className: 'glyphicon glyphicon-zoom-in',
                  'aria-label': 'Zoom in',
                  onClick: this.zoomIn
                }),
                React.createElement(Button, {
                  className: 'glyphicon glyphicon-zoom-out',
                  'aria-label': 'Zoom out',
                  onClick: this.zoomOut
                })
              )
            ),
            ' ',
            React.createElement(
              FormGroup,
              null,
              React.createElement(FormControl, {
                className: 'form-control',
                type: 'text',
                value: this.state.seekTime,
                onChange: this.handleChange,
                placeholder: '0',
                'aria-label': 'Seek time in seconds'
              })
            ),
            ' ',
            React.createElement(
              Button,
              { onClick: this.seekTime },
              'Seek'
            )
          )
        )
      )
    );
  };

  return Waveform;
}(Component);

// To use in tests as a disconnected component (to access state)


export { Waveform as PureWaveform };

var mapStateToProps = function mapStateToProps(state) {
  return {
    peaksInstance: state.peaksInstance
  };
};
// To use in the app
export default connect(mapStateToProps)(Waveform);