import * as types from './types';
import { isEmpty } from 'lodash';
import Peaks from 'peaks.js';

import APIUtils from '../api/Utils';
import { configureAlert } from '../services/alert-status';
import WaveformDataUtils from '../services/WaveformDataUtils';
import { setWaveformOptions } from '../services/utils';
import { getWaveformInfo } from '../services/iiif-parser';
import {
  setAlert,
  retrieveWaveformSuccess,
} from './forms';

const waveformUtils = new WaveformDataUtils();
const apiUtils = new APIUtils();

/**
 * Initialize Peaks instance
 * @param {Object} options - peaks options
 * @param {Array} smData - array of structures from the manifest
 * @param {Number} canvasIndex - index of the current canvas
 */
export function initializePeaks(
  peaksOptions,
  smData,
  canvasIndex,
) {
  return async (dispatch, getState) => {
    let duration = 0;
    let mediaInfo = {};
    let waveformInfo;

    const { manifest } = getState();

    if (manifest) {
      mediaInfo = manifest.mediaInfo;
      duration = mediaInfo.duration;
      waveformInfo = getWaveformInfo(manifest.manifest, canvasIndex);
    }

    // Make waveform more zoomed-in for shorter media and less for larger media
    if (duration < 31) {
      peaksOptions.zoomLevels = [170, 256, 512];
    } else if (duration > 31 && duration < 60) {
      peaksOptions.zoomLevels = [512, 1024];
    } else {
      peaksOptions.zoomLevels = [512, 1024, 2048, 4096];
    }

    if (waveformInfo != null) {
      peaksOptions = await setWaveformInfo(waveformInfo, mediaInfo, peaksOptions, dispatch);
    }
    else {
      const { opts, alertStatus } = await setWaveformOptions(mediaInfo, peaksOptions);
      peaksOptions = opts;
      if (alertStatus != null) {
        let alert = configureAlert(alertStatus);
        dispatch(setAlert(alert));
      }
    }
    buildPeaksInstance(peaksOptions, smData, duration, dispatch, getState);
  };
}

async function setWaveformInfo(waveformURL, mediaInfo, peaksOptions, dispatch, status = null) {
  try {
    // Check whether the waveform.json exists in the server
    await apiUtils.headRequest(waveformURL);
    // Set waveform URI
    peaksOptions.dataUri = { json: waveformURL };
    // Update redux-store flag for waveform file retrieval
    dispatch(retrieveWaveformSuccess());
  } catch (error) {
    // Enable the flash message alert
    console.log('TCL: peaks-instance -> setWaveformInfo() -> error', error);
    // Pull status code out of error response/request
    if (error.response !== undefined) {
      status = error.response.status;
      if (status == 404) {
        peaksOptions.dataUri = { json: `${waveformURL}?empty=true` };
        status = -7;
      }
    } else if (error.request !== undefined) {
      // Set waveform data option
      const { opts, alertStatus } = await setWaveformOptions(mediaInfo, peaksOptions);
      peaksOptions = opts;
      status = alertStatus;
    }
  }

  if (status != null) {
    const alert = configureAlert(status);
    dispatch(setAlert(alert));
  }
  return peaksOptions;
}

async function buildPeaksInstance(peaksOptions, smData, duration, dispatch, getState) {
  // Initialize Peaks intance with the given options
  Peaks.init(peaksOptions, (err, peaks) => {
    if (err)
      console.error(
        'TCL: peaks-instance -> buildPeaksInstance() -> Peaks.init ->',
        err
      );

    // Create segments from structural metadata
    const segments = waveformUtils.initSegments(smData, duration);

    if (peaks) {
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
            // startMarker = true -> handle at the start of the segment is being dragged
            // startMarker = flase -> handle at the end of the segment is being dragged
            const { segment, startMarker } = eProps;
            dispatch(dragSegment(segment.id, startMarker, 1));
          });
          // Mark peaks is ready
          dispatch(peaksReady(true));
        }
      }
    }
  });
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
