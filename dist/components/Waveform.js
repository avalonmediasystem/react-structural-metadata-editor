"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

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

var _AlertContainer = _interopRequireDefault(require("../containers/AlertContainer"));

var _alertStatus = require("../services/alert-status");

var _forms = require("../actions/forms");

var _Slider = _interopRequireDefault(require("./Slider"));

// Content of aria-label for UI components
var waveformLabel = "Two interactive waveforms, plotted one after the other using data from a masterfile in the back-end server.\nThere are time-based visual sections plotted in these 2 waveforms representing each timespan in the structure below. \nFirst one contains a selected zoomed-in section from the entire waveform, while the second waveform shows an overview of the entire audio file.\nThere are multiple zoom levels, which can be changed using the zoom-in and zoom-out buttons in the waveform toolbar. \nThese time-based visual sections will be updated by editing the matching timespans in the structure.";

var Waveform =
/*#__PURE__*/
function (_Component) {
  (0, _inherits2["default"])(Waveform, _Component);

  function Waveform(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, Waveform);
    _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(Waveform).call(this, props));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "componentDidMount", function () {
      var audioFile = _this.state.audioFile;

      _this.props.retrieveStreamMedia(audioFile, _this.mediaPlayer); // Grab the React `refs` now the component is mounted


      _this.props.waveformRef(_this.waveformContainer.current);

      _this.props.mediaPlayerRef(_this.mediaPlayer.current);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "zoomIn", function () {
      _this.props.peaksInstance.peaks.zoom.zoomIn();
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "zoomOut", function () {
      _this.props.peaksInstance.peaks.zoom.zoomOut();
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "playAudio", function () {
      _this.props.peaksInstance.peaks.player.play();
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "pauseAudio", function () {
      _this.props.peaksInstance.peaks.player.pause();
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "setVolume", function (volume) {
      _this.mediaPlayer.current.volume = volume / 100;

      _this.setState({
        volume: volume
      });
    });
    _this.state = {
      audioFile: _this.props.audioStreamURL,
      alertObj: _this.props.alertObj,
      volume: 100,
      streamMediaStatus: _this.props.streamInfo.streamMediaStatus
    }; // Create `refs`

    _this.waveformContainer = _react["default"].createRef();
    _this.mediaPlayer = _react["default"].createRef();
    return _this;
  }

  (0, _createClass2["default"])(Waveform, [{
    key: "render",
    value: function render() {
      var _this$state = this.state,
          alertObj = _this$state.alertObj,
          volume = _this$state.volume;
      var _this$props$streamInf = this.props.streamInfo,
          streamMediaError = _this$props$streamInf.streamMediaError,
          streamMediaLoading = _this$props$streamInf.streamMediaLoading;
      return _react["default"].createElement(_react["default"].Fragment, null, _react["default"].createElement("div", {
        id: "waveform-container",
        ref: this.waveformContainer,
        "aria-label": waveformLabel,
        tabIndex: "0",
        "data-testid": "waveform"
      }), (streamMediaError || streamMediaLoading) && _react["default"].createElement(_AlertContainer["default"], alertObj), _react["default"].createElement(_reactBootstrap.Row, {
        "data-testid": "waveform-toolbar"
      }, _react["default"].createElement("audio", {
        ref: this.mediaPlayer,
        hidden: true
      }, "Your browser does not support the audio element."), _react["default"].createElement(_reactBootstrap.Col, {
        xs: 6,
        md: 6
      }, _react["default"].createElement(_Slider["default"], {
        volume: volume,
        setVolume: this.setVolume
      })), _react["default"].createElement(_reactBootstrap.Col, {
        xs: 12,
        md: 6
      }, _react["default"].createElement(_reactBootstrap.ButtonToolbar, null, _react["default"].createElement(_reactBootstrap.Button, {
        className: "glyphicon glyphicon-play",
        "aria-label": "Play",
        onClick: this.playAudio,
        "data-testid": "waveform-play-button",
        disabled: streamMediaError || streamMediaLoading
      }), _react["default"].createElement(_reactBootstrap.Button, {
        className: "glyphicon glyphicon-pause",
        "aria-label": "Pause",
        onClick: this.pauseAudio,
        "data-testid": "waveform-pause-button",
        disabled: streamMediaError || streamMediaLoading
      }), _react["default"].createElement(_reactBootstrap.Button, {
        className: "glyphicon glyphicon-zoom-in",
        "aria-label": "Zoom in",
        onClick: this.zoomIn,
        "data-testid": "waveform-zoomin-button"
      }), _react["default"].createElement(_reactBootstrap.Button, {
        className: "glyphicon glyphicon-zoom-out",
        "aria-label": "Zoom out",
        onClick: this.zoomOut,
        "data-testid": "waveform-zoomout-button"
      })))));
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(nextProps, prevState) {
      var streamMediaStatus = nextProps.streamInfo.streamMediaStatus;

      if (prevState.streamMediaStatus !== streamMediaStatus) {
        return {
          streamMediaStatus: nextProps.streamInfo.streamMediaStatus,
          alertObj: (0, _alertStatus.configureAlert)(nextProps.streamInfo.streamMediaStatus, nextProps.clearAlert)
        };
      }

      if (nextProps.alertObj === null) {
        return {
          alertObj: null
        };
      }

      return null;
    }
  }]);
  return Waveform;
}(_react.Component);

var mapStateToProps = function mapStateToProps(state) {
  return {
    peaksInstance: state.peaksInstance,
    streamInfo: state.forms.streamInfo
  };
};

var mapDispatchToProps = {
  retrieveStreamMedia: _forms.retrieveStreamMedia
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(Waveform);

exports["default"] = _default;