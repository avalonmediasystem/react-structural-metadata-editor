"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initializeSMDataPeaks = initializeSMDataPeaks;
exports.initPeaks = initPeaks;
exports.peaksReady = peaksReady;
exports.insertNewSegment = insertNewSegment;
exports.deleteSegment = deleteSegment;
exports.activateSegment = activateSegment;
exports.insertPlaceholderSegment = insertPlaceholderSegment;
exports.revertSegment = revertSegment;
exports.saveSegment = saveSegment;
exports.updateSegment = updateSegment;
exports.dragSegment = dragSegment;
exports.insertTempSegment = insertTempSegment;
exports.deleteTempSegment = deleteTempSegment;

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

// import Peaks from 'peaks.js';
var waveformUtils = new _WaveformDataUtils["default"]();
var apiUtils = new _Utils["default"]();
var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();
/**
 * Fetch structure.json and initialize Peaks
 * @param {Object} peaks - initialized peaks instance
 * @param {String} baseURL - base URL of masterfile location
 * @param {String} masterFileID - ID of the masterfile relevant to media element
 * @param {JSON} initStructure - structure with root element when empty
 * @param {Object} options - peaks options
 */

function initializeSMDataPeaks(peaks, baseURL, masterFileID, initStructure, duration) {
  return (
    /*#__PURE__*/
    function () {
      var _ref = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee(dispatch, getState) {
        var smData, response, status, alert, segments, _getState, peaksInstance, dragged;

        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                smData = [];

                if (typeof initStructure === 'string' && initStructure !== '') {
                  smData = structuralMetadataUtils.addUUIds([JSON.parse(initStructure)]);
                } else if (!(0, _lodash.isEmpty)(initStructure)) {
                  smData = structuralMetadataUtils.addUUIds([initStructure]);
                }

                _context.prev = 2;
                _context.next = 5;
                return apiUtils.getRequest(baseURL, masterFileID, 'structure.json');

              case 5:
                response = _context.sent;

                if (!(0, _lodash.isEmpty)(response.data)) {
                  smData = structuralMetadataUtils.addUUIds([response.data]);
                } // Update redux-store flag for structure file retrieval


                dispatch((0, _forms.retrieveStructureSuccess)());
                _context.next = 17;
                break;

              case 10:
                _context.prev = 10;
                _context.t0 = _context["catch"](2);
                console.log('TCL: Structure -> }catch -> error', _context.t0);
                status = _context.t0.response !== undefined ? _context.t0.response.status : -2;
                dispatch((0, _forms.handleStructureError)(1, status));
                alert = (0, _alertStatus.configureAlert)(status);
                dispatch((0, _forms.setAlert)(alert));

              case 17:
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

              case 21:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[2, 10]]);
      }));

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }()
  );
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