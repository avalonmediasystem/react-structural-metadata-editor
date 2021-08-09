import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import List from '../components/List';
import { Button, Col, Row } from 'react-bootstrap';
import APIUtils from '../api/Utils';
import { configureAlert } from '../services/alert-status';
import { setAlert, updateStructureStatus } from '../actions/forms';
import { isEqual } from 'lodash';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';

const smu = new StructuralMetadataUtils();

const StructureOutputContainer = (props) => {
  const { alertObj, baseURL, masterFileID, structureInfo, structuralMetadata } =
    props;
  const { structureStatus, structureSaved, structureRetrieved } = structureInfo;
  const { smData, initSmData, smDataIsValid } = structuralMetadata;
  const apiUtils = new APIUtils();

  const [stateAlertObj, setAlertObj] = useState(alertObj);
  const [stateInitStructure, setInitStructure] = useState(initSmData);
  const [isValid, setIsValid] = useState(smDataIsValid);

  useEffect(() => {
    setAlertObj(configureAlert(structureStatus, props.clearAlert));
  }, [structureStatus]);

  useEffect(() => {
    if (alertObj === null) {
      setAlertObj(null);
    }
  }, [alertObj]);

  useEffect(() => {
    setInitStructure(initSmData);
  }, [initSmData]);

  useEffect(() => {
    if (smDataIsValid) {
      setIsValid(true);
      setAlertObj(null);
    } else {
      setIsValid(false);
      setAlertObj(configureAlert(-8, props.clearAlert));
    }
  }, [smDataIsValid]);

  useEffect(() => {
    if (structureSaved) {
      props.structureIsSaved(true);
    } else {
      const cleanSmData = smu.filterObjectKey(smData, 'active');
      if (!isEqual(stateInitStructure, cleanSmData)) {
        props.structureIsSaved(false);
      } else {
        props.structureIsSaved(true);
      }
    }
  }, [structureSaved]);

  handleSaveError(error) {
    console.log('TCL: handleSaveError -> error', error);
    let status =
      error.response !== undefined
        ? error.response.status
        : error.request.status;
    const alert = configureAlert(status);
    this.props.setAlert(alert);
  }

  const handleSaveItClick = async () => {
    let postData = { json: smData[0] };
    try {
      const response = await apiUtils.postRequest(
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
      handleSaveError(error);
    }
  };

  return (
    <section
      className="structure-section"
      data-testid="structure-output-section"
    >
      {!structureRetrieved ? (
        <AlertContainer {...stateAlertObj} />
      ) : (
        <div data-testid="structure-output-list">
          <AlertContainer {...stateAlertObj} />
          <List items={smData} />
          <Row>
            <Col xs={12} className="text-right">
              <Button
                bsStyle="primary"
                onClick={handleSaveItClick}
                data-testid="structure-save-button"
                disabled={props.editingDisabled}
              >
                Save Structure
              </Button>
            </Col>
          </Row>
        </div>
      )}
    </section>
  );
};

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
