"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactRedux = require("react-redux");

var _peaksInstance = require("../actions/peaks-instance");

var _Waveform = _interopRequireDefault(require("../components/Waveform"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

// Peaks options
var peaksOptions = {
  mediaElement: null,
  dataUri: null,
  dataUriDefaultFormat: 'json',
  keyboard: true,
  pointMarkerColor: '#006eb0',
  showPlayheadTime: true,
  zoomWaveformColor: 'rgba(117, 117, 117, 1)',
  overviewWaveformColor: 'rgba(117, 117, 117, 1)',
  timeLabelPrecision: 3
};

var WaveformContainer = function WaveformContainer(props) {
  var zoomView = /*#__PURE__*/_react["default"].createRef();

  var overView = /*#__PURE__*/_react["default"].createRef();

  var mediaPlayer = /*#__PURE__*/_react["default"].createRef();

  var _React$useState = _react["default"].useState(props.manifestURL),
      _React$useState2 = (0, _slicedToArray2["default"])(_React$useState, 2),
      manifestURL = _React$useState2[0],
      setManifestURL = _React$useState2[1];

  var _React$useState3 = _react["default"].useState(props.canvasIndex),
      _React$useState4 = (0, _slicedToArray2["default"])(_React$useState3, 2),
      canvasIndex = _React$useState4[0],
      setCanvasIndex = _React$useState4[1];

  var dispatch = (0, _reactRedux.useDispatch)();

  _react["default"].useEffect(function () {
    peaksOptions = _objectSpread(_objectSpread({}, peaksOptions), {}, {
      containers: {
        zoomview: zoomView.current,
        overview: overView.current
      },
      mediaElement: mediaPlayer.current,
      withCredentials: props.withCredentials
    });
    dispatch((0, _peaksInstance.initializePeaks)(peaksOptions, manifestURL, canvasIndex));
  }, []);

  return /*#__PURE__*/_react["default"].createElement("section", {
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