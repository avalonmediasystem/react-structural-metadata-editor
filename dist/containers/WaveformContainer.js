"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactErrorBoundary = require("react-error-boundary");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _reactRedux = require("react-redux");
var _peaksInstance = require("../actions/peaks-instance");
var _manifest = require("../actions/manifest");
var _forms = require("../actions/forms");
var _Waveform = _interopRequireDefault(require("../components/Waveform"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
var WaveformContainer = function WaveformContainer(_ref) {
  var canvasIndex = _ref.canvasIndex,
    manifestURL = _ref.manifestURL,
    withCredentials = _ref.withCredentials;
  var _useWaveform = useWaveform({
      canvasIndex: canvasIndex,
      manifestURL: manifestURL,
      withCredentials: withCredentials
    }),
    zoomView = _useWaveform.zoomView,
    overView = _useWaveform.overView,
    mediaPlayer = _useWaveform.mediaPlayer;
  return /*#__PURE__*/_react["default"].createElement("section", {
    className: "waveform-section",
    "data-testid": "waveform-container"
  }, /*#__PURE__*/_react["default"].createElement(_Waveform["default"], {
    ref: {
      zoomViewRef: zoomView,
      overViewRef: overView,
      mediaPlayerRef: mediaPlayer
    }
  }), ' ');
};
WaveformContainer.propTypes = {
  canvasIndex: _propTypes["default"].number.isRequired,
  manifestURL: _propTypes["default"].string.isRequired,
  withCredentials: _propTypes["default"].bool
};
var _default = exports["default"] = WaveformContainer;
/**
 * Handle state interactions for the WaveformContainer component
 * @param {Object} obj 
 * @param {number} obj.canvasIndex
 * @param {string} param0.manifestURL
 * @param {boolean} param0.withCredentials
 * @returns {Object}
 */
var useWaveform = function useWaveform(_ref2) {
  var canvasIndex = _ref2.canvasIndex,
    manifestURL = _ref2.manifestURL,
    withCredentials = _ref2.withCredentials;
  var zoomView = /*#__PURE__*/(0, _react.createRef)();
  var overView = /*#__PURE__*/(0, _react.createRef)();
  var mediaPlayer = /*#__PURE__*/(0, _react.createRef)();
  var dispatch = (0, _reactRedux.useDispatch)();
  var initializeManifest = function initializeManifest(url, index) {
    return dispatch((0, _manifest.initManifest)(url, index));
  };
  var retrieveStream = function retrieveStream(url, player, options) {
    return dispatch((0, _forms.retrieveStreamMedia)(url, player, options));
  };
  var initPeaks = function initPeaks(options, data) {
    return dispatch((0, _peaksInstance.initializePeaks)(options, data));
  };
  var _useSelector = (0, _reactRedux.useSelector)(function (state) {
      return state.forms.streamInfo;
    }),
    streamMediaLoading = _useSelector.streamMediaLoading;
  var mediaInfo = (0, _reactRedux.useSelector)(function (state) {
    return state.manifest.mediaInfo;
  });
  var readyPeaks = (0, _reactRedux.useSelector)(function (state) {
    return state.peaksInstance.readyPeaks;
  });
  var manifest = (0, _reactRedux.useSelector)(function (state) {
    return state.manifest.manifest;
  });
  var smData = (0, _reactRedux.useSelector)(function (state) {
    return state.structuralMetadata.smData;
  });
  var _useErrorBoundary = (0, _reactErrorBoundary.useErrorBoundary)(),
    showBoundary = _useErrorBoundary.showBoundary;
  (0, _react.useEffect)(function () {
    try {
      if (manifestURL) {
        initializeManifest(manifestURL, canvasIndex);
      }
    } catch (error) {
      showBoundary(error);
    }
  }, []);
  (0, _react.useEffect)(function () {
    try {
      if (manifest != null) {
        // When given a .m3u8 playlist, use HLS to stream media
        if (mediaInfo.isStream) {
          retrieveStream(mediaInfo.src, mediaPlayer.current, {
            withCredentials: withCredentials
          });
        }
      }
    } catch (error) {
      showBoundary(error);
    }
  }, [manifest, mediaInfo]);
  (0, _react.useEffect)(function () {
    var peaksOptions = {
      keyboard: true,
      pointMarkerColor: '#006eb0',
      showPlayheadTime: true,
      timeLabelPrecision: 3,
      withCredentials: withCredentials,
      zoomview: {
        container: zoomView.current,
        waveformColor: 'rgba(117, 117, 117, 1)'
      },
      overview: {
        container: overView.current,
        waveformColor: 'rgba(117, 117, 117, 1)'
      },
      mediaElement: mediaPlayer.current,
      player: null
    };
    // try {
    if (!streamMediaLoading && smData != [] && !readyPeaks) {
      initPeaks(peaksOptions, smData);
    }
    // } catch (error) {
    //   showBoundary(error);
    // }
  }, [streamMediaLoading]);
  return {
    zoomView: zoomView,
    overView: overView,
    mediaPlayer: mediaPlayer
  };
};