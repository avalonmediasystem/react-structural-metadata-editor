"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _react = _interopRequireDefault(require("react"));

var _reactRedux = require("react-redux");

var _List = _interopRequireDefault(require("../components/List"));

var _reactBootstrap = require("react-bootstrap");

var _Utils = _interopRequireDefault(require("../api/Utils"));

var _alertStatus = require("../services/alert-status");

var _lodash = require("lodash");

var _StructuralMetadataUtils = _interopRequireDefault(require("../services/StructuralMetadataUtils"));

var _forms = require("../actions/forms");

var StructureOutputContainer = function StructureOutputContainer(props) {
  var smu = new _StructuralMetadataUtils["default"]();
  var apiUtils = new _Utils["default"]();

  var _useSelector = (0, _reactRedux.useSelector)(function (state) {
    return state.manifest;
  }),
      manifestFetched = _useSelector.manifestFetched;

  var _useSelector2 = (0, _reactRedux.useSelector)(function (state) {
    return state.structuralMetadata;
  }),
      smData = _useSelector2.smData,
      initSmData = _useSelector2.initSmData,
      smDataIsValid = _useSelector2.smDataIsValid;

  var _useSelector3 = (0, _reactRedux.useSelector)(function (state) {
    return state.forms;
  }),
      editingDisabled = _useSelector3.editingDisabled,
      structureInfo = _useSelector3.structureInfo;

  var dispatch = (0, _reactRedux.useDispatch)();

  var _React$useState = _react["default"].useState(initSmData),
      _React$useState2 = (0, _slicedToArray2["default"])(_React$useState, 2),
      stateInitStructure = _React$useState2[0],
      setInitStructure = _React$useState2[1];

  _react["default"].useEffect(function () {
    setInitStructure(initSmData);
  }, [initSmData]);

  _react["default"].useEffect(function () {
    if (!smDataIsValid) {
      dispatch((0, _forms.setAlert)((0, _alertStatus.configureAlert)(-8)));
    }
  }, [smDataIsValid]);

  _react["default"].useEffect(function () {
    if (structureInfo.structureSaved) {
      props.structureIsSaved(true);
    } else {
      var cleanSmData = smu.filterObjectKey(smData, 'active');

      if (!(0, _lodash.isEqual)(stateInitStructure, cleanSmData)) {
        props.structureIsSaved(false);
      } else {
        props.structureIsSaved(true);
      }
    }
  }, [structureInfo.structureSaved]);

  var handleSaveError = function handleSaveError(error) {
    console.log('TCL: handleSaveError -> error', error);
    var alert = (0, _alertStatus.configureAlert)(-10);
    dispatch((0, _forms.setAlert)(alert));
  };

  var handleSaveItClick = /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var postData, response, status, alert;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              postData = {
                json: smData[0]
              };
              _context.prev = 1;
              _context.next = 4;
              return apiUtils.postRequest(props.structureURL, postData);

            case 4:
              response = _context.sent;
              status = response.status;
              alert = (0, _alertStatus.configureAlert)(status);
              dispatch((0, _forms.setAlert)(alert));
              dispatch((0, _forms.updateStructureStatus)(1));
              _context.next = 14;
              break;

            case 11:
              _context.prev = 11;
              _context.t0 = _context["catch"](1);
              handleSaveError(_context.t0);

            case 14:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[1, 11]]);
    }));

    return function handleSaveItClick() {
      return _ref.apply(this, arguments);
    };
  }();

  return /*#__PURE__*/_react["default"].createElement("section", {
    className: "structure-section",
    "data-testid": "structure-output-section"
  }, manifestFetched && smData != null && /*#__PURE__*/_react["default"].createElement("div", {
    "data-testid": "structure-output-list"
  }, /*#__PURE__*/_react["default"].createElement(_List["default"], {
    items: smData
  }), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Row, null, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Col, {
    xs: 12,
    className: "text-right"
  }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Button, {
    variant: "primary",
    onClick: handleSaveItClick,
    "data-testid": "structure-save-button",
    disabled: editingDisabled
  }, "Save Structure")))));
};

var _default = StructureOutputContainer;
exports["default"] = _default;