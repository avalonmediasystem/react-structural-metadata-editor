"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setWaveformInfo = exports.setMediaInfo = exports.setManifest = exports.initManifest = exports.handleManifestError = exports.fetchManifestSuccess = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var types = _interopRequireWildcard(require("./types"));

var _lodash = require("lodash");

var _Utils = _interopRequireDefault(require("../api/Utils"));

var _StructuralMetadataUtils = _interopRequireDefault(require("../services/StructuralMetadataUtils"));

var _alertStatus = require("../services/alert-status");

var _smData = require("./sm-data");

var _iiifParser = require("../services/iiif-parser");

var _forms = require("./forms");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var apiUtils = new _Utils["default"]();
var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();

var initManifest = function initManifest(manifestURL, canvasIndex) {
  return /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(dispatch, getState) {
      var smData, duration, mediaInfo, waveformInfo, response, alert, status, _alert;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              smData = [];
              duration = 0;
              mediaInfo = {};
              waveformInfo = '';
              _context.prev = 4;
              _context.next = 7;
              return apiUtils.getRequest(manifestURL);

            case 7:
              response = _context.sent;

              if (!(0, _lodash.isEmpty)(response.data)) {
                mediaInfo = (0, _iiifParser.getMediaInfo)(response.data, canvasIndex);
                waveformInfo = (0, _iiifParser.getWaveformInfo)(response.data, canvasIndex); // Set manifest info in state

                dispatch(setManifest(response.data));
                dispatch(setWaveformInfo(waveformInfo));
                dispatch(setMediaInfo(mediaInfo.src, mediaInfo.duration, mediaInfo.isStream, mediaInfo.isVideo));
                smData = (0, _iiifParser.parseStructureToJSON)(response.data, mediaInfo.duration, canvasIndex);
                duration = mediaInfo.duration;
              }

              if (smData.length > 0) {
                dispatch((0, _forms.retrieveStructureSuccess)());
              } else {
                dispatch((0, _forms.handleStructureError)(1, -2));
                alert = (0, _alertStatus.configureAlert)(-2);
                dispatch((0, _forms.setAlert)(alert));
              }

              dispatch(fetchManifestSuccess()); // Initialize Redux state variable with structure

              dispatch((0, _smData.buildSMUI)(smData, duration));
              dispatch((0, _smData.saveInitialStructure)(smData)); // Mark the top element as 'root'

              structuralMetadataUtils.markRootElement(smData);
              _context.next = 23;
              break;

            case 16:
              _context.prev = 16;
              _context.t0 = _context["catch"](4);
              console.log('TCL: manifest -> initManifest() -> error', _context.t0); // Update manifest error in the redux store

              status = -9;
              dispatch(handleManifestError(1, status));
              _alert = (0, _alertStatus.configureAlert)(status);
              dispatch((0, _forms.setAlert)(_alert));

            case 23:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[4, 16]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();
};
/**
 * Set manifest content fetched from the given manifestURL
 * in the props from the host application
 * @param {Object} manifest - manifest from given URL in props
 */


exports.initManifest = initManifest;

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

var setMediaInfo = function setMediaInfo(src, duration, isStream, isVideo) {
  return {
    type: types.SET_MANIFEST_MEDIAINFO,
    src: src,
    duration: duration,
    isStream: isStream,
    isVideo: isVideo
  };
};
/**
 * Set waveform file URL in the Redux store
 * @param {String} waveformUrl - URL of the waveform in Canvas
 * @returns 
 */


exports.setMediaInfo = setMediaInfo;

var setWaveformInfo = function setWaveformInfo(waveformUrl) {
  return {
    type: types.SET_CANVAS_WAVEFORMINFO,
    waveformUrl: waveformUrl
  };
};

exports.setWaveformInfo = setWaveformInfo;