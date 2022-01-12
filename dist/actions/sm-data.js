"use strict";

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addDropTargets = addDropTargets;
exports.buildSMUI = buildSMUI;
exports.deleteItem = deleteItem;
exports.handleItemDrop = handleItemDrop;
exports.handleListItemDrop = handleListItemDrop;
exports.reBuildSMUI = reBuildSMUI;
exports.removeActiveDragSources = removeActiveDragSources;
exports.removeDropTargets = removeDropTargets;
exports.saveInitialStructure = saveInitialStructure;
exports.setActiveDragSource = setActiveDragSource;

var types = _interopRequireWildcard(require("./types"));

var _forms = require("./forms");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function reBuildSMUI(items, duration) {
  return function (dispatch, getState) {
    dispatch(buildSMUI(items, duration));

    var _getState = getState(),
        structuralMetadata = _getState.structuralMetadata; // Remove invalid structure alert when data is corrected


    if (structuralMetadata.smDataIsValid) {
      dispatch((0, _forms.clearExistingAlerts)());
    }

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