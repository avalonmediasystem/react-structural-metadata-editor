import React from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

var tooltip = function tooltip(tip) {
  return React.createElement(
    Tooltip,
    { id: 'tooltip' },
    tip
  );
};

var ListItemInlineEditControls = function ListItemInlineEditControls(props) {
  return React.createElement(
    'div',
    { className: 'edit-controls-wrapper' },
    React.createElement(
      OverlayTrigger,
      { placement: 'left', overlay: tooltip('Save') },
      React.createElement(
        Button,
        {
          bsStyle: 'link',
          disabled: !props.formIsValid,
          onClick: props.handleSaveClick
        },
        React.createElement(FontAwesomeIcon, { icon: 'save' })
      )
    ),
    React.createElement(
      OverlayTrigger,
      {
        placement: 'right',
        overlay: tooltip('Cancel'),
        onClick: props.handleCancelClick
      },
      React.createElement(
        Button,
        { bsStyle: 'link' },
        React.createElement(FontAwesomeIcon, { icon: 'minus-circle' })
      )
    )
  );
};

ListItemInlineEditControls.propTypes = process.env.NODE_ENV !== "production" ? {
  formIsValid: PropTypes.bool,
  handleSaveClick: PropTypes.func,
  handleCancelClick: PropTypes.func
} : {};

export default ListItemInlineEditControls;