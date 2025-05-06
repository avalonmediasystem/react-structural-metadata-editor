import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import WaveformContainer from './containers/WaveformContainer';
import ButtonSection from './components/ButtonSection';
import StructureOutputContainer from './containers/StructureOutputContainer';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDispatch } from 'react-redux';
import { resetReduxStore } from './actions';
import { removeAlert } from './actions/forms';
import ErrorBoundary from './components/ErrorBoundary';
import AlertContainer from './containers/AlertContainer';

const App = (props) => {
  // Dispatch actions from Redux store
  const dispatch = useDispatch();
  const resetStore = () => dispatch(resetReduxStore());
  const deleteAlert = () => dispatch(removeAlert());

  useEffect(() => {
    return () => {
      // Reset the redux-store
      resetStore();
    };
  }, []);

  return (
    <div className="sme-container">
      <WaveformContainer {...props} />
      <ErrorBoundary>
        <AlertContainer removeAlert={deleteAlert} />
        <ButtonSection />
        <DndProvider backend={HTML5Backend}>
          <StructureOutputContainer {...props} />
        </DndProvider>
      </ErrorBoundary>
    </div>
  );
};

App.defaultProps = {
  canvasIndex: 0,
  structureIsSaved: (val) => { },
  withCredentials: false,
  disableSave: false,
};

App.propTypes = {
  canvasIndex: PropTypes.number,
  manifestURL: PropTypes.string.isRequired,
  structureURL: function (props, propName) {
    if (props['disableSave'] == false && props[propName] == undefined) {
      return new Error('Please provide a value for `structureURL` prop');
    }
  },
  structureIsSaved: PropTypes.func,
  withCredentials: PropTypes.bool,
  disableSave: PropTypes.bool,
};

export default App;
