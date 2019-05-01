import React from 'react';
import { render } from 'react-dom';
import Root from '../../src';

const props = {
  baseURL: 'https://spruce.dlib.indiana.edu',
  masterFileID: 'sj1392061',
  initStructure: '',
  audioStreamURL:
    'https://spruce.dlib.indiana.edu/master_files/sj1392061/auto.m3u8'
};

render(<Root {...props} />, document.getElementById('root'));
