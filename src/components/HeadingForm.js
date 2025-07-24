import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import PropTypes from 'prop-types';
import { getValidationTitleState } from '../services/form-helper';

const structuralMetadataUtils = new StructuralMetadataUtils();

const HeadingForm = ({ cancelClick, onSubmit }) => {
  // State variables from Redux store
  const { smData } = useSelector((state) => state.structuralMetadata);

  const [headingTitle, setHeadingTitle] = useState('');
  const [headingChildOf, setHeadingChildOf] = useState('');
  const [childOfOptions, setChildOfOptions] = useState([]);

  useEffect(() => {
    if (smData?.length > 0) {
      processOptions();
    }
  }, [smData]);

  const processOptions = () => {
    const options = getOptions();
    setChildOfOptions([...options]);
  };

  const clearFormValues = () => {
    setHeadingTitle('');
    setHeadingChildOf('');
    setChildOfOptions([]);
  };

  const formIsValid = () => {
    const titleValid = headingTitle && headingTitle.length > 2;
    const childOfValid = headingChildOf.length > 0;

    return titleValid && childOfValid;
  };

  const getOptions = () => {
    const rootHeader = structuralMetadataUtils.getItemsOfType('root', smData);
    const divHeaders = structuralMetadataUtils.getItemsOfType('div', smData);
    const allHeaders = rootHeader.concat(divHeaders);
    const options = allHeaders.map((header) => (
      <option value={header.id} key={header.id}>
        {header.label}
      </option>
    ));

    return options;
  };

  const handleChildOfChange = (e) => {
    setHeadingChildOf(e.target.value);
  };

  const handleHeadingChange = (e) => {
    setHeadingTitle(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ headingChildOf, headingTitle });

    // Clear form
    clearFormValues();
  };

  return (
    <Form onSubmit={handleSubmit} data-testid='heading-form' className='mb-0'>
      <Form.Group controlId='headingTitle' className='mb-3'>
        <Form.Label>Title</Form.Label>
        <Form.Control
          type='text'
          value={headingTitle}
          isValid={getValidationTitleState(headingTitle)}
          isInvalid={!getValidationTitleState(headingTitle)}
          onChange={handleHeadingChange}
          data-testid='heading-form-title'
        />
        <Form.Control.Feedback />
      </Form.Group>

      <Form.Group controlId='headingChildOf' className='mb-3'>
        <Form.Label>Child Of</Form.Label>
        <Form.Select
          onChange={handleChildOfChange}
          value={headingChildOf}
          data-testid='heading-form-childof'
        >
          <option value=''>Select...</option>
          {childOfOptions}
        </Form.Select>
      </Form.Group>

      <Row>
        <Col>
          <ButtonToolbar className='float-end'>
            <Button
              variant='outline-secondary'
              className='me-1'
              onClick={cancelClick}
              data-testid='heading-form-cancel-button'
            >
              Cancel
            </Button>
            <Button
              variant='primary'
              type='submit'
              disabled={!formIsValid()}
              data-testid='heading-form-save-button'
            >
              Save
            </Button>
          </ButtonToolbar>
        </Col>
      </Row>
    </Form>
  );
};

HeadingForm.propTypes = {
  cancelClick: PropTypes.func,
  onSubmit: PropTypes.func,
};

export default HeadingForm;
