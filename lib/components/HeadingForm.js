'use strict';

exports.__esModule = true;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _StructuralMetadataUtils = require('../services/StructuralMetadataUtils');

var _StructuralMetadataUtils2 = _interopRequireDefault(_StructuralMetadataUtils);

var _reactBootstrap = require('react-bootstrap');

var _forms = require('../actions/forms');

var actions = _interopRequireWildcard(_forms);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _lodash = require('lodash');

var _formHelper = require('../services/form-helper');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var structuralMetadataUtils = new _StructuralMetadataUtils2.default();

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
    if (!(0, _lodash.isEqual)(this.props.smData, prevProps.smData)) {
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
      return _react2.default.createElement(
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


    return _react2.default.createElement(
      'form',
      { onSubmit: this.handleSubmit },
      _react2.default.createElement(
        _reactBootstrap.FormGroup,
        {
          controlId: 'headingTitle',
          validationState: (0, _formHelper.getValidationTitleState)(headingTitle)
        },
        _react2.default.createElement(
          _reactBootstrap.ControlLabel,
          null,
          'Title'
        ),
        _react2.default.createElement(_reactBootstrap.FormControl, {
          type: 'text',
          value: headingTitle,
          onChange: this.handleHeadingChange
        }),
        _react2.default.createElement(_reactBootstrap.FormControl.Feedback, null)
      ),
      _react2.default.createElement(
        _reactBootstrap.FormGroup,
        { controlId: 'headingChildOf' },
        _react2.default.createElement(
          _reactBootstrap.ControlLabel,
          null,
          'Child Of'
        ),
        _react2.default.createElement(
          _reactBootstrap.FormControl,
          {
            componentClass: 'select',
            placeholder: 'select',
            onChange: this.handleChildOfChange,
            value: this.state.headingChildOf
          },
          _react2.default.createElement(
            'option',
            { value: '' },
            'Select...'
          ),
          this.state.childOfOptions
        )
      ),
      _react2.default.createElement(
        _reactBootstrap.Row,
        null,
        _react2.default.createElement(
          _reactBootstrap.Col,
          { xs: 12 },
          _react2.default.createElement(
            _reactBootstrap.ButtonToolbar,
            { className: 'pull-right' },
            _react2.default.createElement(
              _reactBootstrap.Button,
              { onClick: this.props.cancelClick },
              'Cancel'
            ),
            _react2.default.createElement(
              _reactBootstrap.Button,
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
}(_react.Component);

HeadingForm.propTypes = process.env.NODE_ENV !== "production" ? {
  cancelClick: _propTypes2.default.func,
  onSubmit: _propTypes2.default.func
} : {};

var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.smData
  };
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, actions)(HeadingForm);
module.exports = exports['default'];