import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './App.css';
import WaveformContainer from './containers/WaveformContainer';
import ButtonSection from './components/ButtonSection';
import StructureOutputContainer from './containers/StructureOutputContainer';
import { DragDropContextProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { connect } from 'react-redux';
import { Col, Row, Button } from 'react-bootstrap';
import { resetReduxStore } from './actions';
import { removeAlert, setAlert, updateStructureStatus } from './actions/forms';
import { configureAlert } from './services/alert-status';
import APIUtils from './api/Utils';
import ErrorBoundary from './components/ErrorBoundary';
import AlertContainer from './containers/AlertContainer';

const apiUtils = new APIUtils();

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

  handleSaveError = (error) => {
    console.log('TCL: handleSaveError -> error -> ', error);
    let status = -10;
    const alert = configureAlert(status);
    this.props.setAlert(alert);
  };

  handleSaveItClick = async () => {
    let postData = { json: this.props.smData[0] };
    try {
      const response = await apiUtils.postRequest(this.props.structureURL, postData);
      const { status } = response;
      const alert = configureAlert(status);
      this.props.setAlert(alert);

      this.props.updateStructureStatus(1);
    } catch (error) {
      this.handleSaveError(error);
    }
  };

  render() {
    return (
      <DragDropContextProvider backend={HTML5Backend}>
        <div className="sme-container">
            <Row className="mx-0">
              <Col lg={12}><WaveformContainer {...this.props} /></Col>
            </Row>
            <Col lg={12}>
              <ErrorBoundary>
                <AlertContainer removeAlert={this.props.removeAlert} />
                <ButtonSection />
                <StructureOutputContainer {...this.props} />
              </ErrorBoundary>
            </Col>
            { (!this.props.disableSave && this.props.manifestFetched) && (
              <Row className="structure-save">
                <Col md={12} className="mt-1 text-right">
                  <Button
                    variant="primary"
                    onClick={this.handleSaveItClick}
                    data-testid="structure-save-button"
                    disabled={this.props.editingDisabled}
                  >
                    Save Structure
                  </Button>
                </Col>
              </Row>)
            }
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
  structureURL: function(props, propName) {
    if(props['disableSave'] == false && props[propName] == undefined) {
      return new Error('Please provide a value for `structureURL` prop')
    }
  },
  structureIsSaved: PropTypes.func,
  withCredentials: PropTypes.bool,
  disableSave: PropTypes.bool,
};

const mapDispatchToProps = {
  resetStore: resetReduxStore,
  removeAlert: removeAlert,
  setAlert: setAlert,
  updateStructureStatus: updateStructureStatus,
};

const mapStateToProps = (state) => ({
  smData: state.structuralMetadata.smData,
  editingDisabled: state.forms.editingDisabled,
  manifestFetched: state.manifest.manifestFetched,
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
