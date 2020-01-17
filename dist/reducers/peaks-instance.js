"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var types = _interopRequireWildcard(require("../actions/types"));

var _WaveformDataUtils = _interopRequireDefault(require("../services/WaveformDataUtils"));

var _peaks = _interopRequireDefault(require("peaks.js"));

var _rxjs = require("rxjs");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var waveformUtils = new _WaveformDataUtils["default"]();
var initialState = {
  peaks: {},
  events: null,
  segment: null,
  isDragging: false,
  inMarker: null
};
var newPeaks = null;
var updatedSegment = null;

var peaksInstance = function peaksInstance() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments.length > 1 ? arguments[1] : undefined;

  switch (action.type) {
    case types.INIT_PEAKS:
      var segments = waveformUtils.initSegments(action.smData);

      var _peaksInstance = _peaks["default"].init(_objectSpread({}, action.options, {
        segments: segments
      }));

      return {
        peaks: _peaksInstance,
        events: (0, _rxjs.fromEvent)(_peaksInstance, 'segments.dragged'),
        segment: _objectSpread({}, state.segment)
      };

    case types.INSERT_SEGMENT:
      state.peaks.segments.add(waveformUtils.convertTimespanToSegment(action.payload));
      newPeaks = waveformUtils.rebuildPeaks(_objectSpread({}, state.peaks));
      return _objectSpread({}, state, {
        peaks: newPeaks
      });

    case types.DELETE_SEGMENT:
      newPeaks = waveformUtils.deleteSegments(action.payload, _objectSpread({}, state.peaks));
      return _objectSpread({}, state, {
        peaks: waveformUtils.rebuildPeaks(newPeaks)
      });

    case types.ACTIVATE_SEGMENT:
      newPeaks = waveformUtils.activateSegment(action.payload, _objectSpread({}, state.peaks));
      return _objectSpread({}, state, {
        peaks: newPeaks
      });

    case types.SAVE_SEGMENT:
      newPeaks = waveformUtils.deactivateSegment(action.payload.clonedSegment.id, _objectSpread({}, state.peaks));
      var rebuiltPeaks = waveformUtils.saveSegment(action.payload, _objectSpread({}, newPeaks));
      return _objectSpread({}, state, {
        isDragging: false,
        peaks: rebuiltPeaks
      });

    case types.REVERT_SEGMENT:
      newPeaks = waveformUtils.deactivateSegment(action.payload.id, _objectSpread({}, state.peaks));
      return _objectSpread({}, state, {
        isDragging: false,
        peaks: waveformUtils.revertSegment(action.payload, _objectSpread({}, newPeaks))
      });

    case types.UPDATE_SEGMENT:
      newPeaks = waveformUtils.updateSegment(action.segment, action.state, _objectSpread({}, state.peaks));
      updatedSegment = newPeaks.segments.getSegment(action.segment.id);
      return _objectSpread({}, state, {
        peaks: _objectSpread({}, newPeaks),
        segment: updatedSegment
      });

    case types.IS_DRAGGING:
      if (action.flag === 0) {
        return _objectSpread({}, state, {
          segment: state.peaks.segments.getSegment(action.segmentID),
          inMarker: action.inMarker,
          isDragging: false
        });
      } else {
        return _objectSpread({}, state, {
          segment: state.peaks.segments.getSegment(action.segmentID),
          inMarker: action.inMarker,
          isDragging: true
        });
      }

    case types.TEMP_INSERT_SEGMENT:
      newPeaks = waveformUtils.insertTempSegment(_objectSpread({}, state.peaks));
      return _objectSpread({}, state, {
        peaks: _objectSpread({}, newPeaks)
      });

    case types.TEMP_DELETE_SEGMENT:
      state.peaks.segments.removeById(action.payload);
      return _objectSpread({}, state);

    default:
      return state;
  }
};

var _default = peaksInstance;
exports["default"] = _default;