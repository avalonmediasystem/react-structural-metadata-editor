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

var apiUtils = new _Utils["default"]();
var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();
/**
 * Fetch structure.json and initialize Peaks
 * @param {String} baseURL - base URL of masterfile location
 * @param {String} masterFileID - ID of the masterfile relevant to media element
 * @param {JSON} initStructure - structure with root element when empty
 * @param {Object} options - peaks options
 */

function initializeSMDataPeaks(baseURL, masterFileID, initStructure, options, duration) {
  return (
    /*#__PURE__*/
    function () {
      var _ref = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee(dispatch, getState) {
        var smData, response, status, _getState, peaksInstance, structuralMetadata, _peaksInstance$events, dragged, ready;

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
                _context.next = 15;
                break;

              case 10:
                _context.prev = 10;
                _context.t0 = _context["catch"](2);
                console.log('TCL: Structure -> }catch -> error', _context.t0);
                status = _context.t0.response !== undefined ? _context.t0.response.status : -2;
                dispatch((0, _forms.handleStructureError)(1, status));

              case 15:
                // Mark the top element as 'root'
                structuralMetadataUtils.markRootElement(smData); // Initialize Redux state variable with structure

                dispatch((0, _smData.buildSMUI)(smData, duration));
                dispatch(initPeaks(smData, options, duration));
                _getState = getState(), peaksInstance = _getState.peaksInstance, structuralMetadata = _getState.structuralMetadata;
                dispatch((0, _smData.saveInitialStructure)(structuralMetadata.smData)); // Subscribe to Peaks events

                if (!(0, _lodash.isEmpty)(peaksInstance.events)) {
                  _peaksInstance$events = peaksInstance.events, dragged = _peaksInstance$events.dragged, ready = _peaksInstance$events.ready; // for segment editing using handles

                  if (dragged) {
                    dragged.subscribe(function (eProps) {
                      // startTimeChanged = true -> handle at the start of the segment is being dragged
                      // startTimeChanged = flase -> handle at the end of the segment is being dragged
                      var _eProps = (0, _slicedToArray2["default"])(eProps, 2),
                          segment = _eProps[0],
                          startTimeChanged = _eProps[1];

                      dispatch(dragSegment(segment.id, startTimeChanged, 1));
                    });
                  }

                  if (ready) {
                    // peaks ready event
                    peaksInstance.events.ready.subscribe(function () {
                      dispatch(peaksReady(true));
                    });
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

function initPeaks(smData, options, duration) {
  return {
    type: types.INIT_PEAKS,
    smData: smData,
    options: options,
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