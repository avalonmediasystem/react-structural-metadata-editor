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
import { removeAlert } from './actions/forms';
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

const mapDispatchToProps = {
  resetStore: resetReduxStore,
  removeAlert: removeAlert
};

export default connect(null, mapDispatchToProps)(App);
