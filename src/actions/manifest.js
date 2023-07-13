import * as types from './types';
import { isEmpty } from 'lodash';
import APIUtils from '../api/Utils';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';

import { configureAlert } from '../services/alert-status';
import { buildSMUI, saveInitialStructure } from './sm-data';
import { getMediaInfo, parseStructureToJSON } from '../services/iiif-parser';
import {
  retrieveStructureSuccess,
  handleStructureError,
  setAlert,
} from './forms';

const apiUtils = new APIUtils();
const structuralMetadataUtils = new StructuralMetadataUtils();

export const initManifest = ( manifestURL, canvasIndex ) => {
  return async (dispatch, getState) => {
    let smData = [];
    let duration = 0;
    let mediaInfo = {};
    try {
      const response = await apiUtils.getRequest(manifestURL);
      if (!isEmpty(response.data)) {
        mediaInfo = getMediaInfo(response.data, canvasIndex);
  
        dispatch(setManifest(response.data));
        dispatch(setMediaInfo(mediaInfo.src, mediaInfo.duration, mediaInfo.isStream, mediaInfo.isVideo));
        smData = parseStructureToJSON(response.data, mediaInfo.duration, canvasIndex);
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
    } catch (error) {
      console.log('TCL: manifest -> initManifest() -> error', error);
      // Update manifest error in the redux store
      let status = error.response !== undefined ? error.response.status : -9;
      dispatch(handleManifestError(1, status));
      let alert = configureAlert(status);
      dispatch(setAlert(alert));
    }
  }
}

/**
 * Set manifest content fetched from the given manifestURL
 * in the props from the host application
 * @param {Object} manifest - manifest from given URL in props
 */
export const setManifest = (manifest) => ({
  type: types.SET_MANIFEST,
  manifest
});

/**
 * Set the error status code for fetching IIIF manifest in Redux
 * store. This status code is then used to create the alert.
 * @param {Integer} flag - choose from; 1(ture -> HTTP error occurred) |
 *        0(false -> No error). No error -> manifestStatus is set to null
 * @param {Integer} status - HTTP error status code
 */
export const handleManifestError = (flag, status) => ({
  type: types.FETCH_MANIFEST_ERROR,
  flag,
  status,
});

/**
 * Update Redux store flag on successful manifest retreival
 * from the given URL
 */
export const fetchManifestSuccess = () => ({
  type: types.FETCH_MANIFEST_SUCCESS,
});

/**
 * Set media file related info parsed from the manifest in
 * the Redux store
 * @param {String} src - media file URI
 * @param {Number} duration - duration of the media file
 */
export const setMediaInfo = (src, duration, isStream, isVideo) => ({
  type: types.SET_MANIFEST_MEDIAINFO,
  src,
  duration,
  isStream,
  isVideo
});
