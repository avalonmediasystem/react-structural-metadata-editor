"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _objectDestructuringEmpty2 = _interopRequireDefault(require("@babel/runtime/helpers/objectDestructuringEmpty"));
var _react = _interopRequireWildcard(require("react"));
var _Button = _interopRequireDefault(require("react-bootstrap/Button"));
var _ButtonToolbar = _interopRequireDefault(require("react-bootstrap/ButtonToolbar"));
var _Row = _interopRequireDefault(require("react-bootstrap/Row"));
var _Col = _interopRequireDefault(require("react-bootstrap/Col"));
var _reactFontawesome = require("@fortawesome/react-fontawesome");
var _freeSolidSvgIcons = require("@fortawesome/free-solid-svg-icons");
var _reactRedux = require("react-redux");
var _forms = require("../actions/forms");
var _Slider = _interopRequireDefault(require("./Slider"));
var _LoadingSpinner = _interopRequireDefault(require("../services/LoadingSpinner"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
// Content of aria-label for UI components
var waveformLabel = "Two interactive waveforms, plotted one after the other using data from a masterfile in a back-end server.\nThere are time-based visual sections plotted in these 2 waveforms representing each timespan in the structure below.";
var zoomViewLabel = "A detailed portion of the waveform data, the level of details shown can be changed with zoom in/out buttons in the waveform toolbar";
var overViewLabel = "An overview of the waveform data of the media file used. This shows all the time-based segments from the structure";
var Waveform = /*#__PURE__*/(0, _react.forwardRef)(function (_ref, ref) {
  (0, _objectDestructuringEmpty2["default"])(_ref);
  // State variables from global state
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
  // Dispatch actions
  var dispatch = (0, _reactRedux.useDispatch)();
  var mediaLoading = function mediaLoading(value) {
    return dispatch((0, _forms.setStreamMediaLoading)(value));
  };
  var mediaSuccess = function mediaSuccess() {
    return dispatch((0, _forms.streamMediaSuccess)());
  };
  var _useState = (0, _react.useState)(mediaInfo.src),
    _useState2 = (0, _slicedToArray2["default"])(_useState, 2),
    audioFile = _useState2[0],
    setAudioFile = _useState2[1];
  var _useState3 = (0, _react.useState)(100),
    _useState4 = (0, _slicedToArray2["default"])(_useState3, 2),
    volume = _useState4[0],
    setVolume = _useState4[1];
  var _useState5 = (0, _react.useState)(),
    _useState6 = (0, _slicedToArray2["default"])(_useState5, 2),
    stillLoading = _useState6[0],
    setStillLoading = _useState6[1];

  /* Ref to access changes in 'editingDisabled' state variable from 
  redux within the eventhandler for 'keydown' event */
  var editingRef = (0, _react.useRef)(editingDisabled);
  var setEditing = function setEditing(e) {
    editingRef.current = e;
  };
  (0, _react.useEffect)(function () {
    // Add an event listener to keydown event
    document.addEventListener('keydown', handleKeyPress);

    // Remove event listener when component is unmounting
    return function () {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);
  (0, _react.useEffect)(function () {
    var isLoading = streamMediaLoading || !readyPeaks;
    setStillLoading(isLoading);
  }, [streamMediaLoading, readyPeaks]);
  (0, _react.useEffect)(function () {
    if (mediaInfo.src === undefined) {
      mediaLoading(0);
    } else if (!mediaInfo.isStream) {
      setAudioFile(mediaInfo.src);
    }
  }, [mediaInfo]);
  (0, _react.useEffect)(function () {
    setEditing(editingDisabled);
  }, [editingDisabled]);
  var handleKeyPress = function handleKeyPress(event) {
    if (event.target.nodeName == 'INPUT') return;
    // When structure is not being edited play/pause audio when spacebar is pressed
    if (event.keyCode == 32 && !editingRef.current) {
      event.preventDefault();
      ref.mediaPlayerRef.current.paused ? playAudio() : pauseAudio();
    }
  };
  var handleCanplay = function handleCanplay() {
    mediaSuccess();
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
  return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement(_Row["default"], {
    className: "waveform-row"
  }, /*#__PURE__*/_react["default"].createElement(_Col["default"], {
    lg: mediaInfo.isVideo ? 8 : 12,
    sm: 8
  }, /*#__PURE__*/_react["default"].createElement("div", {
    id: "waveform-container",
    className: streamMediaError ? "disabled" : "",
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
  }))), stillLoading && /*#__PURE__*/_react["default"].createElement("div", {
    "data-testid": "loading-spinner"
  }, /*#__PURE__*/_react["default"].createElement(_LoadingSpinner["default"], {
    isLoading: stillLoading
  })), /*#__PURE__*/_react["default"].createElement(_Col["default"], {
    lg: 4,
    sm: 4,
    className: "waveform-media"
  }, mediaInfo.isVideo ? /*#__PURE__*/_react["default"].createElement("video", {
    ref: ref.mediaPlayerRef,
    controls: false,
    "data-testid": "waveform-video-player",
    src: audioFile || null,
    onCanPlay: handleCanplay
  }, "Your browser does not support the video element.") : /*#__PURE__*/_react["default"].createElement("audio", {
    ref: ref.mediaPlayerRef,
    hidden: true,
    controls: "controls",
    "data-testid": "waveform-audio-player",
    src: audioFile || null,
    onCanPlay: handleCanplay
  }, "Your browser does not support the audio element."))), !streamMediaLoading && !streamMediaError && /*#__PURE__*/_react["default"].createElement(_Row["default"], {
    "data-testid": "waveform-toolbar"
  }, /*#__PURE__*/_react["default"].createElement(_Col["default"], {
    sm: 6,
    md: 6
  }, /*#__PURE__*/_react["default"].createElement(_Slider["default"], {
    volume: volume,
    setVolume: adjustVolume
  })), /*#__PURE__*/_react["default"].createElement(_Col["default"], {
    sm: 6,
    md: 6,
    className: "mt-1"
  }, /*#__PURE__*/_react["default"].createElement(_ButtonToolbar["default"], null, /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    variant: "outline-secondary",
    "aria-label": "Play",
    onClick: playAudio,
    "data-testid": "waveform-play-button",
    disabled: streamMediaError || streamMediaLoading,
    className: "me-1"
  }, /*#__PURE__*/_react["default"].createElement(_reactFontawesome.FontAwesomeIcon, {
    icon: _freeSolidSvgIcons.faPlay
  })), /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    variant: "outline-secondary",
    "aria-label": "Pause",
    onClick: pauseAudio,
    "data-testid": "waveform-pause-button",
    disabled: streamMediaError || streamMediaLoading,
    className: "me-1"
  }, /*#__PURE__*/_react["default"].createElement(_reactFontawesome.FontAwesomeIcon, {
    icon: _freeSolidSvgIcons.faPause
  })), /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    variant: "outline-secondary",
    "aria-label": "Zoom in",
    onClick: zoomIn,
    "data-testid": "waveform-zoomin-button",
    className: "me-1"
  }, /*#__PURE__*/_react["default"].createElement(_reactFontawesome.FontAwesomeIcon, {
    icon: _freeSolidSvgIcons.faSearchPlus
  })), /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    variant: "outline-secondary",
    "aria-label": "Zoom out",
    onClick: zoomOut,
    "data-testid": "waveform-zoomout-button"
  }, /*#__PURE__*/_react["default"].createElement(_reactFontawesome.FontAwesomeIcon, {
    icon: _freeSolidSvgIcons.faSearchMinus
  }))))));
});
var _default = exports["default"] = Waveform;