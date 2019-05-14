"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.PureStructureOutputContainer = void 0;

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

var _v = _interopRequireDefault(require("uuid/v1"));

var _lodash = require("lodash");

var _smData = require("../actions/sm-data");

var _forms = require("../actions/forms");

var StructureOutputContainer =
/*#__PURE__*/
function (_Component) {
  (0, _inherits2["default"])(StructureOutputContainer, _Component);

  function StructureOutputContainer(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, StructureOutputContainer);
    _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(StructureOutputContainer).call(this, props));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
      alertObj: {},
      masterFileID: _this.props.masterFileID,
      baseURL: _this.props.baseURL,
      initStructure: _this.props.initStructure
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "clearAlert", function () {
      _this.setState({
        alertObj: null
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleSaveItClick", function () {
      var _this$state = _this.state,
          baseURL = _this$state.baseURL,
          masterFileID = _this$state.masterFileID;
      var postData = {
        json: _this.props.smData[0]
      };

      _this.apiUtils.postRequest(baseURL, masterFileID, 'structure.json', postData).then(function (response) {
        var status = response.status;
        var alertObj = (0, _alertStatus.configureAlert)(status, _this.clearAlert);

        _this.setState({
          alertObj: alertObj
        });
      })["catch"](function (error) {
        _this.handleSaveError(error);
      });
    });
    _this.apiUtils = new _Utils["default"]();
    return _this;
  }

  (0, _createClass2["default"])(StructureOutputContainer, [{
    key: "componentDidMount",
    value: function () {
      var _componentDidMount = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee() {
        var smData, _this$state2, baseURL, masterFileID, initStructure, response;

        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                smData = [];
                _this$state2 = this.state, baseURL = _this$state2.baseURL, masterFileID = _this$state2.masterFileID, initStructure = _this$state2.initStructure;
                _context.prev = 2;
                _context.next = 5;
                return this.apiUtils.getRequest(baseURL, masterFileID, 'structure.json');

              case 5:
                response = _context.sent;

                // Check for empty response when ingesting a new file
                // Add unique ids to every object
                if ((0, _lodash.isEmpty)(response.data)) {
                  smData = this.addIds([JSON.parse(initStructure)]);
                } else {
                  smData = this.addIds([response.data]);
                } // Tag the root element


                this.markRootElement(smData); // Update the redux store

                this.props.buildSMUI(smData); // Update redux-store flag for structure file retrieval

                this.props.retrieveStructureSuccess();
                _context.next = 16;
                break;

              case 12:
                _context.prev = 12;
                _context.t0 = _context["catch"](2);
                console.log('TCL: StructureOutputContainer -> }catch -> error', _context.t0);
                this.handleFetchError(_context.t0);

              case 16:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[2, 12]]);
      }));

      function componentDidMount() {
        return _componentDidMount.apply(this, arguments);
      }

      return componentDidMount;
    }()
    /**
     * This function adds a unique, front-end only id, to every object in the data structure
     * @param {Array} structureJS
     * @returns {Array}
     */

  }, {
    key: "addIds",
    value: function addIds(structureJS) {
      var structureWithIds = (0, _lodash.cloneDeep)(structureJS); // Recursively loop through data structure

      var fn = function fn(items) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var item = _step.value;
            // Create and add an id
            item.id = (0, _v["default"])(); // Send child items back into the function

            if (item.items && item.items.length > 0) {
              fn(item.items);
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      };

      fn(structureWithIds);
      return structureWithIds;
    }
  }, {
    key: "markRootElement",
    value: function markRootElement(smData) {
      if (smData.length > 0) {
        smData[0].type = 'root';
      }
    }
  }, {
    key: "handleFetchError",
    value: function handleFetchError(error) {
      var status = error.response !== undefined ? error.response.status : -2;
      var alertObj = (0, _alertStatus.configureAlert)(status, this.clearAlert);
      this.setState({
        alertObj: alertObj
      });
    }
  }, {
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
          _this$props$smData = _this$props.smData,
          smData = _this$props$smData === void 0 ? [] : _this$props$smData,
          forms = _this$props.forms;
      var alertObj = this.state.alertObj;
      return _react["default"].createElement("section", {
        className: "structure-section"
      }, !forms.structureRetrieved ? _react["default"].createElement(_AlertContainer["default"], alertObj) : _react["default"].createElement("div", null, _react["default"].createElement(_AlertContainer["default"], alertObj), _react["default"].createElement(_List["default"], {
        items: smData
      }), _react["default"].createElement(_reactBootstrap.Row, null, _react["default"].createElement(_reactBootstrap.Col, {
        xs: 12,
        className: "text-right"
      }, _react["default"].createElement(_reactBootstrap.Button, {
        bsStyle: "primary",
        onClick: this.handleSaveItClick
      }, "Save Structure")))));
    }
  }]);
  return StructureOutputContainer;
}(_react.Component); // For testing purposes


exports.PureStructureOutputContainer = StructureOutputContainer;

var mapStateToProps = function mapStateToProps(state) {
  return {
    smData: state.smData,
    forms: state.forms
  };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
  return {
    buildSMUI: function buildSMUI(smData) {
      return dispatch((0, _smData.buildSMUI)(smData));
    },
    retrieveStructureSuccess: function retrieveStructureSuccess() {
      return dispatch((0, _forms.retrieveStructureSuccess)());
    }
  };
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(StructureOutputContainer);

exports["default"] = _default;