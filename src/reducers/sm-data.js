import * as types from '../actions/types';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';
import { cloneDeep } from 'lodash';

const structuralMetadataUtils = new StructuralMetadataUtils();
const initialState = [];
let stateClone = null;
let newState = null;

const smData = (state = initialState, action) => {
  switch (action.type) {
    case types.BUILD_SM_UI:
      newState = structuralMetadataUtils.buildSMUI(
        action.json,
        action.duration
      );
      return newState;

    case types.DELETE_ITEM:
      return structuralMetadataUtils.deleteListItem(action.id, state);

    case types.ADD_DROP_TARGETS:
      newState = structuralMetadataUtils.determineDropTargets(
        action.payload,
        state
      );
      return newState;

    case types.REMOVE_DROP_TARGETS:
      let noDropTargetsState = structuralMetadataUtils.removeDropTargets(state);
      return noDropTargetsState;

    case types.SET_ACTIVE_DRAG_SOURCE:
      stateClone = cloneDeep(state);
      let target = structuralMetadataUtils.findItem(action.id, stateClone);
      // Put an active flag on list item
      target.active = true;
      return stateClone;

    case types.REMOVE_ACTIVE_DRAG_SOURCES:
      let noActiveDragSourcesState = structuralMetadataUtils.removeActiveDragSources(
        state
      );
      return noActiveDragSourcesState;

    case types.HANDLE_LIST_ITEM_DROP:
      newState = structuralMetadataUtils.handleListItemDrop(
        action.dragSource,
        action.dropTarget,
        state
      );
      return newState;

    default:
      return state;
  }
};

export default smData;
