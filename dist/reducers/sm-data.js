"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var types = _interopRequireWildcard(require("../actions/types"));
var _StructuralMetadataUtils = _interopRequireDefault(require("../services/StructuralMetadataUtils"));
var _lodash = require("lodash");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var structuralMetadataUtils = new _StructuralMetadataUtils["default"]();
var initialState = {
  smData: [],
  initSmData: [],
  smDataIsValid: true
};
var stateClone = null;
var newState = null;
var structuralMetadata = function structuralMetadata() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments.length > 1 ? arguments[1] : undefined;
  switch (action.type) {
    case types.BUILD_SM_UI:
      newState = structuralMetadataUtils.buildSMUI(action.json, action.duration);
      return _objectSpread(_objectSpread({}, state), {}, {
        smData: newState[0],
        smDataIsValid: newState[1]
      });
    case types.REBUILD_SM_UI:
      return _objectSpread(_objectSpread({}, state), {}, {
        smData: action.items
      });
    case types.SAVE_INIT_SMDATA:
      return _objectSpread(_objectSpread({}, state), {}, {
        initSmData: action.payload
      });
    case types.DELETE_ITEM:
      newState = structuralMetadataUtils.deleteListItem(action.id, state.smData);
      return _objectSpread(_objectSpread({}, state), {}, {
        smData: newState
      });
    case types.ADD_DROP_TARGETS:
      newState = structuralMetadataUtils.determineDropTargets(action.payload, state.smData);
      return _objectSpread(_objectSpread({}, state), {}, {
        smData: newState
      });
    case types.REMOVE_DROP_TARGETS:
      var noDropTargetsState = structuralMetadataUtils.removeDropTargets(state.smData);
      return _objectSpread(_objectSpread({}, state), {}, {
        smData: noDropTargetsState
      });
    case types.SET_ACTIVE_DRAG_SOURCE:
      stateClone = (0, _lodash.cloneDeep)(state);
      var target = structuralMetadataUtils.findItem(action.id, stateClone.smData);
      // Put an active flag on list item
      target.active = true;
      return _objectSpread(_objectSpread({}, stateClone), {}, {
        smData: stateClone.smData
      });
    case types.REMOVE_ACTIVE_DRAG_SOURCES:
      var noActiveDragSourcesState = structuralMetadataUtils.removeActiveDragSources(state.smData);
      return _objectSpread(_objectSpread({}, state), {}, {
        smData: noActiveDragSourcesState
      });
    case types.HANDLE_LIST_ITEM_DROP:
      newState = structuralMetadataUtils.handleListItemDrop(action.dragSource, action.dropTarget, state.smData);
      return _objectSpread(_objectSpread({}, state), {}, {
        smData: newState
      });
    default:
      return state;
  }
};
var _default = exports["default"] = structuralMetadata;