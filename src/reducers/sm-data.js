import * as types from '../actions/types';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';
import { cloneDeep } from 'lodash';

const structuralMetadataUtils = new StructuralMetadataUtils();
const initialState = {
  smData: [],
  initSmData: [],
  smDataIsValid: true,
};
let stateClone = null;
let newState = null;

const structuralMetadata = (state = initialState, action) => {
  switch (action.type) {
    case types.BUILD_SM_UI:
      const { newSmData, newSmDataStatus } = structuralMetadataUtils.buildSMUI(
        action.json,
        action.duration
      );
      return { ...state, smData: newSmData, smDataIsValid: newSmDataStatus };

    case types.UPDATE_SM_UI:
      return { ...state, smData: action.json, smDataIsValid: action.isValid };

    case types.SAVE_INIT_SMDATA:
      return {
        ...state,
        initSmData: action.payload,
      };

    case types.ADD_DROP_TARGETS:
      newState = structuralMetadataUtils.determineDropTargets(
        action.payload,
        state.smData
      );
      return { ...state, smData: newState };

    case types.REMOVE_DROP_TARGETS:
      let noDropTargetsState = structuralMetadataUtils.removeDropTargets(
        state.smData
      );
      return { ...state, smData: noDropTargetsState };

    case types.SET_ACTIVE_DRAG_SOURCE:
      stateClone = cloneDeep(state);
      let target = structuralMetadataUtils.findItem(
        action.id,
        stateClone.smData
      );
      // Put an active flag on list item
      target.active = true;
      return { ...stateClone, smData: stateClone.smData };

    case types.REMOVE_ACTIVE_DRAG_SOURCES:
      let noActiveDragSourcesState =
        structuralMetadataUtils.removeActiveDragSources(state.smData);
      return { ...state, smData: noActiveDragSourcesState };

    case types.HANDLE_LIST_ITEM_DROP:
      newState = structuralMetadataUtils.handleListItemDrop(
        action.dragSource,
        action.dropTarget,
        state.smData
      );
      return { ...state, smData: newState };

    default:
      return state;
  }
};

export default structuralMetadata;
