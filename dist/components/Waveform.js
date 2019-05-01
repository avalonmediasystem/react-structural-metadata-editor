"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.PureWaveform = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _reactBootstrap = require("react-bootstrap");

var _reactRedux = require("react-redux");

var _hls = _interopRequireDefault(require("hls.js"));

// Content of aria-label for UI components
var waveformLabel = "Two interactive waveforms, plotted one after the other using data from a masterfile in the back-end server.\nThere are time-based visual sections plotted in these 2 waveforms representing each timespan in the structure below. \nFirst one contains a selected zoomed-in section from the entire waveform, while the second waveform shows an overview of the entire audio file.\nThere are multiple zoom levels, which can be changed using the zoom-in and zoom-out buttons in the waveform toolbar. \nThese time-based visual sections will be updated by editing the matching timespans in the structure.";
var audioControlsLabel = "Audio controls; play, seek, and adjust volume of the audio file";
var waveformControlsLabel = "Waveform toolbar with zoom-in, zoom-out, and seek functionalities to view and traverse the waveform";

var Waveform =
/*#__PURE__*/
function (_Component) {
  (0, _inherits2["default"])(Waveform, _Component);

  function Waveform(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, Waveform);
    _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(Waveform).call(this, props));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "zoomIn", function () {
      _this.props.peaksInstance.peaks.zoom.zoomIn();
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "zoomOut", function () {
      _this.props.peaksInstance.peaks.zoom.zoomOut();
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "seekTime", function () {
      var timeInSeconds = parseFloat(_this.state.seekTime);

      if (!Number.isNaN(timeInSeconds)) {
        _this.props.peaksInstance.peaks.player.seek(timeInSeconds);
      }
    });
    _this.state = {
      seekTime: '',
      audioFile: _this.props.audioStreamURL
    }; // Create `refs`

    _this.waveformContainer = _react["default"].createRef();
    _this.mediaPlayer = _react["default"].createRef();
    _this.handleSubmit = _this.handleSubmit.bind((0, _assertThisInitialized2["default"])(_this));
    _this.handleChange = _this.handleChange.bind((0, _assertThisInitialized2["default"])(_this));
    return _this;
  }

  (0, _createClass2["default"])(Waveform, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var audioFile = this.state.audioFile;

      if (_hls["default"].isSupported()) {
        var hls = new _hls["default"](); // Bind media player

        hls.attachMedia(this.mediaPlayer.current); // MEDIA_ATTACHED event is fired by hls object once MediaSource is ready

        hls.on(_hls["default"].Events.MEDIA_ATTACHED, function () {
          hls.loadSource(audioFile);
        });
      } // Grab the React `refs` now the component is mounted


      this.props.waveformRef(this.waveformContainer.current);
      this.props.mediaPlayerRef(this.mediaPlayer.current);
    }
  }, {
    key: "handleSubmit",
    value: function handleSubmit(event) {
      this.seekTime();
      event.preventDefault();
    }
  }, {
    key: "handleChange",
    value: function handleChange(event) {
      this.setState({
        seekTime: event.target.value
      });
    }
  }, {
    key: "render",
    value: function render() {
      return _react["default"].createElement("div", null, _react["default"].createElement("div", {
        id: "waveform-container",
        ref: this.waveformContainer,
        "aria-label": waveformLabel,
        tabIndex: "0"
      }), _react["default"].createElement(_reactBootstrap.Row, null, _react["default"].createElement(_reactBootstrap.Col, {
        xs: 12,
        md: 6
      }, _react["default"].createElement("audio", {
        controls: true,
        ref: this.mediaPlayer,
        "aria-label": audioControlsLabel
      }, "Your browser does not support the audio element.")), _react["default"].createElement(_reactBootstrap.Col, {
        xs: 12,
        md: 6,
        className: "text-right",
        tabIndex: "0",
        "aria-label": waveformControlsLabel
      }, _react["default"].createElement(_reactBootstrap.Form, {
        inline: true,
        onSubmit: this.handleSubmit,
        role: "form"
      }, _react["default"].createElement(_reactBootstrap.FormGroup, null, _react["default"].createElement(_reactBootstrap.ButtonToolbar, null, _react["default"].createElement(_reactBootstrap.Button, {
        className: "glyphicon glyphicon-zoom-in",
        "aria-label": "Zoom in",
        onClick: this.zoomIn
      }), _react["default"].createElement(_reactBootstrap.Button, {
        className: "glyphicon glyphicon-zoom-out",
        "aria-label": "Zoom out",
        onClick: this.zoomOut
      }))), ' ', _react["default"].createElement(_reactBootstrap.FormGroup, null, _react["default"].createElement(_reactBootstrap.FormControl, {
        className: "form-control",
        type: "text",
        value: this.state.seekTime,
        onChange: this.handleChange,
        placeholder: "0",
        "aria-label": "Seek time in seconds"
      })), ' ', _react["default"].createElement(_reactBootstrap.Button, {
        onClick: this.seekTime
      }, "Seek")))));
    }
  }]);
  return Waveform;
}(_react.Component); // To use in tests as a disconnected component (to access state)


exports.PureWaveform = Waveform;

var mapStateToProps = function mapStateToProps(state) {
  return {
    peaksInstance: state.peaksInstance
  };
}; // To use in the app


var _default = (0, _reactRedux.connect)(mapStateToProps)(Waveform);

exports["default"] = _default;