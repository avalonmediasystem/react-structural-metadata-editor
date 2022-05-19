"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _react = _interopRequireWildcard(require("react"));

var _reactBootstrap = require("react-bootstrap");

var _reactFontawesome = require("@fortawesome/react-fontawesome");

var _freeSolidSvgIcons = require("@fortawesome/free-solid-svg-icons");

var _reactRedux = require("react-redux");

var _alertStatus = require("../services/alert-status");

var _forms = require("../actions/forms");

var _Slider = _interopRequireDefault(require("./Slider"));

var _LoadingSpinner = _interopRequireDefault(require("../services/LoadingSpinner"));

var _utils = require("../services/utils");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// Content of aria-label for UI components
var waveformLabel = "Two interactive waveforms, plotted one after the other using data from a masterfile in a back-end server.\nThere are time-based visual sections plotted in these 2 waveforms representing each timespan in the structure below.";
var zoomViewLabel = "A detailed portion of the waveform data, the level of details shown can be changed with zoom in/out buttons in the waveform toolbar";
var overViewLabel = "An overview of the waveform data of the media file used. This shows all the time-based segments from the structure";

var Waveform = /*#__PURE__*/_react["default"].forwardRef(function (props, ref) {
  var streamMediaStatus = (0, _reactRedux.useSelector)(function (state) {
    return state.forms.streamInfo.streamMediaStatus;
  });
  var readyPeaks = (0, _reactRedux.useSelector)(function (state) {
    return state.peaksInstance.readyPeaks;
  });
  var peaksInstance = (0, _reactRedux.useSelector)(function (state) {
    return state.peaksInstance;
  });
  var editingDisabled = (0, _reactRedux.useSelector)(function (state) {
    return state.forms.editingDisabled;
  });
  var dispatch = (0, _reactRedux.useDispatch)();

  var _React$useState = _react["default"].useState(props.audioURL),
      _React$useState2 = (0, _slicedToArray2["default"])(_React$useState, 2),
      audioFile = _React$useState2[0],
      setAudioFile = _React$useState2[1];

  var _React$useState3 = _react["default"].useState(100),
      _React$useState4 = (0, _slicedToArray2["default"])(_React$useState3, 2),
      volume = _React$useState4[0],
      setVolume = _React$useState4[1];

  var _React$useState5 = _react["default"].useState(readyPeaks),
      _React$useState6 = (0, _slicedToArray2["default"])(_React$useState5, 2),
      peaksIsReady = _React$useState6[0],
      setPeaksIsReady = _React$useState6[1];
  /* Ref to access changes in 'editingDisabled' state variable from 
  redux within the eventhandler for 'keydown' event */


  var editingRef = _react["default"].useRef(editingDisabled);

  var setEditing = function setEditing(e) {
    editingRef.current = e;
  };

  _react["default"].useEffect(function () {
    setAudioFile(props.audioURL);
    return function () {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  _react["default"].useEffect(function () {
    setEditing(editingDisabled);
  }, [editingDisabled]);

  _react["default"].useEffect(function () {
    setPeaksIsReady(readyPeaks);
    var mimeType = (0, _utils.getMimetype)(audioFile); // When given a .m3u8 playlist, use HLS to stream media

    if (readyPeaks && mimeType == 'application/x-mpegURL') {
      dispatch((0, _forms.retrieveStreamMedia)(audioFile, ref.mediaPlayerRef.current, {
        withCredentials: props.withCredentials
      })); // Add a listener to keydown event

      document.addEventListener('keydown', handleKeyPress);
    } else {
      // Given a audio/video file, the HTML player handles the playback
      dispatch((0, _forms.streamMediaSuccess)());
    }
  }, [readyPeaks]);

  _react["default"].useEffect(function () {
    if (streamMediaStatus) {
      var alert = (0, _alertStatus.configureAlert)(streamMediaStatus);
      dispatch((0, _forms.setAlert)(alert));
    }
  }, [streamMediaStatus]);

  var handleKeyPress = function handleKeyPress(event) {
    // When structure is not being edited play/pause audio when spacebar is pressed
    if (event.keyCode == 32 && !editingRef.current) {
      event.preventDefault();
      ref.mediaPlayerRef.current.paused ? playAudio() : pauseAudio();
    }
  };

  var zoomIn = function zoomIn() {
    peaksInstance.peaks.zoom.zoomIn();
  };

  var zoomOut = function zoomOut() {
    peaksInstance.peaks.zoom.zoomOut();
  };

  var playAudio = function playAudio() {
    peaksInstance.peaks.player.play();
  };

  var pauseAudio = function pauseAudio() {
    peaksInstance.peaks.player.pause();
  };

  var adjustVolume = function adjustVolume(volume) {
    ref.mediaPlayerRef.current.volume = volume / 100;
    setVolume(volume);
  };

  var _useSelector = (0, _reactRedux.useSelector)(function (state) {
    return state.forms.streamInfo;
  }),
      streamMediaError = _useSelector.streamMediaError,
      streamMediaLoading = _useSelector.streamMediaLoading;

  var stillLoading = streamMediaLoading && !streamMediaError || !peaksIsReady;
  return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement("div", {
    id: "waveform-container",
    tabIndex: "0",
    "data-testid": "waveform",
    "aria-label": waveformLabel
  }, /*#__PURE__*/_react["default"].createElement("div", {
    id: "zoomview-container",
    ref: ref.zoomViewRef,
    tabIndex: "0",
    "data-testid": "zoomview-view",
    "aria-label": zoomViewLabel
  }), /*#__PURE__*/_react["default"].createElement("div", {
    id: "overview-container",
    ref: ref.overViewRef,
    tabIndex: "0",
    "data-testid": "overview-view",
    "aria-label": overViewLabel
  })), stillLoading && /*#__PURE__*/_react["default"].createElement("div", {
    "data-testid": "loading-spinner"
  }, /*#__PURE__*/_react["default"].createElement(_LoadingSpinner["default"], {
    isLoading: stillLoading
  })), /*#__PURE__*/_react["default"].createElement("audio", {
    ref: ref.mediaPlayerRef,
    hidden: true,
    controls: "controls",
    "data-testid": "waveform-media",
    src: audioFile
  }, "Your browser does not support the audio element."), !streamMediaLoading && !streamMediaError && /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Row, {
    "data-testid": "waveform-toolbar"
  }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Col, {
    sm: 6,
    md: 6
  }, /*#__PURE__*/_react["default"].createElement(_Slider["default"], {
    volume: volume,
    setVolume: adjustVolume
  })), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Col, {
    sm: 6,
    md: 6,
    className: "mt-1"
  }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.ButtonToolbar, null, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Button, {
    variant: "outline-secondary",
    "aria-label": "Play",
    onClick: playAudio,
    "data-testid": "waveform-play-button",
    disabled: streamMediaError || streamMediaLoading,
    className: "mr-1"
  }, /*#__PURE__*/_react["default"].createElement(_reactFontawesome.FontAwesomeIcon, {
    icon: _freeSolidSvgIcons.faPlay
  })), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Button, {
    variant: "outline-secondary",
    "aria-label": "Pause",
    onClick: pauseAudio,
    "data-testid": "waveform-pause-button",
    disabled: streamMediaError || streamMediaLoading,
    className: "mr-1"
  }, /*#__PURE__*/_react["default"].createElement(_reactFontawesome.FontAwesomeIcon, {
    icon: _freeSolidSvgIcons.faPause
  })), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Button, {
    variant: "outline-secondary",
    "aria-label": "Zoom in",
    onClick: zoomIn,
    "data-testid": "waveform-zoomin-button",
    className: "mr-1"
  }, /*#__PURE__*/_react["default"].createElement(_reactFontawesome.FontAwesomeIcon, {
    icon: _freeSolidSvgIcons.faSearchPlus
  })), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Button, {
    variant: "outline-secondary",
    "aria-label": "Zoom out",
    onClick: zoomOut,
    "data-testid": "waveform-zoomout-button"
  }, /*#__PURE__*/_react["default"].createElement(_reactFontawesome.FontAwesomeIcon, {
    icon: _freeSolidSvgIcons.faSearchMinus
  }))))));
});

var _default = Waveform;
exports["default"] = _default;