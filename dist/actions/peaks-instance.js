"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initializeSMDataPeaks = initializeSMDataPeaks;
exports.initPeaks = initPeaks;
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
 * @param {JSON String} initStructure - structure with root element when empty
 * @param {Object} options - peaks options
 * @param {Boolean} isError - flag inidicating an error happened when fetching waveform.json
 */

function initializeSMDataPeaks(baseURL, masterFileID, initStructure, options, duration, isError) {
  return (
    /*#__PURE__*/
    function () {
      var _ref = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee(dispatch, getState) {
        var response, smData, initSmData, _getState, peaksInstance, status;

        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return apiUtils.getRequest(baseURL, masterFileID, 'structure.json');

              case 3:
                response = _context.sent;
                smData = [];

                if ((0, _lodash.isEmpty)(response.data)) {
                  smData = structuralMetadataUtils.addUUIds([JSON.parse(initStructure)]);
                } else {
                  smData = structuralMetadataUtils.addUUIds([response.data]);
                }

                initSmData = smData;
                dispatch((0, _smData.saveInitialStructure)(initSmData)); // Mark the top element as 'root'

                structuralMetadataUtils.markRootElement(smData); // Initialize Redux state variable with structure

                dispatch((0, _smData.buildSMUI)(smData, duration)); // Update redux-store flag for structure file retrieval

                dispatch((0, _forms.retrieveStructureSuccess)());

                if (!isError) {
                  dispatch(initPeaks(smData, options));
                  _getState = getState(), peaksInstance = _getState.peaksInstance; // Subscribe to Peaks event for dragging handles in a segment

                  if (peaksInstance.events !== undefined) {
                    peaksInstance.events.subscribe(function (segment) {
                      dispatch(dragSegment(segment, 1));
                    });
                  }
                }

                _context.next = 20;
                break;

              case 14:
                _context.prev = 14;
                _context.t0 = _context["catch"](0);
                console.log('TCL: Structure -> }catch -> error', _context.t0); // Check whether fetching waveform.json was successful

                if (!isError) {
                  // Initialize Peaks when structure.json is not found to show an empty waveform
                  dispatch(initPeaks([], options));
                }

                status = _context.t0.response !== undefined ? _context.t0.response.status : -2;
                dispatch((0, _forms.handleStructureError)(1, status));

              case 20:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[0, 14]]);
      }));

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }()
  );
}

function initPeaks(smData, options) {
  return {
    type: types.INIT_PEAKS,
    smData: smData,
    options: options
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

function dragSegment(segment, flag) {
  return {
    type: types.IS_DRAGGING,
    segment: segment,
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