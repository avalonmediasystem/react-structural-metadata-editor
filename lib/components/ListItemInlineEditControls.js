'use strict';

exports.__esModule = true;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactBootstrap = require('react-bootstrap');

var _reactFontawesome = require('@fortawesome/react-fontawesome');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var tooltip = function tooltip(tip) {
  return _react2.default.createElement(
    _reactBootstrap.Tooltip,
    { id: 'tooltip' },
    tip
  );
};

var ListItemInlineEditControls = function ListItemInlineEditControls(props) {
  return _react2.default.createElement(
    'div',
    { className: 'edit-controls-wrapper' },
    _react2.default.createElement(
      _reactBootstrap.OverlayTrigger,
      { placement: 'left', overlay: tooltip('Save') },
      _react2.default.createElement(
        _reactBootstrap.Button,
        {
          bsStyle: 'link',
          disabled: !props.formIsValid,
          onClick: props.handleSaveClick
        },
        _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'save' })
      )
    ),
    _react2.default.createElement(
      _reactBootstrap.OverlayTrigger,
      {
        placement: 'right',
        overlay: tooltip('Cancel'),
        onClick: props.handleCancelClick
      },
      _react2.default.createElement(
        _reactBootstrap.Button,
        { bsStyle: 'link' },
        _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'minus-circle' })
      )
    )
  );
};

ListItemInlineEditControls.propTypes = process.env.NODE_ENV !== "production" ? {
  formIsValid: _propTypes2.default.bool,
  handleSaveClick: _propTypes2.default.func,
  handleCancelClick: _propTypes2.default.func
} : {};

exports.default = ListItemInlineEditControls;
module.exports = exports['default'];