import * as types from './types';
import { isEmpty } from 'lodash';
import APIUtils from '../api/Utils';
import { buildSMUI } from './sm-data';
import { retrieveStructureSuccess, handleStructureError } from './forms';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';

const apiUtils = new APIUtils();
const structuralMetadataUtils = new StructuralMetadataUtils();

/**
 * Fetch structure.json and initialize Peaks
 * @param {String} baseURL - base URL of masterfile location
 * @param {String} masterFileID - ID of the masterfile relevant to media element
 * @param {JSON String} initStructure - structure with root element when empty
 * @param {Object} options - peaks options
 * @param {Boolean} isError - flag inidicating an error happened when fetching waveform.json
 */
export function initializeSMDataPeaks(
  baseURL,
  masterFileID,
  initStructure,
  options,
  duration,
  isError
) {
  return async (dispatch, getState) => {
    try {
      const response = await apiUtils.getRequest(
        baseURL,
        masterFileID,
        'structure.json'
      );
      let smData = [];

      if (isEmpty(response.data)) {
        smData = structuralMetadataUtils.addUUIds([JSON.parse(initStructure)]);
      } else {
        smData = structuralMetadataUtils.addUUIds([response.data]);
      }

      // Mark the top element as 'root'
      structuralMetadataUtils.markRootElement(smData);

      // Initialize Redux state variable with structure
      dispatch(buildSMUI(smData, duration));

      // Update redux-store flag for structure file retrieval
      dispatch(retrieveStructureSuccess());
      if (!isError) {
        dispatch(initPeaks(smData, options));

        const { peaksInstance } = getState();

        // Subscribe to Peaks event for dragging handles in a segment
        if (peaksInstance.events !== undefined) {
          peaksInstance.events.subscribe(segment => {
            dispatch(dragSegment(segment, 1));
          });
        }
      }
    } catch (error) {
      console.log('TCL: Structure -> }catch -> error', error);

      // Check whether fetching waveform.json was successful
      if (!isError) {
        // Initialize Peaks when structure.json is not found to show an empty waveform
        dispatch(initPeaks([], options));
      }

      let status = error.response !== undefined ? error.response.status : -2;
      dispatch(handleStructureError(1, status));
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

export function dragSegment(segment, flag) {
  return {
    type: types.IS_DRAGGING,
    segment,
    flag
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
