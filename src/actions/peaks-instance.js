import * as types from './types';
import { isEmpty } from 'lodash';
import APIUtils from '../api/Utils';
import { buildSMUI, saveInitialStructure } from './sm-data';
import {
  retrieveStructureSuccess,
  handleStructureError,
  setAlert,
} from './forms';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';
import { configureAlert } from '../services/alert-status';
// import Peaks from 'peaks.js';
import WaveformDataUtils from '../services/WaveformDataUtils';
import { getMediaInfo, parseStructureToJSON } from '../services/iiif-parser';
import { fetchManifestSuccess } from './manfiest';

const waveformUtils = new WaveformDataUtils();
const apiUtils = new APIUtils();
const structuralMetadataUtils = new StructuralMetadataUtils();

/**
 * Fetch structure.json and initialize Peaks
 * @param {Object} peaks - initialized peaks instance
 * @param {String} structureURL - URL of the structure.json
 * @param {JSON} initStructure - structure with root element when empty
 * @param {Object} options - peaks options
 */
export function initializeSMDataPeaks(
  peaks,
  manifestURL,
  canvasIndex,
  initStructure,
  duration
) {
  return async (dispatch, getState) => {
    let smData = [];
    if (typeof initStructure === 'string' && initStructure !== '') {
      smData = structuralMetadataUtils.addUUIds([JSON.parse(initStructure)]);
    } else if (!isEmpty(initStructure)) {
      smData = structuralMetadataUtils.addUUIds([initStructure]);
    }
    try {
      const manifestRes = await apiUtils.getRequest(manifestURL);

      if (!isEmpty(manifestRes.data)) {
        const { src, duration } = getMediaInfo(manifestRes.data, canvasIndex);
        smData = parseStructureToJSON(manifestRes.data, duration);
      }

      if (smData.length > 0) {
        dispatch(retrieveStructureSuccess());
      } else {
        dispatch(handleStructureError(1, -2));
        let alert = configureAlert(-2);
        dispatch(setAlert(alert));
      }
      dispatch(fetchManifestSuccess());
    } catch (error) {
      console.log('TCL: Structure -> }catch -> error', error);

      let status = error.response !== undefined ? error.response.status : -2;
      dispatch(handleStructureError(1, status));
      let alert = configureAlert(status);
      dispatch(setAlert(alert));
    }

    // Mark the top element as 'root'
    structuralMetadataUtils.markRootElement(smData);

    // Initialize Redux state variable with structure
    dispatch(buildSMUI(smData, duration));
    dispatch(saveInitialStructure(smData));

    if (peaks) {
      // Create segments from structural metadata
      const segments = waveformUtils.initSegments(smData, duration);

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
