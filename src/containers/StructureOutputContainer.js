import React, { Component } from 'react';
import { connect } from 'react-redux';
import List from '../components/List';
import { Button, Col, Row } from 'react-bootstrap';
import APIUtils from '../api/Utils';
import AlertContainer from './AlertContainer';
import { configureAlert } from '../services/alert-status';
import { updateStructureStatus } from '../actions/forms';
import { isEqual } from 'lodash';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';

const smu = new StructuralMetadataUtils();

class StructureOutputContainer extends Component {
  constructor(props) {
    super(props);
    this.apiUtils = new APIUtils();
  }
  state = {
    alertObj: this.props.alertObj,
    baseURL: this.props.baseURL,
    masterFileID: this.props.masterFileID,
    structureStatus: this.props.structureInfo.structureStatus,
    initialStructure: this.props.structuralMetadata.initSmData
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { structureStatus, structureSaved } = nextProps.structureInfo;
    if (prevState.structureStatus !== structureStatus) {
      return {
        alertObj: configureAlert(structureStatus, nextProps.clearAlert)
      };
    }
    if (nextProps.alertObj === null) {
      return { alertObj: null };
    }
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

  clearAlert = () => {
    this.setState({
      alertObj: null
    });
  };

  handleSaveError(error) {
    console.log('TCL: handleSaveError -> error', error);
    let status =
      error.response !== undefined
        ? error.response.status
        : error.request.status;
    const alertObj = configureAlert(status, this.clearAlert);

    this.setState({ alertObj });
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
      const alertObj = configureAlert(status, this.clearAlert);
      this.props.postStructureSuccess(1);
      this.setState({ alertObj });
    } catch (error) {
      this.handleSaveError(error);
    }
  };

  render() {
    const { structureInfo, structuralMetadata, editingDisabled } = this.props;
    const { alertObj } = this.state;

    return (
      <section
        className="structure-section"
        data-testid="structure-output-section"
      >
        {!structureInfo.structureRetrieved ? (
          <AlertContainer {...alertObj} />
        ) : (
          <div data-testid="structure-output-list">
            <AlertContainer {...alertObj} />
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
        )}
      </section>
    );
  }
}

const mapStateToProps = state => ({
  structuralMetadata: state.structuralMetadata,
  structureInfo: state.forms.structureInfo,
  editingDisabled: state.forms.editingDisabled
});

const mapDispatchToProps = {
  postStructureSuccess: updateStructureStatus
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StructureOutputContainer);
