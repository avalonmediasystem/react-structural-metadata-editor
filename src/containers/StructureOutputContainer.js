import React, { useEffect, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
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

  const dispatch = useDispatch();
  const { manifestFetched } = useSelector((state) => state.manifest);
  const { smData, initSmData, smDataIsValid } = useSelector((state) => state.structuralMetadata);
  const { structureInfo, editingDisabled } = useSelector((state) => state.forms);

  const [stateInitStructure, setInitStructure] = useState(initSmData);

  useEffect(() => {
    setInitStructure(initSmData);
  }, [initSmData]);

  useEffect(() => {
    if (!smDataIsValid) {
      dispatch(setAlert(configureAlert(-8)));
    }
  }, [smDataIsValid]);

  useEffect(() => {
    if (structureInfo.structureSaved) {
      props.structureIsSaved(true);
    } else {
      const cleanSmData = smu.filterObjectKey(smData, 'active');
      if (!isEqual(stateInitStructure, cleanSmData)) {
        props.structureIsSaved(false);
      } else {
        props.structureIsSaved(true);
      }
    }
  }, [structureInfo.structureSaved]);

  const handleSaveError = (error) => {
    console.log('TCL: handleSaveError -> error -> ', error);
    let status = -10;
    const alert = configureAlert(status);
    dispatch(setAlert(alert));
  };

  const handleSaveItClick = async () => {
    let postData = { json: smData[0] };
    try {
      const response = await apiUtils.postRequest(props.structureURL, postData);
      const { status } = response;
      const alert = configureAlert(status);
      dispatch(setAlert(alert));

      dispatch(updateStructureStatus(1));
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
      {!props.disableSave && (
        <Row>
          <Col md={{ span: 4, offset: 8 }} className="text-right pr-4 pt-2">
            <Button
              variant="primary"
              onClick={handleSaveItClick}
              data-testid="structure-save-button"
              disabled={editingDisabled}
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
