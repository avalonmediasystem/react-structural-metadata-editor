import React, { Component } from 'react';
import {
  Button,
  ButtonToolbar,
  Col,
  ControlLabel,
  FormControl,
  FormGroup,
  Row
} from 'react-bootstrap';
import { connect } from 'react-redux';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';
import {
  getValidationBeginState,
  getValidationEndState,
  getValidationTitleState,
  isTitleValid,
  validTimespans
} from '../services/form-helper';
import * as peaksActions from '../actions/peaks-instance';
import WaveformDataUtils from '../services/WaveformDataUtils';
import { isEqual } from 'lodash';

const structuralMetadataUtils = new StructuralMetadataUtils();
const waveformDataUtils = new WaveformDataUtils();

class TimespanForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      beginTime: '',
      endTime: '',
      timespanChildOf: '',
      timespanTitle: '',
      validHeadings: [],
      peaksInstance: this.props.peaksInstance,
      isInitializing: this.props.isInitializing
    };
    this.allSpans = null;
  }

  componentDidMount() {
    const { smData } = this.props;
    this.allSpans = structuralMetadataUtils.getItemsOfType('span', smData);
  }

  componentDidUpdate(prevProps, prevState) {
    const { smData } = this.props;
    if (!isEqual(smData, prevProps.smData)) {
      this.allSpans = structuralMetadataUtils.getItemsOfType('span', smData);
      // Update valid headings when structure changes
      this.updateChildOfOptions();
    }
    const { beginTime, endTime, isInitializing } = this.state;
    const { beginTime: prevBeginTime, endTime: prevEndTime } = prevState;
    if (beginTime !== prevBeginTime || endTime !== prevEndTime) {
      this.updateChildOfOptions();
      if (!isInitializing) {
        // Set isInitializing flag to false
        this.props.setIsInitializing(0);
      }
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.timespanOpen && !nextProps.isTyping) {
      const { initSegment, isInitializing, peaksInstance, segment } = nextProps;

      if (initSegment && isInitializing) {
        const { startTime, endTime } = initSegment;
        return {
          beginTime: structuralMetadataUtils.toHHmmss(startTime),
          endTime: structuralMetadataUtils.toHHmmss(endTime),
          isInitializing: false
        };
      }

      if (prevState.peaksInstance !== peaksInstance && !isInitializing) {
        const { startTime, endTime } = waveformDataUtils.validateSegment(
          segment,
          peaksInstance.peaks
        );
        return {
          beginTime: structuralMetadataUtils.toHHmmss(startTime),
          endTime: structuralMetadataUtils.toHHmmss(endTime)
        };
      }
    }
    // When handles in waveform is dragged disable typing in the input form
    if (nextProps.isDragging) {
      nextProps.setIsTyping(0);
    }
    return null;
  }

  buildHeadingsOptions = () => {
    const { smData } = this.props;
    let newSpan = {
      begin: this.state.beginTime,
      end: this.state.endTime
    };

    // Get spans in overall span list which fall before and after the new span
    let wrapperSpans = structuralMetadataUtils.findWrapperSpans(
      newSpan,
      this.allSpans
    );

    // Get all valid div headings
    let validHeadings = structuralMetadataUtils.getValidHeadings(
      newSpan,
      wrapperSpans,
      smData
    );

    // Update state with valid headings
    this.setState({ validHeadings });
  };

  clearHeadingOptions = () => {
    this.setState({
      validHeadings: []
    });
  };

  clearFormValues() {
    this.setState({
      beginTime: '',
      endTime: '',
      timespanChildOf: '',
      timespanTitle: '',
      validHeadings: []
    });
  }

  formIsValid() {
    const titleValid = isTitleValid(this.state.timespanTitle);
    const childOfValid = this.state.timespanChildOf.length > 0;
    const timesValidResponse = this.localValidTimespans();

    return titleValid && childOfValid && timesValidResponse.valid;
  }

  handleInputChange = e => {
    this.setState(
      { [e.target.id]: e.target.value },
      this.updateChildOfOptions()
    );
  };

  handleSubmit = e => {
    e.preventDefault();
    const { beginTime, endTime, timespanChildOf, timespanTitle } = this.state;

    this.props.cancelClick();
    this.props.onSubmit({
      beginTime,
      endTime,
      timespanChildOf,
      timespanTitle
    });

    // Clear form values
    this.clearFormValues();
  };

  handleTimeChange = e => {
    // Lock setting isTyping to false before updating the DOM
    this.props.setIsDragging(this.props.segment, 0);

    // Set isTyping flag in props to true
    this.props.setIsTyping(1);

    this.setState({ [e.target.id]: e.target.value }, () => {
      this.updateChildOfOptions();
      // Update waveform segment with user inputs in the form
      if (this.localValidTimespans().valid) {
        this.props.updateSegment(this.props.segment, this.state);
      }
    });
  };

  handleCancelClick = () => {
    this.props.cancelClick();
  };

  handleChildOfChange = e => {
    this.setState({ timespanChildOf: e.target.value });
  };

  updateChildOfOptions() {
    const timesValidResponse = this.localValidTimespans();

    if (timesValidResponse.valid) {
      this.buildHeadingsOptions();
    } else {
      this.clearHeadingOptions();
    }
  }

  /**
   * A local wrapper for the reusable function 'validTimespans'
   */
  localValidTimespans() {
    const { beginTime, endTime } = this.state;
    const { allSpans } = this;

    return validTimespans(
      beginTime,
      endTime,
      allSpans,
      this.props.peaksInstance.peaks
    );
  }

  render() {
    const { beginTime, endTime, timespanChildOf, timespanTitle } = this.state;

    return (
      <form onSubmit={this.handleSubmit}>
        <FormGroup
          controlId="timespanTitle"
          validationState={getValidationTitleState(timespanTitle)}
        >
          <ControlLabel>Title</ControlLabel>
          <FormControl
            type="text"
            value={timespanTitle}
            onChange={this.handleInputChange}
          />
          <FormControl.Feedback />
        </FormGroup>

        <Row>
          <Col sm={6}>
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
                value={beginTime}
                placeholder="00:00:00"
                onChange={this.handleTimeChange}
              />
              <FormControl.Feedback />
            </FormGroup>
          </Col>
          <Col sm={6}>
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
                value={endTime}
                placeholder="00:00:00"
                onChange={this.handleTimeChange}
              />
              <FormControl.Feedback />
            </FormGroup>
          </Col>
        </Row>

        <FormGroup controlId="timespanChildOf">
          <ControlLabel>Child Of</ControlLabel>
          <FormControl
            componentClass="select"
            placeholder="select"
            onChange={this.handleChildOfChange}
            value={timespanChildOf}
          >
            <option value="">Select...</option>
            {this.state.validHeadings.map(item => (
              <option value={item.id} key={item.id}>
                {item.label}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <Row>
          <Col xs={12}>
            <ButtonToolbar className="pull-right">
              <Button onClick={this.handleCancelClick}>Cancel</Button>
              <Button
                bsStyle="primary"
                type="submit"
                disabled={!this.formIsValid()}
              >
                Save
              </Button>
            </ButtonToolbar>
          </Col>
        </Row>
      </form>
    );
  }
}

// For testing purposes
export { TimespanForm as PureTimespanForm };

const mapStateToProps = state => ({
  smData: state.smData,
  peaksInstance: state.peaksInstance,
  segment: state.peaksInstance.segment,
  isDragging: state.peaksInstance.isDragging
});

const mapDispatchToProps = {
  updateSegment: peaksActions.updateSegment,
  setIsDragging: peaksActions.dragSegment
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TimespanForm);
