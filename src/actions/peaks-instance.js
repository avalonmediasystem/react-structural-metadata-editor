import * as types from './types';

export function initPeaksInstance(smData, options) {
  return (dispatch, getState) => {
    dispatch(initPeaks(smData, options));

    const { peaksInstance } = getState();

    if (peaksInstance.events !== undefined) {
      peaksInstance.events.subscribe(segment => {
        dispatch(changeSegment(segment));
      });
    }
  };
}

export function initPeaks(smData, options) {
  return {
    type: types.INIT_PEAKS,
    smData,
    options
  };
}

export function insertNewSegment(span) {
  return {
    type: types.INSERT_SEGMENT,
    payload: span
  };
}

export function deleteSegment(item) {
  return {
    type: types.DELETE_SEGMENT,
    payload: item
  };
}

export function activateSegment(id) {
  return {
    type: types.ACTIVATE_SEGMENT,
    payload: id
  };
}

export function revertSegment(clone) {
  return {
    type: types.REVERT_SEGMENT,
    payload: clone
  };
}

export function saveSegment(state) {
  return {
    type: types.SAVE_SEGMENT,
    payload: state
  };
}

export function updateSegment(segment, state) {
  return {
    type: types.UPDATE_SEGMENT,
    segment,
    state
  };
}

export function changeSegment(segment) {
  return {
    type: types.DRAG_SEGMENT,
    payload: segment
  };
}

export function insertTempSegment() {
  return {
    type: types.TEMP_INSERT_SEGMENT
  };
}

export function deleteTempSegment(id) {
  return {
    type: types.TEMP_DELETE_SEGMENT,
    payload: id
  };
}
