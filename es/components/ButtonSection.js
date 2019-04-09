function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Col, Collapse, Row } from 'react-bootstrap';
import HeadingFormContainer from '../containers/HeadingFormContainer';
import TimespanFormContainer from '../containers/TimespanFormContainer';
import * as peaksActions from '../actions/peaks-instance';
import { configureAlert } from '../services/alert-status';
import AlertContainer from '../containers/AlertContainer';
import { handleEditingTimespans } from '../actions/forms';

var styles = {
  section: {
    margin: '4rem 0'
  },
  well: {
    marginTop: '1rem'
  }
};

var ButtonSection = function (_Component) {
  _inherits(ButtonSection, _Component);

  function ButtonSection() {
    var _temp, _this, _ret;

    _classCallCheck(this, ButtonSection);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _Component.call.apply(_Component, [this].concat(args))), _this), _this.state = {
      headingOpen: false,
      timespanOpen: false,
      initSegment: null,
      isInitializing: true,
      alertObj: null,
      disabled: true
    }, _this.updateInitializeFlag = function (value) {
      _this.setState({
        isInitializing: value
      });
    }, _this.clearAlert = function () {
      _this.setState({
        alertObj: null,
        disabled: true
      });
      // Clear the redux-store flag when closing the alert from AlertContainer
      _this.props.handleEditingTimespans(1);
    }, _this.handleCancelHeadingClick = function () {
      _this.setState({ headingOpen: false });
      _this.clearAlert();
    }, _this.handleHeadingClick = function () {
      _this.props.handleEditingTimespans(0);
      // When opening heading form, delete if a temporary segment exists
      _this.deleteTempSegment();
      _this.setState({
        alertObj: null,
        headingOpen: true,
        timespanOpen: false,
        disabled: false
      });
    }, _this.handleCancelTimespanClick = function () {
      _this.deleteTempSegment();
      _this.setState({ timespanOpen: false });
      _this.clearAlert();
    }, _this.handleTimeSpanClick = function () {
      // Clear existing alertObj
      _this.clearAlert();

      // Disable editing other items in structure
      _this.props.handleEditingTimespans(0);

      // Create a temporary segment if timespan form is closed
      if (!_this.state.timespanOpen) {
        _this.props.createTempSegment();
      }
      var tempSegment = _this.props.peaksInstance.peaks.segments.getSegment('temp-segment');
      if (tempSegment === null) {
        _this.setState({
          alertObj: configureAlert(-4, _this.clearAlert),
          headingOpen: false,
          disabled: false
        });
      } else {
        _this.setState({
          initSegment: tempSegment,
          headingOpen: false,
          timespanOpen: true,
          isInitializing: true,
          disabled: false
        });
      }
    }, _this.deleteTempSegment = function () {
      if (_this.state.initSegment !== null) {
        _this.props.deleteTempSegment(_this.state.initSegment.id);
      }
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  // Delete if a temporary segment exists


  ButtonSection.prototype.render = function render() {
    var timespanFormProps = {
      cancelClick: this.handleCancelTimespanClick,
      initSegment: this.state.initSegment,
      isInitializing: this.state.isInitializing,
      timespanOpen: this.state.timespanOpen,
      updateInitialize: this.updateInitializeFlag
    };

    var _props$forms = this.props.forms,
        structureRetrieved = _props$forms.structureRetrieved,
        waveformRetrieved = _props$forms.waveformRetrieved;

    var waveformAndStructureValid = structureRetrieved && waveformRetrieved;

    return waveformAndStructureValid ? React.createElement(
      'section',
      { style: styles.section },
      React.createElement(AlertContainer, this.state.alertObj),
      React.createElement(
        Row,
        null,
        React.createElement(
          Col,
          { xs: 6 },
          React.createElement(
            Button,
            {
              block: true,
              onClick: this.handleHeadingClick,
              disabled: this.state.disabled && this.props.forms.editingDisabled
            },
            'Add a Heading'
          )
        ),
        React.createElement(
          Col,
          { xs: 6 },
          React.createElement(
            Button,
            {
              block: true,
              onClick: this.handleTimeSpanClick,
              disabled: this.state.disabled && this.props.forms.editingDisabled
            },
            'Add a Timespan'
          )
        )
      ),
      React.createElement(
        Collapse,
        { 'in': this.state.headingOpen },
        React.createElement(
          'div',
          { className: 'well', style: styles.well },
          React.createElement(HeadingFormContainer, { cancelClick: this.handleCancelHeadingClick })
        )
      ),
      React.createElement(
        Collapse,
        { 'in': this.state.timespanOpen },
        React.createElement(
          'div',
          { className: 'well', style: styles.well },
          React.createElement(TimespanFormContainer, timespanFormProps)
        )
      )
    ) : null;
  };

  return ButtonSection;
}(Component);

// To use in tests as a disconnected component (to access state)


export { ButtonSection as PureButtonSection };

var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.smData,
    peaksInstance: state.peaksInstance,
    forms: state.forms
  };
};

var mapDispatchToProps = {
  createTempSegment: peaksActions.insertTempSegment,
  deleteTempSegment: peaksActions.deleteTempSegment,
  handleEditingTimespans: handleEditingTimespans
};

export default connect(mapStateToProps, mapDispatchToProps)(ButtonSection);