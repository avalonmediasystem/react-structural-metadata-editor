import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {
  getExistingFormValues,
  getValidationTitleState,
  isTitleValid,
} from '../services/form-helper';
import { connect } from 'react-redux';
import { cloneDeep } from 'lodash';
import ListItemInlineEditControls from './ListItemInlineEditControls';

const styles = {
  formControl: {
    margin: '0 5px',
    width: '300px',
  },
};

class HeadingInlineForm extends Component {
  constructor(props) {
    super(props);

    // To implement validation logic on begin and end times, we need to remove the current item
    // from the stored data
    this.tempSmData = undefined;
  }

  static propTypes = {
    item: PropTypes.object,
    cancelFn: PropTypes.func,
    saveFn: PropTypes.func,
  };

  state = {
    headingTitle: '',
  };

  componentDidMount() {
    const { smData } = this.props;

    // Get a fresh copy of store data
    this.tempSmData = cloneDeep(smData);

    // Load existing form values
    this.setState(getExistingFormValues(this.props.item.id, this.tempSmData));
  }

  formIsValid() {
    return isTitleValid(this.state.headingTitle);
  }

  handleCancelClick = () => {
    this.props.cancelFn();
  };

  handleInputChange = (e) => {
    this.setState({ [e.target.id]: e.target.value });
  };

  handleSaveClick = () => {
    const { headingTitle } = this.state;
    this.props.saveFn(this.props.item.id, {
      headingTitle,
    });
  };

  render() {
    const { headingTitle } = this.state;

    return (
      <div className='row-wrapper d-flex justify-content-between'>
        <Form data-testid='heading-inline-form' className='mb-0'>
          <Form.Group as={Row} controlId='headingTitle'>
            <Form.Label column sm={2}>Title</Form.Label>
            <Col sm={10}>
              <Form.Control
                type='text'
                style={styles.formControl}
                value={headingTitle}
                isValid={getValidationTitleState(headingTitle)}
                isInvalid={!getValidationTitleState(headingTitle)}
                onChange={this.handleInputChange}
                data-testid='inline-heading-title-form-control'
              />
            </Col>
          </Form.Group>
        </Form>
        <ListItemInlineEditControls
          formIsValid={this.formIsValid()}
          handleSaveClick={this.handleSaveClick}
          handleCancelClick={this.handleCancelClick}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  smData: state.structuralMetadata.smData,
});

export default connect(mapStateToProps)(HeadingInlineForm);
