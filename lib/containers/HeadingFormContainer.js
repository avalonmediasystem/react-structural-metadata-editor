'use strict';

exports.__esModule = true;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _HeadingForm = require('../components/HeadingForm');

var _HeadingForm2 = _interopRequireDefault(_HeadingForm);

var _reactRedux = require('react-redux');

var _smData = require('../actions/sm-data');

var smActions = _interopRequireWildcard(_smData);

var _StructuralMetadataUtils = require('../services/StructuralMetadataUtils');

var _StructuralMetadataUtils2 = _interopRequireDefault(_StructuralMetadataUtils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var structuralMetadataUtils = new _StructuralMetadataUtils2.default();

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
    return _react2.default.createElement(_HeadingForm2.default, { onSubmit: this.submit, cancelClick: this.props.cancelClick });
  };

  return HeadingFormContainer;
}(_react.Component);

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

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(HeadingFormContainer);
module.exports = exports['default'];