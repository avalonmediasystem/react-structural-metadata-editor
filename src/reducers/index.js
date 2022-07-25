import { combineReducers } from 'redux';
import forms from './forms';
import structuralMetadata from './sm-data';
import peaksInstance from './peaks-instance';
import manifest from './manifest';
import * as types from '../actions/types';

const appReducer = combineReducers({
  forms,
  structuralMetadata,
  peaksInstance,
  manifest
});

const rootReducer = (state, action) => {
  if (action.type === types.RESET_STORE) {
    // Reducers return initial state when they are called with 'undefined'
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;
