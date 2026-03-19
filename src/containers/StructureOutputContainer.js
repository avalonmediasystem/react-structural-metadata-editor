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
import { getLabelValue, parseJSONToStructure } from '../services/iiif-parser';

const StructureOutputContainer = ({ disableSave, enableDownload, structureIsSaved, structureURL }) => {
  const smu = new StructuralMetadataUtils();
  const apiUtils = new APIUtils();

  // State variables from Redux store
  const { manifestFetched, manifest } = useSelector((state) => state.manifest);
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

  const handleDownload = () => {
    if (!manifest || !smData?.length) return;
    const updatedManifest = {
      ...manifest,
      structures: parseJSONToStructure(manifest, smData, 0),
    };
    // Use Manifest name as file name
    let manifestName = getLabelValue(manifest.label);
    const json = JSON.stringify(updatedManifest, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = manifestName == 'Label could not be parsed'
      ? 'manifest.json' : `${manifestName}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
      {enableDownload && (
        <Row>
          <Col className="pt-2">
            <Button
              variant="outline-secondary"
              onClick={handleDownload}
              data-testid="download-manifest-button"
              className="float-end"
            >
              Download Manifest
            </Button>
          </Col>
        </Row>)
      }
    </section>
  );
};

export default StructureOutputContainer;
