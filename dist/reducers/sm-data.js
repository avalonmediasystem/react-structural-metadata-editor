"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var types = _interopRequireWildcard(require("../actions/types"));

var _StructuralMetadataUtils = _interopRequireDefault(require("../services/StructuralMetadataUtils"));

var _lodash = require("lodash");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { keys.push.apply(keys, Object.getOwnPropertySymbols(object)); } if (enumerableOnly) keys = keys.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
      return _objectSpread({}, state, {
        smData: newState
      });

    case types.SAVE_INIT_SMDATA:
      return _objectSpread({}, state, {
        initSmData: action.payload
      });

    case types.DELETE_ITEM:
      newState = structuralMetadataUtils.deleteListItem(action.id, state.smData);
      return _objectSpread({}, state, {
        smData: newState
      });

    case types.ADD_DROP_TARGETS:
      newState = structuralMetadataUtils.determineDropTargets(action.payload, state.smData);
      return _objectSpread({}, state, {
        smData: newState
      });

    case types.REMOVE_DROP_TARGETS:
      var noDropTargetsState = structuralMetadataUtils.removeDropTargets(state.smData);
      return _objectSpread({}, state, {
        smData: noDropTargetsState
      });

    case types.SET_ACTIVE_DRAG_SOURCE:
      stateClone = (0, _lodash.cloneDeep)(state);
      var target = structuralMetadataUtils.findItem(action.id, stateClone.smData); // Put an active flag on list item

      target.active = true;
      return _objectSpread({}, stateClone, {
        smData: stateClone.smData
      });

    case types.REMOVE_ACTIVE_DRAG_SOURCES:
      var noActiveDragSourcesState = structuralMetadataUtils.removeActiveDragSources(state.smData);
      return _objectSpread({}, state, {
        smData: noActiveDragSourcesState
      });

    case types.HANDLE_LIST_ITEM_DROP:
      newState = structuralMetadataUtils.handleListItemDrop(action.dragSource, action.dropTarget, state.smData);
      return _objectSpread({}, state, {
        smData: newState
      });

    default:
      return state;
  }
};

var _default = structuralMetadata;
exports["default"] = _default;