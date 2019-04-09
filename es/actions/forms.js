import * as types from './types';

export var handleEditingTimespans = function handleEditingTimespans(code) {
  return {
    type: types.IS_EDITING_TIMESPAN,
    code: code
  };
};

export var handleStructureMasterFile = function handleStructureMasterFile(code) {
  return {
    type: types.RETRIEVED_STRUCTURE,
    code: code
  };
};

export var handleWaveformMasterFile = function handleWaveformMasterFile(code) {
  return {
    type: types.RETRIEVED_WAVEFORM,
    code: code
  };
};