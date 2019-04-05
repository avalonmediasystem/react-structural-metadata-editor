import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Col, Collapse, Row } from 'react-bootstrap';
import HeadingFormContainer from '../containers/HeadingFormContainer';
import TimespanFormContainer from '../containers/TimespanFormContainer';
import * as peaksActions from '../actions/peaks-instance';
import { configureAlert } from '../services/alert-status';
import AlertContainer from '../containers/AlertContainer';
import { handleEditingTimespans } from '../actions/forms';

const styles = {
  section: {
    margin: '4rem 0'
  },
  well: {
    marginTop: '1rem'
  }
};

class ButtonSection extends Component {
  state = {
    headingOpen: false,
    timespanOpen: false,
    initSegment: null,
    isInitializing: true,
    alertObj: null,
    disabled: true
  };

  updateInitializeFlag = value => {
    this.setState({
      isInitializing: value
    });
  };

  clearAlert = () => {
    this.setState({
      alertObj: null,
      disabled: true
    });
    // Clear the redux-store flag when closing the alert from AlertContainer
    this.props.handleEditingTimespans(1);
  };

  handleCancelHeadingClick = () => {
    this.setState({ headingOpen: false });
    this.clearAlert();
  };

  handleHeadingClick = () => {
    this.props.handleEditingTimespans(0);
    // When opening heading form, delete if a temporary segment exists
    this.deleteTempSegment();
    this.setState({
      alertObj: null,
      headingOpen: true,
      timespanOpen: false,
      disabled: false
    });
  };

  handleCancelTimespanClick = () => {
    this.deleteTempSegment();
    this.setState({ timespanOpen: false });
    this.clearAlert();
  };

  handleTimeSpanClick = () => {
    // Clear existing alertObj
    this.clearAlert();

    // Disable editing other items in structure
    this.props.handleEditingTimespans(0);

    // Create a temporary segment if timespan form is closed
    if (!this.state.timespanOpen) {
      this.props.createTempSegment();
    }
    const tempSegment = this.props.peaksInstance.peaks.segments.getSegment(
      'temp-segment'
    );
    if (tempSegment === null) {
      this.setState({
        alertObj: configureAlert(-4, this.clearAlert),
        headingOpen: false,
        disabled: false
      });
    } else {
      this.setState({
        initSegment: tempSegment,
        headingOpen: false,
        timespanOpen: true,
        isInitializing: true,
        disabled: false
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
    const timespanFormProps = {
      cancelClick: this.handleCancelTimespanClick,
      initSegment: this.state.initSegment,
      isInitializing: this.state.isInitializing,
      timespanOpen: this.state.timespanOpen,
      updateInitialize: this.updateInitializeFlag
    };

    const { structureRetrieved, waveformRetrieved } = this.props.forms;
    const waveformAndStructureValid = structureRetrieved && waveformRetrieved;

    return waveformAndStructureValid ? (
      <section style={styles.section}>
        <AlertContainer {...this.state.alertObj} />
        <Row>
          <Col xs={6}>
            <Button
              block
              onClick={this.handleHeadingClick}
              disabled={this.state.disabled && this.props.forms.editingDisabled}
            >
              Add a Heading
            </Button>
          </Col>
          <Col xs={6}>
            <Button
              block
              onClick={this.handleTimeSpanClick}
              disabled={this.state.disabled && this.props.forms.editingDisabled}
            >
              Add a Timespan
            </Button>
          </Col>
        </Row>

        <Collapse in={this.state.headingOpen}>
          <div className="well" style={styles.well}>
            <HeadingFormContainer cancelClick={this.handleCancelHeadingClick} />
          </div>
        </Collapse>
        <Collapse in={this.state.timespanOpen}>
          <div className="well" style={styles.well}>
            <TimespanFormContainer {...timespanFormProps} />
          </div>
        </Collapse>
      </section>
    ) : null;
  }
}

// To use in tests as a disconnected component (to access state)
export { ButtonSection as PureButtonSection };

const mapStateToProps = state => ({
  smData: state.smData,
  peaksInstance: state.peaksInstance,
  forms: state.forms
});

const mapDispatchToProps = {
  createTempSegment: peaksActions.insertTempSegment,
  deleteTempSegment: peaksActions.deleteTempSegment,
  handleEditingTimespans: handleEditingTimespans
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ButtonSection);
