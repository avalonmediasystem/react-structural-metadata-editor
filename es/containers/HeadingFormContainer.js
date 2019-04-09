function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React, { Component } from 'react';
import HeadingForm from '../components/HeadingForm';
import { connect } from 'react-redux';
import * as smActions from '../actions/sm-data';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';

var structuralMetadataUtils = new StructuralMetadataUtils();

var HeadingFormContainer = function (_Component) {
  _inherits(HeadingFormContainer, _Component);

  function HeadingFormContainer() {
    var _temp, _this, _ret;

    _classCallCheck(this, HeadingFormContainer);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _Component.call.apply(_Component, [this].concat(args))), _this), _this.state = {
      message: null
    }, _this.submit = function (values) {
      var smData = _this.props.smData;

      var submittedItem = {
        headingChildOf: values.headingChildOf,
        headingTitle: values.headingTitle
      };
      var updatedSmData = null;

      // Update the data structure with new heading
      updatedSmData = structuralMetadataUtils.insertNewHeader(submittedItem, smData);

      // Update redux store
      _this.props.buildSMUI(updatedSmData);

      // Close the form
      _this.props.cancelClick();
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  HeadingFormContainer.prototype.render = function render() {
    return React.createElement(HeadingForm, { onSubmit: this.submit, cancelClick: this.props.cancelClick });
  };

  return HeadingFormContainer;
}(Component);

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
  return {
    buildSMUI: function buildSMUI(data) {
      return dispatch(smActions.buildSMUI(data));
    }
  };
};

var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.smData
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HeadingFormContainer);