import React from 'react';
import { render } from 'react-dom';
import Root from '../../src';

const props = {
  baseURL: 'https://spruce.dlib.indiana.edu',
  masterFileID: 'h989r3360',
  initStructure: {
    label: 'BBC Planet Earth',
    type: 'div',
    items: [
      {
        label: 'Introduction',
        type: 'div',
        items: [
          {
            label: 'Darwin',
            begin: '00:00:00.00',
            end: '00:00:12.199',
            type: 'span',
          },
          {
            label: 'Story of life',
            begin: '00:00:12.199',
            end: '00:00:25.000',
            type: 'span',
          },
        ],
      },
      {
        label: 'History of Life',
        type: 'div',
        items: [
          {
            label: 'Sea',
            begin: '00:00:25.00',
            end: '00:00:37.30',
            type: 'span',
          },
          {
            label: 'Tree of life',
            begin: '00:00:38.296',
            end: '00:01:24.00',
            type: 'span',
          },
        ],
      },
    ],
  },
  audioStreamURL:
    'https://multiplatform-f.akamaihd.net/i/multi/will/bunny/big_buck_bunny_,640x360_400,640x360_700,640x360_1000,950x540_1500,.f4v.csmil/master.m3u8',
  //'https://spruce.dlib.indiana.edu/master_files/h989r3360/auto.m3u8',
  streamDuration: 377338,
  structureIsSaved: (val) => {},
};

render(<Root {...props} />, document.getElementById('root'));
