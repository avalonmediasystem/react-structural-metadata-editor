import React from 'react';
import { render } from 'react-dom';
import Root from '../../src';

const props = {
  baseURL: 'https://media.dlib.indiana.edu',
  masterFileID: 'x920gh165',
  initStructure: {
    label: 'Lunchroom manners',
    type: 'div',
    items: [],
  },
  audioStreamURL:
    'https://media.dlib.indiana.edu/master_files/x920gh165/auto.m3u8',
  streamDuration: 572000,
  structureIsSaved: (val) => {},
};

render(<Root {...props} />, document.getElementById('root'));
