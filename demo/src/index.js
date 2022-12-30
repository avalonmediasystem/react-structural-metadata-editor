import React from 'react';
import { render } from 'react-dom';
import Root from '../../src';

export const BASE_API_URL = '.netlify/functions';

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
