'use strict';

exports.__esModule = true;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactBootstrap = require('react-bootstrap');

var _formHelper = require('../services/form-helper');

var _reactRedux = require('react-redux');

var _lodash = require('lodash');

var _ListItemInlineEditControls = require('./ListItemInlineEditControls');

var _ListItemInlineEditControls2 = _interopRequireDefault(_ListItemInlineEditControls);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

    this.tempSmData = (0, _lodash.cloneDeep)(smData);

    // Load existing form values
    this.setState((0, _formHelper.getExistingFormValues)(this.props.item.id, this.tempSmData));
  };

  HeadingInlineForm.prototype.formIsValid = function formIsValid() {
    return (0, _formHelper.isTitleValid)(this.state.headingTitle);
  };

  HeadingInlineForm.prototype.render = function render() {
    var headingTitle = this.state.headingTitle;


    return _react2.default.createElement(
      _reactBootstrap.Form,
      { inline: true },
      _react2.default.createElement(
        'div',
        { className: 'row-wrapper' },
        _react2.default.createElement(
          'div',
          null,
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
              style: styles.formControl,
              value: headingTitle,
              onChange: this.handleInputChange
            })
          )
        ),
        _react2.default.createElement(_ListItemInlineEditControls2.default, {
          formIsValid: this.formIsValid(),
          handleSaveClick: this.handleSaveClick,
          handleCancelClick: this.handleCancelClick
        })
      )
    );
  };

  return HeadingInlineForm;
}(_react.Component);

HeadingInlineForm.propTypes = process.env.NODE_ENV !== "production" ? {
  item: _propTypes2.default.object,
  cancelFn: _propTypes2.default.func,
  saveFn: _propTypes2.default.func
} : {};


var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.smData
  };
};

exports.default = (0, _reactRedux.connect)(mapStateToProps)(HeadingInlineForm);
module.exports = exports['default'];