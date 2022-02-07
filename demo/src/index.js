import React from 'react';
import { render } from 'react-dom';
import Root from '../../src';

console.log(process.env.NODE_ENV);

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
  streamDuration: 572000,
  structureIsSaved: (val) => {},
};

render(<Root {...props} />, document.getElementById('root'));
