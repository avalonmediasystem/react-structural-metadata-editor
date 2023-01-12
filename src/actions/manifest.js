import * as types from './types';
import { isEmpty } from 'lodash';
import { handleStructureError, setAlert } from './forms';
import APIUtils from '../api/Utils';
import { configureAlert } from '../services/alert-status';
import { buildSMUI } from './sm-data';
import { getMediaInfo, parseStructureToJSON } from '../services/iiif-parser';

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
export const setMediaInfo = (src, duration) => ({
  type: types.SET_MANIFEST_MEDIAINFO,
  src,
  duration,
});
