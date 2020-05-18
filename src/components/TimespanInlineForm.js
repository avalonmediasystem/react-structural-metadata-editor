import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ControlLabel, Form, FormControl, FormGroup } from 'react-bootstrap';
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

    // Load existing form values
    this.setState(getExistingFormValues(item.id, this.tempSmData, tempPeaks));

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

    // Make segment related to timespan editable
    this.props.activateSegment(item.id);

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
          peaksInstance.peaks
        );
        return {
          beginTime: structuralMetadataUtils.toHHmmss(startTime),
          endTime: structuralMetadataUtils.toHHmmss(endTime),
        };
      }
    }
    return null;
  }

  formIsValid() {
    const { beginTime, endTime } = this.state;
    const titleValid = isTitleValid(this.state.timespanTitle);
    const timesValidResponse = validTimespans(
      beginTime,
      endTime,
      this.allSpans,
      this.props.peaksInstance.peaks
    );

    return titleValid && timesValidResponse.valid;
  }

  handleCancelClick = () => {
    // Revert to segment to the state before
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
      <Form inline data-testid="timespan-inline-form">
        <div className="row-wrapper">
          <div>
            <FormGroup
              controlId="timespanTitle"
              validationState={getValidationTitleState(timespanTitle)}
              data-testid="timespan-inline-form-title"
            >
              <ControlLabel>Title</ControlLabel>
              <FormControl
                type="text"
                style={styles.formControl}
                value={timespanTitle}
                onChange={this.handleInputChange}
              />
            </FormGroup>
            <FormGroup
              controlId="beginTime"
              validationState={getValidationBeginState(
                beginTime,
                this.allSpans
              )}
              data-testid="timespan-inline-form-begintime"
            >
              <ControlLabel>Begin Time</ControlLabel>
              <FormControl
                type="text"
                style={styles.formControl}
                value={beginTime}
                onChange={this.handleInputChange}
              />
            </FormGroup>
            <FormGroup
              controlId="endTime"
              validationState={getValidationEndState(
                beginTime,
                endTime,
                this.allSpans,
                this.props.peaksInstance.peaks
              )}
            >
              <ControlLabel>End Time</ControlLabel>
              <FormControl
                type="text"
                style={styles.formControl}
                value={endTime}
                onChange={this.handleInputChange}
              />
            </FormGroup>
          </div>
          <ListItemInlineEditControls
            formIsValid={this.formIsValid()}
            handleSaveClick={this.handleSaveClick}
            handleCancelClick={this.handleCancelClick}
          />
        </div>
      </Form>
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
  revertSegment: peaksActions.revertSegment,
  saveSegment: peaksActions.saveSegment,
  updateSegment: peaksActions.updateSegment,
  dragSegment: peaksActions.dragSegment,
};

export default connect(mapStateToProps, mapDispatchToProps)(TimespanInlineForm);
