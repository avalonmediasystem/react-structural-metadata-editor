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
      isTyping: false
    };
    this.allSpans = null;
  }

  componentDidMount() {
    const { smData } = this.props;
    this.allSpans = structuralMetadataUtils.getItemsOfType('span', smData);
  }

  componentDidUpdate(prevProps) {
    const { smData } = this.props;
    if (!isEqual(smData, prevProps.smData)) {
      this.allSpans = structuralMetadataUtils.getItemsOfType('span', smData);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.timespanOpen && !this.state.isTyping) {
      const { initSegment, isInitializing, peaksInstance, segment } = nextProps;

      // Set state to get initial begin and end times from temporary segment
      if (initSegment !== this.props.initSegment && isInitializing) {
        const { startTime, endTime } = initSegment;
        this.setState({
          beginTime: structuralMetadataUtils.toHHmmss(startTime),
          endTime: structuralMetadataUtils.toHHmmss(endTime)
        });
        this.props.updateInitialize(false);
      }

      // Update state when segment handles are dragged in the waveform
      if (this.props.peaksInstance !== peaksInstance && !isInitializing) {
        // Prevent from overlapping when dragging the handles
        const { startTime, endTime } = waveformDataUtils.validateSegment(
          segment,
          peaksInstance.peaks
        );
        this.setState(
          {
            beginTime: structuralMetadataUtils.toHHmmss(startTime),
            endTime: structuralMetadataUtils.toHHmmss(endTime)
          },
          this.updateChildOfOptions()
        );
      }
    }
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
      validHeadings: [],
      isTyping: false
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

  handleTimeChange = (e, callback) => {
    // Update waveform segment with user inputs in the form
    this.setState({ isTyping: true });

    this.setState({ [e.target.id]: e.target.value }, () => {
      callback();
      this.updateChildOfOptions();
      const { initSegment, peaksInstance } = this.props;
      let segment = peaksInstance.peaks.segments.getSegment(initSegment.id);
      if (this.localValidTimespans().valid) {
        this.props.updateSegment(segment, this.state);
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
                onChange={e => {
                  this.handleTimeChange(e, () => {
                    this.setState({ isTyping: false });
                  });
                }}
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
                onChange={e => {
                  this.handleTimeChange(e, () => {
                    this.setState({ isTyping: false });
                  });
                }}
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
  segment: state.peaksInstance.segment
});

const mapDispatchToProps = {
  updateSegment: peaksActions.updateSegment
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TimespanForm);
