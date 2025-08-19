import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { useDispatch, useSelector } from 'react-redux';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';
import { isTitleValid, validTimespans } from '../services/form-helper';
import * as peaksActions from '../actions/peaks-instance';
import WaveformDataUtils from '../services/WaveformDataUtils';
import { useFindNeighborSegments, useTimespanFormValidation } from '../services/sme-hooks';

const structuralMetadataUtils = new StructuralMetadataUtils();
const waveformDataUtils = new WaveformDataUtils();

const TimespanForm = ({
  cancelClick, initSegment, isInitializing, isTyping,
  onSubmit, setIsInitializing, setIsTyping
}) => {
  // State variables from global state
  const { smData } = useSelector((state) => state.structuralMetadata);
  const peaksInstance = useSelector((state) => state.peaksInstance);
  const { duration, isDragging, segment, startTimeChanged } = peaksInstance;

  // Dispatch actions
  const dispatch = useDispatch();
  const updateSegment = (segment, state) => dispatch(peaksActions.updateSegment(segment, state));
  const dragSegment = (id, startTimeChanged, value) => dispatch(peaksActions.dragSegment(id, startTimeChanged, value));

  const [beginTime, setBeginTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [timespanChildOf, setTimespanChildOf] = useState('');
  const [timespanTitle, setTimespanTitle] = useState('');
  const [validHeadings, setValidHeadings] = useState([]);

  // Update beginTime and endTime on load
  useEffect(() => {
    if (initSegment) {
      setBeginTime(structuralMetadataUtils.toHHmmss(initSegment.startTime));
      setEndTime(structuralMetadataUtils.toHHmmss(initSegment.endTime));
    }
  }, [initSegment]);

  const allSpans = useMemo(() => {
    if (smData?.length > 0) {
      return structuralMetadataUtils.getItemsOfType('span', smData);
    }
  }, [smData]);

  // Find neighboring timespans of the currently editing timespan
  const { prevSiblingRef, nextSiblingRef, parentTimespanRef } = useFindNeighborSegments({ segment });

  // Validate timespan form when editing
  const { formIsValid, isBeginValid, isEndValid } = useTimespanFormValidation({
    beginTime,
    endTime,
    neighbors: { prevSiblingRef, nextSiblingRef, parentTimespanRef },
    timespanTitle
  });

  const buildHeadingsOptions = () => {
    let newSpan = { begin: beginTime, end: endTime };

    // Build wrapperSpans from sibling timespans
    let wrapperSpans = { before: prevSiblingRef.current, after: nextSiblingRef.current };

    // Possible parent timespan that can fully contain the new span
    let parentTimespan = parentTimespanRef.current ? [parentTimespanRef.current] : [];

    // Get all valid div headings and potential parent timespans
    let validHeadings = structuralMetadataUtils.getValidParents(newSpan, wrapperSpans, smData, parentTimespan);

    // Update state with valid headings
    setValidHeadings(validHeadings);
  };

  const isValidTimespan = useMemo(() => {
    const { valid } = validTimespans(beginTime, endTime, duration, allSpans);
    if (valid) {
      buildHeadingsOptions();
    } else {
      setValidHeadings([]);
    }
    return valid;
  }, [beginTime, endTime, duration, allSpans]);

  useEffect(() => {
    if (!isInitializing) {
      setIsInitializing(false);
    }
  }, [smData, isInitializing]);

  useEffect(() => {
    if (!isTyping) {
      if (initSegment && isInitializing) {
        // Set isInitializing flag to false
        setIsInitializing(false);
      }
      if (!isInitializing) {
        const { startTime, endTime } = waveformDataUtils.validateSegment(
          segment, startTimeChanged, duration,
          {
            previousSibling: prevSiblingRef.current,
            nextSibling: nextSiblingRef.current,
            parentTimespan: parentTimespanRef.current
          },
        );
        setBeginTime(structuralMetadataUtils.toHHmmss(startTime));
        setEndTime(structuralMetadataUtils.toHHmmss(endTime));
      }
    }
    if (isDragging) {
      setIsTyping(0);
    }
  }, [initSegment, isDragging, isInitializing, peaksInstance]);

  const clearFormValues = () => {
    setBeginTime('');
    setEndTime('');
    setTimespanChildOf('');
    setTimespanTitle('');
    setValidHeadings([]);
    // Reset isTyping flag
    setIsTyping(0);
  };

  const handleInputChange = (e) => {
    setTimespanTitle(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    cancelClick();
    onSubmit({
      beginTime,
      endTime,
      timespanChildOf,
      timespanTitle,
    });

    // Clear form values
    clearFormValues();
  };

  /**
   * Set begin and end time and call handleTimeChange to update peaks
   * segement. This is a reusable function to update the begin and end time
   * of the segment when the user changes times in the form.
   * @param {Object} obj
   * @param {string} obj.start changed/existing start time
   * @param {string} obj.end changed/existing end time
   */
  const handleTimeChange = ({ start, end }) => {
    // Lock setting isTyping to false before updating the DOM
    dragSegment(segment.id, startTimeChanged, 0);

    // Set isTyping flag in props to true
    setIsTyping(1);

    if (isValidTimespan) {
      updateSegment(segment, { beginTime: start, endTime: end });
    }
  };

  /**
   * Set end time and call handleTimeChange to update peaks
   * segement. This event is triggered when the user types in the
   * input field for end time.
   * @param {Event} e 
   */
  const handleEndTimeChange = (e) => {
    setEndTime(e.target.value);
    handleTimeChange({ start: beginTime, end: e.target.value });
  };

  /**
   * Set begin time and call handleTimeChange to update peaks
   * segement. This event is triggered when the user types in the
   * input field for begin time.
   * @param {Event} e 
   */
  const handleBeginTimeChange = (e) => {
    setBeginTime(e.target.value);
    handleTimeChange({ start: e.target.value, end: endTime });
  };

  const handleCancelClick = () => {
    cancelClick();
    setIsTyping(0);
  };

  const handleChildOfChange = (e) => {
    setTimespanChildOf(e.target.value);
  };

  return (
    <Form onSubmit={handleSubmit} data-testid='timespan-form' className='mb-0'>
      <Form.Group controlId='timespanTitle'>
        <Form.Label>Title</Form.Label>
        <Form.Control
          type='text'
          value={timespanTitle}
          isValid={isTitleValid(timespanTitle)}
          isInvalid={!isTitleValid(timespanTitle)}
          onChange={handleInputChange}
          data-testid='timespan-form-title'
        />
        <Form.Control.Feedback />
      </Form.Group>

      <Row>
        <Col sm={6}>
          <Form.Group controlId='beginTime' className='mb-3'>
            <Form.Label>Begin Time</Form.Label>
            <Form.Control
              type='text'
              value={beginTime}
              isValid={isBeginValid}
              isInvalid={!isBeginValid}
              placeholder='00:00:00'
              onChange={handleBeginTimeChange}
              data-testid='timespan-form-begintime'
            />
            <Form.Control.Feedback />
          </Form.Group>
        </Col>
        <Col sm={6}>
          <Form.Group controlId='endTime' className='mb-3'>
            <Form.Label>End Time</Form.Label>
            <Form.Control
              type='text'
              value={endTime}
              isValid={isEndValid}
              isInvalid={!isEndValid}
              placeholder='00:00:00'
              onChange={handleEndTimeChange}
              data-testid='timespan-form-endtime'
            />
            <Form.Control.Feedback />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group controlId='timespanChildOf' className='mb-3'>
        <Form.Label>Child Of</Form.Label>
        <Form.Select
          onChange={handleChildOfChange}
          value={timespanChildOf}
          data-testid='timespan-form-childof'
        >
          <option value=''>Select...</option>
          {validHeadings.map((item) => (
            <option value={item.id} key={item.id}>
              {item.label}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Row>
        <Col>
          <ButtonToolbar className='float-end'>
            <Button
              variant='outline-secondary'
              className='me-1'
              onClick={handleCancelClick}
              data-testid='timespan-form-cancel-button'
            >
              Cancel
            </Button>
            <Button
              variant='primary'
              type='submit'
              disabled={!(formIsValid && timespanChildOf.length > 0)}
              data-testid='timespan-form-save-button'
            >
              Save
            </Button>
          </ButtonToolbar>
        </Col>
      </Row>
    </Form>
  );
};

TimespanForm.propTypes = {
  cancelClick: PropTypes.func,
  initSegment: PropTypes.object,
  isInitializing: PropTypes.bool,
  isTyping: PropTypes.bool,
  onSubmit: PropTypes.func,
  timespanOpen: PropTypes.bool,
  setIsInitializing: PropTypes.func,
  setIsTyping: PropTypes.func,
};

export default TimespanForm;
