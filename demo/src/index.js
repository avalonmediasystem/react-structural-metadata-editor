import React from 'react';
import { render } from 'react-dom';
import Root from '../../src';

const props = {
  baseURL: 'https://spruce.dlib.indiana.edu',
  masterFileID: 'h989r3360',
  initStructure: '',
  audioStreamURL:
    'https://spruce.dlib.indiana.edu/master_files/h989r3360/auto.m3u8',
  streamDuration: 377338,
  structureIsSaved: (val) => {},
};

render(<Root {...props} />, document.getElementById('root'));
