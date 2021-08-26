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

const apiUtils = new APIUtils();
const structuralMetadataUtils = new StructuralMetadataUtils();

/**
 * Fetch structure.json and initialize Peaks
 * @param {String} baseURL - base URL of masterfile location
 * @param {String} masterFileID - ID of the masterfile relevant to media element
 * @param {JSON} initStructure - structure with root element when empty
 * @param {Object} options - peaks options
 */
export function initializeSMDataPeaks(
  baseURL,
  masterFileID,
  initStructure,
  options,
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
      const response = await apiUtils.getRequest(
        baseURL,
        masterFileID,
        'structure.json'
      );

      if (!isEmpty(response.data)) {
        smData = structuralMetadataUtils.addUUIds([response.data]);
      }
      // Update redux-store flag for structure file retrieval
      dispatch(retrieveStructureSuccess());
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
    dispatch(initPeaks(smData, options, duration));

    const { peaksInstance, structuralMetadata } = getState();

    dispatch(saveInitialStructure(structuralMetadata.smData));

    // Subscribe to Peaks events
    if (!isEmpty(peaksInstance.events)) {
      const { dragged, ready } = peaksInstance.events;
      // for segment editing using handles
      if (dragged) {
        dragged.subscribe((eProps) => {
          // startTimeChanged = true -> handle at the start of the segment is being dragged
          // startTimeChanged = flase -> handle at the end of the segment is being dragged
          const [segment, startTimeChanged] = eProps;
          dispatch(dragSegment(segment.id, startTimeChanged, 1));
        });
      }
      if (ready) {
        // peaks ready event
        peaksInstance.events.ready.subscribe(() => {
          dispatch(peaksReady(true));
        });
      }
    }
  };
}

export function initPeaks(smData, options, duration) {
  return {
    type: types.INIT_PEAKS,
    smData,
    options,
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

export function insertPlaceholderSegment(item, index) {
  return {
    type: types.INSERT_PLACEHOLDER,
    item,
    index,
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
