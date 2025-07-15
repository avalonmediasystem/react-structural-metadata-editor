import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {
  getExistingFormValues,
  getValidationBeginState,
  getValidationEndState,
  getValidationTitleState,
  isTitleValid,
  validTimespans,
} from '../services/form-helper';
import { useDispatch, useSelector } from 'react-redux';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';
import { cloneDeep, isEmpty } from 'lodash';
import ListItemInlineEditControls from './ListItemInlineEditControls';
import * as peaksActions from '../actions/peaks-instance';
import WaveformDataUtils from '../services/WaveformDataUtils';

const structuralMetadataUtils = new StructuralMetadataUtils();
const waveformUtils = new WaveformDataUtils();

const styles = {
  formControl: {
    margin: '0 5px',
  },
};

function TimespanInlineForm({ cancelFn, item, isInitializing, isTyping, saveFn, setIsInitializing, setIsTyping }) {
  // State variables from global state
  const { smData } = useSelector((state) => state.structuralMetadata);
  const peaksInstance = useSelector((state) => state.peaksInstance);
  const { isDragging, segment, startTimeChanged } = peaksInstance;

  // Dispatch actions
  const dispatch = useDispatch();
  const activateSegment = (id) => dispatch(peaksActions.activateSegment(id));
  const insertPlaceholderSegment = (item, wrapperSpans) =>
    dispatch(peaksActions.insertPlaceholderSegment(item, wrapperSpans));
  const revertSegment = (segment) => dispatch(peaksActions.revertSegment(segment));
  const saveSegment = (state) => dispatch(peaksActions.saveSegment(state));
  const updateSegment = (segment, state) => dispatch(peaksActions.updateSegment(segment, state));
  const dragSegment = (id, startTimeChanged, value) =>
    dispatch(peaksActions.dragSegment(id, startTimeChanged, value));

  const [beginTime, setBeginTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [timespanTitle, setTimespanTitle] = useState('');
  const [clonedSegment, setClonedSegment] = useState({});

  const tempSmDataRef = useRef();
  const allSpansRef = useRef([]);

  useEffect(() => {
    // Get a fresh copy of store data
    tempSmDataRef.current = cloneDeep(smData);
    const tempPeaks = cloneDeep(peaksInstance.peaks);

    // Make segment related to timespan editable
    if (item.valid) {
      // Load existing form values
      const formValues = getExistingFormValues(item.id, tempSmDataRef.current, tempPeaks);
      setBeginTime(formValues.beginTime);
      setEndTime(formValues.endTime);
      setTimespanTitle(formValues.timespanTitle);
      setClonedSegment(formValues.clonedSegment);

      activateSegment(item.id);
    } else {
      handleInvalidTimespan();
    }

    // Remove current list item from the data we're doing validation against in this form
    tempSmDataRef.current = structuralMetadataUtils.deleteListItem(
      item.id,
      tempSmDataRef.current
    );

    // Save a reference to all the spans for future calculations
    allSpansRef.current = structuralMetadataUtils.getItemsOfType(
      'span',
      tempSmDataRef.current
    );

    // Get segment from current peaks instance
    const currentSegment = peaksInstance.peaks.segments.getSegment(item.id);

    // Initialize the segment in Redux store with the selected item
    dragSegment(currentSegment.id, startTimeChanged, 0);
  }, []);

  useEffect(() => {
    if (!isDragging && isInitializing && !isTyping && !isEmpty(segment)) {
      const { startTime, endTime } = segment;
      setBeginTime(structuralMetadataUtils.toHHmmss(startTime));
      setEndTime(structuralMetadataUtils.toHHmmss(endTime));
    }

    if (isDragging) {
      // When handles in waveform are dragged clear out isInitializing and isTyping flags
      if (isInitializing) setIsInitializing(0);
      if (isTyping) setIsTyping(0);

      const { startTime, endTime } = waveformUtils.validateSegment(
        segment,
        startTimeChanged,
        peaksInstance.peaks,
        peaksInstance.duration
      );

      setBeginTime(structuralMetadataUtils.toHHmmss(startTime));
      setEndTime(structuralMetadataUtils.toHHmmss(endTime));
    }
  }, [isDragging, isInitializing, isTyping, segment, peaksInstance]);


  /**
   * When there are invalid timespans in the structure, to edit them
   * a placeholder segment is created within the Peaks instance, since
   * they cannot be added at the time Peaks is initialized.
   */
  const handleInvalidTimespan = () => {
    const itemIndex = structuralMetadataUtils
      .getItemsOfType('span', smData)
      .findIndex((i) => i.id === item.id);

    const allSpans = structuralMetadataUtils.getItemsOfType(
      'span',
      tempSmDataRef.current
    );

    const wrapperSpans = { prevSpan: null, nextSpan: null };
    wrapperSpans.prevSpan = allSpans[itemIndex - 1] || null;
    wrapperSpans.nextSpan = allSpans[itemIndex + 1] || null;

    insertPlaceholderSegment(item, wrapperSpans);
    const placeholderSegment = peaksInstance.peaks.segments.getSegment(item.id);
    placeholderSegment.valid = false;

    setClonedSegment(placeholderSegment);
    setBeginTime(structuralMetadataUtils.toHHmmss(placeholderSegment.startTime));
    setEndTime(structuralMetadataUtils.toHHmmss(placeholderSegment.endTime));
    setTimespanTitle(placeholderSegment.labelText);
  };

  const formIsValid = () => {
    const titleValid = isTitleValid(timespanTitle);
    const timesValidResponse = validTimespans(
      beginTime,
      endTime,
      peaksInstance.duration,
      allSpansRef.current
    );

    return titleValid && timesValidResponse.valid;
  };

  const handleCancelClick = () => {
    // Revert to segment to the state prior to editing
    revertSegment(clonedSegment);
    cancelFn();
  };

  const handleInputChange = (e) => {
    // Lock disabling isTyping flag before updating DOM from form inputs
    dragSegment(segment.id, startTimeChanged, 0);
    // Enable updating state from form inputs
    setIsTyping(1);

    const { id, value } = e.target;

    if (id === 'timespanTitle') {
      setTimespanTitle(value);
    } else if (id === 'beginTime') {
      setBeginTime(value);
    } else if (id === 'endTime') {
      setEndTime(value);
    }

    // Update waveform segment with user inputs in the form
    updateSegment(segment, {
      beginTime: id === 'beginTime' ? value : beginTime,
      endTime: id === 'endTime' ? value : endTime,
      timespanTitle: id === 'timespanTitle' ? value : timespanTitle
    });
  };

  const handleSaveClick = () => {
    saveSegment({ beginTime, endTime, timespanTitle, clonedSegment });
    saveFn(segment.id, {
      beginTime,
      endTime,
      timespanTitle,
    });
  };

  return (
    <div className='row-wrapper d-flex justify-content-between gap-5 px-0'>
      <Form data-testid='timespan-inline-form' className='mb-0 d-flex gap-4 flex-wrap flex-lg-nowrap no-gutters'>
        <Form.Group as={Row} controlId='timespanTitle' className='ms-0'>
          <Form.Label column sm={2} md={3}>Title</Form.Label>
          <Col sm={10} md={9} className='px-0'>
            <Form.Control
              type='text'
              style={styles.formControl}
              value={timespanTitle}
              isValid={getValidationTitleState(timespanTitle)}
              isInvalid={!getValidationTitleState(timespanTitle)}
              onChange={handleInputChange}
              data-testid='timespan-inline-form-title'
              className='mx-0'
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId='beginTime' className='ms-0'>
          <Form.Label column sm={2} md={3}>Begin</Form.Label>
          <Col sm={10} md={9} className='px-0'>
            <Form.Control
              as='input'
              style={styles.formControl}
              value={beginTime}
              onChange={handleInputChange}
              isValid={getValidationBeginState(beginTime, allSpansRef.current)}
              isInvalid={!getValidationBeginState(beginTime, allSpansRef.current)}
              data-testid='timespan-inline-form-begintime'
              className='mx-0'
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId='endTime' className='ms-0'>
          <Form.Label column sm={2} md={3}>End</Form.Label>
          <Col sm={10} md={9} className='px-0'>
            <Form.Control
              type='text'
              style={styles.formControl}
              value={endTime}
              isValid={getValidationEndState(
                beginTime,
                endTime,
                allSpansRef.current,
                peaksInstance.duration
              )}
              isInvalid={
                !getValidationEndState(
                  beginTime,
                  endTime,
                  allSpansRef.current,
                  peaksInstance.duration
                )
              }
              onChange={handleInputChange}
              data-testid='timespan-inline-form-endtime'
              className='mx-0'
            />
          </Col>
        </Form.Group>
      </Form>
      <ListItemInlineEditControls
        formIsValid={formIsValid()}
        handleSaveClick={handleSaveClick}
        handleCancelClick={handleCancelClick}
      />
    </div>
  );
}

TimespanInlineForm.propTypes = {
  item: PropTypes.object,
  cancelFn: PropTypes.func,
  saveFn: PropTypes.func,
  setIsTyping: PropTypes.func,
  isTyping: PropTypes.bool,
  isInitializing: PropTypes.bool,
  setIsInitializing: PropTypes.func,
};

export default TimespanInlineForm;
