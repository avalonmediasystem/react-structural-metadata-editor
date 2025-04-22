import React, { useEffect, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
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
  const dispatch = useDispatch();
  const { editingDisabled, structureInfo, streamInfo } = useSelector((state) => state.forms);
  const { peaks } = useSelector((state) => state.peaksInstance);

  const [headingOpen, setHeadingOpen] = useState(false);
  const [timespanOpen, setTimespanOpen] = useState(false);
  const [initSegment, setInitSegment] = useState(null);
  const [isInitializing, _setIsInitializing] = useState(true);
  const [disabled, setDisabled] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    if (editingDisabled && !formOpen) {
      setDisabled(true);
    }
  }, [formOpen, editingDisabled]);

  const setIsInitializing = (value) => {
    if (value === 1) {
      _setIsInitializing(true);
    } else {
      _setIsInitializing(false);
    }
  };

  // Wrapper function to update heeading/timespan collapsible form states
  const setFormStatus = ({ formState, hState = false, tState = false }) => {
    setHeadingOpen(hState);
    setTimespanOpen(tState);
    setFormOpen(formState);
  };

  const handleCancelHeadingClick = () => {
    setFormStatus({ formState: false, hState: false });
    dispatch(handleEditingTimespans(0));
  };

  const handleHeadingClick = () => {
    dispatch(handleEditingTimespans(1));
    // When opening heading form, delete if a temporary segment exists
    deleteTempSegment();
    setFormStatus({ formState: true, hState: true });
    setDisabled(false);
  };

  const handleCancelTimespanClick = () => {
    deleteTempSegment();
    setFormStatus({ formState: false });
    dispatch(handleEditingTimespans(0));
  };

  const handleTimeSpanClick = () => {
    // Disable editing other items in structure
    dispatch(handleEditingTimespans(1));

    // Create a temporary segment if timespan form is closed
    if (!timespanOpen) {
      dispatch(peaksActions.insertTempSegment());
    }

    const tempSegment = peaks.segments.getSegment('temp-segment');

    if (tempSegment == undefined) {
      const noSpaceAlert = configureAlert(-4);
      dispatch(setAlert(noSpaceAlert));
    } else {
      // Initialize Redux store with temporary segment
      dispatch(peaksActions.dragSegment(tempSegment.id, null, 0));
      setInitSegment(tempSegment);
      setTimespanOpen(true);
      setIsInitializing(true);
    }
  };

  // Delete if a temporary segment exists
  const deleteTempSegment = () => {
    if (initSegment != null) {
      dispatch(peaksActions.deleteTempSegment(initSegment.id));
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

const mapStateToProps = (state) => ({
  peaksInstance: state.peaksInstance,
  forms: state.forms,
});

const mapDispatchToProps = {
  createTempSegment: peaksActions.insertTempSegment,
  deleteTempSegment: peaksActions.deleteTempSegment,
  dragSegment: peaksActions.dragSegment,
  handleEditingTimespans: handleEditingTimespans,
  setAlert: setAlert,
};

export default connect(mapStateToProps, mapDispatchToProps)(ButtonSection);
