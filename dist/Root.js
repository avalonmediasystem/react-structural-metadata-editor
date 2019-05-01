"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _App = _interopRequireDefault(require("./App"));

var _reactRedux = require("react-redux");

var _redux = require("redux");

var _reducers = _interopRequireDefault(require("./reducers"));

var _reduxThunk = _interopRequireDefault(require("redux-thunk"));

var store = (0, _redux.createStore)(_reducers["default"], (0, _redux.applyMiddleware)(_reduxThunk["default"]));

var Root = function Root(props) {
  return _react["default"].createElement(_reactRedux.Provider, {
    store: store
  }, _react["default"].createElement(_App["default"], props));
};

var _default = Root;
exports["default"] = _default;