import React, { Component } from 'react';
import TimespanForm from '../components/TimespanForm';
import { connect } from 'react-redux';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';
import * as smActions from '../actions/sm-data';
import * as peaksActions from '../actions/peaks-instance';

const structuralMetadataUtils = new StructuralMetadataUtils();
class TimespanFormContainer extends Component {
  state = {
    isTyping: false
  };

  submit = values => {
    // Update the data structure with new heading
    const { newSpan, updatedData } = structuralMetadataUtils.insertNewTimespan(
      values,
      this.props.smData
    );

    // Update the waveform segments with new timespan
    this.props.insertNewSegment(newSpan);

    // Update redux store
    this.props.reBuildSMUI(updatedData);

    // Close the form
    this.props.cancelClick();
  };

  setIsTyping = value => {
    if (value === 1) {
      this.setState({ isTyping: true });
    } else {
      this.setState({ isTyping: false });
    }
  };

  render() {
    return (
      <TimespanForm
        {...this.props}
        setIsTyping={this.setIsTyping}
        isTyping={this.state.isTyping}
        onSubmit={this.submit}
      />
    );
  }
}

const mapDispatchToProps = dispatch => ({
  reBuildSMUI: data => dispatch(smActions.reBuildSMUI(data)),
  insertNewSegment: newspan => dispatch(peaksActions.insertNewSegment(newspan))
});

const mapStateToProps = state => ({
  smData: state.structuralMetadata.smData
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TimespanFormContainer);
