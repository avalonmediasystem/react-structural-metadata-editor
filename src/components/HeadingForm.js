import React, { Component } from 'react';
import { connect } from 'react-redux';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';
import {
  Button,
  ButtonToolbar,
  Col,
  ControlLabel,
  FormControl,
  FormGroup,
  Row
} from 'react-bootstrap';
import * as actions from '../actions/forms';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';
import { getValidationTitleState } from '../services/form-helper';

const structuralMetadataUtils = new StructuralMetadataUtils();
class HeadingForm extends Component {
  state = {
    headingTitle: '',
    headingChildOf: '',
    childOfOptions: []
  };

  componentDidMount() {
    if (this.props.smData.length > 0) {
      this.processOptions();
    }
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(this.props.smData, prevProps.smData)) {
      this.processOptions();
    }
  }

  clearFormValues() {
    this.setState({
      headingTitle: '',
      headingChildOf: '',
      childOfOptions: []
    });
  }

  formIsValid() {
    const { headingTitle } = this.state;
    const titleValid = headingTitle && headingTitle.length > 2;
    const childOfValid = this.state.headingChildOf.length > 0;

    return titleValid && childOfValid;
  }

  getOptions() {
    const rootHeader = structuralMetadataUtils.getItemsOfType(
      'root',
      this.props.smData
    );
    const divHeaders = structuralMetadataUtils.getItemsOfType(
      'div',
      this.props.smData
    );
    const allHeaders = rootHeader.concat(divHeaders);
    const options = allHeaders.map(header => (
      <option value={header.id} key={header.id}>
        {header.label}
      </option>
    ));

    return options;
  }

  handleCancelClick = () => {
    this.props.toggleHeading();
  };

  handleChildOfChange = e => {
    this.setState({ headingChildOf: e.target.value });
  };

  handleHeadingChange = e => {
    this.setState({ headingTitle: e.target.value });
  };

  handleSubmit = e => {
    const { headingChildOf, headingTitle } = this.state;
    let submitItem = { headingChildOf, headingTitle };

    e.preventDefault();

    this.props.onSubmit(submitItem);

    // Clear form
    this.clearFormValues();
  };

  processOptions() {
    const options = this.getOptions();
    this.setState({ childOfOptions: options });
  }

  render() {
    const { headingTitle } = this.state;

    return (
      <form onSubmit={this.handleSubmit} data-testid="heading-form">
        <FormGroup
          controlId="headingTitle"
          validationState={getValidationTitleState(headingTitle)}
          data-testid="heading-title-form-group"
        >
          <ControlLabel>Title</ControlLabel>
          <FormControl
            type="text"
            value={headingTitle}
            onChange={this.handleHeadingChange}
          />
          <FormControl.Feedback />
        </FormGroup>

        <FormGroup controlId="headingChildOf">
          <ControlLabel>Child Of</ControlLabel>

          <FormControl
            componentClass="select"
            placeholder="select"
            onChange={this.handleChildOfChange}
            value={this.state.headingChildOf}
          >
            <option value="">Select...</option>
            {this.state.childOfOptions}
          </FormControl>
        </FormGroup>

        <Row>
          <Col xs={12}>
            <ButtonToolbar className="pull-right">
              <Button
                onClick={this.props.cancelClick}
                data-testid="heading-form-cancel-button"
              >
                Cancel
              </Button>
              <Button
                bsStyle="primary"
                type="submit"
                disabled={!this.formIsValid()}
                data-testid="heading-form-save-button"
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

HeadingForm.propTypes = {
  cancelClick: PropTypes.func,
  onSubmit: PropTypes.func
};

const mapStateToProps = state => ({
  smData: state.smData
});

export default connect(
  mapStateToProps,
  actions
)(HeadingForm);
