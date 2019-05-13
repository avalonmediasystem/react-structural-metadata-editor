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

  setIsInitializing = value => {
    if (value === 1) {
      this.setState({ isInitializing: true });
    } else {
      this.setState({ isInitializing: false });
    }
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
      // Initialize Redux store with temporary segment
      this.props.bindInitSegment(tempSegment, 0);
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
      setIsInitializing: this.setIsInitializing
    };

    const { structureRetrieved, waveformRetrieved } = this.props.forms;

    // Only return UI when both structure and waveform data exist
    return structureRetrieved && waveformRetrieved ? (
      <section style={styles.section}>
        <AlertContainer {...this.state.alertObj} />
        <Row data-testid="button-row">
          <Col xs={6}>
            <Button
              data-testid="add-heading-button"
              block
              onClick={this.handleHeadingClick}
              disabled={this.state.disabled && this.props.forms.editingDisabled}
            >
              Add a Heading
            </Button>
          </Col>
          <Col xs={6}>
            <Button
              data-testid="add-timespan-button"
              block
              onClick={this.handleTimeSpanClick}
              disabled={this.state.disabled && this.props.forms.editingDisabled}
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

const mapStateToProps = state => ({
  smData: state.smData,
  peaksInstance: state.peaksInstance,
  forms: state.forms
});

const mapDispatchToProps = {
  createTempSegment: peaksActions.insertTempSegment,
  deleteTempSegment: peaksActions.deleteTempSegment,
  bindInitSegment: peaksActions.dragSegment,
  handleEditingTimespans: handleEditingTimespans
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ButtonSection);
