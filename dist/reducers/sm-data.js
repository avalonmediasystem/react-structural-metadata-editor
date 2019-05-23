"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var types = _interopRequireWildcard(require("../actions/types"));

var _StructuralMetadataUtils = _interopRequireDefault(require("../services/StructuralMetadataUtils"));

var _lodash = require("lodash");

var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();
var initialState = [];
var stateClone = null;
var newState = null;

var smData = function smData() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments.length > 1 ? arguments[1] : undefined;

  switch (action.type) {
    case types.BUILD_SM_UI:
      newState = structuralMetadataUtils.buildSMUI(action.json, action.duration);
      return newState;

    case types.DELETE_ITEM:
      return structuralMetadataUtils.deleteListItem(action.id, state);

    case types.ADD_DROP_TARGETS:
      newState = structuralMetadataUtils.determineDropTargets(action.payload, state);
      return newState;

    case types.REMOVE_DROP_TARGETS:
      var noDropTargetsState = structuralMetadataUtils.removeDropTargets(state);
      return noDropTargetsState;

    case types.SET_ACTIVE_DRAG_SOURCE:
      stateClone = (0, _lodash.cloneDeep)(state);
      var target = structuralMetadataUtils.findItem(action.id, stateClone); // Put an active flag on list item

      target.active = true;
      return stateClone;

    case types.REMOVE_ACTIVE_DRAG_SOURCES:
      var noActiveDragSourcesState = structuralMetadataUtils.removeActiveDragSources(state);
      return noActiveDragSourcesState;

    case types.HANDLE_LIST_ITEM_DROP:
      newState = structuralMetadataUtils.handleListItemDrop(action.dragSource, action.dropTarget, state);
      return newState;

    default:
      return state;
  }
};

var _default = smData;
exports["default"] = _default;