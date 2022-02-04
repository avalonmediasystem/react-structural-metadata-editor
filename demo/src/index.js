import React from 'react';
import { render } from 'react-dom';
import Root from '../../src';

const props = {
  initStructure: {
    label: 'Lunchroom manners',
    type: 'div',
    items: [],
  },
  structureURL: 'http://localhost:3002/structure.json',
  waveformURL: 'http://localhost:3002/waveform.json',
  audioURL: 'http://localhost:3002/media.mp4',
  streamDuration: 572000,
  structureIsSaved: (val) => {},
};

render(<Root {...props} />, document.getElementById('root'));
