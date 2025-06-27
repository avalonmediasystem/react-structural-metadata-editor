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
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function reBuildSMUI(items, duration) {
  return function (dispatch, getState) {
    dispatch(buildSMUI(items, duration));
    var _getState = getState(),
      structuralMetadata = _getState.structuralMetadata;
    // Remove invalid structure alert when data is corrected
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