import React from 'react';
import { render } from 'react-dom';
import Root from '../../src';

console.log('env: ', process.env.NODE_ENV)
const BASE_API_URL = 
  process.env.NODE_ENV === 'production' 
    ? 'https://react-structural-metadata-editor.netlify.app' 
    : 'http://localhost:3001';

const props = {
  initStructure: {
    label: 'Lunchroom manners',
    type: 'div',
    items: [],
  },
  structureURL: `${BASE_API_URL}/structure.json`,
  manifestURL: `${BASE_API_URL}/manifest.json`,
  canvasIndex: 0,
  structureIsSaved: (val) => { },
};

render(<Root {...props} />, document.getElementById('root'));
