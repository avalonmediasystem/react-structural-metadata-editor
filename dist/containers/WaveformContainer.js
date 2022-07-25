"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _Utils = _interopRequireDefault(require("../api/Utils"));

var _reactRedux = require("react-redux");

var _peaksInstance = require("../actions/peaks-instance");

var _forms = require("../actions/forms");

var _Waveform = _interopRequireDefault(require("../components/Waveform"));

var _alertStatus = require("../services/alert-status");

var _peaks = _interopRequireDefault(require("peaks.js"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

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

var WaveformContainer = /*#__PURE__*/function (_Component) {
  (0, _inherits2["default"])(WaveformContainer, _Component);

  var _super = _createSuper(WaveformContainer);

  function WaveformContainer(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, WaveformContainer);
    _this = _super.call(this, props);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
      streamAlert: {},
      structureURL: _this.props.structureURL,
      waveformURL: _this.props.waveformURL,
      initStructure: _this.props.initStructure,
      streamLength: _this.props.streamDuration,
      manifestURL: _this.props.manifestURL,
      dataUri: null
    });
    _this.zoomView = /*#__PURE__*/_react["default"].createRef();
    _this.overView = /*#__PURE__*/_react["default"].createRef();
    _this.mediaPlayer = /*#__PURE__*/_react["default"].createRef();
    _this.peaks = null;
    return _this;
  }

  (0, _createClass2["default"])(WaveformContainer, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      peaksOptions = _objectSpread(_objectSpread({}, peaksOptions), {}, {
        containers: {
          zoomview: this.zoomView.current,
          overview: this.overView.current
        },
        mediaElement: this.mediaPlayer.current,
        withCredentials: this.props.withCredentials
      });
      this.initializePeaksInstance();
    }
  }, {
    key: "initializePeaksInstance",
    value: function () {
      var _initializePeaksInstance = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        var _this2 = this;

        var _this$state, structureURL, manifestURL, waveformURL, initStructure, streamLength;

        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _this$state = this.state, structureURL = _this$state.structureURL, manifestURL = _this$state.manifestURL, waveformURL = _this$state.waveformURL, initStructure = _this$state.initStructure, streamLength = _this$state.streamLength;
                _context.prev = 1;
                _context.next = 4;
                return apiUtils.headRequest(waveformURL);

              case 4:
                // Set waveform URI
                peaksOptions.dataUri = {
                  json: waveformURL
                }; // Update redux-store flag for waveform file retrieval

                this.props.retrieveWaveformSuccess();
                _context.next = 11;
                break;

              case 8:
                _context.prev = 8;
                _context.t0 = _context["catch"](1);
                // Enable the flash message alert
                this.handleError(_context.t0);

              case 11:
                // Initialize Peaks intance with the given options
                _peaks["default"].init(peaksOptions, function (err, peaks) {
                  if (err) console.error('TCL: WaveformContainer -> initializePeaksInstance -> Peaks.init ->', err);
                  _this2.peaks = peaks;

                  _this2.props.fetchDataAndBuildPeaks(_this2.peaks, structureURL, manifestURL, initStructure, streamLength);
                });

              case 12:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[1, 8]]);
      }));

      function initializePeaksInstance() {
        return _initializePeaksInstance.apply(this, arguments);
      }

      return initializePeaksInstance;
    }()
  }, {
    key: "handleError",
    value: function handleError(error) {
      console.log('TCL: WaveformContainer -> handleError -> error', error);
      var status = null;
      var waveformURL = this.state.waveformURL; // Pull status code out of error response/request

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
      this.props.setAlert(alert);
    }
  }, {
    key: "render",
    value: function render() {
      return /*#__PURE__*/_react["default"].createElement("section", {
        className: "waveform-section",
        "data-testid": "waveform-container"
      }, /*#__PURE__*/_react["default"].createElement(_Waveform["default"], {
        audioURL: this.props.audioURL,
        withCredentials: this.props.withCredentials,
        ref: {
          zoomViewRef: this.zoomView,
          overViewRef: this.overView,
          mediaPlayerRef: this.mediaPlayer
        }
      }), ' ');
    }
  }]);
  return WaveformContainer;
}(_react.Component);

WaveformContainer.propTypes = {
  structureURL: _propTypes["default"].string.isRequired,
  waveformURL: _propTypes["default"].string.isRequired,
  audioURL: _propTypes["default"].string.isRequired,
  streamDuration: _propTypes["default"].number.isRequired,
  initStructure: _propTypes["default"].object.isRequired
};

var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.structuralMetadata.smData,
    alert: state.forms.alert
  };
};

var mapDispatchToProps = {
  fetchDataAndBuildPeaks: _peaksInstance.initializeSMDataPeaks,
  peaksReady: _peaksInstance.peaksReady,
  retrieveWaveformSuccess: _forms.retrieveWaveformSuccess,
  setAlert: _forms.setAlert
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(WaveformContainer);

exports["default"] = _default;