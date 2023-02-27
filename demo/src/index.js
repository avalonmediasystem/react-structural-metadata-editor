import React from 'react';
import { render } from 'react-dom';
import config from '../config';
import Root from '../../src';

const props = {
  structureURL: `${config.url}/structure.json`,
  manifestURL: `${config.url}/${config.env}/manifest.json`,
  canvasIndex: 0,
  structureIsSaved: (val) => { },
  disableSave: config.env === 'prod' ? true : false
};

render(<Root { ...props } />, document.getElementById('root'));
