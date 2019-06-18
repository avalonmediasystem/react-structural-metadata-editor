"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var types = _interopRequireWildcard(require("../actions/types"));

var _StructuralMetadataUtils = _interopRequireDefault(require("../services/StructuralMetadataUtils"));

var _lodash = require("lodash");

var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();
var initialState = {
  smData: [],
  initSmData: []
};
var stateClone = null;
var newState = null;

var structuralMetadata = function structuralMetadata() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments.length > 1 ? arguments[1] : undefined;

  switch (action.type) {
    case types.BUILD_SM_UI:
      newState = structuralMetadataUtils.buildSMUI(action.json, action.duration);
      return (0, _objectSpread2["default"])({}, state, {
        smData: newState
      });

    case types.SAVE_INIT_SMDATA:
      return (0, _objectSpread2["default"])({}, state, {
        initSmData: action.payload
      });

    case types.DELETE_ITEM:
      newState = structuralMetadataUtils.deleteListItem(action.id, state.smData);
      return (0, _objectSpread2["default"])({}, state, {
        smData: newState
      });

    case types.ADD_DROP_TARGETS:
      newState = structuralMetadataUtils.determineDropTargets(action.payload, state.smData);
      return (0, _objectSpread2["default"])({}, state, {
        smData: newState
      });

    case types.REMOVE_DROP_TARGETS:
      var noDropTargetsState = structuralMetadataUtils.removeDropTargets(state.smData);
      return (0, _objectSpread2["default"])({}, state, {
        smData: noDropTargetsState
      });

    case types.SET_ACTIVE_DRAG_SOURCE:
      stateClone = (0, _lodash.cloneDeep)(state);
      var target = structuralMetadataUtils.findItem(action.id, stateClone.smData); // Put an active flag on list item

      target.active = true;
      return (0, _objectSpread2["default"])({}, stateClone, {
        smData: stateClone.smData
      });

    case types.REMOVE_ACTIVE_DRAG_SOURCES:
      var noActiveDragSourcesState = structuralMetadataUtils.removeActiveDragSources(state.smData);
      return (0, _objectSpread2["default"])({}, state, {
        smData: noActiveDragSourcesState
      });

    case types.HANDLE_LIST_ITEM_DROP:
      newState = structuralMetadataUtils.handleListItemDrop(action.dragSource, action.dropTarget, state.smData);
      return (0, _objectSpread2["default"])({}, state, {
        smData: newState
      });

    default:
      return state;
  }
};

var _default = structuralMetadata;
exports["default"] = _default;