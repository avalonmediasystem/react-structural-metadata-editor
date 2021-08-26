"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf3 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _reactBootstrap = require("react-bootstrap");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactFontawesome = require("@fortawesome/react-fontawesome");

var _reactRedux = require("react-redux");

var _forms = require("../actions/forms");

var _freeSolidSvgIcons = require("@fortawesome/free-solid-svg-icons");

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

var ListItemControls =
/*#__PURE__*/
function (_Component) {
  (0, _inherits2["default"])(ListItemControls, _Component);

  function ListItemControls() {
    var _getPrototypeOf2;

    var _this;

    (0, _classCallCheck2["default"])(this, ListItemControls);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = (0, _possibleConstructorReturn2["default"])(this, (_getPrototypeOf2 = (0, _getPrototypeOf3["default"])(ListItemControls)).call.apply(_getPrototypeOf2, [this].concat(args)));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
      deleteMessage: '',
      showDeleteConfirm: false,
      target: null
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleConfirmDelete", function () {
      _this.props.handleDelete();

      _this.enableEditing();

      _this.setState({
        deleteMessage: '',
        showDeleteConfirm: false
      }); // Change structureIsSaved to false


      _this.props.updateStructureStatus(0);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleDeleteClick", function (e) {
      var _this$props$item = _this.props.item,
          childrenCount = _this$props$item.childrenCount,
          label = _this$props$item.label;
      var deleteMessage = "Are you sure you'd like to delete <strong>".concat(label, "</strong>");

      if (childrenCount > 0) {
        deleteMessage += " and it's <strong>".concat(childrenCount, "</strong> child items");
      }

      deleteMessage += "?"; // Disable editing of other list items

      _this.props.handleEditingTimespans(1);

      _this.setState({
        deleteMessage: deleteMessage,
        showDeleteConfirm: true,
        target: e.target
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "cancelDeleteClick", function (e) {
      _this.enableEditing();

      _this.setState({
        showDeleteConfirm: false
      });
    });
    return _this;
  }

  (0, _createClass2["default"])(ListItemControls, [{
    key: "enableEditing",
    value: function enableEditing() {
      // Enable editing of other list items
      this.props.handleEditingTimespans(0);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props = this.props,
          handleShowDropTargetsClick = _this$props.handleShowDropTargetsClick,
          handleEditClick = _this$props.handleEditClick,
          item = _this$props.item,
          forms = _this$props.forms;
      var _this$state = this.state,
          deleteMessage = _this$state.deleteMessage,
          showDeleteConfirm = _this$state.showDeleteConfirm;
      return _react["default"].createElement("div", {
        className: "edit-controls-wrapper",
        "data-testid": "list-item-controls"
      }, item.type === 'span' && _react["default"].createElement(_reactBootstrap.Button, {
        bsStyle: "link",
        disabled: forms.editingDisabled && !item.active,
        onClick: handleShowDropTargetsClick,
        "data-testid": "list-item-dnd-btn"
      }, _react["default"].createElement(_reactFontawesome.FontAwesomeIcon, {
        icon: _freeSolidSvgIcons.faDotCircle
      })), _react["default"].createElement(_reactBootstrap.Button, {
        bsStyle: "link",
        onClick: handleEditClick,
        disabled: forms.editingDisabled,
        "data-testid": "list-item-edit-btn"
      }, _react["default"].createElement(_reactFontawesome.FontAwesomeIcon, {
        icon: _freeSolidSvgIcons.faPen
      })), item.type !== 'root' && _react["default"].createElement(_react["default"].Fragment, null, _react["default"].createElement(_reactBootstrap.Button, {
        bsStyle: "link",
        onClick: this.handleDeleteClick,
        disabled: forms.editingDisabled,
        "data-testid": "list-item-delete-btn"
      }, _react["default"].createElement(_reactFontawesome.FontAwesomeIcon, {
        icon: _freeSolidSvgIcons.faTrash
      })), _react["default"].createElement(_reactBootstrap.Overlay, {
        show: showDeleteConfirm,
        target: this.state.target,
        placement: "left",
        container: this
      }, _react["default"].createElement(_reactBootstrap.Popover, {
        id: "popover-contained",
        title: "Confirm delete?",
        style: styles.popover,
        "data-testid": "delete-confirmation-popup"
      }, _react["default"].createElement("p", {
        dangerouslySetInnerHTML: {
          __html: deleteMessage
        },
        "data-testid": "delete-confirmation-message"
      }), _react["default"].createElement(_reactBootstrap.ButtonToolbar, {
        style: styles.buttonToolbar
      }, _react["default"].createElement(_reactBootstrap.Button, {
        bsStyle: "danger",
        bsSize: "xsmall",
        onClick: this.handleConfirmDelete,
        "data-testid": "delete-confirmation-confirm-btn"
      }, "Delete"), _react["default"].createElement(_reactBootstrap.Button, {
        bsSize: "xsmall",
        onClick: this.cancelDeleteClick,
        "data-testid": "delete-confirmation-cancel-btn"
      }, "Cancel"))))));
    }
  }]);
  return ListItemControls;
}(_react.Component);

(0, _defineProperty2["default"])(ListItemControls, "propTypes", {
  handleShowDropTargetsClick: _propTypes["default"].func,
  handleEditClick: _propTypes["default"].func,
  handleDelete: _propTypes["default"].func,
  item: _propTypes["default"].shape({
    childrenCount: _propTypes["default"].number,
    label: _propTypes["default"].string.isRequired,
    type: _propTypes["default"].string
  })
});

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
  return {
    handleEditingTimespans: function handleEditingTimespans(code) {
      return dispatch((0, _forms.handleEditingTimespans)(code));
    },
    updateStructureStatus: function updateStructureStatus(code) {
      return dispatch((0, _forms.updateStructureStatus)(code));
    }
  };
};

var mapStateToProps = function mapStateToProps(state) {
  return {
    forms: state.forms
  };
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(ListItemControls);

exports["default"] = _default;