import * as types from './types';
import { isEmpty } from 'lodash';
import Peaks from 'peaks.js';

import APIUtils from '../api/Utils';
import { configureAlert } from '../services/alert-status';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';
import WaveformDataUtils from '../services/WaveformDataUtils';
import {
  getMediaInfo,
  getWaveformInfo,
  parseStructureToJSON
} from '../services/iiif-parser';

import { buildSMUI, saveInitialStructure } from './sm-data';
import {
  retrieveStructureSuccess,
  handleStructureError,
  setAlert,
  retrieveWaveformSuccess,
} from './forms';
import {
  fetchManifestSuccess,
  handleManifestError,
  setManifest,
  setMediaInfo
} from './manifest';

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
export function initializePeaks(
  peaksOptions,
  manifestURL,
  canvasIndex,
  initStructure,
) {
  return async (dispatch, getState) => {
    let smData = [];
    let duration = 0;
    let mediaInfo = {};
    let waveformInfo = [];

    try {
      const response = await apiUtils.getRequest(manifestURL);

      if (!isEmpty(response.data)) {
        mediaInfo = getMediaInfo(response.data, canvasIndex);
        waveformInfo = getWaveformInfo(response.data, canvasIndex);

        dispatch(setManifest(response.data));
        dispatch(setMediaInfo(mediaInfo.src, mediaInfo.duration));
        smData = parseStructureToJSON(response.data, initStructure, mediaInfo.duration);
        duration = mediaInfo.duration;
      }

      if (smData.length > 0) {
        dispatch(retrieveStructureSuccess());
      } else {
        dispatch(handleStructureError(1, -2));
        let alert = configureAlert(-2);
        dispatch(setAlert(alert));
      }
      dispatch(fetchManifestSuccess());

      // Initialize Redux state variable with structure
      dispatch(buildSMUI(smData, duration));
      dispatch(saveInitialStructure(smData));

      // Mark the top element as 'root'
      structuralMetadataUtils.markRootElement(smData);

      if (waveformInfo.length > 0) {
        buildPeaksInstance(
          waveformInfo[0],
          peaksOptions,
          smData,
          duration,
          dispatch, getState);
      } else {
        let alert = configureAlert(-3);
        dispatch(setAlert(alert));
      }
    } catch (error) {
      console.log('TCL: peaks-instance -> initializePeaks() -> error', error);

      // Update manifest error in the redux store
      let status = error.response !== undefined ? error.response.status : -9;
      dispatch(handleManifestError(1, status));

      // Create an alert to be displayed in the UI
      let alert = configureAlert(status);
      dispatch(setAlert(alert));
    }
  };
}

async function buildPeaksInstance(
  waveformURL,
  peaksOptions,
  smData,
  duration,
  dispatch,
  getState) {
  try {
    // Check whether the waveform.json exists in the server
    await apiUtils.headRequest(waveformURL);

    // Set waveform URI
    peaksOptions.dataUri = {
      json: waveformURL,
    };

    // Update redux-store flag for waveform file retrieval
    dispatch(retrieveWaveformSuccess());
  } catch (error) {
    // Enable the flash message alert
    console.log('TCL: peaks-instance -> buildPeaksInstance() -> error', error);
    let status = null;

    // Pull status code out of error response/request
    if (error.response !== undefined) {
      status = error.response.status;
      if (status == 404) {
        peaksOptions.dataUri = {
          json: `${waveformURL}?empty=true`,
        };
        status = -7; // for persistent missing waveform data alert
      }
    } else if (error.request !== undefined) {
      status = -3;
    }

    const alert = configureAlert(status);
    dispatch(setAlert(alert));
  }

  let makePeaksCallback = (err, peaks) => {
    if (err)
      console.error(
        'TCL: peaks-instance -> buildPeaksInstance() -> Peaks.init ->',
        err
      );

    // Create segments from structural metadata
    const segments = waveformUtils.initSegments(smData, duration);

    console.log(peaks);
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
  };

  // Initialize Peaks intance with the given options
  Peaks.init(peaksOptions, makePeaksCallback);
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
