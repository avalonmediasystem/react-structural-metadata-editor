import React from 'react';
import { render } from 'react-dom';
import Root from '../../src';

export const BASE_API_URL = '';

const props = {
  initStructure: {
    label: 'Lunchroom manners',
    type: 'div',
    items: [
      {
        label: 'Darwin',
        begin: '00:00:00.00',
        end: '00:00:12.199',
        type: 'span',
      },
    ],
  },
  canvasIndex: 0,
  manifestURL: `${BASE_API_URL}/manifests/lunchroom_manners.json`,
  structureURL: `${BASE_API_URL}/structure.json`,
  structureIsSaved: (val) => { },
};

render(<Root {...props} />, document.getElementById('root'));
