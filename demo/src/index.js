import React from 'react';
import { render } from 'react-dom';
import Root from '../../src';

export const BASE_API_URL = '';

const props = {
  initStructure: {
    label: 'Lunchroom manners',
    type: 'div',
    items: [],
  },
  structureURL: `${BASE_API_URL}/structure.json`,
  waveformURL: `${BASE_API_URL}/waveform.json`,
  audioURL: `${BASE_API_URL}/media.mp4`,
  manifestURL: `${BASE_API_URL}/manifests/lunchroom_manners.json`,
  streamDuration: 572000,
  structureIsSaved: (val) => {},
};

render(<Root {...props} />, document.getElementById('root'));
