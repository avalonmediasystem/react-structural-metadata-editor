"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactRedux = require("react-redux");

var _reactBootstrap = require("react-bootstrap");

var _peaksInstance = require("../actions/peaks-instance");

var _manifest = require("../actions/manifest");

var _forms = require("../actions/forms");

var _Waveform = _interopRequireDefault(require("../components/Waveform"));

var WaveformContainer = function WaveformContainer(props) {
  var zoomView = /*#__PURE__*/_react["default"].createRef();

  var overView = /*#__PURE__*/_react["default"].createRef();

  var mediaPlayer = /*#__PURE__*/_react["default"].createRef();

  var _useSelector = (0, _reactRedux.useSelector)(function (state) {
    return state.forms.streamInfo;
  }),
      streamMediaLoading = _useSelector.streamMediaLoading;

  var mediaInfo = (0, _reactRedux.useSelector)(function (state) {
    return state.manifest.mediaInfo;
  });
  var smData = (0, _reactRedux.useSelector)(function (state) {
    return state.structuralMetadata.smData;
  });
  var dispatch = (0, _reactRedux.useDispatch)();

  _react["default"].useEffect(function () {
    if (props.manifestURL) {
      dispatch((0, _manifest.initManifest)(props.manifestURL, props.canvasIndex));
    }
  }, []);

  _react["default"].useEffect(function () {
    // When given a .m3u8 playlist, use HLS to stream media
    if (mediaInfo.isStream) {
      dispatch((0, _forms.retrieveStreamMedia)(mediaInfo.src, mediaPlayer.current, {
        withCredentials: props.withCredentials
      }));
    }
  }, [mediaInfo]);

  _react["default"].useEffect(function () {
    var peaksOptions = {
      keyboard: true,
      pointMarkerColor: '#006eb0',
      showPlayheadTime: true,
      timeLabelPrecision: 3,
      zoomview: {
        container: zoomView.current,
        waveformColor: 'rgba(117, 117, 117, 1)'
      },
      overview: {
        container: overView.current,
        waveformColor: 'rgba(117, 117, 117, 1)'
      },
      mediaElement: mediaPlayer.current,
      withCredentials: props.withCredentials,
      player: null
    };

    if (!streamMediaLoading && smData != []) {
      dispatch((0, _peaksInstance.initializePeaks)(peaksOptions, smData, props.canvasIndex));
    }
  }, [streamMediaLoading]);

  return /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Row, {
    className: "waveform-section",
    "data-testid": "waveform-container"
  }, /*#__PURE__*/_react["default"].createElement(_Waveform["default"], {
    withCredentials: props.withCredentials,
    ref: {
      zoomViewRef: zoomView,
      overViewRef: overView,
      mediaPlayerRef: mediaPlayer
    }
  }), ' ');
};

WaveformContainer.propTypes = {
  manifestURL: _propTypes["default"].string.isRequired
};
var _default = WaveformContainer;
exports["default"] = _default;