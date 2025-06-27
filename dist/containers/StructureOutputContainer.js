"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _react = _interopRequireWildcard(require("react"));
var _reactRedux = require("react-redux");
var _List = _interopRequireDefault(require("../components/List"));
var _Button = _interopRequireDefault(require("react-bootstrap/Button"));
var _Row = _interopRequireDefault(require("react-bootstrap/Row"));
var _Col = _interopRequireDefault(require("react-bootstrap/Col"));
var _Utils = _interopRequireDefault(require("../api/Utils"));
var _alertStatus = require("../services/alert-status");
var _forms = require("../actions/forms");
var _lodash = require("lodash");
var _StructuralMetadataUtils = _interopRequireDefault(require("../services/StructuralMetadataUtils"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
var StructureOutputContainer = function StructureOutputContainer(_ref) {
  var disableSave = _ref.disableSave,
    structureIsSaved = _ref.structureIsSaved,
    structureURL = _ref.structureURL;
  var smu = new _StructuralMetadataUtils["default"]();
  var apiUtils = new _Utils["default"]();

  // State variables from Redux store
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
    structureInfo = _useSelector3.structureInfo,
    editingDisabled = _useSelector3.editingDisabled;

  // Dispatch actions
  var dispatch = (0, _reactRedux.useDispatch)();
  var settingAlert = function settingAlert(alert) {
    return dispatch((0, _forms.setAlert)(alert));
  };
  var updateStructStatus = function updateStructStatus(value) {
    return dispatch((0, _forms.updateStructureStatus)(value));
  };
  var _useState = (0, _react.useState)(initSmData),
    _useState2 = (0, _slicedToArray2["default"])(_useState, 2),
    stateInitStructure = _useState2[0],
    setInitStructure = _useState2[1];
  (0, _react.useEffect)(function () {
    setInitStructure(initSmData);
  }, [initSmData]);
  (0, _react.useEffect)(function () {
    if (!smDataIsValid) {
      settingAlert((0, _alertStatus.configureAlert)(-8));
    }
  }, [smDataIsValid]);
  (0, _react.useEffect)(function () {
    if (structureInfo.structureSaved) {
      structureIsSaved(true);
    } else {
      var cleanSmData = smu.filterObjectKey(smData, 'active');
      if (!(0, _lodash.isEqual)(stateInitStructure, cleanSmData)) {
        structureIsSaved(false);
      } else {
        structureIsSaved(true);
      }
    }
  }, [structureInfo.structureSaved]);
  var handleSaveError = function handleSaveError(error) {
    console.log('TCL: handleSaveError -> error -> ', error);
    var status = -10;
    var alert = (0, _alertStatus.configureAlert)(status);
    settingAlert(alert);
  };
  var handleSaveItClick = /*#__PURE__*/function () {
    var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var postData, response, status, alert;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            postData = {
              json: smData[0]
            };
            _context.prev = 1;
            _context.next = 4;
            return apiUtils.postRequest(structureURL, postData);
          case 4:
            response = _context.sent;
            status = response.status;
            alert = (0, _alertStatus.configureAlert)(status);
            settingAlert(alert);
            updateStructStatus(1);
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
      }, _callee, null, [[1, 11]]);
    }));
    return function handleSaveItClick() {
      return _ref2.apply(this, arguments);
    };
  }();
  return /*#__PURE__*/_react["default"].createElement("section", {
    className: "structure-section",
    "data-testid": "structure-output-section"
  }, /*#__PURE__*/_react["default"].createElement(_Col["default"], {
    lg: 12,
    className: "structure-lists"
  }, manifestFetched && smData != null && /*#__PURE__*/_react["default"].createElement("ul", {
    "data-testid": "structure-output-list"
  }, /*#__PURE__*/_react["default"].createElement(_List["default"], {
    items: smData
  }))), !disableSave && /*#__PURE__*/_react["default"].createElement(_Row["default"], null, /*#__PURE__*/_react["default"].createElement(_Col["default"], {
    md: {
      span: 4,
      offset: 8
    },
    className: "text-right pr-4 pt-2"
  }, /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    variant: "primary",
    onClick: handleSaveItClick,
    "data-testid": "structure-save-button",
    disabled: editingDisabled
  }, "Save Structure"))));
};
var _default = exports["default"] = StructureOutputContainer;