import React, { Component } from 'react';
import { Button, ButtonToolbar, Col, Form, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';
import {
  getValidationBeginState,
  getValidationEndState,
  getValidationTitleState,
  isTitleValid,
  validTimespans,
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
      isInitializing: this.props.isInitializing,
      allSpans: null,
    };
  }

  componentDidMount() {
    const { smData, peaksInstance } = this.props;
    const { beginTime, endTime } = this.state;
    this.setState({
      allSpans: structuralMetadataUtils.getItemsOfType('span', smData),
    });
    if (peaksInstance && beginTime !== '' && endTime !== '') {
      this.updateChildOfOptions();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { smData } = this.props;
    if (!isEqual(smData, prevProps.smData) && smData.length > 0) {
      this.setState({
        allSpans: structuralMetadataUtils.getItemsOfType('span', smData),
      });
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
      const {
        initSegment,
        isInitializing,
        peaksInstance,
        segment,
        smData,
        startTimeChanged,
      } = nextProps;

      // Render initial values when form opens
      if (initSegment && isInitializing) {
        const { startTime, endTime } = initSegment;
        return {
          allSpans: structuralMetadataUtils.getItemsOfType('span', smData),
          beginTime: structuralMetadataUtils.toHHmmss(startTime),
          endTime: structuralMetadataUtils.toHHmmss(endTime),
          isInitializing: false,
        };
      }
      // Render time value changes
      if (prevState.peaksInstance !== peaksInstance && !isInitializing) {
        const { startTime, endTime } = waveformDataUtils.validateSegment(
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
      end: this.state.endTime,
    };

    // Get spans in overall span list which fall before and after the new span
    let wrapperSpans = structuralMetadataUtils.findWrapperSpans(
      newSpan,
      this.state.allSpans
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
      validHeadings: [],
    });
  };

  clearFormValues() {
    this.setState({
      beginTime: '',
      endTime: '',
      timespanChildOf: '',
      timespanTitle: '',
      validHeadings: [],
    });
    // Reset isTyping flag
    this.props.setIsTyping(0);
  }

  formIsValid() {
    const titleValid = isTitleValid(this.state.timespanTitle);
    const childOfValid = this.state.timespanChildOf.length > 0;
    const timesValidResponse = this.localValidTimespans();

    return titleValid && childOfValid && timesValidResponse.valid;
  }

  handleInputChange = (e) => {
    this.setState(
      { [e.target.id]: e.target.value },
      this.updateChildOfOptions()
    );
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { beginTime, endTime, timespanChildOf, timespanTitle } = this.state;

    this.props.cancelClick();
    this.props.onSubmit({
      beginTime,
      endTime,
      timespanChildOf,
      timespanTitle,
    });

    // Clear form values
    this.clearFormValues();
  };

  handleTimeChange = (e) => {
    const { segment, startTimeChanged } = this.props;
    // Lock setting isTyping to false before updating the DOM
    this.props.dragSegment(segment.id, startTimeChanged, 0);

    // Set isTyping flag in props to true
    this.props.setIsTyping(1);

    this.setState({ [e.target.id]: e.target.value }, () => {
      this.updateChildOfOptions();
      // Update waveform segment with user inputs in the form
      if (this.localValidTimespans().valid) {
        this.props.updateSegment(segment, this.state);
      }
    });
  };

  handleCancelClick = () => {
    this.props.cancelClick();
    this.props.setIsTyping(0);
  };

  handleChildOfChange = (e) => {
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
    const { beginTime, endTime, allSpans } = this.state;

    return validTimespans(
      beginTime,
      endTime,
      this.props.peaksInstance.duration,
      allSpans
    );
  }

  render() {
    const { beginTime, endTime, timespanChildOf, timespanTitle, allSpans } =
      this.state;

    return (
      <Form onSubmit={this.handleSubmit} data-testid="timespan-form">
        <Form.Group controlId="timespanTitle">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            value={timespanTitle}
            isValid={getValidationTitleState(timespanTitle)}
            isInvalid={!getValidationTitleState(timespanTitle)}
            onChange={this.handleInputChange}
            data-testid="timespan-form-title"
          />
          <Form.Control.Feedback />
        </Form.Group>

        <Row>
          <Col sm={6}>
            <Form.Group controlId="beginTime">
              <Form.Label>Begin Time</Form.Label>
              <Form.Control
                type="text"
                value={beginTime}
                isValid={getValidationBeginState(beginTime, allSpans)}
                isInvalid={!getValidationBeginState(beginTime, allSpans)}
                placeholder="00:00:00"
                onChange={this.handleTimeChange}
                data-testid="timespan-form-begintime"
              />
              <Form.Control.Feedback />
            </Form.Group>
          </Col>
          <Col sm={6}>
            <Form.Group controlId="endTime">
              <Form.Label>End Time</Form.Label>
              <Form.Control
                type="text"
                value={endTime}
                isValid={getValidationEndState(
                  beginTime,
                  endTime,
                  allSpans,
                  this.props.peaksInstance.peaks
                )}
                isInvalid={
                  !getValidationEndState(
                    beginTime,
                    endTime,
                    allSpans,
                    this.props.peaksInstance.peaks
                  )
                }
                placeholder="00:00:00"
                onChange={this.handleTimeChange}
                data-testid="timespan-form-endtime"
              />
              <Form.Control.Feedback />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group controlId="timespanChildOf">
          <Form.Label>Child Of</Form.Label>
          <Form.Control
            as="select"
            onChange={this.handleChildOfChange}
            value={timespanChildOf}
            data-testid="timespan-form-childof"
          >
            <option value="">Select...</option>
            {this.state.validHeadings.map((item) => (
              <option value={item.id} key={item.id}>
                {item.label}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Row>
          <Col sm={{ offset: 5 }} md={{ offset: 5 }} lg={{ offset: 10 }}>
            <ButtonToolbar className="float-right">
              <Button
                variant="outline-secondary"
                className="mr-1"
                onClick={this.handleCancelClick}
                data-testid="timespan-form-cancel-button"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={!this.formIsValid()}
                data-testid="timespan-form-save-button"
              >
                Save
              </Button>
            </ButtonToolbar>
          </Col>
        </Row>
      </Form>
    );
  }
}

const mapStateToProps = (state) => ({
  smData: state.structuralMetadata.smData,
  peaksInstance: state.peaksInstance,
  segment: state.peaksInstance.segment,
  startTimeChanged: state.peaksInstance.startTimeChanged,
  isDragging: state.peaksInstance.isDragging,
});

const mapDispatchToProps = {
  updateSegment: peaksActions.updateSegment,
  dragSegment: peaksActions.dragSegment,
};

export default connect(mapStateToProps, mapDispatchToProps)(TimespanForm);
