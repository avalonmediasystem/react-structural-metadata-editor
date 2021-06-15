import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Col, Collapse, Row } from 'react-bootstrap';
import HeadingFormContainer from '../containers/HeadingFormContainer';
import TimespanFormContainer from '../containers/TimespanFormContainer';
import * as peaksActions from '../actions/peaks-instance';
import { configureAlert } from '../services/alert-status';
import AlertContainer from '../containers/AlertContainer';
import {
  handleEditingTimespans,
  setAlert,
  removeAlert,
} from '../actions/forms';

const styles = {
  well: {
    marginTop: '1rem',
  },
};

class ButtonSection extends Component {
  state = {
    headingOpen: false,
    timespanOpen: false,
    initSegment: null,
    isInitializing: true,
    alertObj: {
      alert: null,
      showAlert: false,
    },
    disabled: true,
  };

  setIsInitializing = (value) => {
    if (value === 1) {
      this.setState({ isInitializing: true });
    } else {
      this.setState({ isInitializing: false });
    }
  };

  handleCancelHeadingClick = () => {
    this.setState({ headingOpen: false });
    // this.props.removeAlert();
  };

  handleHeadingClick = () => {
    this.props.handleEditingTimespans(1);
    // When opening heading form, delete if a temporary segment exists
    this.deleteTempSegment();
    // this.props.removeAlert();
    this.setState({
      // alertObj: { alert: null, showAlert: false },
      headingOpen: true,
      timespanOpen: false,
      disabled: false,
    });
  };

  handleCancelTimespanClick = () => {
    this.deleteTempSegment();
    this.setState({ timespanOpen: false });
    // this.props.removeAlert();
  };

  handleTimeSpanClick = () => {
    // Clear existing alertObj
    // this.props.removeAlert();

    // Disable editing other items in structure
    this.props.handleEditingTimespans(1);

    // Create a temporary segment if timespan form is closed
    if (!this.state.timespanOpen) {
      this.props.createTempSegment();
    }
    const tempSegment =
      this.props.peaksInstance.peaks.segments.getSegment('temp-segment');
    if (tempSegment === null) {
      const noSpaceAlert = configureAlert(-4);
      this.props.setAlert(noSpaceAlert);
      this.setState({
        // alertObj: { alert: noSpaceAlert, showAlert: true },
        headingOpen: false,
        disabled: false,
      });
    } else {
      // Initialize Redux store with temporary segment
      this.props.dragSegment(tempSegment.id, null, 0);
      this.setState({
        initSegment: tempSegment,
        headingOpen: false,
        timespanOpen: true,
        isInitializing: true,
        disabled: false,
      });
    }
  };

  // Delete if a temporary segment exists
  deleteTempSegment = () => {
    if (this.state.initSegment !== null) {
      this.props.deleteTempSegment(this.state.initSegment.id);
    }
  };

  render() {
    // console.log(this.state.alertObj);
    const timespanFormProps = {
      cancelClick: this.handleCancelTimespanClick,
      initSegment: this.state.initSegment,
      isInitializing: this.state.isInitializing,
      timespanOpen: this.state.timespanOpen,
      setIsInitializing: this.setIsInitializing,
    };

    const { editingDisabled, structureInfo, streamInfo } = this.props.forms;

    // Only return UI when both structure and waveform data exist
    return structureInfo.structureRetrieved ? (
      <section>
        {/* {this.state.alertObj.showAlert ? (
          <AlertContainer {...this.state.alertObj.alert} />
        ) : null} */}
        <Row data-testid="button-row">
          <Col xs={6}>
            <Button
              data-testid="add-heading-button"
              block
              onClick={this.handleHeadingClick}
              disabled={this.state.disabled && editingDisabled}
            >
              Add a Heading
            </Button>
          </Col>
          <Col xs={6}>
            <Button
              data-testid="add-timespan-button"
              block
              onClick={this.handleTimeSpanClick}
              disabled={
                (this.state.disabled && editingDisabled) ||
                streamInfo.streamMediaError
              }
            >
              Add a Timespan
            </Button>
          </Col>
        </Row>

        <Collapse in={this.state.headingOpen}>
          <div
            className="well"
            style={styles.well}
            data-testid="heading-form-wrapper"
          >
            <HeadingFormContainer cancelClick={this.handleCancelHeadingClick} />
          </div>
        </Collapse>
        <Collapse in={this.state.timespanOpen}>
          <div
            className="well"
            style={styles.well}
            data-testid="timespan-form-wrapper"
          >
            <TimespanFormContainer {...timespanFormProps} />
          </div>
        </Collapse>
      </section>
    ) : null;
  }
}

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
  removeAlert: removeAlert,
};

export default connect(mapStateToProps, mapDispatchToProps)(ButtonSection);
