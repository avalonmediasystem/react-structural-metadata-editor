import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faSave } from '@fortawesome/free-solid-svg-icons';

const ListItemInlineEditControls = ({ formIsValid, handleCancelClick, handleSaveClick }) => {
  return (
    <div className='edit-controls-wrapper d-flex' data-testid='inline-form-controls'>
      <OverlayTrigger placement='left' overlay={<Tooltip id='tooltip-save'>Save</Tooltip>}>
        <Button
          variant='link'
          disabled={!formIsValid}
          onClick={handleSaveClick}
          data-testid='inline-form-save-button'
        >
          <FontAwesomeIcon icon={faSave} />
        </Button>
      </OverlayTrigger>
      <OverlayTrigger placement='left' overlay={<Tooltip id='tooltip-cancel'>Cancel</Tooltip>}>
        <Button
          variant='link'
          data-testid='inline-form-cancel-button'
          onClick={handleCancelClick}
        >
          <FontAwesomeIcon icon={faMinusCircle} />
        </Button>
      </OverlayTrigger>
    </div>
  );
};

ListItemInlineEditControls.propTypes = {
  formIsValid: PropTypes.bool,
  handleSaveClick: PropTypes.func,
  handleCancelClick: PropTypes.func,
};

export default ListItemInlineEditControls;
