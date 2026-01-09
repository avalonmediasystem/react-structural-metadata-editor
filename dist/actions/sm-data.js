"use strict";

var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addDropTargets = addDropTargets;
exports.buildSMUI = buildSMUI;
exports.handleItemDrop = handleItemDrop;
exports.handleListItemDrop = handleListItemDrop;
exports.removeActiveDragSources = removeActiveDragSources;
exports.removeDropTargets = removeDropTargets;
exports.saveInitialStructure = saveInitialStructure;
exports.setActiveDragSource = setActiveDragSource;
exports.updateSMUI = updateSMUI;
var types = _interopRequireWildcard(require("./types"));
var _forms = require("./forms");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function buildSMUI(json, duration) {
  return {
    type: types.BUILD_SM_UI,
    json: json,
    duration: duration
  };
}
function updateSMUI(json, isValid) {
  return {
    type: types.UPDATE_SM_UI,
    json: json,
    isValid: isValid
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