import React, { Component } from 'react';
import './App.css';
import WaveformContainer from './containers/WaveformContainer';
import ButtonSection from './components/ButtonSection';
import StructureOutputContainer from './containers/StructureOutputContainer';
import { DragDropContextProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { connect } from 'react-redux';
import { resetReduxStore } from './actions';
import { handleStructureError } from './actions/forms';
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
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     structureAlert: { alert: null, showAlert: false },
  //   };
  // }
  // Lifecycle method fired before unmounting the React component
  componentWillUnmount() {
    // Reset the redux-store
    this.props.resetStore();
  }

  structureIsSaved = (value) => {
    this.props.structureIsSaved(value);
  };

  render() {
    console.log(this.props.alerts);

    return (
      <DragDropContextProvider backend={HTML5Backend}>
        <div className="sme-container">
          <WaveformContainer
            {...this.props}
            // structureAlert={this.state.structureAlert}
          />
          <ErrorBoundary>
            {/* <AlertContainer {...this.props.alert} /> */}
            {this.props.alerts && <AlertContainer alerts={this.props.alerts} />}
            <ButtonSection />
            <StructureOutputContainer
              // alertObj={this.state.structureAlert}
              {...this.props}
            />
          </ErrorBoundary>
        </div>
      </DragDropContextProvider>
    );
  }
}

const mapStateToProps = (state) => ({
  alerts: state.forms.alerts,
});

const mapDispatchToProps = {
  resetStore: resetReduxStore,
  handleStructureError: handleStructureError,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
