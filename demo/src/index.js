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
  manifestURL: `${BASE_API_URL}/manifests/lunchroom_manners.json`,
  structureIsSaved: (val) => { },
};

render(<Root {...props} />, document.getElementById('root'));
