import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import List from '../components/List';
import { Button, Col, Row } from 'react-bootstrap';
import APIUtils from '../api/Utils';
import { configureAlert } from '../services/alert-status';
import { setAlert, updateStructureStatus } from '../actions/forms';
import { isEqual } from 'lodash';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';

const StructureOutputContainer = (props) => {
  const smu = new StructuralMetadataUtils();
  const apiUtils = new APIUtils();

  const { structureURL, structureInfo, structuralMetadata } = props;
  const { structureSaved } = structureInfo;
  const { smData, initSmData, smDataIsValid } = structuralMetadata;

  const [stateInitStructure, setInitStructure] = useState(initSmData);

  useEffect(() => {
    setInitStructure(initSmData);
  }, [initSmData]);

  useEffect(() => {
    if (!smDataIsValid) {
      props.setAlert(configureAlert(-8));
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

  const handleSaveError = (error) => {
    console.log('TCL: handleSaveError -> error', error);
    let status =
      error.response !== undefined
        ? error.response.status
        : error.request.status;
    const alert = configureAlert(status);
    props.setAlert(alert);
  };

  const handleSaveItClick = async () => {
    let postData = { json: smData[0] };
    try {
      const response = await apiUtils.postRequest(structureURL, postData);
      const { status } = response;
      const alert = configureAlert(status);
      props.setAlert(alert);

      props.postStructureSuccess(1);
    } catch (error) {
      handleSaveError(error);
    }
  };

  return (
    <section
      className="structure-section"
      data-testid="structure-output-section"
    >
      <div data-testid="structure-output-list">
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
