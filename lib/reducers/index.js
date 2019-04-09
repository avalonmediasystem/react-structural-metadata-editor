'use strict';

exports.__esModule = true;

var _redux = require('redux');

var _forms = require('./forms');

var _forms2 = _interopRequireDefault(_forms);

var _smData = require('./sm-data');

var _smData2 = _interopRequireDefault(_smData);

var _peaksInstance = require('./peaks-instance');

var _peaksInstance2 = _interopRequireDefault(_peaksInstance);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _redux.combineReducers)({
  forms: _forms2.default,
  smData: _smData2.default,
  peaksInstance: _peaksInstance2.default
});
module.exports = exports['default'];