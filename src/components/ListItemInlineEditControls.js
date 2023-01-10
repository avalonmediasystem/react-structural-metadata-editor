import React from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faSave } from '@fortawesome/free-solid-svg-icons';

const tooltip = (tip) => <Tooltip id="tooltip">{tip}</Tooltip>;

const ListItemInlineEditControls = (props) => {
  return (
    <div className="edit-controls-wrapper" data-testid="inline-form-controls">
      <OverlayTrigger placement="bottom" overlay={tooltip('Save')}>
        <Button
          variant="link"
          disabled={!props.formIsValid}
          onClick={props.handleSaveClick}
          data-testid="inline-form-save-button"
        >
          <FontAwesomeIcon icon={faSave} />
        </Button>
      </OverlayTrigger>
      <OverlayTrigger placement="bottom" overlay={tooltip('Cancel')}>
        <Button
          variant="link"
          data-testid="inline-form-cancel-button"
          onClick={props.handleCancelClick}
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
