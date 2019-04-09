import * as types from '../actions/types';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';
import { cloneDeep } from 'lodash';

var structuralMetadataUtils = new StructuralMetadataUtils();
var initialState = [];
var stateClone = null;
var newState = null;

var smData = function smData() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];

  switch (action.type) {
    case types.ADD_HEADING:
      stateClone = cloneDeep(state);
      stateClone.push(action.payload);
      return stateClone;

    case types.BUILD_SM_UI:
      return action.payload;

    case types.DELETE_ITEM:
      return structuralMetadataUtils.deleteListItem(action.id, state);

    case types.ADD_DROP_TARGETS:
      newState = structuralMetadataUtils.determineDropTargets(action.payload, state);
      return newState;

    case types.REMOVE_DROP_TARGETS:
      var noDropTargetsState = structuralMetadataUtils.removeDropTargets(state);
      return noDropTargetsState;

    case types.SET_ACTIVE_DRAG_SOURCE:
      stateClone = cloneDeep(state);
      var target = structuralMetadataUtils.findItem(action.id, stateClone);
      // Put an active flag on list item
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

export default smData;