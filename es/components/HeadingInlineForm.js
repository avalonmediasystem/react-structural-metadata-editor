function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ControlLabel, Form, FormControl, FormGroup } from 'react-bootstrap';
import { getExistingFormValues, getValidationTitleState, isTitleValid } from '../services/form-helper';
import { connect } from 'react-redux';
import { cloneDeep } from 'lodash';
import ListItemInlineEditControls from './ListItemInlineEditControls';

var styles = {
  formControl: {
    margin: '0 5px',
    width: '300px'
  }
};

var HeadingInlineForm = function (_Component) {
  _inherits(HeadingInlineForm, _Component);

  function HeadingInlineForm(props) {
    _classCallCheck(this, HeadingInlineForm);

    // To implement validation logic on begin and end times, we need to remove the current item
    // from the stored data
    var _this = _possibleConstructorReturn(this, _Component.call(this, props));

    _this.state = {
      headingTitle: ''
    };

    _this.handleCancelClick = function () {
      _this.props.cancelFn();
    };

    _this.handleInputChange = function (e) {
      var _this$setState;

      _this.setState((_this$setState = {}, _this$setState[e.target.id] = e.target.value, _this$setState));
    };

    _this.handleSaveClick = function () {
      var headingTitle = _this.state.headingTitle;

      _this.props.saveFn(_this.props.item.id, {
        headingTitle: headingTitle
      });
    };

    _this.tempSmData = undefined;
    return _this;
  }

  HeadingInlineForm.prototype.componentDidMount = function componentDidMount() {
    var smData = this.props.smData;

    // Get a fresh copy of store data

    this.tempSmData = cloneDeep(smData);

    // Load existing form values
    this.setState(getExistingFormValues(this.props.item.id, this.tempSmData));
  };

  HeadingInlineForm.prototype.formIsValid = function formIsValid() {
    return isTitleValid(this.state.headingTitle);
  };

  HeadingInlineForm.prototype.render = function render() {
    var headingTitle = this.state.headingTitle;


    return React.createElement(
      Form,
      { inline: true },
      React.createElement(
        'div',
        { className: 'row-wrapper' },
        React.createElement(
          'div',
          null,
          React.createElement(
            FormGroup,
            {
              controlId: 'headingTitle',
              validationState: getValidationTitleState(headingTitle)
            },
            React.createElement(
              ControlLabel,
              null,
              'Title'
            ),
            React.createElement(FormControl, {
              type: 'text',
              style: styles.formControl,
              value: headingTitle,
              onChange: this.handleInputChange
            })
          )
        ),
        React.createElement(ListItemInlineEditControls, {
          formIsValid: this.formIsValid(),
          handleSaveClick: this.handleSaveClick,
          handleCancelClick: this.handleCancelClick
        })
      )
    );
  };

  return HeadingInlineForm;
}(Component);

HeadingInlineForm.propTypes = process.env.NODE_ENV !== "production" ? {
  item: PropTypes.object,
  cancelFn: PropTypes.func,
  saveFn: PropTypes.func
} : {};


var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.smData
  };
};

export default connect(mapStateToProps)(HeadingInlineForm);