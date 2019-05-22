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

var _AlertContainer = _interopRequireDefault(require("../containers/AlertContainer"));

var _alertStatus = require("../services/alert-status");

var _forms = require("../actions/forms");

// Content of aria-label for UI components
var waveformLabel = "Two interactive waveforms, plotted one after the other using data from a masterfile in the back-end server.\nThere are time-based visual sections plotted in these 2 waveforms representing each timespan in the structure below. \nFirst one contains a selected zoomed-in section from the entire waveform, while the second waveform shows an overview of the entire audio file.\nThere are multiple zoom levels, which can be changed using the zoom-in and zoom-out buttons in the waveform toolbar. \nThese time-based visual sections will be updated by editing the matching timespans in the structure.";
var audioControlsLabel = "Audio controls; play, seek, and adjust volume of the audio file";

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

      if (_hls["default"].isSupported()) {
        var hls = new _hls["default"]();
        var self = (0, _assertThisInitialized2["default"])(_this); // Bind media player

        hls.attachMedia(_this.mediaPlayer.current); // MEDIA_ATTACHED event is fired by hls object once MediaSource is ready

        hls.on(_hls["default"].Events.MEDIA_ATTACHED, function () {
          hls.loadSource(audioFile);
        });
        hls.on(_hls["default"].Events.ERROR, function (event, data) {
          if (data.fatal) {
            switch (data.type) {
              case _hls["default"].ErrorTypes.NETWORK_ERROR:
                self.setAlert(data);
                break;

              case _hls["default"].ErrorTypes.MEDIA_ERROR:
                self.setAlert(data);
                break;

              default:
                break;
            }
          }
        });
      } // Grab the React `refs` now the component is mounted


      _this.props.waveformRef(_this.waveformContainer.current);

      _this.props.mediaPlayerRef(_this.mediaPlayer.current);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "clearAlert", function () {
      _this.setState({
        alertObj: null
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "setAlert", function (data) {
      _this.props.retrieveStreamMediaError();

      if (data.response !== undefined) {
        var status = data.response.code;
        status === 0 ? _this.setState({
          alertObj: (0, _alertStatus.configureAlert)(-5, _this.clearAlert),
          hasError: true
        }) : _this.setState({
          alertObj: (0, _alertStatus.configureAlert)(data.response.code, _this.clearAlert),
          hasError: true
        });
      } else {
        _this.setState({
          alertObj: (0, _alertStatus.configureAlert)(-5, _this.clearAlert),
          hasError: true
        });
      }
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "zoomIn", function () {
      _this.props.peaksInstance.peaks.zoom.zoomIn();
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "zoomOut", function () {
      _this.props.peaksInstance.peaks.zoom.zoomOut();
    });
    _this.state = {
      audioFile: _this.props.audioStreamURL,
      alertObj: null,
      hasError: false
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
          hasError = _this$state.hasError;
      return _react["default"].createElement("div", null, _react["default"].createElement("div", {
        id: "waveform-container",
        ref: this.waveformContainer,
        "aria-label": waveformLabel,
        tabIndex: "0"
      }), _react["default"].createElement(_reactBootstrap.Row, null, _react["default"].createElement(_reactBootstrap.Col, {
        xs: 12,
        md: 6
      }, hasError ? _react["default"].createElement(_AlertContainer["default"], alertObj) : _react["default"].createElement("audio", {
        controls: true,
        ref: this.mediaPlayer,
        "aria-label": audioControlsLabel
      }, "Your browser does not support the audio element.")), _react["default"].createElement(_reactBootstrap.Col, {
        xs: 12,
        md: 6,
        className: "text-right"
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
      })))))));
    }
  }]);
  return Waveform;
}(_react.Component); // To use in tests as a disconnected component (to access state)


exports.PureWaveform = Waveform;

var mapStateToProps = function mapStateToProps(state) {
  return {
    peaksInstance: state.peaksInstance
  };
};

var mapDispatchToProps = {
  retrieveStreamMediaError: _forms.retrieveStreamMediaError
}; // To use in the app

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(Waveform);

exports["default"] = _default;