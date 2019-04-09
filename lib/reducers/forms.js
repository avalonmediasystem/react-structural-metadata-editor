'use strict';

exports.__esModule = true;

var _types = require('../actions/types');

var types = _interopRequireWildcard(_types);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var initialState = {
  editingDisabled: false,
  structureRetrieved: false,
  waveformRetrieved: false
};

var forms = function forms() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];

  switch (action.type) {
    case types.IS_EDITING_TIMESPAN:
      if (action.code === 0) {
        return Object.assign({}, state, {
          editingDisabled: true
        });
      }

      return Object.assign({}, state, {
        editingDisabled: false
      });

    case types.RETRIEVED_STRUCTURE:
      if (action.code === 0) {
        return Object.assign({}, state, {
          structureRetrieved: true
        });
      }
      break;

    case types.RETRIEVED_WAVEFORM:
      if (action.code === 0) {
        return Object.assign({}, state, {
          waveformRetrieved: true
        });
      }
      break;

    default:
      return state;
  }
};

exports.default = forms;
module.exports = exports['default'];