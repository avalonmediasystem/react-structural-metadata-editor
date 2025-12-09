import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import List from '../components/List';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import APIUtils from '../api/Utils';
import { configureAlert } from '../services/alert-status';
import { setAlert, updateStructureStatus } from '../actions/forms';
import { isEqual } from 'lodash';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';

const StructureOutputContainer = ({ disableSave, structureIsSaved, structureURL }) => {
  const smu = new StructuralMetadataUtils();
  const apiUtils = new APIUtils();

  // State variables from Redux store
  const { manifestFetched } = useSelector((state) => state.manifest);
  const { smData, initSmData, smDataIsValid } = useSelector((state) => state.structuralMetadata);
  const { structureInfo, editingDisabled } = useSelector((state) => state.forms);

  // Dispatch actions
  const dispatch = useDispatch();
  const settingAlert = (alert) => dispatch(setAlert(alert));
  const updateStructStatus = (value) => dispatch(updateStructureStatus(value));

  const [stateInitStructure, setInitStructure] = useState(initSmData);

  useEffect(() => {
    setInitStructure(initSmData);
  }, [initSmData]);

  useEffect(() => {
    if (!smDataIsValid) {
      settingAlert(configureAlert(-8));
    }
  }, [smDataIsValid]);

  useEffect(() => {
    if (structureInfo.structureSaved) {
      structureIsSaved(true);
    } else {
      const cleanSmData = smu.filterObjectKey(smData, 'active');
      if (!isEqual(stateInitStructure, cleanSmData)) {
        structureIsSaved(false);
      } else {
        structureIsSaved(true);
      }
    }
  }, [structureInfo.structureSaved]);

  const handleSaveError = (error) => {
    console.log('TCL: handleSaveError -> error -> ', error);
    let status = -10;
    const alert = configureAlert(status);
    settingAlert(alert);
  };

  const handleSaveItClick = async () => {
    let postData = { json: smData[0] };
    try {
      const response = await apiUtils.postRequest(structureURL, postData);
      const { status } = response;
      const alert = configureAlert(status);
      settingAlert(alert);

      updateStructStatus(1);
    } catch (error) {
      handleSaveError(error);
    }
  };

  return (
    <section
      className="structure-section"
      data-testid="structure-output-section"
    >
      <Col lg={12} className="structure-lists">
        {manifestFetched && smData != null && (
          <ul data-testid="structure-output-list">
            <List items={smData} />
          </ul>)
        }
      </Col>
      {!disableSave && (
        <Row>
          <Col className="pt-2">
            <Button
              variant="primary"
              onClick={handleSaveItClick}
              data-testid="structure-save-button"
              disabled={editingDisabled || !smDataIsValid}
              className="float-end"
            >
              Save Structure
            </Button>
          </Col>
        </Row>)
      }
    </section>
  );
};

export default StructureOutputContainer;
