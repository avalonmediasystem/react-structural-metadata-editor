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
var _reactCodemirror = _interopRequireDefault(require("@uiw/react-codemirror"));
var _langJson = require("@codemirror/lang-json");
var _view = require("@codemirror/view");
var _language = require("@codemirror/language");
var _lint = require("@codemirror/lint");
var _smeHooks = require("../services/sme-hooks");
var _codemirrorExtensions = require("../services/codemirror-extensions");
var _Button = _interopRequireDefault(require("react-bootstrap/Button"));
var _Alert = _interopRequireDefault(require("react-bootstrap/Alert"));
require("../styles/text-editor.css");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t2 in e) "default" !== _t2 && {}.hasOwnProperty.call(e, _t2) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t2)) && (i.get || i.set) ? o(f, _t2, i) : f[_t2] = e[_t2]); return f; })(e, t); }
var TextEditor = function TextEditor(_ref) {
  var _ref$initialJson = _ref.initialJson,
    initialJson = _ref$initialJson === void 0 ? null : _ref$initialJson;
  var _useState = (0, _react.useState)(''),
    _useState2 = (0, _slicedToArray2["default"])(_useState, 2),
    jsonContent = _useState2[0],
    setJsonContent = _useState2[1];
  var _useState3 = (0, _react.useState)(true),
    _useState4 = (0, _slicedToArray2["default"])(_useState3, 2),
    isValid = _useState4[0],
    setIsValid = _useState4[1];
  var _useState5 = (0, _react.useState)([]),
    _useState6 = (0, _slicedToArray2["default"])(_useState5, 2),
    validationErrors = _useState6[0],
    setValidationErrors = _useState6[1];
  var _useState7 = (0, _react.useState)(false),
    _useState8 = (0, _slicedToArray2["default"])(_useState7, 2),
    copySuccess = _useState8[0],
    setCopySuccess = _useState8[1];
  var _useState9 = (0, _react.useState)(false),
    _useState0 = (0, _slicedToArray2["default"])(_useState9, 2),
    hasBeenEdited = _useState0[0],
    setHasBeenEdited = _useState0[1];

  // Track in-progress validation to show/hide validation status
  var isValidating = (0, _react.useRef)(false);
  var editorViewRef = (0, _react.useRef)(null);
  var _useStructureUpdate = (0, _smeHooks.useStructureUpdate)(),
    updateStructure = _useStructureUpdate.updateStructure;
  var _useTextEditor = (0, _smeHooks.useTextEditor)(),
    formatJson = _useTextEditor.formatJson,
    injectTemplate = _useTextEditor.injectTemplate,
    restoreRemovedProps = _useTextEditor.restoreRemovedProps,
    sanitizeDisplayedText = _useTextEditor.sanitizeDisplayedText;
  (0, _react.useEffect)(function () {
    if (initialJson) {
      // Filter ids and other extra properties from displayed text
      var sanitizedText = sanitizeDisplayedText(initialJson);
      // Format filtered data
      var formatted = formatJson(sanitizedText);
      setJsonContent(formatted);
    }
  }, [initialJson, formatJson, sanitizeDisplayedText]);

  /**
   * Handle save action in editor. This updates the Redux store with the latest
   * JSON from the text editor, which re-renders the visual editor
   * on the other tab.
   */
  var handleSave = function handleSave() {
    if (isValid) {
      try {
        var parsedData = JSON.parse(jsonContent);
        // Restore removed properties on to the edited data
        var withOtherProps = restoreRemovedProps(parsedData);
        updateStructure([withOtherProps]);
      } catch (error) {
        console.error('Failed to parse JSON:', error);
        setIsValid(false);
        setValidationErrors(['Unable to save JSON, please check again.']);
      }
    }
  };

  /**
   * Handle copy to clipboard function in the editor
   */
  var handleCopy = /*#__PURE__*/function () {
    var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var _t;
      return _regenerator["default"].wrap(function (_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            if (!isValid) {
              _context.next = 4;
              break;
            }
            _context.prev = 1;
            _context.next = 2;
            return navigator.clipboard.writeText(jsonContent);
          case 2:
            setCopySuccess(true);
            // Reset button once content is copied
            setTimeout(function () {
              return setCopySuccess(false);
            }, 2000);
            _context.next = 4;
            break;
          case 3:
            _context.prev = 3;
            _t = _context["catch"](1);
            console.error('Failed to copy to clipboard:', _t);
          case 4:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[1, 3]]);
    }));
    return function handleCopy() {
      return _ref2.apply(this, arguments);
    };
  }();

  /**
   * Update text changes from the editor in state
   * @param {String} value current text from editor
   */
  var handleChange = function handleChange(value) {
    isValidating.current = true;
    setJsonContent(value);
    setHasBeenEdited(true);
  };

  /**
   * Handle adding a new heading template at cursor position
   */
  var handleAddHeading = function handleAddHeading() {
    if (!editorViewRef.current) return;
    var headingTemplate = {
      label: "",
      type: "div",
      items: []
    };
    injectTemplate(editorViewRef, headingTemplate);
  };

  /**
   * Handle adding a new timespan template at cursor position
   */
  var handleAddTimespan = function handleAddTimespan() {
    if (!editorViewRef.current) return;
    var timespanTemplate = {
      label: "",
      type: "span",
      begin: "",
      end: ""
    };
    injectTemplate(editorViewRef, timespanTemplate);
  };

  /**
   * Validation state update function
   */
  var updateValidationState = function updateValidationState(isValidResult, errorMessages) {
    setIsValid(isValidResult);
    setValidationErrors(errorMessages);
    isValidating.current = false;
  };

  /**
   * Custom linter extension for CodeMirror for JSON validation using AJV schema validator.
   * 'useMemo' helps stabilize the extension reference across renders.
   */
  var customJsonLinter = (0, _react.useMemo)(function () {
    return (0, _codemirrorExtensions.createCustomJsonLinter)(updateValidationState);
  }, []);

  /**
   * Custom extension to make "id" fields read-only.
   * 'useMemo' helps stabilize the extension reference across renders.
   */
  var readOnlyIdExtension = (0, _react.useMemo)(function () {
    return (0, _codemirrorExtensions.createReadOnlyIdExtension)();
  }, []);
  return /*#__PURE__*/_react["default"].createElement("section", {
    className: "text-editor"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "text-editor-header"
  }, /*#__PURE__*/_react["default"].createElement(_Alert["default"], {
    variant: "info",
    className: "p-2 m-2"
  }, /*#__PURE__*/_react["default"].createElement("strong", null, "Info:"), " The \"id\" fields are read-only. Please save edited structure to reflect these changes in the visual editor and the waveform.")), /*#__PURE__*/_react["default"].createElement("div", {
    className: "text-editor-body"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "codemirror-text-editor"
  }, /*#__PURE__*/_react["default"].createElement(_reactCodemirror["default"], {
    value: jsonContent,
    theme: "light",
    extensions: [(0, _langJson.json)(), (0, _view.lineNumbers)(), (0, _language.syntaxHighlighting)(_language.defaultHighlightStyle, {
      fallback: true
    }), _view.EditorView.lineWrapping, _view.EditorView.editable.of(true), customJsonLinter, (0, _lint.lintGutter)(), readOnlyIdExtension],
    onChange: handleChange,
    onCreateEditor: function onCreateEditor(view) {
      editorViewRef.current = view;
    },
    readOnly: false,
    "data-testid": "codemirror-editor"
  })), /*#__PURE__*/_react["default"].createElement("div", {
    className: "text-editor-sidebar"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "text-editor-buttons"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "d-flex mb-2"
  }, /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    variant: "outline-secondary",
    onClick: handleAddHeading,
    title: "Insert heading template at cursor",
    className: "w-100 mx-1 mt-2",
    "data-testid": "add-heading-template"
  }, "New Heading Template"), /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    variant: "outline-secondary",
    onClick: handleAddTimespan,
    title: "Insert timespan template at cursor",
    className: "w-100 mx-1 mt-2",
    "data-testid": "add-timespan-template"
  }, "New Timespan Template")), /*#__PURE__*/_react["default"].createElement("div", {
    className: "d-flex"
  }, /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    variant: "primary",
    onClick: handleSave,
    disabled: !isValid,
    title: "Save JSON changes",
    className: "w-100 mx-1",
    "data-testid": "save-text"
  }, "Save JSON"), /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    variant: copySuccess ? "secondary" : "success",
    onClick: handleCopy,
    disabled: !isValid,
    title: "Copy JSON to clipboard",
    className: "w-100 mx-1",
    "data-testid": "copy-text"
  }, copySuccess ? "Copied!" : "Copy JSON"))), /*#__PURE__*/_react["default"].createElement("div", {
    className: "text-editor-status"
  }, hasBeenEdited && !isValidating.current && /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, !isValid && validationErrors.length > 0 ? /*#__PURE__*/_react["default"].createElement(_Alert["default"], {
    variant: "danger",
    className: "validation-errors my-0 p-2",
    "data-testid": "validation-errors"
  }, /*#__PURE__*/_react["default"].createElement("strong", null, "Validation Errors:"), /*#__PURE__*/_react["default"].createElement("ul", {
    className: "mb-0 mt-2"
  }, validationErrors.map(function (error, index) {
    return /*#__PURE__*/_react["default"].createElement("li", {
      key: index
    }, error);
  }))) : /*#__PURE__*/_react["default"].createElement(_Alert["default"], {
    variant: "success",
    className: "my-0 p-2",
    "data-testid": "validation-success"
  }, "\u2713 Valid structure!"))))));
};
var _default = exports["default"] = TextEditor;