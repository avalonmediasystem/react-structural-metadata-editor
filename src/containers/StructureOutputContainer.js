import React, { Component } from 'react';
import { connect } from 'react-redux';
import List from '../components/List';
import { Button, Col, Row } from 'react-bootstrap';
import APIUtils from '../api/Utils';
// import AlertContainer from './AlertContainer';
import { configureAlert } from '../services/alert-status';
import { setAlert, updateStructureStatus } from '../actions/forms';
import { isEqual } from 'lodash';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';

const smu = new StructuralMetadataUtils();

class StructureOutputContainer extends Component {
  constructor(props) {
    super(props);
    this.apiUtils = new APIUtils();
  }
  state = {
    alertObj: { alert: null, showAlert: false },
    baseURL: this.props.baseURL,
    masterFileID: this.props.masterFileID,
    structureStatus: this.props.structureInfo.structureStatus,
    initialStructure: this.props.structuralMetadata.initSmData,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { structureStatus, structureSaved } = nextProps.structureInfo;
    if (prevState.structureStatus !== structureStatus) {
      return {
        alertObj: {
          alert: configureAlert(structureStatus),
          showAlert: true,
        },
      };
    }
    // if (nextProps.alertObj.alert === null) {
    //   return { alertObj: { alert: null, showAlert: false } };
    // }
    const { initSmData, smData } = nextProps.structuralMetadata;
    if (!isEqual(initSmData, prevState.initialStructure)) {
      return { initialStructure: initSmData };
    }
    if (structureSaved) {
      nextProps.structureIsSaved(true);
      return null;
    } else {
      const cleanSmData = smu.filterObjectKey(smData, 'active');
      if (!isEqual(prevState.initialStructure, cleanSmData)) {
        nextProps.structureIsSaved(false);
      } else {
        nextProps.structureIsSaved(true);
      }
      return null;
    }
  }

  componentDidUpdate(nextProps, prevState) {
    const { alert } = this.state.alertObj;
    if (nextProps.alert != alert && alert) {
      console.log(alert);
      this.props.setAlert(alert);
    }
  }

  handleSaveError(error) {
    console.log('TCL: handleSaveError -> error', error);
    let status =
      error.response !== undefined
        ? error.response.status
        : error.request.status;
    const alert = configureAlert(status);
    this.props.setAlert(alert);
    // this.setState({ alertObj: { alert: alert, showAlert: true } });
  }

  handleSaveItClick = async () => {
    const { baseURL, masterFileID } = this.state;
    let postData = { json: this.props.structuralMetadata.smData[0] };
    try {
      const response = await this.apiUtils.postRequest(
        baseURL,
        masterFileID,
        'structure.json',
        postData
      );
      const { status } = response;
      const alert = configureAlert(status);
      this.props.setAlert(alert);
      // this.setState({ alertObj: { alert: alert, showAlert: true } });

      this.props.postStructureSuccess(1);
    } catch (error) {
      this.handleSaveError(error);
    }
  };

  render() {
    const { structureInfo, structuralMetadata, editingDisabled } = this.props;
    const { alert, showAlert } = this.state.alertObj;

    return (
      <section
        className="structure-section"
        data-testid="structure-output-section"
      >
        {/* {!structureInfo.structureRetrieved && showAlert ? (
          <AlertContainer {...alert} />
        ) : ( */}
        <div data-testid="structure-output-list">
          {/* {showAlert ? <AlertContainer {...alert} /> : null} */}
          <List items={structuralMetadata.smData} />
          <Row>
            <Col xs={12} className="text-right">
              <Button
                bsStyle="primary"
                onClick={this.handleSaveItClick}
                data-testid="structure-save-button"
                disabled={editingDisabled}
              >
                Save Structure
              </Button>
            </Col>
          </Row>
        </div>
        {/* )} */}
      </section>
    );
  }
}

const mapStateToProps = (state) => ({
  structuralMetadata: state.structuralMetadata,
  structureInfo: state.forms.structureInfo,
  editingDisabled: state.forms.editingDisabled,
  alert: state.forms.alert,
});

const mapDispatchToProps = {
  postStructureSuccess: updateStructureStatus,
  setAlert: setAlert,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StructureOutputContainer);
