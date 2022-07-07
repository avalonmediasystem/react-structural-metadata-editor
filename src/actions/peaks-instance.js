import * as types from './types';
import { isEmpty } from 'lodash';
import WaveformDataUtils from '../services/WaveformDataUtils';

const waveformUtils = new WaveformDataUtils();

/**
 * Initialize Peaks instance from structure
 * @param {Object} peaks - initialized peaks instance
 * @param {Number} duration - duration of the media file
 */
export function initializeSMDataPeaks(
  peaks,
  duration
) {
  return (dispatch, getState) => {
    const { structuralMetadata } = getState();
    if (peaks) {
      // Create segments from structural metadata
      const segments = waveformUtils.initSegments(structuralMetadata.smData, duration);

      // Add segments to peaks instance
      segments.map((seg) => peaks.segments.add(seg));
      dispatch(initPeaks(peaks, duration));

      // Subscribe to Peaks events
      const { peaksInstance } = getState();
      if (!isEmpty(peaksInstance.events)) {
        const { dragged } = peaksInstance.events;
        // for segment editing using handles
        if (dragged) {
          dragged.subscribe((eProps) => {
            // startTimeChanged = true -> handle at the start of the segment is being dragged
            // startTimeChanged = flase -> handle at the end of the segment is being dragged
            const [segment, startTimeChanged] = eProps;
            dispatch(dragSegment(segment.id, startTimeChanged, 1));
          });
          // Mark peaks is ready
          dispatch(peaksReady(true));
        }
      }
    }
  };
}

export function initPeaks(peaksInstance, duration) {
  return {
    type: types.INIT_PEAKS,
    peaksInstance,
    duration,
  };
}

export function peaksReady(ready) {
  return {
    type: types.PEAKS_READY,
    payload: ready,
  };
}
export function insertNewSegment(span) {
  return {
    type: types.INSERT_SEGMENT,
    payload: span,
  };
}

export function deleteSegment(item) {
  return {
    type: types.DELETE_SEGMENT,
    payload: item,
  };
}

export function activateSegment(id) {
  return {
    type: types.ACTIVATE_SEGMENT,
    payload: id,
  };
}

export function insertPlaceholderSegment(item, wrapperSpans) {
  return {
    type: types.INSERT_PLACEHOLDER,
    item,
    wrapperSpans,
  };
}

export function revertSegment(clone) {
  return {
    type: types.REVERT_SEGMENT,
    payload: clone,
  };
}

export function saveSegment(state) {
  return {
    type: types.SAVE_SEGMENT,
    payload: state,
  };
}

export function updateSegment(segment, state) {
  return {
    type: types.UPDATE_SEGMENT,
    segment,
    state,
  };
}

export function dragSegment(segmentID, startTimeChanged, flag) {
  return {
    type: types.IS_DRAGGING,
    segmentID,
    startTimeChanged,
    flag,
  };
}

export function insertTempSegment() {
  return {
    type: types.TEMP_INSERT_SEGMENT,
  };
}

export function deleteTempSegment(id) {
  return {
    type: types.TEMP_DELETE_SEGMENT,
    payload: id,
  };
}
