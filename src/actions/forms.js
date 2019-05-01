import * as types from './types';

export const handleEditingTimespans = code => ({
  type: types.IS_EDITING_TIMESPAN,
  code
});

export const retrieveStructureSuccess = () => ({
  type: types.RETRIEVE_STRUCTURE_SUCCESS
});

export const retrieveWaveformSuccess = () => ({
  type: types.RETRIEVE_WAVEFORM_SUCCESS
});
