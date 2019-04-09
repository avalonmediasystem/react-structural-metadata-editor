function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React, { Component } from 'react';
import { connect } from 'react-redux';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';
import { Button, ButtonToolbar, Col, ControlLabel, FormControl, FormGroup, Row } from 'react-bootstrap';
import * as actions from '../actions/forms';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';
import { getValidationTitleState } from '../services/form-helper';

var structuralMetadataUtils = new StructuralMetadataUtils();

var HeadingForm = function (_Component) {
  _inherits(HeadingForm, _Component);

  function HeadingForm() {
    var _temp, _this, _ret;

    _classCallCheck(this, HeadingForm);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _Component.call.apply(_Component, [this].concat(args))), _this), _this.state = {
      headingTitle: '',
      headingChildOf: '',
      childOfOptions: []
    }, _this.handleCancelClick = function () {
      _this.props.toggleHeading();
    }, _this.handleChildOfChange = function (e) {
      _this.setState({ headingChildOf: e.target.value });
    }, _this.handleHeadingChange = function (e) {
      _this.setState({ headingTitle: e.target.value });
    }, _this.handleSubmit = function (e) {
      var _this$state = _this.state,
          headingChildOf = _this$state.headingChildOf,
          headingTitle = _this$state.headingTitle;

      var submitItem = { headingChildOf: headingChildOf, headingTitle: headingTitle };

      e.preventDefault();

      _this.props.onSubmit(submitItem);

      // Clear form
      _this.clearFormValues();
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  HeadingForm.prototype.componentDidMount = function componentDidMount() {
    if (this.props.smData.length > 0) {
      this.processOptions();
    }
  };

  HeadingForm.prototype.componentDidUpdate = function componentDidUpdate(prevProps) {
    if (!isEqual(this.props.smData, prevProps.smData)) {
      this.processOptions();
    }
  };

  HeadingForm.prototype.clearFormValues = function clearFormValues() {
    this.setState({
      headingTitle: '',
      headingChildOf: '',
      childOfOptions: []
    });
  };

  HeadingForm.prototype.formIsValid = function formIsValid() {
    var headingTitle = this.state.headingTitle;

    var titleValid = headingTitle && headingTitle.length > 0;
    var childOfValid = this.state.headingChildOf.length > 0;

    return titleValid && childOfValid;
  };

  HeadingForm.prototype.getOptions = function getOptions() {
    var rootHeader = structuralMetadataUtils.getItemsOfType('root', this.props.smData);
    var divHeaders = structuralMetadataUtils.getItemsOfType('div', this.props.smData);
    var allHeaders = rootHeader.concat(divHeaders);
    var options = allHeaders.map(function (header) {
      return React.createElement(
        'option',
        { value: header.id, key: header.id },
        header.label
      );
    });

    return options;
  };

  HeadingForm.prototype.processOptions = function processOptions() {
    var options = this.getOptions();
    this.setState({ childOfOptions: options });
  };

  HeadingForm.prototype.render = function render() {
    var headingTitle = this.state.headingTitle;


    return React.createElement(
      'form',
      { onSubmit: this.handleSubmit },
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
          value: headingTitle,
          onChange: this.handleHeadingChange
        }),
        React.createElement(FormControl.Feedback, null)
      ),
      React.createElement(
        FormGroup,
        { controlId: 'headingChildOf' },
        React.createElement(
          ControlLabel,
          null,
          'Child Of'
        ),
        React.createElement(
          FormControl,
          {
            componentClass: 'select',
            placeholder: 'select',
            onChange: this.handleChildOfChange,
            value: this.state.headingChildOf
          },
          React.createElement(
            'option',
            { value: '' },
            'Select...'
          ),
          this.state.childOfOptions
        )
      ),
      React.createElement(
        Row,
        null,
        React.createElement(
          Col,
          { xs: 12 },
          React.createElement(
            ButtonToolbar,
            { className: 'pull-right' },
            React.createElement(
              Button,
              { onClick: this.props.cancelClick },
              'Cancel'
            ),
            React.createElement(
              Button,
              {
                bsStyle: 'primary',
                type: 'submit',
                disabled: !this.formIsValid()
              },
              'Save'
            )
          )
        )
      )
    );
  };

  return HeadingForm;
}(Component);

HeadingForm.propTypes = process.env.NODE_ENV !== "production" ? {
  cancelClick: PropTypes.func,
  onSubmit: PropTypes.func
} : {};

var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.smData
  };
};

export default connect(mapStateToProps, actions)(HeadingForm);