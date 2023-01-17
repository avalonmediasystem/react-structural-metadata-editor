import React from 'react';
import { render } from 'react-dom';
import Root from '../../src';
import config from '../config';

const props = {
  initStructure: {
    label: 'Lunchroom manners',
    type: 'div',
    items: [],
  },
  structureURL: `${config.url}/structure.json`,
  manifestURL: `${config.url}/${config.env}/manifest.json`,
  canvasIndex: 0,
  structureIsSaved: (val) => { },
  disableSave: config.env === 'prod' ? true : false
};

render(<Root {...props} />, document.getElementById('root'));
