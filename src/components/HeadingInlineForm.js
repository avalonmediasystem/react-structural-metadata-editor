import React, { useEffect, useState } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {
  getExistingFormValues,
  isTitleValid,
} from '../services/form-helper';
import { useSelector } from 'react-redux';
import { cloneDeep } from 'lodash';
import ListItemInlineEditControls from './ListItemInlineEditControls';

const styles = {
  formControl: {
    margin: '0 5px',
    width: '300px',
  },
};

const HeadingInlineForm = ({ itemId, cancelFn, saveFn }) => {
  // State variables from Redux store
  const { smData } = useSelector((state) => state.structuralMetadata);

  const [headingTitle, setHeadingTitle] = useState('');

  const { showBoundary } = useErrorBoundary();

  useEffect(() => {
    // Get a fresh copy of store data
    const tempSmData = cloneDeep(smData);

    // Load existing form values
    const formValues = getExistingFormValues(itemId, tempSmData);
    setHeadingTitle(formValues.headingTitle);
  }, [smData]);

  const formIsValid = () => {
    return isTitleValid(headingTitle);
  };

  const handleCancelClick = () => {
    cancelFn();
  };

  const handleInputChange = (e) => {
    setHeadingTitle(e.target.value);
  };

  const handleSaveClick = () => {
    try {
      saveFn(itemId, { headingTitle });
    } catch (error) {
      showBoundary(error);
    }
  };

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
              isValid={isTitleValid(headingTitle)}
              isInvalid={!isTitleValid(headingTitle)}
              onChange={handleInputChange}
              data-testid='inline-heading-title-form-control'
            />
          </Col>
        </Form.Group>
      </Form>
      <ListItemInlineEditControls
        formIsValid={formIsValid()}
        handleSaveClick={handleSaveClick}
        handleCancelClick={handleCancelClick}
      />
    </div>
  );
};

HeadingInlineForm.propTypes = {
  itemId: PropTypes.string,
  cancelFn: PropTypes.func,
  saveFn: PropTypes.func,
};

export default HeadingInlineForm;

