function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React, { Component } from 'react';
import './App.css';
import WaveformContainer from './containers/WaveformContainer';
import ButtonSection from './components/ButtonSection';
import StructureOutputContainer from './containers/StructureOutputContainer';
import { DragDropContextProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

// Font Awesome Imports
import { library } from '@fortawesome/fontawesome-svg-core';
import { faDotCircle, faMinusCircle, faPen, faSave, faTrash } from '@fortawesome/free-solid-svg-icons';
library.add(faDotCircle, faMinusCircle, faPen, faSave, faTrash);

var App = function (_Component) {
  _inherits(App, _Component);

  function App() {
    _classCallCheck(this, App);

    return _possibleConstructorReturn(this, _Component.apply(this, arguments));
  }

  App.prototype.render = function render() {
    return React.createElement(
      DragDropContextProvider,
      { backend: HTML5Backend },
      React.createElement(
        'div',
        { className: 'container' },
        React.createElement(
          'h1',
          null,
          'Test Structural Metadata Editor'
        ),
        React.createElement(WaveformContainer, null),
        React.createElement(ButtonSection, null),
        React.createElement(StructureOutputContainer, null)
      )
    );
  };

  return App;
}(Component);

export default App;