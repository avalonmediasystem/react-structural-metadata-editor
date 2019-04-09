'use strict';

exports.__esModule = true;
exports.handleWaveformMasterFile = exports.handleStructureMasterFile = exports.handleEditingTimespans = undefined;

var _types = require('./types');

var types = _interopRequireWildcard(_types);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var handleEditingTimespans = exports.handleEditingTimespans = function handleEditingTimespans(code) {
  return {
    type: types.IS_EDITING_TIMESPAN,
    code: code
  };
};

var handleStructureMasterFile = exports.handleStructureMasterFile = function handleStructureMasterFile(code) {
  return {
    type: types.RETRIEVED_STRUCTURE,
    code: code
  };
};

var handleWaveformMasterFile = exports.handleWaveformMasterFile = function handleWaveformMasterFile(code) {
  return {
    type: types.RETRIEVED_WAVEFORM,
    code: code
  };
};