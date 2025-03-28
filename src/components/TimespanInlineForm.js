import React, { Component } from 'react';
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
import { connect } from 'react-redux';
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

class TimespanInlineForm extends Component {
  constructor(props) {
    super(props);

    // To implement validation logic on begin and end times, we need to remove the current item
    // from the stored data
    this.tempSmData = undefined;
    this.allSpans = [];
  }

  static propTypes = {
    item: PropTypes.object,
    cancelFn: PropTypes.func,
    saveFn: PropTypes.func,
  };

  state = {
    beginTime: '',
    endTime: '',
    timespanTitle: '',
    clonedSegment: {},
    peaksInstance: this.props.peaksInstance,
    segment: this.props.segment,
    startTimeChanged: this.props.startTimeChanged,
  };

  componentDidMount() {
    const { smData, item, peaksInstance, startTimeChanged } = this.props;
    // Get a fresh copy of store data
    this.tempSmData = cloneDeep(smData);
    const tempPeaks = cloneDeep(peaksInstance.peaks);

    // Make segment related to timespan editable
    if (item.valid) {
      // Load existing form values
      this.setState(getExistingFormValues(item.id, this.tempSmData, tempPeaks));

      this.props.activateSegment(item.id);
    } else {
      this.handleInvalidTimespan();
    }

    // Remove current list item from the data we're doing validation against in this form
    this.tempSmData = structuralMetadataUtils.deleteListItem(
      item.id,
      this.tempSmData
    );

    // Save a reference to all the spans for future calculations
    this.allSpans = structuralMetadataUtils.getItemsOfType(
      'span',
      this.tempSmData
    );

    // Get segment from current peaks instance
    const segment = peaksInstance.peaks.segments.getSegment(item.id);

    // Set the selected segment in the component's state
    this.setState({ segment });

    // Initialize the segment in Redux store with the selected item
    this.props.dragSegment(segment.id, startTimeChanged, 0);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      peaksInstance,
      segment,
      isTyping,
      isDragging,
      isInitializing,
      startTimeChanged,
    } = nextProps;
    if (!isDragging && isInitializing && !isTyping && !isEmpty(segment)) {
      const { startTime, endTime } = segment;
      return {
        beginTime: structuralMetadataUtils.toHHmmss(startTime),
        endTime: structuralMetadataUtils.toHHmmss(endTime),
      };
    }
    if (isDragging) {
      // When handles in waveform are dragged clear out isInitializing and isTyping flags
      isInitializing ? nextProps.setIsInitializing(0) : null;
      isTyping ? nextProps.setIsTyping(0) : null;
      if (prevState.peaksInstance !== peaksInstance) {
        const { startTime, endTime } = waveformUtils.validateSegment(
          segment,
          startTimeChanged,
          peaksInstance.peaks,
          peaksInstance.duration
        );
        return {
          beginTime: structuralMetadataUtils.toHHmmss(startTime),
          endTime: structuralMetadataUtils.toHHmmss(endTime),
        };
      }
    }
    return null;
  }

  /**
   * When there are invalid timespans in the structure, to edit them
   * a placeholder segment is created within the Peaks instance, since
   * they cannot be added at the time Peaks is initialized.
   */
  handleInvalidTimespan() {
    const { item, smData, peaksInstance } = this.props;
    const itemIndex = structuralMetadataUtils
      .getItemsOfType('span', smData)
      .findIndex((i) => i.id === item.id);

    const allSpans = structuralMetadataUtils.getItemsOfType(
      'span',
      this.tempSmData
    );

    const wrapperSpans = { prevSpan: null, nextSpan: null };
    wrapperSpans.prevSpan = allSpans[itemIndex - 1] || null;
    wrapperSpans.nextSpan = allSpans[itemIndex + 1] || null;

    this.props.insertPlaceholderSegment(item, wrapperSpans);
    const placeholderSegment = peaksInstance.peaks.segments.getSegment(item.id);
    placeholderSegment.valid = false;
    this.setState({
      clonedSegment: placeholderSegment,
      beginTime: structuralMetadataUtils.toHHmmss(placeholderSegment.startTime),
      endTime: structuralMetadataUtils.toHHmmss(placeholderSegment.endTime),
      timespanTitle: placeholderSegment.labelText,
    });
  }

  formIsValid() {
    const { beginTime, endTime } = this.state;
    const titleValid = isTitleValid(this.state.timespanTitle);
    const timesValidResponse = validTimespans(
      beginTime,
      endTime,
      this.props.peaksInstance.duration,
      this.allSpans
    );

    return titleValid && timesValidResponse.valid;
  }

  handleCancelClick = () => {
    // Revert to segment to the state prior to editing
    this.props.revertSegment(this.state.clonedSegment);
    this.props.cancelFn();
  };

  handleInputChange = (e) => {
    const { segment, startTimeChanged } = this.props;
    // Lock disabling isTyping flag before updating DOM from form inputs
    this.props.dragSegment(segment.id, startTimeChanged, 0);

    // Enable updating state from form inputs
    this.props.setIsTyping(1);

    this.setState({ [e.target.id]: e.target.value }, () => {
      // Update waveform segment with user inputs in the form
      this.props.updateSegment(segment, this.state);
    });
  };

  handleSaveClick = () => {
    this.props.saveSegment(this.state);
    const { beginTime, endTime, timespanTitle } = this.state;
    this.props.saveFn(this.props.segment.id, {
      beginTime,
      endTime,
      timespanTitle,
    });
  };

  render() {
    const { beginTime, endTime, timespanTitle } = this.state;

    return (
      <div className='row-wrapper d-flex justify-content-between gap-5 px-0'>
        <Form data-testid='timespan-inline-form' className='mb-0 d-flex gap-4 flex-wrap flex-lg-nowrap no-gutters'>
          <Form.Group as={Row} controlId='timespanTitle' className='ml-0'>
            <Form.Label column sm={2} md={3}>Title</Form.Label>
            <Col sm={10} md={9} className='px-0'>
              <Form.Control
                type='text'
                style={styles.formControl}
                value={timespanTitle}
                isValid={getValidationTitleState(timespanTitle)}
                isInvalid={!getValidationTitleState(timespanTitle)}
                onChange={this.handleInputChange}
                data-testid='timespan-inline-form-title'
                className='mx-0'
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId='beginTime' className='ml-0'>
            <Form.Label column sm={2} md={3}>Begin</Form.Label>
            <Col sm={10} md={9} className='px-0'>
              <Form.Control
                as='input'
                style={styles.formControl}
                value={beginTime}
                onChange={this.handleInputChange}
                isValid={getValidationBeginState(beginTime, this.allSpans)}
                isInvalid={!getValidationBeginState(beginTime, this.allSpans)}
                data-testid='timespan-inline-form-begintime'
                className='mx-0'
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId='endTime' className='ml-0'>
            <Form.Label column sm={2} md={3}>End</Form.Label>
            <Col sm={10} md={9} className='px-0'>
              <Form.Control
                type='text'
                style={styles.formControl}
                value={endTime}
                isValid={getValidationEndState(
                  beginTime,
                  endTime,
                  this.allSpans,
                  this.props.peaksInstance.duration
                )}
                isInvalid={
                  !getValidationEndState(
                    beginTime,
                    endTime,
                    this.allSpans,
                    this.props.peaksInstance.duration
                  )
                }
                onChange={this.handleInputChange}
                data-testid='timespan-inline-form-endtime'
                className='mx-0'
              />
            </Col>
          </Form.Group>
        </Form>
        <ListItemInlineEditControls
          formIsValid={this.formIsValid()}
          handleSaveClick={this.handleSaveClick}
          handleCancelClick={this.handleCancelClick}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  smData: state.structuralMetadata.smData,
  peaksInstance: state.peaksInstance,
  segment: state.peaksInstance.segment,
  isDragging: state.peaksInstance.isDragging,
  startTimeChanged: state.peaksInstance.startTimeChanged,
});

const mapDispatchToProps = {
  activateSegment: peaksActions.activateSegment,
  insertPlaceholderSegment: peaksActions.insertPlaceholderSegment,
  revertSegment: peaksActions.revertSegment,
  saveSegment: peaksActions.saveSegment,
  updateSegment: peaksActions.updateSegment,
  dragSegment: peaksActions.dragSegment,
};

export default connect(mapStateToProps, mapDispatchToProps)(TimespanInlineForm);
