"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderWithRedux = renderWithRedux;
exports.testEmptyHeaderAfter = exports.testEmptyHeaderBefore = exports.testSmData = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _reactRedux = require("react-redux");

var _redux = require("redux");

var _reactTestingLibrary = require("react-testing-library");

var _reducers = _interopRequireDefault(require("../reducers"));

var _reduxThunk = _interopRequireDefault(require("redux-thunk"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { keys.push.apply(keys, Object.getOwnPropertySymbols(object)); } if (enumerableOnly) keys = keys.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/**
 * Helper function for providing a Redux connected component for testing.
 * Taken from Testing Library:  https://testing-library.com/docs/example-react-redux
 *
 * Providing re-render when props gets updated.
 * Taken from: https://gist.github.com/darekzak/0c56bd9f1ad6e876fd21837feee79c50
 *
 * @param {React Component} ui
 * @param {object} param1
 * @param {function} param2
 */
function renderWithRedux(ui) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      initialState = _ref.initialState,
      _ref$store = _ref.store,
      store = _ref$store === void 0 ? (0, _redux.createStore)(_reducers["default"], initialState, (0, _redux.applyMiddleware)(_reduxThunk["default"])) : _ref$store;

  var renderFn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _reactTestingLibrary.render;

  var obj = _objectSpread({}, renderFn(_react["default"].createElement(_reactRedux.Provider, {
    store: store
  }, ui)), {
    store: store
  });

  obj.rerenderWithRedux = function (el, nextState) {
    if (nextState) {
      store.replaceReducer(function () {
        return nextState;
      });
      store.dispatch({
        type: '__TEST_ACTION_REPLACE_STATE__'
      });
      store.replaceReducer(_reducers["default"]);
    }

    return renderWithRedux(el, {
      store: store
    }, obj.rerender);
  };

  return obj;
}

var testSmData = [{
  type: 'root',
  label: 'Ima Title',
  id: '123a-456b-789c-0d',
  items: [{
    type: 'div',
    label: 'First segment',
    id: '123a-456b-789c-1d',
    items: [{
      type: 'div',
      label: 'Sub-Segment 1.1',
      id: '123a-456b-789c-2d',
      items: []
    }, {
      type: 'span',
      label: 'Segment 1.1',
      id: '123a-456b-789c-3d',
      begin: '00:00:03.321',
      end: '00:00:10.321'
    }, {
      type: 'span',
      label: 'Segment 1.2',
      id: '123a-456b-789c-4d',
      begin: '00:00:11.231',
      end: '00:08:00.001'
    }]
  }, {
    type: 'div',
    label: 'Second segment',
    id: '123a-456b-789c-5d',
    items: [{
      type: 'div',
      label: 'Sub-Segment 2.1',
      id: '123a-456b-789c-6d',
      items: [{
        type: 'div',
        label: 'Sub-Segment 2.1.1',
        id: '123a-456b-789c-7d',
        items: []
      }, {
        type: 'span',
        label: 'Segment 2.1',
        id: '123a-456b-789c-8d',
        begin: '00:09:03.241',
        end: '00:15:00.001'
      }]
    }]
  }, {
    type: 'div',
    label: 'A ',
    id: '123a-456b-789c-9d',
    items: []
  }]
}];
exports.testSmData = testSmData;
var testEmptyHeaderBefore = [{
  type: 'div',
  label: 'Title',
  id: '123a-456b-789c-0d',
  items: [{
    type: 'div',
    label: 'Scene 1',
    id: '123a-456b-789c-1d',
    items: []
  }, {
    type: 'div',
    label: 'Scene 2',
    id: '123a-456b-789c-2d',
    items: [{
      type: 'span',
      label: 'Act 1',
      id: '123a-456b-789c-3d',
      begin: '00:10:00.001',
      end: '00:15:00.001'
    }]
  }]
}];
exports.testEmptyHeaderBefore = testEmptyHeaderBefore;
var testEmptyHeaderAfter = [{
  type: 'div',
  label: 'Title',
  id: '123a-456b-789c-0d',
  items: [{
    type: 'div',
    label: 'Scene 1',
    id: '123a-456b-789c-1d',
    items: [{
      type: 'span',
      label: 'Act 1',
      id: '123a-456b-789c-2d',
      begin: '00:00:00.000',
      end: '00:09:00.001'
    }]
  }, {
    type: 'div',
    label: 'Scene 2',
    id: '123a-456b-789c-3d',
    items: []
  }]
}];
exports.testEmptyHeaderAfter = testEmptyHeaderAfter;