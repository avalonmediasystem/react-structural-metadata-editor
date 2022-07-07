import * as types from '../actions/types';
import { isEmpty } from 'lodash';
import { setAlert } from './forms';
import APIUtils from '../api/Utils';
import { configureAlert } from '../services/alert-status';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';
import { setSMData } from './sm-data';
import { getMediaInfo, parseStructureToJSON } from '../services/iiif-services/iiif-parser';

const apiUtils = new APIUtils();
const smUtils = new StructuralMetadataUtils();

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
 * Parse `structure` in manifest into the nested JSON object
 * the structure navigation components can utilize to display 
 * structure on the page
 */
export const setManifestStructure = (structure) => ({
  type: types.SET_MANIFEST_STRUCTURE,
  structure,
});

/**
 * Set media file related info parsed from the manifest in
 * the Redux store
 * @param {String} mediaSrc - media file URI
 * @param {Number} duration - duration of the media file
 */
export const setMediaInfo = (mediaSrc, duration) => ({
  type: types.SET_MANIFEST_MEDIAINFO,
  mediaSrc,
  duration,
});

/**
 * Fetch the manifest from the given URL and handle relavant
 * errors and update manifest in the Redux store
 * @param {String} manifestURL - URL of the manifest
 */
export function fetchManifest(manifestURL) {
  return async (dispatch, getState) => {
    try {
      const response = await apiUtils.getRequest(manifestURL);

      const manifest = response.data;
      if (!isEmpty(manifest)) {
        dispatch(setManifest(manifest));
      }

      const { mediaSrc, duration } = getMediaInfo(manifest);
      dispatch(setMediaInfo(mediaSrc, duration));

      const { structureJSON, structureIsValid } = parseStructureToJSON(manifest, duration);

      dispatch(setManifestStructure(structureJSON));
      dispatch(setSMData(structureJSON, structureIsValid));

      dispatch(fetchManifestSuccess());
    } catch (error) {
      console.log('TCL: Manifest -> catch -> error', error);

      // Update manifest error in the redux store
      let status = error.response !== undefined ? error.response.status : -9;
      dispatch(handleManifestError(1, status));

      // Create an alert to be displayed in the UI
      let alert = configureAlert(status);
      dispatch(setAlert(alert));
    }
  };
}
