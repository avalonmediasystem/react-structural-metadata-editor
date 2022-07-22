import React from 'react';
import { DragDropContextProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import ErrorBoundary from './components/ErrorBoundary';
import AlertContainer from './containers/AlertContainer';
import WaveformContainer from './containers/WaveformContainer';
import ButtonSection from './components/ButtonSection';
import StructureOutputContainer from './containers/StructureOutputContainer';

import { resetReduxStore } from './actions';
import { removeAlert } from './actions/forms';
import { fetchManifest } from './actions/manifest';

import './App.css';

const App = (props) => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    const { canvasIndex, initStructure, manifestURL } = props;
    dispatch(fetchManifest(manifestURL, initStructure, canvasIndex));

    return () => {
      dispatch(resetReduxStore());
    };
  }, []);

  return (
    <DragDropContextProvider backend={HTML5Backend} key={1}>
      <div className="sme-container">
        <WaveformContainer {...props} />
        <ErrorBoundary>
          <AlertContainer removeAlert={removeAlert} />
          <ButtonSection />
          <StructureOutputContainer {...props} />
        </ErrorBoundary>
      </div>
    </DragDropContextProvider>
  );
};

App.propTypes = {
  canvasIndex: PropTypes.number.isRequired,
  manifestURL: PropTypes.string.isRequired,
  initStructure: PropTypes.object,
  withCredentials: PropTypes.bool,
  structureIsSaved: PropTypes.func,
};

App.defaultProps = {
  withCredentials: false,
  structureIsSaved: (val) => { },
};

export default App;
