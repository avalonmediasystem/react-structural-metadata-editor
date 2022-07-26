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

import AlertContainer from './containers/AlertContainer';

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
  canvasIndex: PropTypes.number,
  initStructure: PropTypes.object.isRequired,
  manifestURL: PropTypes.string.isRequired,
  structureURL: PropTypes.string.isRequired,
  structureIsSaved: PropTypes.func,
  withCredentials: PropTypes.bool
};

App.defaultProps = {
  canvasIndex: 0,
  structureIsSaved: (val) => { },
  withCredentials: false,
};

const mapDispatchToProps = {
  resetStore: resetReduxStore,
  handleStructureError: handleStructureError,
  removeAlert: removeAlert,
};

export default connect(null, mapDispatchToProps)(App);
