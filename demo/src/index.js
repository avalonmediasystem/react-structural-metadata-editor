import { createRoot } from "react-dom/client";
import React from 'react';
import { render } from 'react-dom';
import config from '../config';
import App from './app';

const props = {
  structureURL: `${config.url}/structure.json`,
  manifestURL: `${config.url}/${config.env}/manifest.json`,
  canvasIndex: 0,
  structureIsSaved: (val) => { },
  disableSave: true,
  showTextEditor: true,
};

const root = createRoot(document.getElementById('root'));
root.render(<App {...props} />);
