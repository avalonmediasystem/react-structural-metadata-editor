import React, { useState } from "react";
import { useSelector } from 'react-redux';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import JsonEditor from "../components/JSONEditor";
import StructureOutputContainer from "./StructureOutputContainer";

const StructureTabView = ({ disableSave, structureIsSaved, structureURL }) => {
  const [viewMode, setViewMode] = useState('visual'); // 'visual', 'json'

  // Get JSON data from Redux store
  const { smData } = useSelector((state) => state.structuralMetadata);

  return (
    <div className="structural-metadata-editor">
      {/* Mode Toggle */}
      <div className="view-mode-tabs mb-3">
        <ButtonGroup>
          <Button
            variant={viewMode === 'visual' ? 'primary' : 'outline-primary'}
            onClick={() => setViewMode('visual')}
          >
            Visual Editor
          </Button>
          <Button
            variant={viewMode === 'json' ? 'primary' : 'outline-primary'}
            onClick={() => setViewMode('json')}
          >
            JSON Editor
          </Button>
        </ButtonGroup>
      </div>

      {/* Conditional Rendering */}
      {viewMode === 'visual' ? (
        <StructureOutputContainer
          disableSave={disableSave}
          structureIsSaved={structureIsSaved}
          structureURL={structureURL}
        />
      ) : (
        <JsonEditor
          initialJson={smData[0]}
          readOnly={false}
        />
      )}
    </div>
  );
};

export default StructureTabView;
