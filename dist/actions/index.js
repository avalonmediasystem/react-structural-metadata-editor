"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resetReduxStore = void 0;

var types = _interopRequireWildcard(require("./types"));

var resetReduxStore = function resetReduxStore() {
  return {
    type: types.RESET_STORE
  };
};

exports.resetReduxStore = resetReduxStore;