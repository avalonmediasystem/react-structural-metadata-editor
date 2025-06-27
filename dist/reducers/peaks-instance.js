"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var types = _interopRequireWildcard(require("../actions/types"));
var _WaveformDataUtils = _interopRequireDefault(require("../services/WaveformDataUtils"));
var _rxjs = require("rxjs");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var waveformUtils = new _WaveformDataUtils["default"]();
var initialState = {
  peaks: {},
  events: {},
  segment: null,
  isDragging: false,
  startTimeChanged: null,
  duration: null,
  readyPeaks: false
};
var newPeaks = null;
var updatedSegment = null;
var peaksInstance = function peaksInstance() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments.length > 1 ? arguments[1] : undefined;
  switch (action.type) {
    case types.INIT_PEAKS:
      var _peaksInstance = action.peaksInstance;
      return {
        peaks: _peaksInstance,
        events: {
          dragged: _peaksInstance ? (0, _rxjs.fromEvent)(_peaksInstance, 'segments.dragged') : null
        },
        segment: _objectSpread({}, state.segment),
        duration: action.duration
      };
    case types.PEAKS_READY:
      return _objectSpread(_objectSpread({}, state), {}, {
        readyPeaks: action.payload
      });
    case types.INSERT_SEGMENT:
      state.peaks.segments.add(waveformUtils.convertTimespanToSegment(action.payload));
      newPeaks = waveformUtils.rebuildPeaks(_objectSpread({}, state.peaks));
      return _objectSpread(_objectSpread({}, state), {}, {
        peaks: newPeaks
      });
    case types.DELETE_SEGMENT:
      newPeaks = waveformUtils.deleteSegments(action.payload, _objectSpread({}, state.peaks));
      return _objectSpread(_objectSpread({}, state), {}, {
        peaks: waveformUtils.rebuildPeaks(newPeaks)
      });
    case types.ACTIVATE_SEGMENT:
      newPeaks = waveformUtils.activateSegment(action.payload, _objectSpread({}, state.peaks), state.duration);
      return _objectSpread(_objectSpread({}, state), {}, {
        peaks: newPeaks
      });
    case types.INSERT_PLACEHOLDER:
      newPeaks = waveformUtils.addTempInvalidSegment(action.item, action.wrapperSpans, _objectSpread({}, state.peaks), state.duration);
      return _objectSpread(_objectSpread({}, state), {}, {
        peaks: newPeaks
      });
    case types.SAVE_SEGMENT:
      newPeaks = waveformUtils.deactivateSegment(action.payload.clonedSegment, true, _objectSpread({}, state.peaks));
      var rebuiltPeaks = waveformUtils.saveSegment(action.payload, _objectSpread({}, newPeaks));
      return _objectSpread(_objectSpread({}, state), {}, {
        isDragging: false,
        peaks: rebuiltPeaks
      });
    case types.REVERT_SEGMENT:
      newPeaks = waveformUtils.deactivateSegment(action.payload, false, _objectSpread({}, state.peaks));
      return _objectSpread(_objectSpread({}, state), {}, {
        isDragging: false,
        peaks: waveformUtils.revertSegment(action.payload, _objectSpread({}, newPeaks))
      });
    case types.UPDATE_SEGMENT:
      newPeaks = waveformUtils.updateSegment(action.segment, action.state, _objectSpread({}, state.peaks));
      updatedSegment = newPeaks.segments.getSegment(action.segment.id);
      return _objectSpread(_objectSpread({}, state), {}, {
        peaks: _objectSpread({}, newPeaks),
        segment: updatedSegment
      });
    case types.IS_DRAGGING:
      return _objectSpread(_objectSpread({}, state), {}, {
        segment: state.peaks.segments.getSegment(action.segmentID),
        startTimeChanged: action.startTimeChanged,
        isDragging: action.flag === 1 ? true : false
      });
    case types.TEMP_INSERT_SEGMENT:
      newPeaks = waveformUtils.insertTempSegment(_objectSpread({}, state.peaks), state.duration);
      return _objectSpread(_objectSpread({}, state), {}, {
        peaks: _objectSpread({}, newPeaks)
      });
    case types.TEMP_DELETE_SEGMENT:
      state.peaks.segments.removeById(action.payload);
      return _objectSpread({}, state);
    default:
      return state;
  }
};
var _default = exports["default"] = peaksInstance;