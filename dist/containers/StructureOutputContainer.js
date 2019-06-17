"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _reactRedux = require("react-redux");

var _List = _interopRequireDefault(require("../components/List"));

var _reactBootstrap = require("react-bootstrap");

var _Utils = _interopRequireDefault(require("../api/Utils"));

var _AlertContainer = _interopRequireDefault(require("./AlertContainer"));

var _alertStatus = require("../services/alert-status");

var StructureOutputContainer =
/*#__PURE__*/
function (_Component) {
  (0, _inherits2["default"])(StructureOutputContainer, _Component);

  function StructureOutputContainer(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, StructureOutputContainer);
    _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(StructureOutputContainer).call(this, props));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
      alertObj: _this.props.alertObj,
      baseURL: _this.props.baseURL,
      masterFileID: _this.props.masterFileID,
      structureStatus: _this.props.forms.structureStatus
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "clearAlert", function () {
      _this.setState({
        alertObj: null
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleSaveItClick",
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee() {
      var _this$state, baseURL, masterFileID, postData, response, status, alertObj;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _this$state = _this.state, baseURL = _this$state.baseURL, masterFileID = _this$state.masterFileID;
              postData = {
                json: _this.props.smData[0]
              };
              _context.prev = 2;
              _context.next = 5;
              return _this.apiUtils.postRequest(baseURL, masterFileID, 'structure.json', postData);

            case 5:
              response = _context.sent;
              status = response.status;
              alertObj = (0, _alertStatus.configureAlert)(status, _this.clearAlert);

              _this.setState({
                alertObj: alertObj
              });

              _context.next = 14;
              break;

            case 11:
              _context.prev = 11;
              _context.t0 = _context["catch"](2);

              _this.handleSaveError(_context.t0);

            case 14:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[2, 11]]);
    })));
    _this.apiUtils = new _Utils["default"]();
    return _this;
  }

  (0, _createClass2["default"])(StructureOutputContainer, [{
    key: "handleSaveError",
    value: function handleSaveError(error) {
      console.log('TCL: handleSaveError -> error', error);
      var status = error.response !== undefined ? error.response.status : error.request.status;
      var alertObj = (0, _alertStatus.configureAlert)(status, this.clearAlert);
      this.setState({
        alertObj: alertObj
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props = this.props,
          forms = _this$props.forms,
          smData = _this$props.smData;
      var alertObj = this.state.alertObj;
      return _react["default"].createElement("section", {
        className: "structure-section",
        "data-testid": "structure-output-section"
      }, !forms.structureRetrieved ? _react["default"].createElement(_AlertContainer["default"], alertObj) : _react["default"].createElement("div", {
        "data-testid": "structure-output-list"
      }, _react["default"].createElement(_AlertContainer["default"], alertObj), _react["default"].createElement(_List["default"], {
        items: smData
      }), _react["default"].createElement(_reactBootstrap.Row, null, _react["default"].createElement(_reactBootstrap.Col, {
        xs: 12,
        className: "text-right"
      }, _react["default"].createElement(_reactBootstrap.Button, {
        bsStyle: "primary",
        onClick: this.handleSaveItClick,
        "data-testid": "structure-save-button"
      }, "Save Structure")))));
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(nextProps, prevState) {
      if (prevState.structureStatus !== nextProps.forms.structureStatus) {
        return {
          alertObj: (0, _alertStatus.configureAlert)(nextProps.forms.structureStatus, nextProps.clearAlert)
        };
      }

      if (nextProps.alertObj === null) {
        return {
          alertObj: null
        };
      }

      return null;
    }
  }]);
  return StructureOutputContainer;
}(_react.Component);

var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.smData,
    forms: state.forms
  };
};

var _default = (0, _reactRedux.connect)(mapStateToProps)(StructureOutputContainer);

exports["default"] = _default;