"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderWithRedux = renderWithRedux;
exports.testSmData = void 0;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _react = _interopRequireDefault(require("react"));

var _reactRedux = require("react-redux");

var _redux = require("redux");

var _reactTestingLibrary = require("react-testing-library");

var _reducers = _interopRequireDefault(require("../reducers"));

/**
 * Helper function for providing a Redux connected component for testing.
 *
 * Taken from Testing Library:  https://testing-library.com/docs/example-react-redux
 *
 * @param {React Component} ui
 * @param {object} param1
 */
function renderWithRedux(ui) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      initialState = _ref.initialState,
      _ref$store = _ref.store,
      store = _ref$store === void 0 ? (0, _redux.createStore)(_reducers["default"], initialState) : _ref$store;

  return (0, _objectSpread2["default"])({}, (0, _reactTestingLibrary.render)(_react["default"].createElement(_reactRedux.Provider, {
    store: store
  }, ui)), {
    store: store
  });
}

var testSmData = [{
  type: 'root',
  label: 'Sample Video',
  items: [{
    type: 'div',
    label: 'Intro',
    items: [{
      type: 'div',
      label: 'Adam test',
      items: [],
      id: 'abc'
    }, {
      type: 'span',
      label: 'Part I',
      begin: '00:00:00.00',
      end: '00:01:00.00',
      id: 'def'
    }],
    id: 'ghij'
  }],
  id: 'klmn'
}];
exports.testSmData = testSmData;