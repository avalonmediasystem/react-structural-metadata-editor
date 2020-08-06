"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _Utils = _interopRequireDefault(require("../api/Utils"));

var _reactRedux = require("react-redux");

var _peaksInstance = require("../actions/peaks-instance");

var _forms = require("../actions/forms");

var _Waveform = _interopRequireDefault(require("../components/Waveform"));

var _AlertContainer = _interopRequireDefault(require("../containers/AlertContainer"));

var _alertStatus = require("../services/alert-status");

var _WaveformDataUtils = _interopRequireDefault(require("../services/WaveformDataUtils"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var waveformUtils = new _WaveformDataUtils["default"]();
var apiUtils = new _Utils["default"](); // Peaks options

var peaksOptions = {
  container: null,
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

var WaveformContainer =
/*#__PURE__*/
function (_Component) {
  (0, _inherits2["default"])(WaveformContainer, _Component);

  function WaveformContainer(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, WaveformContainer);
    _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(WaveformContainer).call(this, props)); // this.waveformContainer = null;

    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
      alertObj: null,
      streamAlert: {},
      hasError: false,
      masterFileID: _this.props.masterFileID,
      baseURL: _this.props.baseURL,
      initStructure: _this.props.initStructure,
      streamLength: _this.props.streamDuration
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "clearAlert", function () {
      _this.setState({
        alertObj: null
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "clearStreamAlert", function () {
      _this.setState({
        streamAlert: null
      });
    });
    _this.zoomView = null;
    _this.overView = null;
    _this.mediaPlayer = null;
    return _this;
  }

  (0, _createClass2["default"])(WaveformContainer, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      // peaksOptions.container = this.waveformContainer;
      peaksOptions.containers = {
        zoomview: this.zoomView,
        overview: this.overView
      };
      peaksOptions.mediaElement = this.mediaPlayer;
      this.initializePeaksInstance();
    }
  }, {
    key: "initializePeaksInstance",
    value: function () {
      var _initializePeaksInstance = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee() {
        var _this$state, baseURL, masterFileID, initStructure, streamLength, response;

        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _this$state = this.state, baseURL = _this$state.baseURL, masterFileID = _this$state.masterFileID, initStructure = _this$state.initStructure, streamLength = _this$state.streamLength;
                _context.prev = 1;
                _context.next = 4;
                return apiUtils.headRequest(baseURL, masterFileID, 'waveform.json');

              case 4:
                response = _context.sent;

                // Set the masterfile URL as the URI for the waveform data file
                if (response.status >= 200 && response.status < 400) {
                  peaksOptions.dataUri = response.request.responseURL;
                } // Initialize Peaks


                this.props.fetchDataAndBuildPeaks(baseURL, masterFileID, initStructure, peaksOptions, streamLength); // Update redux-store flag for waveform file retrieval

                this.props.retrieveWaveformSuccess();
                _context.next = 15;
                break;

              case 10:
                _context.prev = 10;
                _context.t0 = _context["catch"](1);
                // Enable the flash message alert
                this.handleError(_context.t0); // Provide an empty waveform dataset for Peaks to build on

                peaksOptions = _objectSpread({}, peaksOptions, {
                  waveformData: {
                    json: waveformUtils.generateEmptyWaveform(streamLength)
                  }
                }); // Fetch structure.json and build Peaks

                this.props.fetchDataAndBuildPeaks(baseURL, masterFileID, initStructure, peaksOptions, streamLength);

              case 15:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[1, 10]]);
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
      var status = null; // Pull status code out of error response/request

      if (error.response) {
        var statusCode = error.response.status;

        if (statusCode > 400 && statusCode < 500) {
          // Use non-dismissible alert and use dummy waveform data
          status = -7;
        } else {
          status = statusCode;
        }
      } else if (error.request !== undefined) {
        status = -3;
      }

      var alertObj = (0, _alertStatus.configureAlert)(status, this.clearAlert);
      this.setState({
        alertObj: alertObj,
        hasError: true
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var _this$state2 = this.state,
          alertObj = _this$state2.alertObj,
          streamAlert = _this$state2.streamAlert;
      var audioStreamURL = this.props.audioStreamURL;
      return _react["default"].createElement("section", {
        className: "waveform-section",
        "data-testid": "waveform-container"
      }, _react["default"].createElement(_Waveform["default"], {
        zoomViewRef: function zoomViewRef(ref) {
          return _this2.zoomView = ref;
        },
        overViewRef: function overViewRef(ref) {
          return _this2.overView = ref;
        },
        mediaPlayerRef: function mediaPlayerRef(ref) {
          return _this2.mediaPlayer = ref;
        },
        audioStreamURL: audioStreamURL,
        alertObj: streamAlert,
        clearAlert: this.clearStreamAlert
      }), ' ', _react["default"].createElement(_AlertContainer["default"], alertObj));
    }
  }]);
  return WaveformContainer;
}(_react.Component);

var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.structuralMetadata.smData
  };
};

var mapDispatchToProps = {
  fetchDataAndBuildPeaks: _peaksInstance.initializeSMDataPeaks,
  retrieveWaveformSuccess: _forms.retrieveWaveformSuccess,
  handleEditingTimespans: _forms.handleEditingTimespans
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(WaveformContainer);

exports["default"] = _default;