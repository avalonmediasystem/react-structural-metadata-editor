import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useErrorBoundary } from 'react-error-boundary';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';
import HeadingFormContainer from '../containers/HeadingFormContainer';
import TimespanFormContainer from '../containers/TimespanFormContainer';
import * as peaksActions from '../actions/peaks-instance';
import { configureAlert } from '../services/alert-status';
import { handleEditingTimespans, setAlert } from '../actions/forms';

const styles = {
  well: {
    marginTop: '1rem',
    minHeight: '20px',
    padding: '19px',
    marginBottom: '20px',
    backgroundColor: '#f5f5f5',
    border: '1px solid #e3e3e3',
    borderRadius: '4px',
    boxShadow: 'inset 0 1px 1px rgb(0 0 0 / 5%)',
  },
};

const ButtonSection = () => {
  // Dispatch actions to Redux store
  const dispatch = useDispatch();
  const createTempSegment = () => dispatch(peaksActions.insertTempSegment());
  const removeTempSegment = (id) => dispatch(peaksActions.deleteTempSegment(id));
  const updateEditingTimespans = (value) => dispatch(handleEditingTimespans(value));
  const settingAlert = (alert) => dispatch(setAlert(alert));

  // Get state variables from Redux store
  const { editingDisabled, structureInfo, streamInfo } = useSelector((state) => state.forms);
  const { peaks } = useSelector((state) => state.peaksInstance);

  const [headingOpen, setHeadingOpen] = useState(false);
  const [timespanOpen, setTimespanOpen] = useState(false);
  const [initSegment, setInitSegment] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [disabled, setDisabled] = useState(true);

  const { showBoundary } = useErrorBoundary();

  const handleCancelHeadingClick = () => {
    setHeadingOpen(false);
    updateEditingTimespans(0);
  };

  const handleHeadingClick = () => {
    // If heading form is open, close it before opening timespan form
    if (timespanOpen) {
      setTimespanOpen(false);
    }

    // Disable editing other items in structure
    updateEditingTimespans(1);

    // When opening heading form, delete if a temporary segment exists
    deleteTempSegment();
    setHeadingOpen(true);
    setDisabled(false);
  };

  const handleCancelTimespanClick = () => {
    deleteTempSegment();
    setTimespanOpen(false);
    updateEditingTimespans(0);
  };

  const handleTimeSpanClick = () => {
    // If heading form is open, close it before opening timespan form
    if (headingOpen) {
      setHeadingOpen(false);
    }

    // Disable editing other items in structure
    updateEditingTimespans(1);

    // Create a temporary segment if timespan form is opened
    if (!timespanOpen) {
      createTempSegment();
    }

    const tempSegment = peaks.segments.getSegment('temp-segment');

    try {
      if (tempSegment == undefined) {
        const noSpaceAlert = configureAlert(-4);
        settingAlert(noSpaceAlert);
      } else {
        // Initialize Redux store with temporary segment
        dispatch(peaksActions.dragSegment(tempSegment.id, null, 0));
        setInitSegment(tempSegment);
        setTimespanOpen(true);
        setIsInitializing(true);
        setDisabled(false);
      }
    } catch (error) {
      showBoundary(error);
    }
  };

  // Delete if a temporary segment exists
  const deleteTempSegment = () => {
    try {
      if (initSegment != null) {
        removeTempSegment(initSegment.id);
      }
    } catch (error) {
      showBoundary(error);
    }
  };

  const timespanFormProps = {
    cancelClick: handleCancelTimespanClick,
    initSegment,
    isInitializing,
    timespanOpen,
    setIsInitializing,
  };

  // Only return UI when both structure and waveform data exist
  if (structureInfo.structureRetrieved) {
    return (
      <section data-testid='button-section'>
        <div className='d-grid gap-2 button-section-container' data-testid='button-row'>
          <Button
            variant='outline-secondary'
            data-testid='add-heading-button'
            onClick={handleHeadingClick}
            disabled={disabled && editingDisabled}
          >
            Add a Heading
          </Button>
          <Button
            variant='outline-secondary'
            data-testid='add-timespan-button'
            onClick={handleTimeSpanClick}
            disabled={
              (disabled && editingDisabled) ||
              streamInfo.streamMediaError
            }
          >
            Add a Timespan
          </Button>
        </div>

        <Collapse in={headingOpen}>
          <div style={styles.well} data-testid='heading-form-wrapper'>
            <HeadingFormContainer cancelClick={handleCancelHeadingClick} />
          </div>
        </Collapse>
        <Collapse in={timespanOpen}>
          <div style={styles.well} data-testid='timespan-form-wrapper'>
            <TimespanFormContainer {...timespanFormProps} />
          </div>
        </Collapse>
      </section>
    );
  }
};


export default ButtonSection;
