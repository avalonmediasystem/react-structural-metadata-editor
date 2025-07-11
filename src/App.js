import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import './App.css';
import WaveformContainer from './containers/WaveformContainer';
import ButtonSection from './components/ButtonSection';
import StructureOutputContainer from './containers/StructureOutputContainer';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDispatch } from 'react-redux';
import { resetReduxStore } from './actions';
import { removeAlert } from './actions/forms';
import AlertContainer from './containers/AlertContainer';
import ErrorMessage from './components/ErrorMessage';

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
      {/* Error boundary for the entire component: this is in place as a fallback if
      there's an error emitted from outside of the following zoned error boundaries.
      WaveformContainer and StructureOutputContainer are placed inside their own error
      boundaries, because they are likely to encounter errors. */}
      <ErrorMessage>
        {/* Error boundary for waveform-related errors */}
        <ErrorMessage>
          <WaveformContainer {...props} />
        </ErrorMessage>
        <AlertContainer removeAlert={deleteAlert} />
        <ButtonSection />
        {/* Error boundary for structure-related errors */}
        <ErrorMessage>
          <DndProvider backend={HTML5Backend}>
            <StructureOutputContainer {...props} />
          </DndProvider>
        </ErrorMessage>
      </ErrorMessage>
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
