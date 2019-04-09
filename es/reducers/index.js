import { combineReducers } from 'redux';
import forms from './forms';
import smData from './sm-data';
import peaksInstance from './peaks-instance';

export default combineReducers({
  forms: forms,
  smData: smData,
  peaksInstance: peaksInstance
});