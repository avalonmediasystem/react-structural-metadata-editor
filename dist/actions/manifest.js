"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchManifest = fetchManifest;
exports.setMediaInfo = exports.setManifest = exports.handleManifestError = exports.fetchManifestSuccess = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var types = _interopRequireWildcard(require("../actions/types"));

var _lodash = require("lodash");

var _forms = require("./forms");

var _Utils = _interopRequireDefault(require("../api/Utils"));

var _alertStatus = require("../services/alert-status");

var _smData = require("./sm-data");

var _iiifParser = require("../services/iiif-parser");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var apiUtils = new _Utils["default"]();
/**
 * Set manifest content fetched from the given manifestURL
 * in the props from the host application
 * @param {Object} manifest - manifest from given URL in props
 */

var setManifest = function setManifest(manifest) {
  return {
    type: types.SET_MANIFEST,
    manifest: manifest
  };
};
/**
 * Set the error status code for fetching IIIF manifest in Redux
 * store. This status code is then used to create the alert.
 * @param {Integer} flag - choose from; 1(ture -> HTTP error occurred) |
 *        0(false -> No error). No error -> manifestStatus is set to null
 * @param {Integer} status - HTTP error status code
 */


exports.setManifest = setManifest;

var handleManifestError = function handleManifestError(flag, status) {
  return {
    type: types.FETCH_MANIFEST_ERROR,
    flag: flag,
    status: status
  };
};
/**
 * Update Redux store flag on successful manifest retreival
 * from the given URL
 */


exports.handleManifestError = handleManifestError;

var fetchManifestSuccess = function fetchManifestSuccess() {
  return {
    type: types.FETCH_MANIFEST_SUCCESS
  };
};
/**
 * Set media file related info parsed from the manifest in
 * the Redux store
 * @param {String} src - media file URI
 * @param {Number} duration - duration of the media file
 */


exports.fetchManifestSuccess = fetchManifestSuccess;

var setMediaInfo = function setMediaInfo(src, duration) {
  return {
    type: types.SET_MANIFEST_MEDIAINFO,
    src: src,
    duration: duration
  };
};
/**
 * Fetch the manifest from the given URL and handle relavant
 * errors and update manifest in the Redux store
 * @param {String} manifestURL - URL of the manifest
 * @param {Object} initStructure - initial structure if manifest does not
 * @param {Number} canvasIndex - index of the current canvas
 * have structures in it
 */


exports.setMediaInfo = setMediaInfo;

function fetchManifest(manifestURL, initStructure, canvasIndex) {
  return /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(dispatch, getState) {
      var response, manifest, _getMediaInfo, src, duration, structureJSON, structStatus, alert, status, _alert;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return apiUtils.getRequest(manifestURL);

            case 3:
              response = _context.sent;
              manifest = response.data;

              if (!(0, _lodash.isEmpty)(manifest)) {
                dispatch(setManifest(manifest));
              }

              _getMediaInfo = (0, _iiifParser.getMediaInfo)(manifest, canvasIndex), src = _getMediaInfo.src, duration = _getMediaInfo.duration;
              dispatch(setMediaInfo(src, duration));
              structureJSON = (0, _iiifParser.parseStructureToJSON)(manifest, initStructure, duration);

              if (structureJSON.length > 0) {
                dispatch((0, _smData.buildSMUI)(structureJSON, duration, true));
              } else {
                structStatus = -2;
                dispatch((0, _forms.handleStructureError)(1, structStatus)); // Create an alert to be displayed in the UI

                alert = (0, _alertStatus.configureAlert)(structStatus);
                dispatch((0, _forms.setAlert)(alert));
              }

              dispatch(fetchManifestSuccess());
              _context.next = 20;
              break;

            case 13:
              _context.prev = 13;
              _context.t0 = _context["catch"](0);
              console.log('TCL: Manifest -> catch -> error', _context.t0); // Update manifest error in the redux store

              status = _context.t0.response !== undefined ? _context.t0.response.status : -9;
              dispatch(handleManifestError(1, status)); // Create an alert to be displayed in the UI

              _alert = (0, _alertStatus.configureAlert)(status);
              dispatch((0, _forms.setAlert)(_alert));

            case 20:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[0, 13]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();
}