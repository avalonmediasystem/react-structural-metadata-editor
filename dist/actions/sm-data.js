"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addHeading = addHeading;
exports.buildSMUI = buildSMUI;
exports.deleteItem = deleteItem;
exports.addDropTargets = addDropTargets;
exports.removeDropTargets = removeDropTargets;
exports.setActiveDragSource = setActiveDragSource;
exports.removeActiveDragSources = removeActiveDragSources;
exports.handleListItemDrop = handleListItemDrop;

var types = _interopRequireWildcard(require("./types"));

function addHeading(values) {
  return {
    type: types.ADD_HEADING,
    payload: values
  };
}

function buildSMUI(json) {
  return {
    type: types.BUILD_SM_UI,
    payload: json
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
  return {
    type: types.HANDLE_LIST_ITEM_DROP,
    dragSource: dragSource,
    dropTarget: dropTarget
  };
}