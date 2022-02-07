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

var _reactBootstrap = require("react-bootstrap");

var _Utils = _interopRequireDefault(require("../api/Utils"));

var _alertStatus = require("../services/alert-status");

var _forms = require("../actions/forms");

var _lodash = require("lodash");

var _StructuralMetadataUtils = _interopRequireDefault(require("../services/StructuralMetadataUtils"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var StructureOutputContainer = function StructureOutputContainer(props) {
  var smu = new _StructuralMetadataUtils["default"]();
  var apiUtils = new _Utils["default"]();
  var structureURL = props.structureURL,
      structureInfo = props.structureInfo,
      structuralMetadata = props.structuralMetadata;
  var structureSaved = structureInfo.structureSaved;
  var smData = structuralMetadata.smData,
      initSmData = structuralMetadata.initSmData,
      smDataIsValid = structuralMetadata.smDataIsValid;

  var _useState = (0, _react.useState)(initSmData),
      _useState2 = (0, _slicedToArray2["default"])(_useState, 2),
      stateInitStructure = _useState2[0],
      setInitStructure = _useState2[1];

  (0, _react.useEffect)(function () {
    setInitStructure(initSmData);
  }, [initSmData]);
  (0, _react.useEffect)(function () {
    if (!smDataIsValid) {
      props.setAlert((0, _alertStatus.configureAlert)(-8));
    }
  }, [smDataIsValid]);
  (0, _react.useEffect)(function () {
    if (structureSaved) {
      props.structureIsSaved(true);
    } else {
      var cleanSmData = smu.filterObjectKey(smData, 'active');

      if (!(0, _lodash.isEqual)(stateInitStructure, cleanSmData)) {
        props.structureIsSaved(false);
      } else {
        props.structureIsSaved(true);
      }
    }
  }, [structureSaved]);

  var handleSaveError = function handleSaveError(error) {
    console.log('TCL: handleSaveError -> error', error);
    var status = error.response !== undefined ? error.response.status : error.request.status;
    var alert = (0, _alertStatus.configureAlert)(status);
    props.setAlert(alert);
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
              return apiUtils.postRequest(structureURL, postData);

            case 4:
              response = _context.sent;
              status = response.status;
              alert = (0, _alertStatus.configureAlert)(status);
              props.setAlert(alert);
              props.postStructureSuccess(1);
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
  }, /*#__PURE__*/_react["default"].createElement("div", {
    "data-testid": "structure-output-list"
  }, /*#__PURE__*/_react["default"].createElement(_List["default"], {
    items: smData
  }), /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Row, null, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Col, {
    xs: 12,
    className: "text-right"
  }, /*#__PURE__*/_react["default"].createElement(_reactBootstrap.Button, {
    bsStyle: "primary",
    onClick: handleSaveItClick,
    "data-testid": "structure-save-button",
    disabled: props.editingDisabled
  }, "Save Structure")))));
};

var mapStateToProps = function mapStateToProps(state) {
  return {
    structuralMetadata: state.structuralMetadata,
    structureInfo: state.forms.structureInfo,
    editingDisabled: state.forms.editingDisabled,
    alert: state.forms.alert
  };
};

var mapDispatchToProps = {
  postStructureSuccess: _forms.updateStructureStatus,
  setAlert: _forms.setAlert
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(StructureOutputContainer);

exports["default"] = _default;