import React, { useState } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import PropTypes from 'prop-types';
import TimespanForm from '../components/TimespanForm';
import { useDispatch, useSelector } from 'react-redux';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';
import { insertNewSegment } from '../actions/peaks-instance';
import { useStructureUpdate } from '../services/sme-hooks';

const structuralMetadataUtils = new StructuralMetadataUtils();

const TimespanFormContainer = ({ cancelClick, ...restProps }) => {
  // Dispatch actions from Redux store
  const dispatch = useDispatch();
  const addNewSegment = (newSpan) => dispatch(insertNewSegment(newSpan));

  const { updateStructure } = useStructureUpdate();

  // State variables from Redux store
  const smData = useSelector((state) => state.structuralMetadata.smData);

  const [isTyping, _setIsTyping] = useState(false);

  const { showBoundary } = useErrorBoundary();

  const submit = (values) => {
    try {
      // Update the data structure with new heading
      const { newSpan, updatedData } = structuralMetadataUtils.insertNewTimespan(values, smData);

      // Update the waveform segments with new timespan
      addNewSegment(newSpan);

      // Update redux store via custom hook
      updateStructure(updatedData);

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
