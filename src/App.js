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
    dispatch(fetchManifest(props.manifestURL));

    return () => {
      dispatch(resetReduxStore());
    };
  }, []);

  return (
    <DragDropContextProvider backend={HTML5Backend}>
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
  withCredentials: PropTypes.bool,
  structureIsSaved: PropTypes.func,
};

App.defaultProps = {
  withCredentials: false,
  structureIsSaved: (val) => { },
};

export default App;
