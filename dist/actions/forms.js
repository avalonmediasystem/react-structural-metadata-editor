"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeAlert = exports.handleStructureError = exports.handleEditingTimespans = exports.clearExistingAlerts = void 0;
exports.retrieveStreamMedia = retrieveStreamMedia;
exports.updateStructureStatus = exports.streamMediaSuccess = exports.setStreamMediaLoading = exports.setStreamMediaError = exports.setAlert = exports.retrieveWaveformSuccess = exports.retrieveStructureSuccess = void 0;
var types = _interopRequireWildcard(require("./types"));
var _hls = _interopRequireDefault(require("hls.js"));
var _uuid = require("uuid");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
;

/**
 * Enable/disable other editing actions when editing a list item
 * @param {Integer} code - choose from; 1(true) | 0(false)
 */
var handleEditingTimespans = exports.handleEditingTimespans = function handleEditingTimespans(code) {
  var valid = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  return function (dispatch) {
    dispatch({
      type: types.IS_EDITING_TIMESPAN,
      code: code
    });
    // Remove dismissible alerts when a CRUD action has been initiated
    // given editing is starting (code = 1) and structure is validated.
    if (code == 1 && valid) {
      dispatch(clearExistingAlerts());
    }
  };
};
var setAlert = exports.setAlert = function setAlert(alert) {
  return function (dispatch) {
    var id = (0, _uuid.v4)();
    alert.id = id;
    dispatch({
      type: types.SET_ALERT,
      alert: alert
    });
    if (alert.delay > 0 && !alert.persistent) {
      setTimeout(function () {
        return dispatch(removeAlert(id));
      }, alert.delay);
    }
  };
};
var removeAlert = exports.removeAlert = function removeAlert(id) {
  return {
    type: types.REMOVE_ALERT,
    id: id
  };
};
var clearExistingAlerts = exports.clearExistingAlerts = function clearExistingAlerts() {
  return {
    type: types.CLEAR_EXISTING_ALERTS
  };
};
var retrieveStructureSuccess = exports.retrieveStructureSuccess = function retrieveStructureSuccess() {
  return {
    type: types.RETRIEVE_STRUCTURE_SUCCESS
  };
};

/**
 * Initially the structure status isSaved (true) and changed to false
 * when an edit action is performed on the structure
 * @param {Integer} code - choose from; 1(true -> saved) | 0(false -> not saved)
 */
var updateStructureStatus = exports.updateStructureStatus = function updateStructureStatus(code) {
  return {
    type: types.UPDATE_STRUCTURE_STATUS,
    payload: code
  };
};
var retrieveWaveformSuccess = exports.retrieveWaveformSuccess = function retrieveWaveformSuccess() {
  return {
    type: types.RETRIEVE_WAVEFORM_SUCCESS
  };
};

/**
 * Set the error status code for fetching structure.json in Redux
 * store. This status code is then used to create the alert.
 * @param {Integer} flag - choose from; 1(ture -> HTTP error occurred) |
 * 0(false ->No error). No error -> structureStatus is set to null
 * @param {Integer} status - HTTP error status code
 */
var handleStructureError = exports.handleStructureError = function handleStructureError(flag, status) {
  return {
    type: types.HANDLE_STRUCTURE_ERROR,
    flag: flag,
    status: status
  };
};

/**
 * streamMediaError flag in redux store is set to true when Hls.js runs out
 * of retries and still cannot load the stream media
 * @param {Integer} code - choose from; 1(true -> failed) | 0(false -> success)
 */
var setStreamMediaError = exports.setStreamMediaError = function setStreamMediaError(code) {
  return {
    type: types.STREAM_MEDIA_ERROR,
    payload: code
  };
};
var streamMediaSuccess = exports.streamMediaSuccess = function streamMediaSuccess() {
  return {
    type: types.STREAM_MEDIA_SUCCESS
  };
};
var setStreamMediaLoading = exports.setStreamMediaLoading = function setStreamMediaLoading(flag) {
  return {
    type: types.STREAM_MEDIA_LOADING,
    flag: flag
  };
};
function retrieveStreamMedia(audioFile, mediaPlayer) {
  var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return function (dispatch, getState) {
    if (_hls["default"].isSupported()) {
      var config = {
        xhrSetup: function xhrSetup(xhr) {
          xhr.withCredentials = opts.withCredentials;
        },
        /*
          Sometimes captions/subtitles in Avalon fails to render and this makes
          HLS streaming to break resulting in a indefinite blocking loading spinner.
          Therefore, disable captions/subtitles rendering in HLS.js setup.
        */
        subtitleTrackController: null,
        enableWebVTT: false,
        enableIMSC1: false,
        enableCEA708Captions: false,
        renderTextTracksNatively: false
      };
      var hls = new _hls["default"](config);
      var _getState = getState(),
        state = _getState.state;
      // Bind media player
      hls.attachMedia(mediaPlayer);
      // MEDIA_ATTACHED event is fired by hls object once MediaSource is ready
      hls.on(_hls["default"].Events.MEDIA_ATTACHED, function () {
        hls.loadSource(audioFile);
        // BUFFER_CREATED event is fired when fetching the media stream is successful
        hls.on(_hls["default"].Events.BUFFER_CREATED, function () {
          hls.once(_hls["default"].Events.BUFFER_APPENDED, function () {
            /**
             * Only set stream status as successful once BUFFER_APPENDED event is fired in HLS,
             * if state is not undefined. With the modal use in Avalon for SME, the component can
             * be unmounted by closing the modal before the async API requests and HLS buffer 
             * gets appended. And this makes the Redux state incosistent  when the SME modal is
             * opened next time making the re-initializing of Peaks.js to fail.
             * 
             * This starts the Peaks initialization, in which the presence of the player
             * is required.
             */
            if (state != undefined) {
              dispatch(streamMediaSuccess());
            }
          });
        });
      });

      // ERROR event is fired when fetching media stream is not successful
      hls.on(_hls["default"].Events.ERROR, function (event, data) {
        // When there are errors in the HLS build this block catches it and flashes
        // the warning message for a split second. The ErrorType for these errors is
        // OTHER_ERROR. Issue in HLS.js: https://github.com/video-dev/hls.js/issues/2435
        if (data.fatal) {
          dispatch(setStreamMediaLoading(1));
          if (data.type !== _hls["default"].ErrorTypes.OTHER_ERROR) {
            switch (data.type) {
              case _hls["default"].ErrorTypes.MEDIA_ERROR:
                console.log('TCL: forms action -> retrieveStreamMedia -> HLS:MEDIA_ERROR trying to recover:', data);
                hls.recoverMediaError();
                dispatch(setStreamMediaLoading(1));
                break;
              default:
                // cannot recover
                hls.off(_hls["default"].Events.ERROR);
                dispatch(setStreamMediaLoading(0));
                break;
            }
          } else {
            hls.off(_hls["default"].Events.ERROR);
            dispatch(setStreamMediaLoading(0));
          }
        }
      });
    }
  };
}