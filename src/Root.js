import React from 'react';
import App from './App';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import rootReducer from './reducers';
import thunk from 'redux-thunk';

const store = createStore(rootReducer, applyMiddleware(thunk));

const Root = props => (
  <Provider store={store}>
    <App config={props} />
  </Provider>
);

export default Root;
