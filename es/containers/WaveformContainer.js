import _regeneratorRuntime from 'babel-runtime/regenerator';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React, { Component } from 'react';
import APIUtils from '../api/Utils';
import { connect } from 'react-redux';
import * as peaksActions from '../actions/peaks-instance';
import * as actions from '../actions/forms';
import Waveform from '../components/Waveform';
import AlertContainer from '../containers/AlertContainer';
import { configureAlert } from '../services/alert-status';
import { handleWaveformMasterFile } from '../actions/forms';

var apiUtils = new APIUtils();

// Peaks options
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

var WaveformContainer = function (_Component) {
  _inherits(WaveformContainer, _Component);

  function WaveformContainer(props) {
    _classCallCheck(this, WaveformContainer);

    var _this = _possibleConstructorReturn(this, _Component.call(this, props));

    _this.state = {
      alertObj: null,
      hasError: false
    };

    _this.clearAlert = function () {
      _this.setState({
        alertObj: null
      });
    };

    _this.waveformContainer = null;
    _this.mediaPlayer = null;
    return _this;
  }

  WaveformContainer.prototype.componentDidMount = function componentDidMount() {
    peaksOptions.container = this.waveformContainer;
    peaksOptions.mediaElement = this.mediaPlayer;
    this.initializePeaks();
  };

  WaveformContainer.prototype.handleError = function handleError(error) {
    console.log('TCL: WaveformContainer -> handleError -> error', error);
    var status = null;

    // Pull status code out of error response/request
    if (error.response !== undefined) {
      status = error.response.status;
    } else if (error.request !== undefined) {
      status = -3;
    }

    var alertObj = configureAlert(status, this.clearAlert);
    this.setState({ alertObj: alertObj, hasError: true });
  };

  WaveformContainer.prototype.initializePeaks = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
      var response;
      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return apiUtils.getRequest('waveform.json');

            case 3:
              response = _context.sent;

              // Set the masterfile URL as the URI for the waveform data file
              peaksOptions.dataUri = response.request.responseURL;

              // Initialize Peaks
              this.props.initPeaks(this.props.smData, peaksOptions);

              // Update redux-store flag for waveform file retrieval
              this.props.handleWaveformFile(0);
              _context.next = 12;
              break;

            case 9:
              _context.prev = 9;
              _context.t0 = _context['catch'](0);

              this.handleError(_context.t0);

            case 12:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this, [[0, 9]]);
    }));

    function initializePeaks() {
      return _ref.apply(this, arguments);
    }

    return initializePeaks;
  }();

  WaveformContainer.prototype.render = function render() {
    var _this2 = this;

    var _state = this.state,
        alertObj = _state.alertObj,
        hasError = _state.hasError;
    var forms = this.props.forms;


    return React.createElement(
      'section',
      { className: 'waveform-section' },
      !forms.waveformRetrieved && hasError ? React.createElement(AlertContainer, alertObj) : React.createElement(Waveform, {
        waveformRef: function waveformRef(ref) {
          return _this2.waveformContainer = ref;
        },
        mediaPlayerRef: function mediaPlayerRef(ref) {
          return _this2.mediaPlayer = ref;
        }
      })
    );
  };

  return WaveformContainer;
}(Component);

// For testing purposes


export { WaveformContainer as PureWaveformContainer };

var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.smData,
    forms: state.forms
  };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
  return _extends({}, actions, {
    initPeaks: function initPeaks(smData, options) {
      return dispatch(peaksActions.initPeaksInstance(smData, options));
    },
    handleWaveformFile: function handleWaveformFile(code) {
      return dispatch(handleWaveformMasterFile(code));
    }
  });
};

export default connect(mapStateToProps, mapDispatchToProps)(WaveformContainer);