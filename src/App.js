import React, { Component } from 'react';
import './App.css';
import WaveformContainer from './containers/WaveformContainer';
import ButtonSection from './components/ButtonSection';
import StructureOutputContainer from './containers/StructureOutputContainer';
import { DragDropContextProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { connect } from 'react-redux';
import { resetReduxStore } from './actions';
import { handleStructureError, removeAlert } from './actions/forms';
import ErrorBoundary from './components/ErrorBoundary';

// Font Awesome Imports
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faDotCircle,
  faMinusCircle,
  faPen,
  faSave,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import AlertContainer from './containers/AlertContainer';
library.add(faDotCircle, faMinusCircle, faPen, faSave, faTrash);

class App extends Component {
  // Lifecycle method fired before unmounting the React component
  componentWillUnmount() {
    // Reset the redux-store
    this.props.resetStore();
  }

  structureIsSaved = (value) => {
    this.props.structureIsSaved(value);
  };

  render() {
    return (
      <DragDropContextProvider backend={HTML5Backend}>
        <div className="sme-container">
          <WaveformContainer {...this.props} />
          <ErrorBoundary>
            <AlertContainer removeAlert={this.props.removeAlert} />
            <ButtonSection />
            <StructureOutputContainer {...this.props} />
          </ErrorBoundary>
        </div>
      </DragDropContextProvider>
    );
  }
}

const mapDispatchToProps = {
  resetStore: resetReduxStore,
  handleStructureError: handleStructureError,
  removeAlert: removeAlert,
};

export default connect(null, mapDispatchToProps)(App);
