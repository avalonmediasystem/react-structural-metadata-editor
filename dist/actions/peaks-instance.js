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

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var types = _interopRequireWildcard(require("./types"));

var _lodash = require("lodash");

var _WaveformDataUtils = _interopRequireDefault(require("../services/WaveformDataUtils"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var waveformUtils = new _WaveformDataUtils["default"]();
/**
 * Initialize Peaks instance from structure
 * @param {Object} peaks - initialized peaks instance
 * @param {Number} duration - duration of the media file
 */

function initializeSMDataPeaks(peaks, duration) {
  return function (dispatch, getState) {
    var _getState = getState(),
        structuralMetadata = _getState.structuralMetadata;

    if (peaks) {
      // Create segments from structural metadata
      var segments = waveformUtils.initSegments(structuralMetadata.smData, duration); // Add segments to peaks instance

      segments.map(function (seg) {
        return peaks.segments.add(seg);
      });
      dispatch(initPeaks(peaks, duration)); // Subscribe to Peaks events

      var _getState2 = getState(),
          peaksInstance = _getState2.peaksInstance;

      if (!(0, _lodash.isEmpty)(peaksInstance.events)) {
        var dragged = peaksInstance.events.dragged; // for segment editing using handles

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
  };
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