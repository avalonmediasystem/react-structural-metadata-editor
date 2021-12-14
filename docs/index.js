import React from 'react';
import { render } from 'react-dom';
import Root from '../src';

const props = {
  baseURL: 'https://avalon-dev.dlib.indiana.edu',
  masterFileID: 't148fh13t',
  initStructure: {
    label: 'Planet Earth',
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
    'https://avalon-dev.dlib.indiana.edu/master_files/t148fh13t/auto.m3u8',
  streamDuration: 377338,
  structureIsSaved: (val) => {},
};

render(<Root {...props} />, document.getElementById('root'));
