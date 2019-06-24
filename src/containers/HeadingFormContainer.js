import React, { Component } from 'react';
import HeadingForm from '../components/HeadingForm';
import { connect } from 'react-redux';
import * as smActions from '../actions/sm-data';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';

const structuralMetadataUtils = new StructuralMetadataUtils();

class HeadingFormContainer extends Component {
  state = {
    message: null
  };

  submit = values => {
    const { smData } = this.props;
    let submittedItem = {
      headingChildOf: values.headingChildOf,
      headingTitle: values.headingTitle
    };
    let updatedSmData = null;

    // Update the data structure with new heading
    updatedSmData = structuralMetadataUtils.insertNewHeader(
      submittedItem,
      smData
    );

    // Update redux store
    this.props.reBuildSMUI(updatedSmData);

    // Close the form
    this.props.cancelClick();
  };

  render() {
    return (
      <HeadingForm
        onSubmit={this.submit}
        cancelClick={this.props.cancelClick}
      />
    );
  }
}

const mapDispatchToProps = dispatch => ({
  reBuildSMUI: data => dispatch(smActions.reBuildSMUI(data))
});

const mapStateToProps = state => ({
  smData: state.structuralMetadata.smData
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HeadingFormContainer);
