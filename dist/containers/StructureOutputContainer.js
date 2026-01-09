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
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t2 in e) "default" !== _t2 && {}.hasOwnProperty.call(e, _t2) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t2)) && (i.get || i.set) ? o(f, _t2, i) : f[_t2] = e[_t2]); return f; })(e, t); }
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
      var postData, response, status, alert, _t;
      return _regenerator["default"].wrap(function (_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            postData = {
              json: smData[0]
            };
            _context.prev = 1;
            _context.next = 2;
            return apiUtils.postRequest(structureURL, postData);
          case 2:
            response = _context.sent;
            status = response.status;
            alert = (0, _alertStatus.configureAlert)(status);
            settingAlert(alert);
            updateStructStatus(1);
            _context.next = 4;
            break;
          case 3:
            _context.prev = 3;
            _t = _context["catch"](1);
            handleSaveError(_t);
          case 4:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[1, 3]]);
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
    className: "pt-2"
  }, /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    variant: "primary",
    onClick: handleSaveItClick,
    "data-testid": "structure-save-button",
    disabled: editingDisabled || !smDataIsValid,
    className: "float-end"
  }, "Save Structure"))));
};
var _default = exports["default"] = StructureOutputContainer;