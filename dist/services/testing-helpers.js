"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.manifestWoStructure = exports.manifestWithStructure = exports.manifest = void 0;
exports.renderWithRedux = renderWithRedux;
exports.testSmData = exports.testInvalidData = exports.testEmptyHeaderBefore = exports.testEmptyHeaderAfter = exports.testDataFromServer = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _reactRedux = require("react-redux");

var _redux = require("redux");

var _reactTestingLibrary = require("react-testing-library");

var _reducers = _interopRequireDefault(require("../reducers"));

var _reduxThunk = _interopRequireDefault(require("redux-thunk"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

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

  var obj = _objectSpread(_objectSpread({}, renderFn( /*#__PURE__*/_react["default"].createElement(_reactRedux.Provider, {
    store: store
  }, ui))), {}, {
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
      end: '00:00:10.321',
      valid: true
    }, {
      type: 'span',
      label: 'Segment 1.2',
      id: '123a-456b-789c-4d',
      begin: '00:00:11.231',
      end: '00:08:00.001',
      valid: true
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
        end: '00:15:00.001',
        valid: true
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
var testDataFromServer = [{
  type: 'root',
  label: 'Ima Title',
  id: '123a-456b-789c-0d',
  items: [{
    type: 'span',
    label: 'First segment',
    id: '123a-456b-789c-1d',
    begin: '41.45',
    end: '42'
  }, {
    type: 'span',
    label: 'Middle segment',
    id: '123a-456b-789c-2d',
    begin: '00:10:42',
    end: '00:15:00.23'
  }, {
    type: 'span',
    label: 'Segmet 1',
    id: '123a-456b-789c-3d',
    begin: '15:30',
    end: '16:00.23'
  }, {
    type: 'span',
    label: 'Segment 2',
    id: '123a-456b-789c-4d',
    begin: '16:30',
    end: '00:38:58'
  }, {
    type: 'span',
    label: 'Final segment',
    id: '123a-456b-789c-5d',
    begin: '17:00',
    end: 'NaN:NaN:NaN'
  }]
}];
exports.testDataFromServer = testDataFromServer;
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
var testInvalidData = [{
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
      end: '00:00:10.321',
      valid: true
    }, {
      type: 'span',
      label: 'Invalid timespan',
      id: '123a-456b-789c-5d',
      begin: '00:20:21.000',
      end: '00:15:00.001',
      valid: false
    }, {
      type: 'span',
      label: 'Segment 1.2',
      id: '123a-456b-789c-4d',
      begin: '00:00:11.231',
      end: '00:08:00.001',
      valid: true
    }]
  }]
}];
exports.testInvalidData = testInvalidData;
var manifest = {
  ' @context': ['http://iiif.io/api/presentation/3/context.json'],
  type: 'Manifest',
  id: 'http://example.com/volleyball-for-boys/manifest',
  label: {
    en: ['Volley Ball for Boys']
  },
  rendering: [{
    id: 'https://example.com/volleyball-for-boys/waveform.json',
    type: 'SpecificResource',
    label: {
      en: ['waveform.json']
    },
    format: 'application/json'
  }],
  items: [{
    type: 'Canvas',
    id: 'http://example.com/volleyball-for-boys/manifest/canvas/1',
    items: [{
      type: 'AnnotationPage',
      id: 'http://example.com/volleyball-for-boys/manifest/canvas/1/annotation_page/1',
      items: [{
        type: 'Annotation',
        motivation: 'painting',
        target: 'http://example.com/volleyball-for-boys/manifest/canvas/#t=44.53,100.403',
        body: {
          type: 'Choice',
          choiceHint: 'user',
          items: [{
            id: 'https://example.com/volleyball-for-boys/volleyball-for-boys.mp4',
            type: 'Video',
            format: 'video/mp4',
            height: 1080,
            width: 1920,
            duration: 662.037,
            label: {
              en: ['high']
            }
          }, {
            id: 'https://example.com/volleyball-for-boys/volleyball-for-boys.mp4',
            type: 'Video',
            format: 'video/mp4',
            height: 1080,
            width: 1920,
            duration: 662.037,
            label: {
              en: ['medium']
            }
          }]
        }
      }]
    }],
    width: 1920,
    height: 1080,
    duration: 662.037
  }],
  structures: [{
    type: 'Range',
    behavior: 'no-nav',
    id: 'http://example.com/volleyball-for-boys/manifest/range/1',
    label: {
      en: ['Volleyball for Boys']
    },
    items: [{
      type: 'Range',
      id: 'http://example.com/volleyball-for-boys/manifest/range/2',
      label: {
        en: ['Volleyball for Boys']
      },
      items: [{
        type: 'Canvas',
        id: 'http://example.com/volleyball-for-boys/manifest/canvas/1#t=0,'
      }]
    }]
  }]
};
exports.manifest = manifest;
var manifestWoStructure = {
  '@context': ['http://www.w3.org/ns/anno.jsonld', 'http://iiif.io/api/presentation/3/context.json'],
  type: 'Manifest',
  id: 'https://example.com/lunchroom-manners/manifest',
  label: {
    en: ['Beginning Responsibility: Lunchroom Manners']
  },
  rendering: [{
    id: 'https://example.com/lunchroom_manners/waveform.json',
    type: 'SpecificResource',
    label: {
      en: ['waveform.json']
    },
    format: 'application/json'
  }],
  items: [{
    type: 'Canvas',
    id: 'https://example.com/lunchroom-manners/manifest/canvas/1',
    width: 480,
    height: 360,
    duration: 660,
    items: [{
      id: 'https://example.com/manifest/canvas/1/page',
      type: 'AnnotationPage',
      items: [{
        id: 'https://example.com/manifest/canvas/1/page/annotation',
        type: 'Annotation',
        motivation: 'painting',
        body: [],
        target: 'https://example.com/manifest/canvas/1'
      }]
    }]
  }]
};
exports.manifestWoStructure = manifestWoStructure;
var manifestWithStructure = {
  ' @context': ['http://iiif.io/api/presentation/3/context.json'],
  type: 'Manifest',
  id: 'http://example.com/sample-manifest/manifest',
  label: {
    en: ['Volley Ball for Boys']
  },
  items: [{
    type: 'Canvas',
    id: 'http://example.com/sample-manifest/manifest/canvas/1',
    items: [{
      type: 'AnnotationPage',
      id: 'http://example.com/sample-manifest/manifest/canvas/1/annotation_page/1',
      items: [{
        type: 'Annotation',
        motivation: 'painting',
        target: 'http://example.com/sample-manifest/manifest/canvas/#t=44.53,100.403',
        body: {
          type: 'Choice',
          choiceHint: 'user',
          items: [{
            id: 'http://example.com/volleyball-for-boys/high/volleyball-for-boys.mp4',
            type: 'Video',
            format: 'video/mp4',
            height: 1080,
            width: 1920,
            duration: 662.037,
            label: {
              en: ['high']
            }
          }, {
            id: 'http://example.com/volleyball-for-boys/volleyball-for-boys.mp4',
            type: 'Video',
            format: 'video/mp4',
            height: 1080,
            width: 1920,
            duration: 662.037,
            label: {
              en: ['auto']
            }
          }]
        }
      }]
    }],
    width: 1920,
    height: 1080,
    duration: 662.037
  }, {
    type: 'Canvas',
    id: 'http://example.com/sample-manifest/manifest/canvas/2',
    width: 480,
    height: 360,
    duration: 660,
    items: [{
      id: 'http://example.com/sample-manifest/manifest/canvas/2/page',
      type: 'AnnotationPage',
      items: [{
        id: 'http://example.com/sample-manifest/manifest/canvas/2/page/annotation',
        type: 'Annotation',
        motivation: 'painting',
        body: [{
          type: 'Choice',
          choiceHint: 'user',
          items: [{
            id: 'http://example.com/lunchroom-manners/high/lunchroom_manners_1024kb.mp4',
            type: 'Video',
            format: 'video/mp4',
            label: {
              en: ['High']
            }
          }, {
            id: 'http://example.com/lunchroom-manners/medium/lunchroom_manners_512kb.mp4',
            type: 'Video',
            format: 'video/mp4',
            label: {
              en: ['Medium']
            }
          }]
        }],
        target: 'http://example.com/sample-manifest/manifest/canvas/2'
      }]
    }],
    rendering: [{
      id: 'http://example.com/lunchroom-manners/waveform.json',
      type: 'SpecificResource',
      label: {
        en: ['waveform.json']
      },
      format: 'application/json'
    }]
  }],
  structures: [{
    type: 'Range',
    behavior: 'no-nav',
    id: 'http://example.com/sample-manifest/manifest/range/1',
    label: {
      en: ['Volleyball for Boys']
    },
    items: [{
      type: 'Range',
      id: 'http://example.com/sample-manifest/manifest/range/2',
      label: {
        en: ['Volleyball for Boys']
      },
      items: [{
        type: 'Canvas',
        id: 'http://example.com/sample-manifest/manifest/canvas/1#t=0,'
      }]
    }]
  }]
};
exports.manifestWithStructure = manifestWithStructure;