'use strict';

exports.__esModule = true;
exports.initPeaksInstance = initPeaksInstance;
exports.initPeaks = initPeaks;
exports.insertNewSegment = insertNewSegment;
exports.deleteSegment = deleteSegment;
exports.activateSegment = activateSegment;
exports.revertSegment = revertSegment;
exports.saveSegment = saveSegment;
exports.updateSegment = updateSegment;
exports.changeSegment = changeSegment;
exports.insertTempSegment = insertTempSegment;
exports.deleteTempSegment = deleteTempSegment;

var _types = require('./types');

var types = _interopRequireWildcard(_types);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function initPeaksInstance(smData, options) {
  return function (dispatch, getState) {
    dispatch(initPeaks(smData, options));

    var _getState = getState(),
        peaksInstance = _getState.peaksInstance;

    if (peaksInstance.events !== undefined) {
      peaksInstance.events.subscribe(function (segment) {
        dispatch(changeSegment(segment));
      });
    }
  };
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

function changeSegment(segment) {
  return {
    type: types.DRAG_SEGMENT,
    payload: segment
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