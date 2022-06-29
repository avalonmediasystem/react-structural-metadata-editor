import React from 'react';
import { DragDropContextProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import ErrorBoundary from './components/ErrorBoundary';
import AlertContainer from './containers/AlertContainer';
import WaveformContainer from './containers/WaveformContainer';
import ButtonSection from './components/ButtonSection';
import StructureOutputContainer from './containers/StructureOutputContainer';

import { resetReduxStore } from './actions';
import { removeAlert } from './actions/forms';
import { fetchManifest, parseStructure, setMediaInfo } from './actions/manifest';
import { getMediaInfo, parseStructureToJSON } from './services/iiif-services/iiif-parser';

import './App.css';

const App = (props) => {
  const dispatch = useDispatch();
  const manifest = useSelector((state) => state.manifest.manifest);
  // const [structureAlert, setStructureAlert] = React.useState({});

  React.useEffect(() => {
    dispatch(fetchManifest(props.manifestURL));

    return () => {
      dispatch(resetReduxStore());
    };
  }, []);

  React.useEffect(() => {
    if (manifest) {
      const { mediaSrc, duration } = getMediaInfo(manifest);
      dispatch(setMediaInfo(mediaSrc, duration));
      const structure = parseStructureToJSON(manifest, duration);
      dispatch(parseStructure(structure));
    }
  }, [manifest]);

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
  structureURL: PropTypes.string.isRequired,
  waveformURL: PropTypes.string.isRequired,
  audioURL: PropTypes.string.isRequired,
  streamDuration: PropTypes.number.isRequired,
  initStructure: PropTypes.object.isRequired,
  manifestURL: PropTypes.string.isRequired,
  withCredentials: PropTypes.bool,
  structureIsSaved: PropTypes.func,
};

App.defaultProps = {
  withCredentials: false,
  structureIsSaved: (val) => { },
};

export default App;
