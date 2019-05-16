"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.PureWaveformContainer = void 0;

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

var _Utils = _interopRequireDefault(require("../api/Utils"));

var _reactRedux = require("react-redux");

var _peaksInstance = require("../actions/peaks-instance");

var actions = _interopRequireWildcard(require("../actions/forms"));

var _Waveform = _interopRequireDefault(require("../components/Waveform"));

var _AlertContainer = _interopRequireDefault(require("../containers/AlertContainer"));

var _alertStatus = require("../services/alert-status");

var apiUtils = new _Utils["default"](); // Peaks options

var peaksOptions = {
  container: null,
  mediaElement: null,
  dataUri: null,
  dataUriDefaultFormat: 'json',
  keyboard: true,
  pointMarkerColor: '#006eb0',
  showPlayheadTime: true,
  zoomWaveformColor: 'rgba(217, 217, 217, 1)'
};

var WaveformContainer =
/*#__PURE__*/
function (_Component) {
  (0, _inherits2["default"])(WaveformContainer, _Component);

  function WaveformContainer(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, WaveformContainer);
    _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(WaveformContainer).call(this, props));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
      alertObj: null,
      hasError: false,
      masterFileID: _this.props.masterFileID,
      baseURL: _this.props.baseURL,
      initStructure: _this.props.initStructure
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "clearAlert", function () {
      _this.setState({
        alertObj: null
      });
    });
    _this.waveformContainer = null;
    _this.mediaPlayer = null;
    return _this;
  }

  (0, _createClass2["default"])(WaveformContainer, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      peaksOptions.container = this.waveformContainer;
      peaksOptions.mediaElement = this.mediaPlayer;
      this.initializePeaksInstance();
    }
  }, {
    key: "initializePeaksInstance",
    value: function () {
      var _initializePeaksInstance = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee() {
        var _this$state, baseURL, masterFileID, initStructure, isError, response;

        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _this$state = this.state, baseURL = _this$state.baseURL, masterFileID = _this$state.masterFileID, initStructure = _this$state.initStructure;
                isError = false;
                _context.prev = 2;
                _context.next = 5;
                return apiUtils.getRequest(baseURL, masterFileID, 'waveform.json');

              case 5:
                response = _context.sent;
                // Set the masterfile URL as the URI for the waveform data file
                peaksOptions.dataUri = response.request.responseURL; // Initialize Peaks

                this.props.fetchDataAndBuildPeaks(baseURL, masterFileID, initStructure, peaksOptions, isError); // Update redux-store flag for waveform file retrieval

                this.props.retrieveWaveformSuccess();
                _context.next = 16;
                break;

              case 11:
                _context.prev = 11;
                _context.t0 = _context["catch"](2);
                isError = true;
                this.handleError(_context.t0); // Fetch structure.json when waveform.json is

                this.props.fetchDataAndBuildPeaks(baseURL, masterFileID, initStructure, peaksOptions, isError);

              case 16:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[2, 11]]);
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

      if (error.response !== undefined) {
        status = error.response.status;
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
          hasError = _this$state2.hasError;
      var _this$props = this.props,
          forms = _this$props.forms,
          audioStreamURL = _this$props.audioStreamURL;
      return _react["default"].createElement("section", null, !forms.waveformRetrieved && hasError ? _react["default"].createElement(_AlertContainer["default"], alertObj) : _react["default"].createElement(_Waveform["default"], {
        waveformRef: function waveformRef(ref) {
          return _this2.waveformContainer = ref;
        },
        mediaPlayerRef: function mediaPlayerRef(ref) {
          return _this2.mediaPlayer = ref;
        },
        audioStreamURL: audioStreamURL
      }));
    }
  }]);
  return WaveformContainer;
}(_react.Component); // For testing purposes


exports.PureWaveformContainer = WaveformContainer;

var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.smData,
    forms: state.forms
  };
};

var mapDispatchToProps = {
  fetchDataAndBuildPeaks: _peaksInstance.initializeSMDataPeaks,
  retrieveWaveformSuccess: actions.retrieveWaveformSuccess
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(WaveformContainer);

exports["default"] = _default;