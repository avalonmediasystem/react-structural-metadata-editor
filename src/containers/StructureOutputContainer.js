import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import List from '../components/List';
import { Button, Col, Row } from 'react-bootstrap';
import APIUtils from '../api/Utils';
import { configureAlert } from '../services/alert-status';
import { isEqual } from 'lodash';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';
import { setAlert, updateStructureStatus } from '../actions/forms';

const StructureOutputContainer = (props) => {
  const smu = new StructuralMetadataUtils();
  const apiUtils = new APIUtils();

  const { structure, manifestFetched } = useSelector((state) => state.manifest);
  const { smData, initSmData, smDataIsValid } = useSelector((state) => state.structuralMetadata);
  const { editingDisabled, structureInfo } = useSelector((state) => state.forms);
  const dispatch = useDispatch();

  const [stateInitStructure, setInitStructure] = React.useState(initSmData);

  React.useEffect(() => {
    setInitStructure(initSmData);
  }, [initSmData]);

  React.useEffect(() => {
    if (!smDataIsValid) {
      dispatch(setAlert(configureAlert(-8)));
    }
  }, [smDataIsValid]);

  React.useEffect(() => {
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
    console.log('TCL: handleSaveError -> error', error);

    const alert = configureAlert(-10);
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
      {manifestFetched && structure != null && (
        <div data-testid="structure-output-list">
          <List items={smData} />
          <Row>
            <Col xs={12} className="text-right">
              <Button
                variant="primary"
                onClick={handleSaveItClick}
                data-testid="structure-save-button"
                disabled={editingDisabled}
              >
                Save Structure
              </Button>
            </Col>
          </Row>
        </div>
      )
      }

    </section>
  );
};

export default StructureOutputContainer;