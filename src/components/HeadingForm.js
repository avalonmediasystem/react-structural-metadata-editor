import React, { Component } from 'react';
import { connect } from 'react-redux';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import * as actions from '../actions/forms';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';
import { getValidationTitleState } from '../services/form-helper';

const structuralMetadataUtils = new StructuralMetadataUtils();
class HeadingForm extends Component {
  state = {
    headingTitle: '',
    headingChildOf: '',
    childOfOptions: [],
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
      childOfOptions: [],
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
    const options = allHeaders.map((header) => (
      <option value={header.id} key={header.id}>
        {header.label}
      </option>
    ));

    return options;
  }

  handleCancelClick = () => {
    this.props.toggleHeading();
  };

  handleChildOfChange = (e) => {
    this.setState({ headingChildOf: e.target.value });
  };

  handleHeadingChange = (e) => {
    this.setState({ headingTitle: e.target.value });
  };

  handleSubmit = (e) => {
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
      <Form onSubmit={this.handleSubmit} data-testid='heading-form' className='mb-0'>
        <Form.Group controlId='headingTitle' className='mb-3'>
          <Form.Label>Title</Form.Label>
          <Form.Control
            type='text'
            value={headingTitle}
            isValid={getValidationTitleState(headingTitle)}
            isInvalid={!getValidationTitleState(headingTitle)}
            onChange={this.handleHeadingChange}
            data-testid='heading-title-form-control'
          />
          <Form.Control.Feedback />
        </Form.Group>

        <Form.Group controlId='headingChildOf' className='mb-3'>
          <Form.Label>Child Of</Form.Label>
          <Form.Select
            onChange={this.handleChildOfChange}
            value={this.state.headingChildOf}
          >
            <option value=''>Select...</option>
            {this.state.childOfOptions}
          </Form.Select>
        </Form.Group>

        <Row>
          <Col sm={{ offset: 5 }} md={{ offset: 5 }} lg={{ offset: 10 }}>
            <ButtonToolbar className='float-right'>
              <Button
                variant='outline-secondary'
                className='mr-1'
                onClick={this.props.cancelClick}
                data-testid='heading-form-cancel-button'
              >
                Cancel
              </Button>
              <Button
                variant='primary'
                type='submit'
                disabled={!this.formIsValid()}
                data-testid='heading-form-save-button'
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

HeadingForm.propTypes = {
  cancelClick: PropTypes.func,
  onSubmit: PropTypes.func,
};

const mapStateToProps = (state) => ({
  smData: state.structuralMetadata.smData,
});

export default connect(mapStateToProps, actions)(HeadingForm);
