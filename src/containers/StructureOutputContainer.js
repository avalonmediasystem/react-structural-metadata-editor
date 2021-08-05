import React, { Component } from 'react';
import { connect } from 'react-redux';
import List from '../components/List';
import { Button, Col, Row } from 'react-bootstrap';
import APIUtils from '../api/Utils';
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
    baseURL: this.props.baseURL,
    masterFileID: this.props.masterFileID,
    structureStatus: this.props.structureInfo.structureStatus,
    initialStructure: this.props.structuralMetadata.initSmData,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { structureSaved } = nextProps.structureInfo;
    const { initSmData, smData } = nextProps.structuralMetadata;
    if (!isEqual(initSmData, prevState.initialStructure)) {
      const timespans = smu.getItemsOfType('span', smData);
      const invalidTimespans = timespans.filter((t) => !t.valid);
      console.log(invalidTimespans);
      if (invalidTimespans.length > 0) {
        return {
          invalid: true,
          alertObj: configureAlert(-8, nextProps.clearAlert),
        };
      }
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

  handleSaveError(error) {
    console.log('TCL: handleSaveError -> error', error);
    let status =
      error.response !== undefined
        ? error.response.status
        : error.request.status;
    const alert = configureAlert(status);
    this.props.setAlert(alert);
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

      this.props.postStructureSuccess(1);
    } catch (error) {
      this.handleSaveError(error);
    }
  };

  render() {
    const { structureInfo, structuralMetadata, editingDisabled } = this.props;
    const { alertObj, invalid } = this.state;

    return (
      <section
        className="structure-section"
        data-testid="structure-output-section"
      >
        <div data-testid="structure-output-list">
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
