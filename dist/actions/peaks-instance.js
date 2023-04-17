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

var _StructuralMetadataUtils = _interopRequireDefault(require("../services/StructuralMetadataUtils"));

var _WaveformDataUtils = _interopRequireDefault(require("../services/WaveformDataUtils"));

var _utils = require("../services/utils");

var _iiifParser = require("../services/iiif-parser");

var _smData = require("./sm-data");

var _forms = require("./forms");

var _manifest = require("./manifest");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var waveformUtils = new _WaveformDataUtils["default"]();
var apiUtils = new _Utils["default"]();
var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();
/**
 * Fetch structure.json and initialize Peaks
 * @param {Object} peaks - initialized peaks instance
 * @param {String} structureURL - URL of the structure.json
 * @param {Object} options - peaks options
 */

function initializePeaks(peaksOptions, manifestURL, canvasIndex) {
  return /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(dispatch, getState) {
      var smData, duration, mediaInfo, waveformInfo, response, alert, _yield$setWaveformOpt, opts, alertStatus, _alert, status, _alert2;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              smData = [];
              duration = 0;
              mediaInfo = {};
              _context.prev = 3;
              _context.next = 6;
              return apiUtils.getRequest(manifestURL);

            case 6:
              response = _context.sent;

              if (!(0, _lodash.isEmpty)(response.data)) {
                mediaInfo = (0, _iiifParser.getMediaInfo)(response.data, canvasIndex);
                waveformInfo = (0, _iiifParser.getWaveformInfo)(response.data, canvasIndex);
                dispatch((0, _manifest.setManifest)(response.data));
                dispatch((0, _manifest.setMediaInfo)(mediaInfo.src, mediaInfo.duration, mediaInfo.isStream));
                smData = (0, _iiifParser.parseStructureToJSON)(response.data, mediaInfo.duration, canvasIndex);
                duration = mediaInfo.duration;
              }

              if (smData.length > 0) {
                dispatch((0, _forms.retrieveStructureSuccess)());
              } else {
                dispatch((0, _forms.handleStructureError)(1, -2));
                alert = (0, _alertStatus.configureAlert)(-2);
                dispatch((0, _forms.setAlert)(alert));
              }

              dispatch((0, _manifest.fetchManifestSuccess)()); // Initialize Redux state variable with structure

              dispatch((0, _smData.buildSMUI)(smData, duration));
              dispatch((0, _smData.saveInitialStructure)(smData)); // Mark the top element as 'root'

              structuralMetadataUtils.markRootElement(smData); // Make waveform more zoomed-in for shorter media and less for larger media 

              if (duration < 31) {
                peaksOptions.zoomLevels = [170, 256, 512];
              } else if (duration > 31 && duration < 60) {
                peaksOptions.zoomLevels = [512, 1024];
              } else {
                peaksOptions.zoomLevels = [512, 1024, 2048, 4096];
              }

              if (!(waveformInfo != null)) {
                _context.next = 20;
                break;
              }

              _context.next = 17;
              return setWaveformInfo(waveformInfo, mediaInfo, peaksOptions, dispatch);

            case 17:
              peaksOptions = _context.sent;
              _context.next = 27;
              break;

            case 20:
              _context.next = 22;
              return (0, _utils.setWaveformOptions)(mediaInfo, peaksOptions);

            case 22:
              _yield$setWaveformOpt = _context.sent;
              opts = _yield$setWaveformOpt.opts;
              alertStatus = _yield$setWaveformOpt.alertStatus;
              peaksOptions = opts;

              if (alertStatus != null) {
                _alert = (0, _alertStatus.configureAlert)(alertStatus);
                dispatch((0, _forms.setAlert)(_alert));
              }

            case 27:
              buildPeaksInstance(peaksOptions, smData, duration, dispatch, getState);
              _context.next = 37;
              break;

            case 30:
              _context.prev = 30;
              _context.t0 = _context["catch"](3);
              console.log('TCL: peaks-instance -> initializePeaks() -> error', _context.t0); // Update manifest error in the redux store

              status = _context.t0.response !== undefined ? _context.t0.response.status : -9;
              dispatch((0, _manifest.handleManifestError)(1, status));
              _alert2 = (0, _alertStatus.configureAlert)(status);
              dispatch((0, _forms.setAlert)(_alert2));

            case 37:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[3, 30]]);
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
  _setWaveformInfo = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(waveformURL, mediaInfo, peaksOptions, dispatch) {
    var status,
        _yield$setWaveformOpt2,
        opts,
        alertStatus,
        alert,
        _args2 = arguments;

    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            status = _args2.length > 4 && _args2[4] !== undefined ? _args2[4] : null;
            _context2.prev = 1;
            _context2.next = 4;
            return apiUtils.headRequest(waveformURL);

          case 4:
            // Set waveform URI
            peaksOptions.dataUri = {
              json: waveformURL
            }; // Update redux-store flag for waveform file retrieval

            dispatch((0, _forms.retrieveWaveformSuccess)());
            _context2.next = 24;
            break;

          case 8:
            _context2.prev = 8;
            _context2.t0 = _context2["catch"](1);
            // Enable the flash message alert
            console.log('TCL: peaks-instance -> setWaveformInfo() -> error', _context2.t0); // Pull status code out of error response/request

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
            return (0, _utils.setWaveformOptions)(mediaInfo, peaksOptions);

          case 19:
            _yield$setWaveformOpt2 = _context2.sent;
            opts = _yield$setWaveformOpt2.opts;
            alertStatus = _yield$setWaveformOpt2.alertStatus;
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
      }
    }, _callee2, null, [[1, 8]]);
  }));
  return _setWaveformInfo.apply(this, arguments);
}

function buildPeaksInstance(_x7, _x8, _x9, _x10, _x11) {
  return _buildPeaksInstance.apply(this, arguments);
}

function _buildPeaksInstance() {
  _buildPeaksInstance = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(peaksOptions, smData, duration, dispatch, getState) {
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            // Initialize Peaks intance with the given options
            _peaks["default"].init(peaksOptions, function (err, peaks) {
              if (err) console.error('TCL: peaks-instance -> buildPeaksInstance() -> Peaks.init ->', err); // Create segments from structural metadata

              var segments = waveformUtils.initSegments(smData, duration); // Add segments to peaks instance

              segments.map(function (seg) {
                return peaks.segments.add(seg);
              });
              dispatch(initPeaks(peaks, duration)); // Subscribe to Peaks events

              var _getState = getState(),
                  peaksInstance = _getState.peaksInstance;

              if (!(0, _lodash.isEmpty)(peaksInstance.events)) {
                var dragged = peaksInstance.events.dragged; // for segment editing using handles

                if (dragged) {
                  dragged.subscribe(function (eProps) {
                    // startMarker = true -> handle at the start of the segment is being dragged
                    // startMarker = flase -> handle at the end of the segment is being dragged
                    var segment = eProps.segment,
                        startMarker = eProps.startMarker;
                    dispatch(dragSegment(segment.id, startMarker, 1));
                  }); // Mark peaks is ready

                  dispatch(peaksReady(true));
                }
              }
            });

          case 1:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _buildPeaksInstance.apply(this, arguments);
}

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