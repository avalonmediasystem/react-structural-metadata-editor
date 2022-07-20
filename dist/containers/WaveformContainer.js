"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactRedux = require("react-redux");

var _peaks = _interopRequireDefault(require("peaks.js"));

var _Utils = _interopRequireDefault(require("../api/Utils"));

var _forms = require("../actions/forms");

var _peaksInstance = require("../actions/peaks-instance");

var _alertStatus = require("../services/alert-status");

var _iiifParser = require("../services/iiif-parser");

var _Waveform = _interopRequireDefault(require("../components/Waveform"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

var apiUtils = new _Utils["default"](); // Peaks options

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

  var peaksInstance = null;

  var _useSelector = (0, _reactRedux.useSelector)(function (state) {
    return state.manifest;
  }),
      manifest = _useSelector.manifest,
      mediaInfo = _useSelector.mediaInfo,
      manifestFetched = _useSelector.manifestFetched;

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
  }, []);

  _react["default"].useEffect(function () {
    if (manifest != null && manifestFetched) {
      var waveformInfo = (0, _iiifParser.getWaveformInfo)(manifest, props.canvasIndex);

      if (waveformInfo.length > 0) {
        initializePeaksInstance(waveformInfo[0]);
      } else {
        // When the manifest doesn't contain waveform information
        // display an alert
        var alert = (0, _alertStatus.configureAlert)(-3);
        dispatch((0, _forms.setAlert)(alert));
      }
    }
  }, [manifestFetched]);

  var initializePeaksInstance = /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(waveformURL) {
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return apiUtils.headRequest(waveformURL);

            case 3:
              // Set waveform URI
              peaksOptions.dataUri = {
                json: waveformURL
              }; // Update redux-store flag for waveform file retrieval

              dispatch((0, _forms.retrieveWaveformSuccess)());
              _context.next = 10;
              break;

            case 7:
              _context.prev = 7;
              _context.t0 = _context["catch"](0);
              // Enable the flash message alert
              handleError(waveformURL, _context.t0);

            case 10:
              // Initialize Peaks intance with the given options
              _peaks["default"].init(peaksOptions, function (err, peaks) {
                if (err) console.error('TCL: WaveformContainer -> initializePeaksInstance -> Peaks.init ->', err);
                peaksInstance = peaks;
                dispatch((0, _peaksInstance.initializeSMDataPeaks)(peaksInstance, mediaInfo.duration));
              });

            case 11:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[0, 7]]);
    }));

    return function initializePeaksInstance(_x) {
      return _ref.apply(this, arguments);
    };
  }();

  var handleError = function handleError(waveformURL, error) {
    console.log('TCL: WaveformContainer -> handleError -> error', error);
    var status = null; // Pull status code out of error response/request

    if (error.response !== undefined) {
      status = error.response.status;

      if (status == 404) {
        peaksOptions.dataUri = {
          json: "".concat(waveformURL, "?empty=true")
        };
        status = -7; // for persistent missing waveform data alert
      }
    } else if (error.request !== undefined) {
      status = -3;
    }

    var alert = (0, _alertStatus.configureAlert)(status);
    dispatch((0, _forms.setAlert)(alert));
  };

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
  initStructure: _propTypes["default"].object,
  withCredentials: _propTypes["default"].bool
};
var _default = WaveformContainer;
exports["default"] = _default;