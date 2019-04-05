import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ControlLabel, Form, FormControl, FormGroup } from 'react-bootstrap';
import {
  getExistingFormValues,
  getValidationBeginState,
  getValidationEndState,
  getValidationTitleState,
  isTitleValid,
  validTimespans
} from '../services/form-helper';
import { connect } from 'react-redux';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';
import { cloneDeep } from 'lodash';
import ListItemInlineEditControls from './ListItemInlineEditControls';
import * as peaksActions from '../actions/peaks-instance';
import WaveformDataUtils from '../services/WaveformDataUtils';

const structuralMetadataUtils = new StructuralMetadataUtils();
const waveformUtils = new WaveformDataUtils();

const styles = {
  formControl: {
    margin: '0 5px'
  }
};

class TimespanInlineForm extends Component {
  constructor(props) {
    super(props);

    // To implement validation logic on begin and end times, we need to remove the current item
    // from the stored data
    this.tempSmData = undefined;
  }

  static propTypes = {
    item: PropTypes.object,
    cancelFn: PropTypes.func,
    saveFn: PropTypes.func
  };

  state = {
    beginTime: '',
    endTime: '',
    timespanTitle: '',
    clonedSegment: {},
    isTyping: false
  };

  componentDidMount() {
    const { smData, item, peaksInstance } = this.props;

    // Get a fresh copy of store data
    this.tempSmData = cloneDeep(smData);

    // Load existing form values
    this.setState(
      getExistingFormValues(item.id, this.tempSmData, peaksInstance.peaks)
    );

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

    this.props.changeSegment();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.peaksInstance !== nextProps.peaksInstance) {
      if (nextProps.segment && !this.state.isTyping) {
        const { segment, peaksInstance } = nextProps;
        // Prevent from overlapping when dragging the handles
        const { startTime, endTime } = waveformUtils.validateSegment(
          segment,
          peaksInstance.peaks
        );
        this.setState({
          beginTime: structuralMetadataUtils.toHHmmss(startTime),
          endTime: structuralMetadataUtils.toHHmmss(endTime)
        });
      }
    }
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

  handleInputChange = (e, callback) => {
    this.setState({ isTyping: true });
    this.setState({ [e.target.id]: e.target.value }, () => {
      callback();
      const { item, peaksInstance } = this.props;
      let segment = peaksInstance.peaks.segments.getSegment(item.id);
      if (this.formIsValid()) {
        this.props.updateSegment(segment, this.state);
      }
    });
  };

  handleSaveClick = () => {
    this.props.saveSegment(this.state);
    const { beginTime, endTime, timespanTitle } = this.state;
    this.props.saveFn(this.props.item.id, {
      beginTime,
      endTime,
      timespanTitle
    });
  };

  render() {
    const { beginTime, endTime, timespanTitle } = this.state;

    return (
      <Form inline>
        <div className="row-wrapper">
          <div>
            <FormGroup
              controlId="timespanTitle"
              validationState={getValidationTitleState(timespanTitle)}
            >
              <ControlLabel>Title</ControlLabel>
              <FormControl
                type="text"
                style={styles.formControl}
                value={timespanTitle}
                onChange={e => {
                  this.handleInputChange(e, () => {
                    this.setState({ isTyping: false });
                  });
                }}
              />
            </FormGroup>
            <FormGroup
              controlId="beginTime"
              validationState={getValidationBeginState(
                beginTime,
                this.allSpans
              )}
            >
              <ControlLabel>Begin Time</ControlLabel>
              <FormControl
                type="text"
                style={styles.formControl}
                value={beginTime}
                onChange={e => {
                  this.handleInputChange(e, () => {
                    this.setState({ isTyping: false });
                  });
                }}
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
                onChange={e => {
                  this.handleInputChange(e, () => {
                    this.setState({ isTyping: false });
                  });
                }}
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

// For testing purposes
export { TimespanInlineForm as PureTimespanInlineForm };

const mapStateToProps = state => ({
  smData: state.smData,
  peaksInstance: state.peaksInstance,
  segment: state.peaksInstance.segment
});

const mapDispatchToProps = {
  activateSegment: peaksActions.activateSegment,
  revertSegment: peaksActions.revertSegment,
  saveSegment: peaksActions.saveSegment,
  updateSegment: peaksActions.updateSegment,
  changeSegment: peaksActions.changeSegment
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TimespanInlineForm);
