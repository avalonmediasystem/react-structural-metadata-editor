"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _react = _interopRequireDefault(require("react"));

var _reactBootstrap = require("react-bootstrap");

var _reactFontawesome = require("@fortawesome/react-fontawesome");

var _freeSolidSvgIcons = require("@fortawesome/free-solid-svg-icons");

var _reactRedux = require("react-redux");

var _alertStatus = require("../services/alert-status");

var _forms = require("../actions/forms");

var _Slider = _interopRequireDefault(require("./Slider"));

var _LoadingSpinner = _interopRequireDefault(require("../services/LoadingSpinner"));

// Content of aria-label for UI components
var waveformLabel = "Two interactive waveforms, plotted one after the other using data from a masterfile in a back-end server.\nThere are time-based visual sections plotted in these 2 waveforms representing each timespan in the structure below.";
var zoomViewLabel = "A detailed portion of the waveform data, the level of details shown can be changed with zoom in/out buttons in the waveform toolbar";
var overViewLabel = "An overview of the waveform data of the media file used. This shows all the time-based segments from the structure";

var Waveform = /*#__PURE__*/_react["default"].forwardRef(function (props, ref) {
  var streamMediaStatus = (0, _reactRedux.useSelector)(function (state) {
    return state.forms.streamInfo.streamMediaStatus;
  });
  var mediaInfo = (0, _reactRedux.useSelector)(function (state) {
    return state.manifest.mediaInfo;
  });
  var readyPeaks = (0, _reactRedux.useSelector)(function (state) {
    return state.peaksInstance.readyPeaks;
  });
  var peaksInstance = (0, _reactRedux.useSelector)(function (state) {
    return state.peaksInstance.peaks;
  });
  var editingDisabled = (0, _reactRedux.useSelector)(function (state) {
    return state.forms.editingDisabled;
  });

  var _useSelector = (0, _reactRedux.useSelector)(function (state) {
    return state.forms.streamInfo;
  }),
      streamMediaError = _useSelector.streamMediaError,
      streamMediaLoading = _useSelector.streamMediaLoading;

  var dispatch = (0, _reactRedux.useDispatch)();

  var _React$useState = _react["default"].useState(mediaInfo.src),
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

  var _React$useState7 = _react["default"].useState(),
      _React$useState8 = (0, _slicedToArray2["default"])(_React$useState7, 2),
      stillLoading = _React$useState8[0],
      setStillLoading = _React$useState8[1];
  /* Ref to access changes in 'editingDisabled' state variable from 
  redux within the eventhandler for 'keydown' event */


  var editingRef = _react["default"].useRef(editingDisabled);

  var setEditing = function setEditing(e) {
    editingRef.current = e;
  };

  _react["default"].useEffect(function () {
    // Add an event listener to keydown event
    document.addEventListener('keydown', handleKeyPress); // Remove event listener when component is unmounting

    return function cleanup() {
      document.removeEventListener('keydown', handleKeyPress);
    };
  });

  _react["default"].useEffect(function () {
    var isLoading = streamMediaLoading && !streamMediaError || !readyPeaks;
    setStillLoading(isLoading);
  }, [streamMediaError, streamMediaLoading, readyPeaks]);

  _react["default"].useEffect(function () {
    if (!mediaInfo.isStream) {
      setAudioFile(mediaInfo.src);
    }
  }, [mediaInfo]);

  _react["default"].useEffect(function () {
    // Add an event listener to keydown event
    document.addEventListener('keydown', handleKeyPress); // Remove event listener when component is unmounting

    return function cleanup() {
      document.removeEventListener('keydown', handleKeyPress);
    };
  });

  _react["default"].useEffect(function () {
    setEditing(editingDisabled);
  }, [editingDisabled]);

  _react["default"].useEffect(function () {
    if (streamMediaStatus) {
      var alert = (0, _alertStatus.configureAlert)(streamMediaStatus);
      dispatch((0, _forms.setAlert)(alert));
    }
  }, [streamMediaStatus]);

  var handleKeyPress = function handleKeyPress(event) {
    if (event.target.nodeName == 'INPUT') return; // When structure is not being edited play/pause audio when spacebar is pressed

    if (event.keyCode == 32 && !editingRef.current) {
      event.preventDefault();
      ref.mediaPlayerRef.current.paused ? playAudio() : pauseAudio();
    }
  };

  var handleCanplay = function handleCanplay() {
    dispatch((0, _forms.streamMediaSuccess)());
  };

  var zoomIn = function zoomIn() {
    peaksInstance.zoom.zoomIn();
  };

  var zoomOut = function zoomOut() {
    peaksInstance.zoom.zoomOut();
  };

  var playAudio = function playAudio() {
    peaksInstance.player.play();
  };

  var pauseAudio = function pauseAudio() {
    peaksInstance.player.pause();
  };

  var adjustVolume = function adjustVolume(volume) {
    ref.mediaPlayerRef.current.volume = volume / 100;
    setVolume(volume);
  };

  return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, stillLoading && /*#__PURE__*/_react["default"].createElement("div", {
    "data-testid": "loading-spinner"
  }, /*#__PURE__*/_react["default"].createElement(_LoadingSpinner["default"], {
    isLoading: stillLoading
  })), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Col, {
    lg: mediaInfo.isVideo ? 8 : 12,
    sm: 7,
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
  })), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Col, {
    lg: 4,
    sm: 5,
    className: "waveform-media"
  }, mediaInfo.isVideo ? /*#__PURE__*/_react["default"].createElement("video", {
    ref: ref.mediaPlayerRef,
    controls: false,
    "data-testid": "waveform-video-player",
    src: audioFile,
    onCanPlay: handleCanplay
  }, "Your browser does not support the audio element.") : /*#__PURE__*/_react["default"].createElement("audio", {
    ref: ref.mediaPlayerRef,
    hidden: true,
    controls: "controls",
    "data-testid": "waveform-audio-player",
    src: audioFile,
    onCanPlay: handleCanplay
  }, "Your browser does not support the audio element.")), !streamMediaLoading && !streamMediaError && /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Row, {
    "data-testid": "waveform-toolbar",
    className: "waveform-toolbar"
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