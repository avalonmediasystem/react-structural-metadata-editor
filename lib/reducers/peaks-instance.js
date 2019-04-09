'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _types = require('../actions/types');

var types = _interopRequireWildcard(_types);

var _WaveformDataUtils = require('../services/WaveformDataUtils');

var _WaveformDataUtils2 = _interopRequireDefault(_WaveformDataUtils);

var _peaks = require('peaks.js');

var _peaks2 = _interopRequireDefault(_peaks);

var _rxjs = require('rxjs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var waveformUtils = new _WaveformDataUtils2.default();
var initialState = {
  peaks: {},
  events: null,
  segment: null
};
var newPeaks = null;

var peaksInstance = function peaksInstance() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];

  switch (action.type) {
    case types.INIT_PEAKS:
      var segments = waveformUtils.initSegments(action.smData);
      var _peaksInstance = _peaks2.default.init(_extends({}, action.options, {
        segments: segments
      }));
      return {
        peaks: _peaksInstance,
        events: (0, _rxjs.fromEvent)(_peaksInstance, 'segments.dragged'),
        segment: _extends({}, state.segment)
      };

    case types.INSERT_SEGMENT:
      newPeaks = waveformUtils.insertNewSegment(action.payload, _extends({}, state.peaks));
      return _extends({}, state, {
        peaks: waveformUtils.rebuildPeaks(newPeaks)
      });

    case types.DELETE_SEGMENT:
      newPeaks = waveformUtils.deleteSegments(action.payload, _extends({}, state.peaks));
      return _extends({}, state, {
        peaks: waveformUtils.rebuildPeaks(newPeaks)
      });

    case types.ACTIVATE_SEGMENT:
      newPeaks = waveformUtils.activateSegment(action.payload, _extends({}, state.peaks));
      return _extends({}, state, {
        peaks: newPeaks
      });

    case types.SAVE_SEGMENT:
      newPeaks = waveformUtils.deactivateSegment(action.payload.clonedSegment.id, _extends({}, state.peaks));
      var rebuiltPeaks = waveformUtils.saveSegment(action.payload, _extends({}, newPeaks));
      return _extends({}, state, {
        peaks: rebuiltPeaks
      });

    case types.REVERT_SEGMENT:
      newPeaks = waveformUtils.deactivateSegment(action.payload.id, _extends({}, state.peaks));
      return _extends({}, state, {
        peaks: waveformUtils.revertSegment(action.payload, _extends({}, newPeaks))
      });

    case types.UPDATE_SEGMENT:
      newPeaks = waveformUtils.updateSegment(action.segment, action.state, _extends({}, state.peaks));
      return _extends({}, state, {
        peaks: _extends({}, newPeaks)
      });

    case types.DRAG_SEGMENT:
      return _extends({}, state, {
        segment: action.payload
      });

    case types.TEMP_INSERT_SEGMENT:
      newPeaks = waveformUtils.insertTempSegment(_extends({}, state.peaks));
      return _extends({}, state, {
        peaks: _extends({}, newPeaks)
      });

    case types.TEMP_DELETE_SEGMENT:
      state.peaks.segments.removeById(action.payload);
      return _extends({}, state);

    default:
      return state;
  }
};

exports.default = peaksInstance;
module.exports = exports['default'];