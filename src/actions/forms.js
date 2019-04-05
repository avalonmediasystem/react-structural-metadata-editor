import * as types from './types';

export const handleEditingTimespans = code => ({
  type: types.IS_EDITING_TIMESPAN,
  code
});

export const handleStructureMasterFile = code => ({
  type: types.RETRIEVED_STRUCTURE,
  code
});

export const handleWaveformMasterFile = code => ({
  type: types.RETRIEVED_WAVEFORM,
  code
});
