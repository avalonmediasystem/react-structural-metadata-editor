"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _reactBootstrap = require("react-bootstrap");

var _reactRedux = require("react-redux");

var _alertStatus = require("../services/alert-status");

var _forms = require("../actions/forms");

var _Slider = _interopRequireDefault(require("./Slider"));

var _LoadingSpinner = _interopRequireDefault(require("../services/LoadingSpinner"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

// Content of aria-label for UI components
var waveformLabel = "Two interactive waveforms, plotted one after the other using data from a masterfile in a back-end server.\nThere are time-based visual sections plotted in these 2 waveforms representing each timespan in the structure below.";
var zoomViewLabel = "A detailed portion of the waveform data, the level of details shown can be changed with zoom in/out buttons in the waveform toolbar";
var overViewLabel = "An overview of the waveform data of the media file used. This shows all the time-based segments from the structure";

var Waveform = /*#__PURE__*/function (_Component) {
  (0, _inherits2["default"])(Waveform, _Component);

  var _super = _createSuper(Waveform);

  function Waveform(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, Waveform);
    _this = _super.call(this, props);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "componentDidMount", function () {
      var audioFile = _this.state.audioFile;

      _this.props.retrieveStreamMedia(audioFile, _this.mediaPlayer, {
        withCredentials: _this.props.withCredentials
      }); // Grab the React `refs` now the component is mounted


      _this.props.zoomViewRef(_this.zoomView.current);

      _this.props.overViewRef(_this.overView.current);

      _this.props.mediaPlayerRef(_this.mediaPlayer.current); // Add a listener to keydown event


      document.addEventListener('keydown', _this.handleKeyPress);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleKeyPress", function (event) {
      // When structure is not being edited play/pause audio when spacebar is pressed
      if (event.keyCode == 32 && !_this.props.editingDisabled) {
        event.preventDefault();
        _this.mediaPlayer.current.paused ? _this.playAudio() : _this.pauseAudio();
      }
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
      volume: 100,
      streamMediaStatus: _this.props.streamInfo.streamMediaStatus,
      readyPeaks: _this.props.peaksInstance.readyPeaks
    }; // Create `refs`

    _this.zoomView = /*#__PURE__*/_react["default"].createRef();
    _this.overView = /*#__PURE__*/_react["default"].createRef();
    _this.mediaPlayer = /*#__PURE__*/_react["default"].createRef();
    return _this;
  }

  (0, _createClass2["default"])(Waveform, [{
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps, prevState) {
      if (prevProps.streamInfo.streamMediaStatus != this.props.streamInfo.streamMediaStatus) {
        var alert = (0, _alertStatus.configureAlert)(this.props.streamInfo.streamMediaStatus);
        this.props.setAlert(alert);
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      // Remove event listener when component is unmounting
      document.removeEventListener('keydown', this.handleKeyPress);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$state = this.state,
          volume = _this$state.volume,
          readyPeaks = _this$state.readyPeaks;
      var _this$props$streamInf = this.props.streamInfo,
          streamMediaError = _this$props$streamInf.streamMediaError,
          streamMediaLoading = _this$props$streamInf.streamMediaLoading;
      var stillLoading = streamMediaLoading && !streamMediaError || !readyPeaks;
      return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement("div", {
        id: "waveform-container",
        tabIndex: "0",
        "data-testid": "waveform",
        "aria-label": waveformLabel
      }, /*#__PURE__*/_react["default"].createElement("div", {
        id: "zoomview-container",
        ref: this.zoomView,
        tabIndex: "0",
        "data-testid": "zoom-view",
        "aria-label": zoomViewLabel
      }), /*#__PURE__*/_react["default"].createElement("div", {
        id: "overview-container",
        ref: this.overView,
        tabIndex: "0",
        "data-testid": "over-view",
        "aria-label": overViewLabel
      })), stillLoading && /*#__PURE__*/_react["default"].createElement("div", {
        "data-testid": "loading-spinner"
      }, /*#__PURE__*/_react["default"].createElement(_LoadingSpinner["default"], {
        isLoading: stillLoading
      })), /*#__PURE__*/_react["default"].createElement("audio", {
        ref: this.mediaPlayer,
        hidden: true,
        "data-testid": "waveform-media"
      }, "Your browser does not support the audio element."), !streamMediaLoading && !streamMediaError && /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Row, {
        "data-testid": "waveform-toolbar"
      }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Col, {
        xs: 6,
        md: 6
      }, /*#__PURE__*/_react["default"].createElement(_Slider["default"], {
        volume: volume,
        setVolume: this.setVolume
      })), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Col, {
        xs: 12,
        md: 6
      }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.ButtonToolbar, null, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Button, {
        className: "glyphicon glyphicon-play",
        "aria-label": "Play",
        onClick: this.playAudio,
        "data-testid": "waveform-play-button",
        disabled: streamMediaError || streamMediaLoading
      }), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Button, {
        className: "glyphicon glyphicon-pause",
        "aria-label": "Pause",
        onClick: this.pauseAudio,
        "data-testid": "waveform-pause-button",
        disabled: streamMediaError || streamMediaLoading
      }), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Button, {
        className: "glyphicon glyphicon-zoom-in",
        "aria-label": "Zoom in",
        onClick: this.zoomIn,
        "data-testid": "waveform-zoomin-button"
      }), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Button, {
        className: "glyphicon glyphicon-zoom-out",
        "aria-label": "Zoom out",
        onClick: this.zoomOut,
        "data-testid": "waveform-zoomout-button"
      })))));
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(nextProps, prevState) {
      if (nextProps.peaksInstance) {
        return {
          readyPeaks: nextProps.peaksInstance.readyPeaks
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
    streamInfo: state.forms.streamInfo,
    editingDisabled: state.forms.editingDisabled
  };
};

var mapDispatchToProps = {
  retrieveStreamMedia: _forms.retrieveStreamMedia,
  setAlert: _forms.setAlert
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(Waveform);

exports["default"] = _default;