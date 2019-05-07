"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var types = _interopRequireWildcard(require("../actions/types"));

var _WaveformDataUtils = _interopRequireDefault(require("../services/WaveformDataUtils"));

var _peaks = _interopRequireDefault(require("peaks.js"));

var _rxjs = require("rxjs");

var waveformUtils = new _WaveformDataUtils["default"]();
var initialState = {
  peaks: {},
  events: null,
  segment: null,
  isDragging: false
};
var newPeaks = null;
var updatedSegment = null;

var peaksInstance = function peaksInstance() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments.length > 1 ? arguments[1] : undefined;

  switch (action.type) {
    case types.INIT_PEAKS:
      var segments = waveformUtils.initSegments(action.smData);

      var _peaksInstance = _peaks["default"].init((0, _objectSpread2["default"])({}, action.options, {
        segments: segments
      }));

      return {
        peaks: _peaksInstance,
        events: (0, _rxjs.fromEvent)(_peaksInstance, 'segments.dragged'),
        segment: (0, _objectSpread2["default"])({}, state.segment)
      };

    case types.INSERT_SEGMENT:
      state.peaks.segments.add(waveformUtils.convertTimespanToSegment(action.payload));
      newPeaks = waveformUtils.rebuildPeaks((0, _objectSpread2["default"])({}, state.peaks));
      return (0, _objectSpread2["default"])({}, state, {
        peaks: newPeaks
      });

    case types.DELETE_SEGMENT:
      newPeaks = waveformUtils.deleteSegments(action.payload, (0, _objectSpread2["default"])({}, state.peaks));
      return (0, _objectSpread2["default"])({}, state, {
        peaks: waveformUtils.rebuildPeaks(newPeaks)
      });

    case types.ACTIVATE_SEGMENT:
      newPeaks = waveformUtils.activateSegment(action.payload, (0, _objectSpread2["default"])({}, state.peaks));
      return (0, _objectSpread2["default"])({}, state, {
        peaks: newPeaks
      });

    case types.SAVE_SEGMENT:
      newPeaks = waveformUtils.deactivateSegment(action.payload.clonedSegment.id, (0, _objectSpread2["default"])({}, state.peaks));
      var rebuiltPeaks = waveformUtils.saveSegment(action.payload, (0, _objectSpread2["default"])({}, newPeaks));
      return (0, _objectSpread2["default"])({}, state, {
        peaks: rebuiltPeaks
      });

    case types.REVERT_SEGMENT:
      newPeaks = waveformUtils.deactivateSegment(action.payload.id, (0, _objectSpread2["default"])({}, state.peaks));
      return (0, _objectSpread2["default"])({}, state, {
        peaks: waveformUtils.revertSegment(action.payload, (0, _objectSpread2["default"])({}, newPeaks))
      });

    case types.UPDATE_SEGMENT:
      newPeaks = waveformUtils.updateSegment(action.segment, action.state, (0, _objectSpread2["default"])({}, state.peaks));
      updatedSegment = newPeaks.segments.getSegment(action.segment.id);
      return (0, _objectSpread2["default"])({}, state, {
        peaks: (0, _objectSpread2["default"])({}, newPeaks),
        segment: updatedSegment
      });

    case types.IS_DRAGGING:
      if (action.flag === 0) {
        return (0, _objectSpread2["default"])({}, state, {
          segment: action.segment,
          isDragging: false
        });
      }

      if (action.flag === 1) {
        return (0, _objectSpread2["default"])({}, state, {
          segment: action.segment,
          isDragging: true
        });
      }

    case types.TEMP_INSERT_SEGMENT:
      newPeaks = waveformUtils.insertTempSegment((0, _objectSpread2["default"])({}, state.peaks));
      return (0, _objectSpread2["default"])({}, state, {
        peaks: (0, _objectSpread2["default"])({}, newPeaks)
      });

    case types.TEMP_DELETE_SEGMENT:
      state.peaks.segments.removeById(action.payload);
      return (0, _objectSpread2["default"])({}, state);

    default:
      return state;
  }
};

var _default = peaksInstance;
exports["default"] = _default;