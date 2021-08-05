import React from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faSave } from '@fortawesome/free-solid-svg-icons';

const tooltip = (tip) => <Tooltip id="tooltip">{tip}</Tooltip>;

const ListItemInlineEditControls = (props) => {
  return (
    <div className="edit-controls-wrapper" data-testid="inline-form-controls">
      <OverlayTrigger placement="left" overlay={tooltip('Save')}>
        <Button
          bsStyle="link"
          disabled={!props.formIsValid}
          onClick={props.handleSaveClick}
          data-testid="inline-form-save-button"
        >
          <FontAwesomeIcon icon={faSave} />
        </Button>
      </OverlayTrigger>
      <OverlayTrigger
        placement="right"
        overlay={tooltip('Cancel')}
        onClick={props.handleCancelClick}
      >
        <Button bsStyle="link" data-testid="inline-form-cancel-button">
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
