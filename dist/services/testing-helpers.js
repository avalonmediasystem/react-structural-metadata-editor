"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.nestedTestSmData = exports.manifestWoStructure = exports.manifestWoStructItems = exports.manifestWoChoice = exports.manifestWithStructure = exports.manifestWithInvalidStruct = exports.manifestWNestedStructure = exports.manifestWEmptyRanges = exports.manifestWEmptyCanvas = exports.manifest = void 0;
exports.renderWithRedux = renderWithRedux;
exports.testSmData = exports.testInvalidData = exports.testEmptyHeaderBefore = exports.testEmptyHeaderAfter = exports.testDataFromServer = void 0;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _react = _interopRequireDefault(require("react"));
var _reactRedux = require("react-redux");
var _redux = require("redux");
var _react2 = require("@testing-library/react");
var _reducers = _interopRequireDefault(require("../reducers"));
var _reduxThunk = require("redux-thunk");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
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
    store = _ref$store === void 0 ? (0, _redux.createStore)(_reducers["default"], initialState, (0, _redux.applyMiddleware)(_reduxThunk.thunk)) : _ref$store;
  var renderFn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _react2.render;
  var obj = _objectSpread(_objectSpread({}, renderFn(/*#__PURE__*/_react["default"].createElement(_reactRedux.Provider, {
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
var testSmData = exports.testSmData = [{
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
      valid: true,
      timeRange: {
        start: 3.321,
        end: 10.321
      }
    }, {
      type: 'span',
      label: 'Segment 1.2',
      id: '123a-456b-789c-4d',
      begin: '00:00:11.231',
      end: '00:08:00.001',
      valid: true,
      timeRange: {
        start: 11.231,
        end: 480.001
      }
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
        valid: true,
        timeRange: {
          start: 543.241,
          end: 900.001
        }
      }]
    }]
  }, {
    type: 'div',
    label: 'A ',
    id: '123a-456b-789c-9d',
    items: []
  }]
}];
var testDataFromServer = exports.testDataFromServer = [{
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
var testEmptyHeaderBefore = exports.testEmptyHeaderBefore = [{
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
var testEmptyHeaderAfter = exports.testEmptyHeaderAfter = [{
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
var testInvalidData = exports.testInvalidData = [{
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
      valid: true,
      timeRange: {
        start: 3.321,
        end: 10.321
      }
    }, {
      type: 'span',
      label: 'Invalid timespan',
      id: '123a-456b-789c-5d',
      begin: '00:20:21.000',
      end: '00:15:00.001',
      valid: false,
      timeRange: {
        start: 261.00,
        end: 900.001
      }
    }, {
      type: 'span',
      label: 'Segment 1.2',
      id: '123a-456b-789c-4d',
      begin: '00:00:11.231',
      end: '00:08:00.001',
      valid: true,
      timeRange: {
        start: 11.231,
        end: 480.001
      }
    }]
  }]
}];
var nestedTestSmData = exports.nestedTestSmData = [{
  type: 'root',
  label: 'Ima Title',
  id: '123a-456b-789c-0d',
  items: [{
    type: 'div',
    label: 'First segment',
    id: '123a-456b-789c-1d',
    items: [{
      type: 'span',
      label: 'Segment 1.1',
      id: '123a-456b-789c-2d',
      begin: '00:00:03.321',
      end: '00:00:10.321',
      valid: true,
      timeRange: {
        start: 3.321,
        end: 10.321
      }
    }, {
      type: 'span',
      label: 'Segment 1.2',
      id: '123a-456b-789c-3d',
      begin: '00:01:00.231',
      end: '00:08:00.001',
      valid: true,
      timeRange: {
        start: 60.231,
        end: 480.001
      }
    }]
  }, {
    type: 'div',
    label: 'Second segment',
    id: '123a-456b-789c-4d',
    items: [{
      type: 'div',
      label: 'Sub-Segment 2.1',
      id: '123a-456b-789c-5d',
      items: [{
        type: 'span',
        label: 'Segment 2.1',
        id: '123a-456b-789c-6d',
        begin: '00:09:00.241',
        end: '00:15:00.001',
        valid: true,
        nestedSpan: false,
        timeRange: {
          start: 540.241,
          end: 900.001
        },
        items: [{
          type: 'span',
          label: 'Segment 2.1.1',
          id: '123a-456b-789c-7d',
          begin: '00:09:10.241',
          end: '00:10:00.321',
          valid: true,
          nestedSpan: true,
          timeRange: {
            start: 550.241,
            end: 660.321
          }
        }, {
          type: 'span',
          label: 'Segment 2.1.2',
          id: '123a-456b-789c-8d',
          begin: '00:12:00.231',
          end: '00:13:00.001',
          valid: true,
          nestedSpan: true,
          timeRange: {
            start: 720.231,
            end: 790.001
          }
        }]
      }]
    }]
  }, {
    type: 'div',
    label: 'A ',
    id: '123a-456b-789c-9d',
    items: []
  }]
}];
var manifest = exports.manifest = {
  ' @context': ['http://iiif.io/api/presentation/3/context.json'],
  type: 'Manifest',
  id: 'http://example.com/volleyball-for-boys/manifest',
  label: {
    en: ['Volley Ball for Boys']
  },
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
var manifestWithInvalidStruct = exports.manifestWithInvalidStruct = {
  '@context': ['http://www.w3.org/ns/anno.jsonld', 'http://iiif.io/api/presentation/3/context.json'],
  type: 'Manifest',
  id: 'https://example.com/lunchroom-manners/manifest',
  label: {
    en: ['Beginning Responsibility: Lunchroom Manners']
  },
  items: [{
    type: 'Canvas',
    id: 'https://example.com/lunchroom-manners/manifest/canvas/1',
    width: 480,
    height: 360,
    duration: 662.037,
    items: [{
      id: 'https://example.com/lunchroom-manners/manifest/canvas/1/page',
      type: 'AnnotationPage',
      items: [{
        id: 'https://example.com/lunchroom-manners/manifest/canvas/1/page/annotation',
        type: 'Annotation',
        motivation: 'painting',
        body: {
          id: 'http://example.com/volleyball-for-boys/volleyball-for-boys.m3u8',
          type: 'Sound',
          format: 'application/x-x-mpegURL',
          height: 1080,
          width: 1920,
          duration: 662.037
        },
        target: 'https://example.com/lunchroom-manners/manifest/canvas/1'
      }]
    }],
    seeAlso: [{
      id: 'https://example.com/lunchroom_manners/waveform.json',
      type: 'Dataset',
      label: {
        en: ['waveform.json']
      },
      format: 'application/json'
    }]
  }],
  structures: [{
    type: 'Range',
    id: 'http://example.com/lunchroom-manners/manifest/range/0',
    behavior: 'top',
    label: null,
    items: [{
      type: 'Range',
      id: 'http://example.com/lunchroom-manners/manifest/range/1',
      label: {
        en: ['Lunchroom Manners']
      },
      items: [{
        type: 'Range',
        id: 'http://example.com/lunchroom-manners/manifest/range/2',
        label: {
          en: ['Manners']
        },
        items: [{
          type: 'Canvas',
          id: 'https://example.com/lunchroom-manners/manifest/canvas/1#t=234,157'
        }]
      }]
    }]
  }]
};
var manifestWoStructure = exports.manifestWoStructure = {
  '@context': ['http://www.w3.org/ns/anno.jsonld', 'http://iiif.io/api/presentation/3/context.json'],
  type: 'Manifest',
  id: 'https://example.com/lunchroom-manners/manifest',
  label: {
    en: ['Beginning Responsibility: Lunchroom Manners']
  },
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
    }],
    seeAlso: [{
      id: 'https://example.com/lunchroom_manners/waveform.json',
      type: 'Dataset',
      label: {
        en: ['waveform.json']
      },
      format: 'application/json'
    }]
  }]
};
var manifestWithStructure = exports.manifestWithStructure = {
  '@context': ['http://iiif.io/api/presentation/3/context.json'],
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
    seeAlso: [{
      id: 'http://example.com/lunchroom-manners/waveform.json',
      type: 'Dataset',
      label: {
        en: ['waveform.json']
      },
      format: 'application/json'
    }]
  }],
  structures: [{
    type: 'Range',
    id: 'http://example.com/sample-manifest/manifest/range/0',
    behavior: 'top',
    label: null,
    items: [{
      type: 'Range',
      id: 'http://example.com/sample-manifest/manifest/range/1',
      label: 'Volleyball for Boys',
      items: [{
        type: 'Range',
        id: 'http://example.com/sample-manifest/manifest/range/2',
        label: {
          en: ['Volleyball for Boys']
        },
        items: [{
          type: 'Canvas',
          id: 'http://example.com/sample-manifest/manifest/canvas/1#t=0,157'
        }]
      }]
    }, {
      type: 'Range',
      id: 'http://example.com/sample-manifest/manifest/range/3',
      label: {
        en: ['Lunchroom Manners']
      },
      items: [{
        type: 'Range',
        id: 'http://example.com/sample-manifest/manifest/range/4',
        label: {
          en: ['Introduction']
        },
        items: [{
          type: 'Canvas',
          id: 'http://example.com/sample-manifest/manifest/canvas/2#t=0,23'
        }]
      }, {
        type: 'Range',
        id: 'http://example.com/sample-manifest/manifest/range/5',
        label: {
          en: ['Washing Hands']
        },
        items: []
      }]
    }]
  }]
};
var manifestWoChoice = exports.manifestWoChoice = {
  '@context': ['http://iiif.io/api/presentation/3/context.json'],
  id: "http://example.com/sample-manifest/manifest.json",
  type: 'Manifest',
  label: {
    en: ['Volley Ball for Boys']
  },
  items: [{
    id: 'http://example.com/sample-manifest/manifest/canvas/1',
    type: 'Canvas',
    height: 1080,
    width: 1920,
    duration: 662.037,
    items: [{
      id: 'http://example.com/sample-manifest/canvas/1/page',
      type: 'AnnotationPage',
      items: [{
        id: 'http://example.com/sample-manifest/canvas/1/page/annotation',
        type: 'Annotation',
        motivation: 'painting',
        body: {
          id: 'http://example.com/volleyball-for-boys/volleyball-for-boys.m3u8',
          type: 'Sound',
          format: 'application/x-x-mpegURL',
          height: 1080,
          width: 1920,
          duration: 662.037
        },
        target: 'http://example.com/sample-manifest/canvas/1'
      }]
    }]
  }]
};
var manifestWEmptyCanvas = exports.manifestWEmptyCanvas = {
  '@context': ['http://iiif.io/api/presentation/3/context.json'],
  id: "http://example.com/empty-canvas-manifest/manifest.json",
  type: 'Manifest',
  label: {
    en: ['Empty Canvas Manifest']
  },
  items: [{
    id: 'http://example.com/empty-canvas-manifest/manifest/canvas/1',
    type: 'Canvas',
    height: 1080,
    width: 1920,
    items: [{
      id: 'http://example.com/empty-canvas-manifest/canvas/1/page',
      type: 'AnnotationPage'
    }],
    seeAlso: [{
      id: 'https://example.com/empty-canvas-manifest/waveform.json',
      type: 'Dataset',
      label: {
        en: ['waveform.json']
      },
      format: 'application/json'
    }],
    placeholderCanvas: {
      type: "Canvas",
      id: "https://example.com/empty-canvas-manifest/canvas/1/placeholder",
      items: [{
        type: "AnnotationPage",
        id: "https://example.com/empty-canvas-manifest/canvas/1/placeholder/annotation_page/1",
        items: [{
          type: "Annotation",
          motivation: "painting",
          body: {
            id: null,
            type: "Text",
            format: "text/plain",
            label: {
              none: ["This item is still processing. Please check back later."]
            }
          },
          id: "https://example.com/empty-canvas-manifest/canvas/1/placeholder/annotation_page/1",
          target: "https://example.com/empty-canvas-manifest/canvas/1/placeholder"
        }]
      }]
    }
  }]
};

// Manifest with nested structures
var manifestWNestedStructure = exports.manifestWNestedStructure = {
  '@context': ['http://iiif.io/api/presentation/3/context.json'],
  type: 'Manifest',
  id: 'http://example.com/deep-nested/manifest',
  label: {
    en: ['Deep Nested Structure']
  },
  items: [{
    id: 'http://example.com/deep-nested/canvas/1',
    type: 'Canvas',
    height: 1080,
    width: 1920,
    duration: 662.037,
    items: [{
      id: 'http://example.com/deep-nested/canvas/1/page',
      type: 'AnnotationPage',
      items: [{
        id: 'http://example.com/deep-nested/canvas/1/page/annotation',
        type: 'Annotation',
        motivation: 'painting',
        body: {
          id: 'http://example.com/deep-nested/media.mp4',
          type: 'Sound',
          format: 'application/x-x-mpegURL',
          height: 1080,
          width: 1920,
          duration: 662.037
        },
        target: 'http://example.com/deep-nested/canvas/1'
      }]
    }]
  }],
  structures: [{
    type: 'Range',
    id: 'http://example.com/deep-nested/range/root',
    label: {
      en: ['Table of Content']
    },
    items: [{
      type: 'Range',
      id: 'http://example.com/deep-nested/range/level1-div',
      label: {
        en: ['Level 1 Div']
      },
      items: [{
        type: 'Range',
        id: 'http://example.com/deep-nested/range/level2-span',
        label: {
          en: ['Level 2 Span']
        },
        items: [{
          type: 'Canvas',
          id: 'http://example.com/deep-nested/canvas/1#t=0,100'
        }]
      }, {
        type: 'Range',
        id: 'http://example.com/deep-nested/range/level2-div',
        label: {
          en: ['Level 2 Div']
        },
        items: [{
          type: 'Range',
          id: 'http://example.com/deep-nested/range/level3-span',
          label: {
            en: ['Level 3 Span']
          },
          items: [{
            type: 'Canvas',
            id: 'http://example.com/deep-nested/canvas/1#t=100,200'
          }]
        }, {
          type: 'Range',
          id: 'http://example.com/deep-nested/range/level3-div',
          label: {
            en: ['Level 3 Div']
          },
          items: [{
            type: 'Range',
            id: 'http://example.com/deep-nested/range/level4-span',
            label: {
              en: ['Level 4 Span']
            },
            items: [{
              type: 'Canvas',
              id: 'http://example.com/deep-nested/canvas/1#t=200,300'
            }, {
              type: 'Range',
              id: 'http://example.com/deep-nested/range/level5-span',
              label: {
                en: ['Level 5 Span']
              },
              items: [{
                type: 'Canvas',
                id: 'http://example.com/deep-nested/canvas/1#t=250,275'
              }]
            }]
          }]
        }]
      }]
    }]
  }]
};

// Manifest with empty Range items
var manifestWEmptyRanges = exports.manifestWEmptyRanges = {
  '@context': ['http://iiif.io/api/presentation/3/context.json'],
  type: 'Manifest',
  id: 'http://example.com/empty-ranges/manifest',
  label: {
    en: ['Edge Cases']
  },
  items: [{
    type: 'Canvas',
    id: 'http://example.com/empty-ranges/canvas/1',
    width: 1920,
    height: 1080,
    duration: 500,
    items: [{
      type: 'AnnotationPage',
      id: 'http://example.com/empty-ranges/canvas/1/page',
      items: [{
        type: 'Annotation',
        motivation: 'painting',
        body: {
          id: 'http://example.com/empty-ranges/media.mp4',
          type: 'Video',
          format: 'video/mp4',
          duration: 500
        },
        target: 'http://example.com/empty-ranges/canvas/1'
      }]
    }]
  }],
  structures: [{
    type: 'Range',
    id: 'http://example.com/empty-ranges/range/root',
    label: {
      en: ['Root']
    },
    items: [{
      type: 'Range',
      id: 'http://example.com/empty-ranges/range/valid',
      label: {
        en: ['Valid Range']
      },
      items: [{
        type: 'Canvas',
        id: 'http://example.com/empty-ranges/canvas/1#t=0,100'
      }]
    }, {
      type: 'Range',
      id: 'http://example.com/empty-ranges/range/no-canvas',
      label: {
        en: ['No Canvas Range']
      },
      items: []
    }, {
      type: 'Range',
      id: 'http://example.com/empty-ranges/range/invalid-id',
      label: {
        en: ['Range with Invalid Canvas']
      },
      items: [{
        type: 'Canvas',
        id: 'http://example.com/empty-ranges/canvas/nonexistent#t=100,200'
      }]
    }]
  }]
};

// Manifest with a Range that has no items
var manifestWoStructItems = exports.manifestWoStructItems = {
  '@context': ['http://iiif.io/api/presentation/3/context.json'],
  type: 'Manifest',
  id: 'http://example.com/undefined-items/manifest',
  label: {
    en: ['Range with undefined items']
  },
  items: [{
    type: 'Canvas',
    id: 'http://example.com/undefined-items/canvas/1',
    width: 1920,
    height: 1080,
    duration: 662.037,
    items: [{
      type: 'AnnotationPage',
      id: 'http://example.com/undefined-items/canvas/1/page',
      items: [{
        type: 'Annotation',
        motivation: 'painting',
        body: {
          id: 'http://example.com/undefined-items/media.mp4',
          type: 'Video',
          format: 'video/mp4',
          duration: 662.037,
          height: 1080,
          width: 1920
        },
        target: 'http://example.com/undefined-items/canvas/1'
      }]
    }]
  }],
  structures: [{
    type: 'Range',
    id: 'http://example.com/undefined-items/range/root',
    label: {
      en: ['Root']
    },
    items: [{
      type: 'Range',
      id: 'http://example.com/undefined-items/range/valid',
      label: {
        en: ['Valid Range']
      }
    }]
  }]
};