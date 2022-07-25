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
exports.initializeSMDataPeaks = initializeSMDataPeaks;
exports.insertNewSegment = insertNewSegment;
exports.insertPlaceholderSegment = insertPlaceholderSegment;
exports.insertTempSegment = insertTempSegment;
exports.peaksReady = peaksReady;
exports.revertSegment = revertSegment;
exports.saveSegment = saveSegment;
exports.updateSegment = updateSegment;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var types = _interopRequireWildcard(require("./types"));

var _lodash = require("lodash");

var _Utils = _interopRequireDefault(require("../api/Utils"));

var _smData = require("./sm-data");

var _forms = require("./forms");

var _StructuralMetadataUtils = _interopRequireDefault(require("../services/StructuralMetadataUtils"));

var _alertStatus = require("../services/alert-status");

var _WaveformDataUtils = _interopRequireDefault(require("../services/WaveformDataUtils"));

var _iiifParser = require("../services/iiif-parser");

var _manifest = require("./manifest");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// import Peaks from 'peaks.js';
var waveformUtils = new _WaveformDataUtils["default"]();
var apiUtils = new _Utils["default"]();
var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();
/**
 * Fetch structure.json and initialize Peaks
 * @param {Object} peaks - initialized peaks instance
 * @param {String} structureURL - URL of the structure.json
 * @param {JSON} initStructure - structure with root element when empty
 * @param {Object} options - peaks options
 */

function initializeSMDataPeaks(peaks, manifestURL, canvasIndex, initStructure) {
  return /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(dispatch, getState) {
      var smData, duration, response, mediaInfo, alert, status, _alert, segments, _getState, peaksInstance, dragged;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              smData = [];
              duration = 0;

              if (typeof initStructure === 'string' && initStructure !== '') {
                smData = structuralMetadataUtils.addUUIds([JSON.parse(initStructure)]);
              } else if (!(0, _lodash.isEmpty)(initStructure)) {
                smData = structuralMetadataUtils.addUUIds([initStructure]);
              }

              _context.prev = 3;
              _context.next = 6;
              return apiUtils.getRequest(manifestURL);

            case 6:
              response = _context.sent;

              if (!(0, _lodash.isEmpty)(response.data)) {
                mediaInfo = (0, _iiifParser.getMediaInfo)(response.data, canvasIndex);
                dispatch((0, _manifest.setMediaInfo)(mediaInfo.src, mediaInfo.duration));
                smData = (0, _iiifParser.parseStructureToJSON)(response.data, mediaInfo.duration);
                duration = mediaInfo.duration;
              }

              if (smData.length > 0) {
                dispatch((0, _forms.retrieveStructureSuccess)());
              } else {
                dispatch((0, _forms.handleStructureError)(1, -2));
                alert = (0, _alertStatus.configureAlert)(-2);
                dispatch((0, _forms.setAlert)(alert));
              }

              dispatch((0, _manifest.fetchManifestSuccess)());
              _context.next = 19;
              break;

            case 12:
              _context.prev = 12;
              _context.t0 = _context["catch"](3);
              console.log('TCL: Structure -> }catch -> error', _context.t0);
              status = _context.t0.response !== undefined ? _context.t0.response.status : -2;
              dispatch((0, _forms.handleStructureError)(1, status));
              _alert = (0, _alertStatus.configureAlert)(status);
              dispatch((0, _forms.setAlert)(_alert));

            case 19:
              // Mark the top element as 'root'
              structuralMetadataUtils.markRootElement(smData); // Initialize Redux state variable with structure

              dispatch((0, _smData.buildSMUI)(smData, duration));
              dispatch((0, _smData.saveInitialStructure)(smData));

              if (peaks) {
                // Create segments from structural metadata
                segments = waveformUtils.initSegments(smData, duration); // Add segments to peaks instance

                segments.map(function (seg) {
                  return peaks.segments.add(seg);
                });
                dispatch(initPeaks(peaks, duration)); // Subscribe to Peaks events

                _getState = getState(), peaksInstance = _getState.peaksInstance;

                if (!(0, _lodash.isEmpty)(peaksInstance.events)) {
                  dragged = peaksInstance.events.dragged; // for segment editing using handles

                  if (dragged) {
                    dragged.subscribe(function (eProps) {
                      // startTimeChanged = true -> handle at the start of the segment is being dragged
                      // startTimeChanged = flase -> handle at the end of the segment is being dragged
                      var _eProps = (0, _slicedToArray2["default"])(eProps, 2),
                          segment = _eProps[0],
                          startTimeChanged = _eProps[1];

                      dispatch(dragSegment(segment.id, startTimeChanged, 1));
                    }); // Mark peaks is ready

                    dispatch(peaksReady(true));
                  }
                }
              }

            case 23:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[3, 12]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();
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