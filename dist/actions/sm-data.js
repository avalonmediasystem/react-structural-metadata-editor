"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reBuildSMUI = reBuildSMUI;
exports.buildSMUI = buildSMUI;
exports.deleteItem = deleteItem;
exports.addDropTargets = addDropTargets;
exports.removeDropTargets = removeDropTargets;
exports.setActiveDragSource = setActiveDragSource;
exports.removeActiveDragSources = removeActiveDragSources;
exports.handleListItemDrop = handleListItemDrop;
exports.handleItemDrop = handleItemDrop;
exports.saveInitialStructure = saveInitialStructure;

var types = _interopRequireWildcard(require("./types"));

var _forms = require("./forms");

function reBuildSMUI(items) {
  return function (dispatch) {
    dispatch({
      type: types.REBUILD_SM_UI,
      items: items
    });
    dispatch((0, _forms.updateStructureStatus)(0));
  };
}

function buildSMUI(json, duration) {
  return {
    type: types.BUILD_SM_UI,
    json: json,
    duration: duration
  };
}

function deleteItem(id) {
  return {
    type: types.DELETE_ITEM,
    id: id
  };
}

function addDropTargets(item) {
  return {
    type: types.ADD_DROP_TARGETS,
    payload: item
  };
}

function removeDropTargets() {
  return {
    type: types.REMOVE_DROP_TARGETS
  };
}

function setActiveDragSource(id) {
  return {
    type: types.SET_ACTIVE_DRAG_SOURCE,
    id: id
  };
}

function removeActiveDragSources() {
  return {
    type: types.REMOVE_ACTIVE_DRAG_SOURCES
  };
}

function handleListItemDrop(dragSource, dropTarget) {
  return function (dispatch) {
    dispatch(handleItemDrop(dragSource, dropTarget));
    dispatch((0, _forms.updateStructureStatus)(0));
  };
}

function handleItemDrop(dragSource, dropTarget) {
  return {
    type: types.HANDLE_LIST_ITEM_DROP,
    dragSource: dragSource,
    dropTarget: dropTarget
  };
}

function saveInitialStructure(initData) {
  return {
    type: types.SAVE_INIT_SMDATA,
    payload: initData
  };
}