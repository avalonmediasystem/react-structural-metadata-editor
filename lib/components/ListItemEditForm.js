'use strict';

exports.__esModule = true;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _TimespanInlineForm = require('./TimespanInlineForm');

var _TimespanInlineForm2 = _interopRequireDefault(_TimespanInlineForm);

var _HeadingInlineForm = require('./HeadingInlineForm');

var _HeadingInlineForm2 = _interopRequireDefault(_HeadingInlineForm);

var _smData = require('../actions/sm-data');

var _lodash = require('lodash');

var _StructuralMetadataUtils = require('../services/StructuralMetadataUtils');

var _StructuralMetadataUtils2 = _interopRequireDefault(_StructuralMetadataUtils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var structuralMetadataUtils = new _StructuralMetadataUtils2.default();

var ListItemEditForm = function (_Component) {
  _inherits(ListItemEditForm, _Component);

  function ListItemEditForm(props) {
    _classCallCheck(this, ListItemEditForm);

    var _this = _possibleConstructorReturn(this, _Component.call(this, props));

    _this.handleCancelClick = function (e) {
      _this.props.handleEditFormCancel();
    };

    _this.handleSaveClick = function (id, payload) {
      // Clone smData
      var clonedItems = (0, _lodash.cloneDeep)(_this.props.smData);

      // Get the original item
      /* eslint-disable */
      var item = structuralMetadataUtils.findItem(id, clonedItems);
      /* eslint-enable */

      // Update item values
      item = _this.addUpdatedValues(item, payload);

      // Send updated smData back to redux
      _this.props.buildSMUI(clonedItems);

      // Turn off editing state
      _this.props.handleEditFormCancel();
    };

    _this.type = _this.props.item.type;
    _this.id = _this.props.item.id;
    return _this;
  }

  ListItemEditForm.prototype.addUpdatedValues = function addUpdatedValues(item, payload) {
    if (item.type === 'div' || item.type === 'root') {
      item.label = payload.headingTitle;
    } else if (item.type === 'span') {
      item.label = payload.timespanTitle;
      item.begin = payload.beginTime;
      item.end = payload.endTime;
    }
    return item;
  };

  ListItemEditForm.prototype.render = function render() {
    var item = this.props.item;


    if (item.type === 'span') {
      return _react2.default.createElement(_TimespanInlineForm2.default, {
        item: item,
        cancelFn: this.handleCancelClick,
        saveFn: this.handleSaveClick
      });
    }

    if (item.type === 'div' || item.type === 'root') {
      return _react2.default.createElement(_HeadingInlineForm2.default, {
        item: item,
        cancelFn: this.handleCancelClick,
        saveFn: this.handleSaveClick
      });
    }
  };

  return ListItemEditForm;
}(_react.Component);

ListItemEditForm.propTypes = process.env.NODE_ENV !== "production" ? {
  handleEditFormCancel: _propTypes2.default.func,
  item: _propTypes2.default.object.isRequired
} : {};


var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.smData
  };
};

var mapDispathToProps = function mapDispathToProps(dispatch) {
  return {
    buildSMUI: function buildSMUI(json) {
      return dispatch((0, _smData.buildSMUI)(json));
    }
  };
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispathToProps)(ListItemEditForm);
module.exports = exports['default'];