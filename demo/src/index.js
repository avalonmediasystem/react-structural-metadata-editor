import React from 'react';
import { render } from 'react-dom';
import config from '../config';
import App from './app';

const props = {
  structureURL: `${config.url}/structure.json`,
  manifestURL: `${config.url}/${config.env}/manifest.json`,
  canvasIndex: 0,
  structureIsSaved: (val) => { },
  disableSave: true
};

render(<App {...props} />, document.getElementById('root'));
