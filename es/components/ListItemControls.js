function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React, { Component } from 'react';
import { Button, ButtonToolbar, Overlay, Popover } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import { handleEditingTimespans as _handleEditingTimespans } from '../actions/forms';

var styles = {
  buttonToolbar: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  popover: {
    width: '250px',
    height: 'auto'
  }
};

var ListItemControls = function (_Component) {
  _inherits(ListItemControls, _Component);

  function ListItemControls() {
    var _temp, _this, _ret;

    _classCallCheck(this, ListItemControls);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _Component.call.apply(_Component, [this].concat(args))), _this), _this.state = {
      deleteMessage: '',
      showDeleteConfirm: false,
      target: null
    }, _this.handleConfirmDelete = function () {
      _this.props.handleDelete();
      _this.enableEditing();
      _this.setState({ deleteMessage: '', showDeleteConfirm: false });
    }, _this.handleDeleteClick = function (e) {
      var _this$props$item = _this.props.item,
          childrenCount = _this$props$item.childrenCount,
          label = _this$props$item.label;

      var deleteMessage = 'Are you sure you\'d like to delete <strong>' + label + '</strong>';

      if (childrenCount > 0) {
        deleteMessage += ' and it\'s <strong>' + childrenCount + '</strong> child items';
      }
      deleteMessage += '?';

      // Disable editing of other list items
      _this.props.handleEditingTimespans(0);

      _this.setState({
        deleteMessage: deleteMessage,
        showDeleteConfirm: true,
        target: e.target
      });
    }, _this.cancelDeleteClick = function (e) {
      _this.enableEditing();
      _this.setState({
        showDeleteConfirm: false
      });
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  ListItemControls.prototype.enableEditing = function enableEditing() {
    // Enable editing of other list items
    this.props.handleEditingTimespans(1);
  };

  ListItemControls.prototype.render = function render() {
    var _props = this.props,
        handleShowDropTargetsClick = _props.handleShowDropTargetsClick,
        handleEditClick = _props.handleEditClick,
        item = _props.item,
        forms = _props.forms;
    var _state = this.state,
        deleteMessage = _state.deleteMessage,
        showDeleteConfirm = _state.showDeleteConfirm;


    return React.createElement(
      'div',
      { className: 'edit-controls-wrapper' },
      item.type === 'span' && React.createElement(
        Button,
        {
          bsStyle: 'link',
          disabled: forms.editingDisabled,
          onClick: handleShowDropTargetsClick
        },
        React.createElement(FontAwesomeIcon, { icon: 'dot-circle' })
      ),
      React.createElement(
        Button,
        {
          bsStyle: 'link',
          onClick: handleEditClick,
          disabled: forms.editingDisabled
        },
        React.createElement(FontAwesomeIcon, { icon: 'pen' })
      ),
      item.type !== 'root' && React.createElement(
        React.Fragment,
        null,
        React.createElement(
          Button,
          {
            bsStyle: 'link',
            onClick: this.handleDeleteClick,
            disabled: forms.editingDisabled
          },
          React.createElement(FontAwesomeIcon, { icon: 'trash' })
        ),
        React.createElement(
          Overlay,
          {
            show: showDeleteConfirm,
            target: this.state.target,
            placement: 'left',
            container: this
          },
          React.createElement(
            Popover,
            {
              id: 'popover-contained',
              title: 'Confirm delete?',
              style: styles.popover
            },
            React.createElement('p', { dangerouslySetInnerHTML: { __html: deleteMessage } }),
            React.createElement(
              ButtonToolbar,
              { style: styles.buttonToolbar },
              React.createElement(
                Button,
                {
                  bsStyle: 'danger',
                  bsSize: 'xsmall',
                  onClick: this.handleConfirmDelete
                },
                'Delete'
              ),
              React.createElement(
                Button,
                { bsSize: 'xsmall', onClick: this.cancelDeleteClick },
                'Cancel'
              )
            )
          )
        )
      )
    );
  };

  return ListItemControls;
}(Component);

ListItemControls.propTypes = process.env.NODE_ENV !== "production" ? {
  handleShowDropTargetsClick: PropTypes.func,
  handleEditClick: PropTypes.func,
  handleDelete: PropTypes.func,
  item: PropTypes.shape({
    childrenCount: PropTypes.number,
    label: PropTypes.string.isRequired,
    type: PropTypes.string
  })
} : {};


var mapDispatchToProps = function mapDispatchToProps(dispatch) {
  return {
    handleEditingTimespans: function handleEditingTimespans(code) {
      return dispatch(_handleEditingTimespans(code));
    }
  };
};

var mapStateToProps = function mapStateToProps(state) {
  return {
    forms: state.forms
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ListItemControls);