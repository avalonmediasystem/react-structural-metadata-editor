import React from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { render } from 'react-testing-library';
import reducer from '../reducers';
import thunk from 'redux-thunk';

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
export function renderWithRedux(
  ui,
  {
    initialState,
    store = createStore(reducer, initialState, applyMiddleware(thunk)),
  } = {},
  renderFn = render
) {
  const obj = {
    ...renderFn(<Provider store={store}>{ui}</Provider>),
    store,
  };
  obj.rerenderWithRedux = (el, nextState) => {
    if (nextState) {
      store.replaceReducer(() => nextState);
      store.dispatch({ type: '__TEST_ACTION_REPLACE_STATE__' });
      store.replaceReducer(reducer);
    }
    return renderWithRedux(el, { store }, obj.rerender);
  };
  return obj;
}

export const testSmData = [
  {
    type: 'root',
    label: 'Ima Title',
    id: '123a-456b-789c-0d',
    items: [
      {
        type: 'div',
        label: 'First segment',
        id: '123a-456b-789c-1d',
        items: [
          {
            type: 'div',
            label: 'Sub-Segment 1.1',
            id: '123a-456b-789c-2d',
            items: [],
          },
          {
            type: 'span',
            label: 'Segment 1.1',
            id: '123a-456b-789c-3d',
            begin: '00:00:03.321',
            end: '00:00:10.321',
            valid: true,
          },
          {
            type: 'span',
            label: 'Segment 1.2',
            id: '123a-456b-789c-4d',
            begin: '00:00:11.231',
            end: '00:08:00.001',
            valid: true,
          },
        ],
      },
      {
        type: 'div',
        label: 'Second segment',
        id: '123a-456b-789c-5d',
        items: [
          {
            type: 'div',
            label: 'Sub-Segment 2.1',
            id: '123a-456b-789c-6d',
            items: [
              {
                type: 'div',
                label: 'Sub-Segment 2.1.1',
                id: '123a-456b-789c-7d',
                items: [],
              },
              {
                type: 'span',
                label: 'Segment 2.1',
                id: '123a-456b-789c-8d',
                begin: '00:09:03.241',
                end: '00:15:00.001',
                valid: true,
              },
            ],
          },
        ],
      },
      {
        type: 'div',
        label: 'A ',
        id: '123a-456b-789c-9d',
        items: [],
      },
    ],
  },
];

export const testDataFromServer = [
  {
    type: 'root',
    label: 'Ima Title',
    id: '123a-456b-789c-0d',
    items: [
      {
        type: 'span',
        label: 'First segment',
        id: '123a-456b-789c-1d',
        begin: '41.45',
        end: '42',
      },
      {
        type: 'span',
        label: 'Middle segment',
        id: '123a-456b-789c-2d',
        begin: '00:10:42',
        end: '00:15:00.23',
      },
      {
        type: 'span',
        label: 'Segmet 1',
        id: '123a-456b-789c-3d',
        begin: '15:30',
        end: '16:00.23',
      },
      {
        type: 'span',
        label: 'Segment 2',
        id: '123a-456b-789c-4d',
        begin: '16:30',
        end: '00:38:58',
      },
      {
        type: 'span',
        label: 'Final segment',
        id: '123a-456b-789c-5d',
        begin: '17:00',
        end: 'NaN:NaN:NaN',
      },
    ],
  },
];

export const testEmptyHeaderBefore = [
  {
    type: 'div',
    label: 'Title',
    id: '123a-456b-789c-0d',
    items: [
      {
        type: 'div',
        label: 'Scene 1',
        id: '123a-456b-789c-1d',
        items: [],
      },
      {
        type: 'div',
        label: 'Scene 2',
        id: '123a-456b-789c-2d',
        items: [
          {
            type: 'span',
            label: 'Act 1',
            id: '123a-456b-789c-3d',
            begin: '00:10:00.001',
            end: '00:15:00.001',
          },
        ],
      },
    ],
  },
];

export const testEmptyHeaderAfter = [
  {
    type: 'div',
    label: 'Title',
    id: '123a-456b-789c-0d',
    items: [
      {
        type: 'div',
        label: 'Scene 1',
        id: '123a-456b-789c-1d',
        items: [
          {
            type: 'span',
            label: 'Act 1',
            id: '123a-456b-789c-2d',
            begin: '00:00:00.000',
            end: '00:09:00.001',
          },
        ],
      },
      {
        type: 'div',
        label: 'Scene 2',
        id: '123a-456b-789c-3d',
        items: [],
      },
    ],
  },
];

export const testInvalidData = [
  {
    type: 'root',
    label: 'Ima Title',
    id: '123a-456b-789c-0d',
    items: [
      {
        type: 'div',
        label: 'First segment',
        id: '123a-456b-789c-1d',
        items: [
          {
            type: 'div',
            label: 'Sub-Segment 1.1',
            id: '123a-456b-789c-2d',
            items: [],
          },
          {
            type: 'span',
            label: 'Segment 1.1',
            id: '123a-456b-789c-3d',
            begin: '00:00:03.321',
            end: '00:00:10.321',
            valid: true,
          },
          {
            type: 'span',
            label: 'Invalid timespan',
            id: '123a-456b-789c-5d',
            begin: '00:20:21.000',
            end: '00:15:00.001',
            valid: false,
          },
          {
            type: 'span',
            label: 'Segment 1.2',
            id: '123a-456b-789c-4d',
            begin: '00:00:11.231',
            end: '00:08:00.001',
            valid: true,
          },
        ],
      },
    ],
  },
];

export const manifest = {
  ' @context': [
    'http://iiif.io/api/presentation/3/context.json',
  ],
  type: 'Manifest',
  id: 'http://example.com/volleyball-for-boys/manifest',
  label: {
    en: ['Volley Ball for Boys'],
  },
  items: [
    {
      type: 'Canvas',
      id: 'http://example.com/volleyball-for-boys/manifest/canvas/1',
      items: [
        {
          type: 'AnnotationPage',
          id: 'http://example.com/volleyball-for-boys/manifest/canvas/1/annotation_page/1',
          items: [
            {
              type: 'Annotation',
              motivation: 'painting',
              target:
                'http://example.com/volleyball-for-boys/manifest/canvas/#t=44.53,100.403',
              body: {
                type: 'Choice',
                choiceHint: 'user',
                items: [
                  {
                    id: 'https://example.com/volleyball-for-boys/volleyball-for-boys.mp4',
                    type: 'Video',
                    format: 'video/mp4',
                    height: 1080,
                    width: 1920,
                    duration: 662.037,
                    label: {
                      en: ['high'],
                    },
                  },
                  {
                    id: 'https://example.com/volleyball-for-boys/volleyball-for-boys.mp4',
                    type: 'Video',
                    format: 'video/mp4',
                    height: 1080,
                    width: 1920,
                    duration: 662.037,
                    label: {
                      en: ['medium'],
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
      width: 1920,
      height: 1080,
      duration: 662.037,
    },
  ],
  structures: [
    {
      type: 'Range',
      behavior: 'no-nav',
      id: 'http://example.com/volleyball-for-boys/manifest/range/1',
      label: { en: ['Volleyball for Boys'] },
      items: [
        {
          type: 'Range',
          id: 'http://example.com/volleyball-for-boys/manifest/range/2',
          label: { en: ['Volleyball for Boys'] },
          items: [
            {
              type: 'Canvas',
              id: 'http://example.com/volleyball-for-boys/manifest/canvas/1#t=0,',
            },
          ],
        },
      ],
    },
  ]
};

export const manifestWithInvalidStruct = {
  '@context': [
    'http://www.w3.org/ns/anno.jsonld',
    'http://iiif.io/api/presentation/3/context.json',
  ],
  type: 'Manifest',
  id: 'https://example.com/lunchroom-manners/manifest',
  label: {
    en: ['Beginning Responsibility: Lunchroom Manners'],
  },
  items: [
    {
      type: 'Canvas',
      id: 'https://example.com/lunchroom-manners/manifest/canvas/1',
      width: 480,
      height: 360,
      duration: 660,
      items: [
        {
          id: 'https://example.com/manifest/canvas/1/page',
          type: 'AnnotationPage',
          items: [
            {
              id: 'https://example.com/manifest/canvas/1/page/annotation',
              type: 'Annotation',
              motivation: 'painting',
              body: {},
              target: 'https://example.com/manifest/canvas/1',
            },
          ],
        },
      ],
      seeAlso: [
        {
          id: 'https://example.com/lunchroom_manners/waveform.json',
          type: 'Dataset',
          label: { en: ['waveform.json'] },
          format: 'application/json',
        }
      ],
    },
  ],
  structures: [
    {
      type: 'Range',
      id: 'http://example.com/lunchroom-manners/manifest/range/0',
      behavior: 'top',
      label: null,
      items: [
        {
          type: 'Range',
          id: 'http://example.com/lunchroom-manners/manifest/range/1',
          label: { en: ['Lunchroom Manners'] },
          items: [
            {
              type: 'Range',
              id: 'http://example.com/lunchroom-manners/manifest/range/2',
              label: { en: ['Manners'] },
              items: [
                {
                  type: 'Canvas',
                  id: 'http://example.com/lunchroom-manners/manifest/canvas/1#t=234,157',
                },
              ],
            },
          ],
        },
      ]
    }
  ]
}

export const manifestWoStructure = {
  '@context': [
    'http://www.w3.org/ns/anno.jsonld',
    'http://iiif.io/api/presentation/3/context.json',
  ],
  type: 'Manifest',
  id: 'https://example.com/lunchroom-manners/manifest',
  label: {
    en: ['Beginning Responsibility: Lunchroom Manners'],
  },
  items: [
    {
      type: 'Canvas',
      id: 'https://example.com/lunchroom-manners/manifest/canvas/1',
      width: 480,
      height: 360,
      duration: 660,
      items: [
        {
          id: 'https://example.com/manifest/canvas/1/page',
          type: 'AnnotationPage',
          items: [
            {
              id: 'https://example.com/manifest/canvas/1/page/annotation',
              type: 'Annotation',
              motivation: 'painting',
              body: [],
              target: 'https://example.com/manifest/canvas/1',
            },
          ],
        },
      ],
      seeAlso: [
        {
          id: 'https://example.com/lunchroom_manners/waveform.json',
          type: 'Dataset',
          label: { en: ['waveform.json'] },
          format: 'application/json',
        }
      ],
    },
  ],
};

export const manifestWithStructure = {
  '@context': [
    'http://iiif.io/api/presentation/3/context.json',
  ],
  type: 'Manifest',
  id: 'http://example.com/sample-manifest/manifest',
  label: {
    en: ['Volley Ball for Boys'],
  },
  items: [
    {
      type: 'Canvas',
      id: 'http://example.com/sample-manifest/manifest/canvas/1',
      items: [
        {
          type: 'AnnotationPage',
          id: 'http://example.com/sample-manifest/manifest/canvas/1/annotation_page/1',
          items: [
            {
              type: 'Annotation',
              motivation: 'painting',
              target:
                'http://example.com/sample-manifest/manifest/canvas/#t=44.53,100.403',
              body: {
                type: 'Choice',
                choiceHint: 'user',
                items: [
                  {
                    id: 'http://example.com/volleyball-for-boys/high/volleyball-for-boys.mp4',
                    type: 'Video',
                    format: 'video/mp4',
                    height: 1080,
                    width: 1920,
                    duration: 662.037,
                    label: {
                      en: ['high'],
                    },
                  },
                  {
                    id: 'http://example.com/volleyball-for-boys/volleyball-for-boys.mp4',
                    type: 'Video',
                    format: 'video/mp4',
                    height: 1080,
                    width: 1920,
                    duration: 662.037,
                    label: {
                      en: ['auto'],
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
      width: 1920,
      height: 1080,
      duration: 662.037,
    },
    {
      type: 'Canvas',
      id: 'http://example.com/sample-manifest/manifest/canvas/2',
      width: 480,
      height: 360,
      duration: 660,
      items: [
        {
          id: 'http://example.com/sample-manifest/manifest/canvas/2/page',
          type: 'AnnotationPage',
          items: [
            {
              id: 'http://example.com/sample-manifest/manifest/canvas/2/page/annotation',
              type: 'Annotation',
              motivation: 'painting',
              body: [
                {
                  type: 'Choice',
                  choiceHint: 'user',
                  items: [
                    {
                      id: 'http://example.com/lunchroom-manners/high/lunchroom_manners_1024kb.mp4',
                      type: 'Video',
                      format: 'video/mp4',
                      label: {
                        en: ['High'],
                      },
                    },
                    {
                      id: 'http://example.com/lunchroom-manners/medium/lunchroom_manners_512kb.mp4',
                      type: 'Video',
                      format: 'video/mp4',
                      label: {
                        en: ['Medium'],
                      },
                    },
                  ],
                },
              ],
              target: 'http://example.com/sample-manifest/manifest/canvas/2',
            },
          ],
        },
      ],
      seeAlso: [
        {
          id: 'http://example.com/lunchroom-manners/waveform.json',
          type: 'Dataset',
          label: { en: ['waveform.json'] },
          format: 'application/json',
        }
      ],
    },
  ],
  structures: [
    {
      type: 'Range',
      id: 'http://example.com/sample-manifest/manifest/range/0',
      behavior: 'top',
      label: null,
      items: [
        {
          type: 'Range',
          id: 'http://example.com/sample-manifest/manifest/range/1',
          label: 'Volleyball for Boys',
          items: [
            {
              type: 'Range',
              id: 'http://example.com/sample-manifest/manifest/range/2',
              label: { en: ['Volleyball for Boys'] },
              items: [
                {
                  type: 'Canvas',
                  id: 'http://example.com/sample-manifest/manifest/canvas/1#t=0,157',
                },
              ],
            },
          ],
        },
        {
          type: 'Range',
          id: 'http://example.com/sample-manifest/manifest/range/3',
          label: { en: ['Lunchroom Manners'] },
          items: [
            {
              type: 'Range',
              id: 'http://example.com/sample-manifest/manifest/range/4',
              label: { en: ['Introduction'] },
              items: [
                {
                  type: 'Canvas',
                  id: 'http://example.com/sample-manifest/manifest/canvas/2#t=0,23',
                },
              ],
            },
          ],
        },
      ]
    }
  ]
};

export const manifestWoChoice = {
  '@context': ['http://iiif.io/api/presentation/3/context.json'],
  id: "http://example.com/sample-manifest/manifest.json",
  type: 'Manifest',
  label: {
    en: [ 'Volley Ball for Boys' ]
  },
  items: [
    {
      id: 'http://example.com/sample-manifest/manifest/canvas/1',
      type: 'Canvas',
      height: 1080,
      width: 1920,
      duration: 662.037,
      items: [
        {
          id: 'http://example.com/sample-manifest/canvas/1/page',
          type: 'AnnotationPage',
          items: [
            {
              id: 'http://example.com/sample-manifest/canvas/1/page/annotation',
              type: 'Annotation',
              motivation: 'painting',
              body: {
                id: 'http://example.com/volleyball-for-boys/volleyball-for-boys.m3u8',
                type: 'Sound',
                format: 'application/x-x-mpegURL',
                height: 1080,
                width: 1920,
                duration: 662.037,
              },
              target: 'http://example.com/sample-manifest/canvas/1'
            }
          ]
        }
      ]
    }
  ]
}
