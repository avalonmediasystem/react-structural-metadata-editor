import * as types from './types';
import { updateStructureStatus } from './forms';

export function reBuildSMUI(items) {
  return {
    type: types.REBUILD_SM_UI,
    items,
  };
}

export function buildSMUI(json, duration) {
  return {
    type: types.BUILD_SM_UI,
    json,
    duration,
  };
}

export function deleteItem(id) {
  return {
    type: types.DELETE_ITEM,
    id,
  };
}

export function addDropTargets(item) {
  return {
    type: types.ADD_DROP_TARGETS,
    payload: item,
  };
}

export function removeDropTargets() {
  return {
    type: types.REMOVE_DROP_TARGETS,
  };
}

export function setActiveDragSource(id) {
  return {
    type: types.SET_ACTIVE_DRAG_SOURCE,
    id,
  };
}

export function removeActiveDragSources() {
  return {
    type: types.REMOVE_ACTIVE_DRAG_SOURCES,
  };
}

export function handleListItemDrop(dragSource, dropTarget) {
  return (dispatch) => {
    dispatch(handleItemDrop(dragSource, dropTarget));
    dispatch(updateStructureStatus(0));
  };
}

export function handleItemDrop(dragSource, dropTarget) {
  return {
    type: types.HANDLE_LIST_ITEM_DROP,
    dragSource,
    dropTarget,
  };
}

export function saveInitialStructure(initData) {
  return {
    type: types.SAVE_INIT_SMDATA,
    payload: initData,
  };
}
