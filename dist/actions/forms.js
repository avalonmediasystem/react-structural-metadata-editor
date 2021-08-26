"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.retrieveStreamMedia = retrieveStreamMedia;
exports.streamMediaSuccess = exports.streamMediaError = exports.handleStructureError = exports.retrieveWaveformSuccess = exports.updateStructureStatus = exports.retrieveStructureSuccess = exports.clearExistingAlerts = exports.removeAlert = exports.setAlert = exports.handleEditingTimespans = void 0;

var types = _interopRequireWildcard(require("./types"));

var _hls = _interopRequireDefault(require("hls.js"));

var _v = _interopRequireDefault(require("uuid/v1"));

/**
 * Enable/disable other editing actions when editing a list item
 * @param {Integer} code - choose from; 1(true) | 0(false)
 */
var handleEditingTimespans = function handleEditingTimespans(code) {
  var valid = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  return (// assumes structure data is valid by default
    function (dispatch) {
      dispatch({
        type: types.IS_EDITING_TIMESPAN,
        code: code
      }); // Remove dismissible alerts when a CRUD action has been initiated
      // given editing is starting (code = 1) and structure is validated.

      if (code == 1 && valid) {
        dispatch(clearExistingAlerts());
      }
    }
  );
};

exports.handleEditingTimespans = handleEditingTimespans;

var setAlert = function setAlert(alert) {
  return function (dispatch) {
    var id = (0, _v["default"])();
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

exports.setAlert = setAlert;

var removeAlert = function removeAlert(id) {
  return {
    type: types.REMOVE_ALERT,
    id: id
  };
};

exports.removeAlert = removeAlert;

var clearExistingAlerts = function clearExistingAlerts() {
  return {
    type: types.CLEAR_EXISTING_ALERTS
  };
};

exports.clearExistingAlerts = clearExistingAlerts;

var retrieveStructureSuccess = function retrieveStructureSuccess() {
  return {
    type: types.RETRIEVE_STRUCTURE_SUCCESS
  };
};
/**
 * Initially the structure status isSaved (true) and changed to false
 * when an edit action is performed on the structure
 * @param {Integer} code - choose from; 1(true -> saved) | 0(false -> not saved)
 */


exports.retrieveStructureSuccess = retrieveStructureSuccess;

var updateStructureStatus = function updateStructureStatus(code) {
  return {
    type: types.UPDATE_STRUCTURE_STATUS,
    payload: code
  };
};

exports.updateStructureStatus = updateStructureStatus;

var retrieveWaveformSuccess = function retrieveWaveformSuccess() {
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


exports.retrieveWaveformSuccess = retrieveWaveformSuccess;

var handleStructureError = function handleStructureError(flag, status) {
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


exports.handleStructureError = handleStructureError;

var streamMediaError = function streamMediaError(code) {
  return {
    type: types.STREAM_MEDIA_ERROR,
    payload: code
  };
};

exports.streamMediaError = streamMediaError;

var streamMediaSuccess = function streamMediaSuccess() {
  return {
    type: types.STREAM_MEDIA_SUCCESS
  };
};

exports.streamMediaSuccess = streamMediaSuccess;

function retrieveStreamMedia(audioFile, mediaPlayer) {
  var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return function (dispatch, getState) {
    if (_hls["default"].isSupported()) {
      var config = {
        xhrSetup: function xhrSetup(xhr) {
          xhr.withCredentials = opts.withCredentials;
        }
      };
      var hls = new _hls["default"](config); // Bind media player

      hls.attachMedia(mediaPlayer.current); // MEDIA_ATTACHED event is fired by hls object once MediaSource is ready

      hls.on(_hls["default"].Events.MEDIA_ATTACHED, function () {
        hls.loadSource(audioFile); // BUFFER_CREATED event is fired when fetching the media stream is successful

        hls.on(_hls["default"].Events.BUFFER_CREATED, function () {
          dispatch(streamMediaSuccess()); // dispatch(handleEditingTimespans(0));
        });
      }); // ERROR event is fired when fetching media stream is not successful

      hls.on(_hls["default"].Events.ERROR, function (event, data) {
        var errorCode = null; // When there are errors in the HLS build this block catches it and flashes
        // the warning message for a split second. The ErrorType for these errors is
        // OTHER_ERROR. Issue in HLS.js: https://github.com/video-dev/hls.js/issues/2435

        if (data.fatal && data.type !== _hls["default"].ErrorTypes.OTHER_ERROR) {
          console.log('TCL: forms action -> retrieveStreamMedia -> error', data);

          if (data.response !== undefined) {
            var status = data.response.code;
            status === 0 ? errorCode = -6 : errorCode = status;
          } else {
            errorCode = -6;
          }

          dispatch(streamMediaError(errorCode));
        }
      });
    }
  };
}