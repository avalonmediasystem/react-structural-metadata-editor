import React from 'react';
import App from './App';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import rootReducer from './reducers';
import thunk from 'redux-thunk';

var store = createStore(rootReducer, applyMiddleware(thunk));

var Root = function Root(props) {
  return React.createElement(
    Provider,
    { store: store },
    React.createElement(App, { config: props })
  );
};

export default Root;