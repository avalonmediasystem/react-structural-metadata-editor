import React from 'react';
import { render } from 'react-dom';
import Root from '../../src';

const props = {
  baseURL: 'https://spruce.dlib.indiana.edu',
  masterFileID: '12579s459',
  initStructure: '',
  audioStreamURL:
    'https://spruce.dlib.indiana.edu/master_files/12579s459/auto.m3u8',
  streamDuration: 377338
};

render(<Root {...props} />, document.getElementById('root'));
