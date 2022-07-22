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

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

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

      if (action.init) {
        return _objectSpread(_objectSpread({}, state), {}, {
          smData: newState[0],
          initSmData: newState[0],
          smDataIsValid: newState[1]
        });
      } else {
        return _objectSpread(_objectSpread({}, state), {}, {
          smData: newState[0],
          smDataIsValid: newState[1]
        });
      }

    case types.REBUILD_SM_UI:
      return _objectSpread(_objectSpread({}, state), {}, {
        smData: action.items
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
      var target = structuralMetadataUtils.findItem(action.id, stateClone.smData); // Put an active flag on list item

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

var _default = structuralMetadata;
exports["default"] = _default;