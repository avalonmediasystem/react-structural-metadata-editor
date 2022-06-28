import * as types from '../actions/types';
import { isEmpty } from 'lodash';
import { setAlert } from './forms';
import APIUtils from '../api/Utils';
import { configureAlert } from '../services/alert-status';

const apiUtils = new APIUtils();

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
  status
});


export const fetchManifestSuccess = () => ({
  type: types.FETCH_MANIFEST_SUCCESS
})

/**
 * Fetch the manifest from the given URL and handle relavant
 * errors and update manifest in the Redux store
 * @param {String} manifestURL - URL of the manifest
 */
export function fetchManifest(manifestURL) {
  return async (dispatch, getState) => {
    try {
      const response = await apiUtils.getRequest(manifestURL);

      if (!isEmpty(response.data)) {
        dispatch(setManifest(response.data));
      }

      dispatch(fetchManifestSuccess());
    } catch (error) {
      console.log('TCL: Manifest -> catch -> error', error);

      let status = error.response !== undefined ? error.response.status : -9;
      dispatch(handleManifestError(1, status));
      let alert = configureAlert(status);
      dispatch(setAlert(alert));
    }
  }
}
