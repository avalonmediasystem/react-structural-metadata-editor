"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UPDATE_STRUCTURE_STATUS = exports.UPDATE_SEGMENT = exports.TEMP_INSERT_SEGMENT = exports.TEMP_DELETE_SEGMENT = exports.STREAM_MEDIA_SUCCESS = exports.STREAM_MEDIA_LOADING = exports.STREAM_MEDIA_ERROR = exports.SET_MANIFEST_MEDIAINFO = exports.SET_MANIFEST = exports.SET_CANVAS_WAVEFORMINFO = exports.SET_ALERT = exports.SET_ACTIVE_DRAG_SOURCE = exports.SAVE_SEGMENT = exports.SAVE_INIT_SMDATA = exports.REVERT_SEGMENT = exports.RETRIEVE_WAVEFORM_SUCCESS = exports.RETRIEVE_STRUCTURE_SUCCESS = exports.RESET_STORE = exports.REMOVE_DROP_TARGETS = exports.REMOVE_ALERT = exports.REMOVE_ACTIVE_DRAG_SOURCES = exports.REBUILD_SM_UI = exports.PEAKS_READY = exports.IS_EDITING_TIMESPAN = exports.IS_DRAGGING = exports.INSERT_SEGMENT = exports.INSERT_PLACEHOLDER = exports.INIT_PEAKS = exports.HANDLE_STRUCTURE_ERROR = exports.HANDLE_LIST_ITEM_DROP = exports.FETCH_MANIFEST_SUCCESS = exports.FETCH_MANIFEST_ERROR = exports.DELETE_SEGMENT = exports.DELETE_ITEM = exports.CLEAR_EXISTING_ALERTS = exports.BUILD_SM_UI = exports.ADD_DROP_TARGETS = exports.ACTIVATE_SEGMENT = void 0;
var BUILD_SM_UI = 'BUILD_SM_UI';
exports.BUILD_SM_UI = BUILD_SM_UI;
var REBUILD_SM_UI = 'REBUILD_SM_UI';
exports.REBUILD_SM_UI = REBUILD_SM_UI;
var DELETE_ITEM = 'DELETE_ITEM';
exports.DELETE_ITEM = DELETE_ITEM;
var ADD_DROP_TARGETS = 'ADD_DROP_TARGETS';
exports.ADD_DROP_TARGETS = ADD_DROP_TARGETS;
var REMOVE_DROP_TARGETS = 'REMOVE_DROP_TARGETS';
exports.REMOVE_DROP_TARGETS = REMOVE_DROP_TARGETS;
var SET_ACTIVE_DRAG_SOURCE = 'SET_ACTIVE_DRAG_SOURCE';
exports.SET_ACTIVE_DRAG_SOURCE = SET_ACTIVE_DRAG_SOURCE;
var REMOVE_ACTIVE_DRAG_SOURCES = 'REMOVE_ACTIVE_DRAG_SOURCES';
exports.REMOVE_ACTIVE_DRAG_SOURCES = REMOVE_ACTIVE_DRAG_SOURCES;
var HANDLE_LIST_ITEM_DROP = 'HANDLE_LIST_ITEM_DROP';
exports.HANDLE_LIST_ITEM_DROP = HANDLE_LIST_ITEM_DROP;
var IS_EDITING_TIMESPAN = 'IS_EDITING_TIMESPAN';
exports.IS_EDITING_TIMESPAN = IS_EDITING_TIMESPAN;
var RETRIEVE_STRUCTURE_SUCCESS = 'RETRIEVE_STRUCTURE_SUCCESS';
exports.RETRIEVE_STRUCTURE_SUCCESS = RETRIEVE_STRUCTURE_SUCCESS;
var UPDATE_STRUCTURE_STATUS = 'UPDATE_STRUCTURE_STATUS';
exports.UPDATE_STRUCTURE_STATUS = UPDATE_STRUCTURE_STATUS;
var HANDLE_STRUCTURE_ERROR = 'HANDLE_STRUCTURE_ERROR';
exports.HANDLE_STRUCTURE_ERROR = HANDLE_STRUCTURE_ERROR;
var RETRIEVE_WAVEFORM_SUCCESS = 'RETRIEVE_WAVEFORM_SUCCESS';
exports.RETRIEVE_WAVEFORM_SUCCESS = RETRIEVE_WAVEFORM_SUCCESS;
var SAVE_INIT_SMDATA = 'SAVE_INIT_SMDATA';
exports.SAVE_INIT_SMDATA = SAVE_INIT_SMDATA;
var STREAM_MEDIA_ERROR = 'STREAM_MEDIA_ERROR';
exports.STREAM_MEDIA_ERROR = STREAM_MEDIA_ERROR;
var STREAM_MEDIA_SUCCESS = 'STREAM_MEDIA_SUCCESS';
exports.STREAM_MEDIA_SUCCESS = STREAM_MEDIA_SUCCESS;
var STREAM_MEDIA_LOADING = 'STREAM_MEDIA_LOADING';
exports.STREAM_MEDIA_LOADING = STREAM_MEDIA_LOADING;
var INIT_PEAKS = 'INIT_PEAKS';
exports.INIT_PEAKS = INIT_PEAKS;
var PEAKS_READY = 'PEAKS_READY';
exports.PEAKS_READY = PEAKS_READY;
var INSERT_SEGMENT = 'INSERT_SEGMENT';
exports.INSERT_SEGMENT = INSERT_SEGMENT;
var DELETE_SEGMENT = 'DELETE_SEGMENT';
exports.DELETE_SEGMENT = DELETE_SEGMENT;
var ACTIVATE_SEGMENT = 'ACTIVATE_SEGMENT';
exports.ACTIVATE_SEGMENT = ACTIVATE_SEGMENT;
var INSERT_PLACEHOLDER = 'INSERT_PLACEHOLDER';
exports.INSERT_PLACEHOLDER = INSERT_PLACEHOLDER;
var SAVE_SEGMENT = 'SAVE_SEGMENT';
exports.SAVE_SEGMENT = SAVE_SEGMENT;
var REVERT_SEGMENT = 'REVERT_SEGMENT';
exports.REVERT_SEGMENT = REVERT_SEGMENT;
var UPDATE_SEGMENT = 'UPDATE_SEGMENT';
exports.UPDATE_SEGMENT = UPDATE_SEGMENT;
var TEMP_INSERT_SEGMENT = 'TEMP_INSERT_SEGMENT';
exports.TEMP_INSERT_SEGMENT = TEMP_INSERT_SEGMENT;
var TEMP_DELETE_SEGMENT = 'TEMP_DELETE_SEGMENT';
exports.TEMP_DELETE_SEGMENT = TEMP_DELETE_SEGMENT;
var IS_DRAGGING = 'IS_DRAGGING';
exports.IS_DRAGGING = IS_DRAGGING;
var SET_ALERT = 'SET_ALERT';
exports.SET_ALERT = SET_ALERT;
var REMOVE_ALERT = 'REMOVE_ALERT';
exports.REMOVE_ALERT = REMOVE_ALERT;
var CLEAR_EXISTING_ALERTS = 'CLEAR_EXISTING_ALERTS';
exports.CLEAR_EXISTING_ALERTS = CLEAR_EXISTING_ALERTS;
var RESET_STORE = 'RESET_STORE';
exports.RESET_STORE = RESET_STORE;
var SET_MANIFEST = 'SET_MANIFEST';
exports.SET_MANIFEST = SET_MANIFEST;
var FETCH_MANIFEST_ERROR = 'FETCH_MANIFEST_ERROR';
exports.FETCH_MANIFEST_ERROR = FETCH_MANIFEST_ERROR;
var FETCH_MANIFEST_SUCCESS = 'FETCH_MANIFEST_SUCCESS';
exports.FETCH_MANIFEST_SUCCESS = FETCH_MANIFEST_SUCCESS;
var SET_MANIFEST_MEDIAINFO = 'SET_MANIFEST_MEDIAINFO';
exports.SET_MANIFEST_MEDIAINFO = SET_MANIFEST_MEDIAINFO;
var SET_CANVAS_WAVEFORMINFO = 'SET_CANVAS_WAVEFORMINFO';
exports.SET_CANVAS_WAVEFORMINFO = SET_CANVAS_WAVEFORMINFO;