import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
// import { library } from '@fortawesome/fontawesome-svg-core';
// import {
//   faDotCircle,
//   faExclamationTriangle,
//   faMinusCircle,
//   faPen,
//   faSave,
//   faTrash,
// } from '@fortawesome/free-solid-svg-icons';
import AlertContainer from './containers/AlertContainer';

// library.add(
//   faDotCircle,
//   faMinusCircle,
//   faPen,
//   faSave,
//   faTrash,
//   faExclamationTriangle
// );

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      structureAlert: {},
    };
  }
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

App.propTypes = {
  structureURL: PropTypes.string.isRequired,
  waveformURL: PropTypes.string.isRequired,
  audioURL: PropTypes.string.isRequired,
  streamDuration: PropTypes.number.isRequired,
  initStructure: PropTypes.object.isRequired,
  withCredentials: PropTypes.bool,
  structureIsSaved: PropTypes.func,
};

App.defaultProps = {
  withCredentials: false,
  structureIsSaved: (val) => {},
};

const mapDispatchToProps = {
  resetStore: resetReduxStore,
  handleStructureError: handleStructureError,
  removeAlert: removeAlert,
};

export default connect(null, mapDispatchToProps)(App);
