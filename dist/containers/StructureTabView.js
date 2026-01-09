"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _react = _interopRequireWildcard(require("react"));
var _reactRedux = require("react-redux");
var _Button = _interopRequireDefault(require("react-bootstrap/Button"));
var _ButtonGroup = _interopRequireDefault(require("react-bootstrap/ButtonGroup"));
var _TextEditor = _interopRequireDefault(require("../components/TextEditor"));
var _StructureOutputContainer = _interopRequireDefault(require("./StructureOutputContainer"));
var _ButtonSection = _interopRequireDefault(require("../components/ButtonSection"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
var StructureTabView = function StructureTabView(_ref) {
  var disableSave = _ref.disableSave,
    structureIsSaved = _ref.structureIsSaved,
    structureURL = _ref.structureURL,
    _ref$showTextEditor = _ref.showTextEditor,
    showTextEditor = _ref$showTextEditor === void 0 ? false : _ref$showTextEditor;
  var _useSelector = (0, _reactRedux.useSelector)(function (state) {
      return state.structuralMetadata;
    }),
    smData = _useSelector.smData;
  var _useState = (0, _react.useState)('visual'),
    _useState2 = (0, _slicedToArray2["default"])(_useState, 2),
    viewMode = _useState2[0],
    setViewMode = _useState2[1];
  return /*#__PURE__*/_react["default"].createElement("div", {
    className: "structural-metadata-editor"
  }, showTextEditor && /*#__PURE__*/_react["default"].createElement("div", {
    className: "view-mode-tabs mb-3 d-flex justify-content-end"
  }, /*#__PURE__*/_react["default"].createElement(_ButtonGroup["default"], null, /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    variant: viewMode === 'visual' ? 'primary' : 'outline-secondary',
    onClick: function onClick() {
      return setViewMode('visual');
    },
    "data-testid": "visual-editor-button"
  }, "Visual Editor"), /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    variant: viewMode === 'text' ? 'primary' : 'outline-secondary',
    onClick: function onClick() {
      return setViewMode('text');
    },
    "data-testid": "text-editor-button"
  }, "Text Editor"))), viewMode === 'visual' ? /*#__PURE__*/_react["default"].createElement("section", {
    "data-testid": "visual-editor-section"
  }, /*#__PURE__*/_react["default"].createElement(_ButtonSection["default"], null), /*#__PURE__*/_react["default"].createElement(_StructureOutputContainer["default"], {
    disableSave: disableSave,
    structureIsSaved: structureIsSaved,
    structureURL: structureURL
  })) : /*#__PURE__*/_react["default"].createElement(_TextEditor["default"], {
    initialJson: smData[0]
  }));
};
var _default = exports["default"] = StructureTabView;