import React, { useState } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import PropTypes from 'prop-types';
import TimespanForm from '../components/TimespanForm';
import { useDispatch, useSelector } from 'react-redux';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';
import * as smActions from '../actions/sm-data';
import * as peaksActions from '../actions/peaks-instance';

const structuralMetadataUtils = new StructuralMetadataUtils();

const TimespanFormContainer = ({ cancelClick, ...restProps }) => {
  // Dispatch actions from Redux store
  const dispatch = useDispatch();
  const updateSMUI = (data, duration) => dispatch(smActions.reBuildSMUI(data, duration));
  const addNewSegment = (newSpan) => dispatch(peaksActions.insertNewSegment(newSpan));

  // State variables from Redux store
  const smData = useSelector((state) => state.structuralMetadata.smData);
  const duration = useSelector((state) => state.peaksInstance.duration);

  const [isTyping, _setIsTyping] = useState(false);

  const { showBoundary } = useErrorBoundary();

  const submit = (values) => {
    try {
      // Update the data structure with new heading
      const { newSpan, updatedData } = structuralMetadataUtils.insertNewTimespan(values, smData);

      // Update the waveform segments with new timespan
      addNewSegment(newSpan);

      // Update redux store
      updateSMUI(updatedData, duration);

      // Close the form
      cancelClick();
    } catch (error) {
      showBoundary(error);
    }
  };

  const setIsTyping = (value) => {
    if (value === 1) {
      _setIsTyping(true);
    } else {
      _setIsTyping(false);
    }
  };

  return (
    <TimespanForm
      {...restProps}
      // Unique id for re-rendering each time a new timespan form is opened
      key={restProps.initSegment?._pid ?? Math.random()}
      cancelClick={cancelClick}
      setIsTyping={setIsTyping}
      isTyping={isTyping}
      onSubmit={submit}
    />
  );
};

TimespanFormContainer.propTypes = {
  cancelClick: PropTypes.func.isRequired,
  initSegment: PropTypes.object,
  isInitializing: PropTypes.bool,
  setIsInitializing: PropTypes.func,
};

export default TimespanFormContainer;
