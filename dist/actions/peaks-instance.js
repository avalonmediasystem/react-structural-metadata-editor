"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activateSegment = activateSegment;
exports.deleteSegment = deleteSegment;
exports.deleteTempSegment = deleteTempSegment;
exports.dragSegment = dragSegment;
exports.initPeaks = initPeaks;
exports.initializePeaks = initializePeaks;
exports.insertNewSegment = insertNewSegment;
exports.insertPlaceholderSegment = insertPlaceholderSegment;
exports.insertTempSegment = insertTempSegment;
exports.peaksReady = peaksReady;
exports.revertSegment = revertSegment;
exports.saveSegment = saveSegment;
exports.updateSegment = updateSegment;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var types = _interopRequireWildcard(require("./types"));
var _lodash = require("lodash");
var _peaks = _interopRequireDefault(require("peaks.js"));
var _Utils = _interopRequireDefault(require("../api/Utils"));
var _alertStatus = require("../services/alert-status");
var _WaveformDataUtils = _interopRequireDefault(require("../services/WaveformDataUtils"));
var _utils = require("../services/utils");
var _forms = require("./forms");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
var waveformUtils = new _WaveformDataUtils["default"]();
var apiUtils = new _Utils["default"]();

/**
 * Initialize Peaks instance
 * @param {Object} options - peaks options
 * @param {Array} smData - array of structures from the manifest
 */
function initializePeaks(peaksOptions, smData) {
  return /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(dispatch, getState) {
      var duration, _getState, manifest, mediaInfo, waveformInfo, _yield$buildWaveformO, opts, alertStatus, alert;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            duration = 0;
            _getState = getState(), manifest = _getState.manifest;
            mediaInfo = manifest.mediaInfo, waveformInfo = manifest.waveformInfo;
            duration = mediaInfo.duration;

            // Make waveform more zoomed-in for shorter media and less for larger media
            if (duration < 31) {
              peaksOptions.zoomLevels = [170, 256, 512];
            } else if (duration > 31 && duration < 60) {
              peaksOptions.zoomLevels = [512, 1024];
            } else {
              peaksOptions.zoomLevels = [512, 1024, 2048, 4096];
            }
            if (!(waveformInfo != null)) {
              _context.next = 11;
              break;
            }
            _context.next = 8;
            return setWaveformInfo(waveformInfo, mediaInfo, peaksOptions, dispatch);
          case 8:
            peaksOptions = _context.sent;
            _context.next = 18;
            break;
          case 11:
            _context.next = 13;
            return (0, _utils.buildWaveformOpt)(mediaInfo, peaksOptions);
          case 13:
            _yield$buildWaveformO = _context.sent;
            opts = _yield$buildWaveformO.opts;
            alertStatus = _yield$buildWaveformO.alertStatus;
            peaksOptions = opts;
            if (alertStatus != null) {
              alert = (0, _alertStatus.configureAlert)(alertStatus);
              dispatch((0, _forms.setAlert)(alert));
            }
          case 18:
            buildPeaksInstance(peaksOptions, smData, duration, dispatch, getState);
          case 19:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();
}
function setWaveformInfo(_x3, _x4, _x5, _x6) {
  return _setWaveformInfo.apply(this, arguments);
}
function _setWaveformInfo() {
  _setWaveformInfo = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(waveformURL, mediaInfo, peaksOptions, dispatch) {
    var status,
      _yield$buildWaveformO2,
      opts,
      alertStatus,
      alert,
      _args2 = arguments;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          status = _args2.length > 4 && _args2[4] !== undefined ? _args2[4] : null;
          _context2.prev = 1;
          _context2.next = 4;
          return apiUtils.headRequest(waveformURL);
        case 4:
          // Set waveform URI
          peaksOptions.dataUri = {
            json: waveformURL
          };
          // Update redux-store flag for waveform file retrieval
          dispatch((0, _forms.retrieveWaveformSuccess)());
          _context2.next = 24;
          break;
        case 8:
          _context2.prev = 8;
          _context2.t0 = _context2["catch"](1);
          // Enable the flash message alert
          console.log('TCL: peaks-instance -> setWaveformInfo() -> error', _context2.t0);
          // Pull status code out of error response/request
          if (!(_context2.t0.response !== undefined)) {
            _context2.next = 16;
            break;
          }
          status = _context2.t0.response.status;
          if (status == 404) {
            peaksOptions.dataUri = {
              json: "".concat(waveformURL, "?empty=true")
            };
            status = -7;
          }
          _context2.next = 24;
          break;
        case 16:
          if (!(_context2.t0.request !== undefined)) {
            _context2.next = 24;
            break;
          }
          _context2.next = 19;
          return (0, _utils.buildWaveformOpt)(mediaInfo, peaksOptions);
        case 19:
          _yield$buildWaveformO2 = _context2.sent;
          opts = _yield$buildWaveformO2.opts;
          alertStatus = _yield$buildWaveformO2.alertStatus;
          peaksOptions = opts;
          status = alertStatus;
        case 24:
          if (status != null) {
            alert = (0, _alertStatus.configureAlert)(status);
            dispatch((0, _forms.setAlert)(alert));
          }
          return _context2.abrupt("return", peaksOptions);
        case 26:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[1, 8]]);
  }));
  return _setWaveformInfo.apply(this, arguments);
}
function buildPeaksInstance(_x7, _x8, _x9, _x10, _x11) {
  return _buildPeaksInstance.apply(this, arguments);
}
function _buildPeaksInstance() {
  _buildPeaksInstance = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(peaksOptions, smData, duration, dispatch, getState) {
    var _getState3, manifest;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _getState3 = getState(), manifest = _getState3.manifest; // Initialize Peaks intance with the given options
          _peaks["default"].init(peaksOptions, function (err, peaks) {
            if (err) {
              // When media is empty stop the loading of the component
              if (manifest.mediaInfo.src === undefined) {
                dispatch((0, _forms.streamMediaSuccess)());
                dispatch((0, _forms.setStreamMediaError)(-11));
                // Mark peaks as ready to unblock the UI
                dispatch(peaksReady(true));
                // Set editing to disabled to block structure editing
                dispatch((0, _forms.handleEditingTimespans)(1));
                // Setup editing disabled alert
                var alert = (0, _alertStatus.configureAlert)(-11);
                dispatch((0, _forms.setAlert)(alert));
                handlePeaksError(err);
              }
            }
            handlePeaksSuccess(peaks, smData, duration, dispatch, getState);
          });
        case 2:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  }));
  return _buildPeaksInstance.apply(this, arguments);
}
var handlePeaksError = function handlePeaksError(err) {
  console.error('TCL: peaks-instance -> buildPeaksInstance() -> Peaks.init ->', err);
};
var handlePeaksSuccess = function handlePeaksSuccess(peaks, smData, duration, dispatch, getState) {
  // Create segments from structural metadata
  var segments = waveformUtils.initSegments(smData, duration);
  if (peaks) {
    // Add segments to peaks instance
    segments.map(function (seg) {
      return peaks.segments.add(seg);
    });
    dispatch(initPeaks(peaks, duration));

    // Subscribe to Peaks events
    var _getState2 = getState(),
      peaksInstance = _getState2.peaksInstance;
    if (!(0, _lodash.isEmpty)(peaksInstance.events)) {
      var dragged = peaksInstance.events.dragged;
      // for segment editing using handles
      if (dragged) {
        dragged.subscribe(function (eProps) {
          // startMarker = true -> handle at the start of the segment is being dragged
          // startMarker = flase -> handle at the end of the segment is being dragged
          var segment = eProps.segment,
            startMarker = eProps.startMarker;
          dispatch(dragSegment(segment.id, startMarker, 1));
        });
        // Mark peaks is ready
        dispatch(peaksReady(true));
      }
    }
  }
};
function initPeaks(peaksInstance, duration) {
  return {
    type: types.INIT_PEAKS,
    peaksInstance: peaksInstance,
    duration: duration
  };
}
function peaksReady(ready) {
  return {
    type: types.PEAKS_READY,
    payload: ready
  };
}
function insertNewSegment(span) {
  return {
    type: types.INSERT_SEGMENT,
    payload: span
  };
}
function deleteSegment(item) {
  return {
    type: types.DELETE_SEGMENT,
    payload: item
  };
}
function activateSegment(id) {
  return {
    type: types.ACTIVATE_SEGMENT,
    payload: id
  };
}
function insertPlaceholderSegment(item, wrapperSpans) {
  return {
    type: types.INSERT_PLACEHOLDER,
    item: item,
    wrapperSpans: wrapperSpans
  };
}
function revertSegment(clone) {
  return {
    type: types.REVERT_SEGMENT,
    payload: clone
  };
}
function saveSegment(state) {
  return {
    type: types.SAVE_SEGMENT,
    payload: state
  };
}
function updateSegment(segment, state) {
  return {
    type: types.UPDATE_SEGMENT,
    segment: segment,
    state: state
  };
}
function dragSegment(segmentID, startTimeChanged, flag) {
  return {
    type: types.IS_DRAGGING,
    segmentID: segmentID,
    startTimeChanged: startTimeChanged,
    flag: flag
  };
}
function insertTempSegment() {
  return {
    type: types.TEMP_INSERT_SEGMENT
  };
}
function deleteTempSegment(id) {
  return {
    type: types.TEMP_DELETE_SEGMENT,
    payload: id
  };
}