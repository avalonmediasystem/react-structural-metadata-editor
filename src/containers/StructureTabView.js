import React, { useState } from "react";
import { useSelector } from 'react-redux';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import TextEditor from "../components/TextEditor";
import StructureOutputContainer from "./StructureOutputContainer";
import ButtonSection from "../components/ButtonSection";

const StructureTabView = ({ disableSave, structureIsSaved, structureURL, showTextEditor = false }) => {
  const { smData } = useSelector((state) => state.structuralMetadata);

  const [viewMode, setViewMode] = useState('visual');

  return (
    <div className="structural-metadata-editor">
      {showTextEditor && (
        <div className="view-mode-tabs mb-3 d-flex justify-content-end">
          <ButtonGroup>
            <Button
              variant={viewMode === 'visual' ? 'primary' : 'outline-secondary'}
              onClick={() => setViewMode('visual')}
              data-testid="visual-editor-button"
            >
              Visual Editor
            </Button>
            <Button
              variant={viewMode === 'text' ? 'primary' : 'outline-secondary'}
              onClick={() => setViewMode('text')}
              data-testid="text-editor-button"
            >
              Text Editor
            </Button>
          </ButtonGroup>
        </div>
      )}
      {viewMode === 'visual' ? (
        <section data-testid="visual-editor-section">
          <ButtonSection />
          <StructureOutputContainer
            disableSave={disableSave}
            structureIsSaved={structureIsSaved}
            structureURL={structureURL}
          />
        </section>
      ) : (
        <TextEditor initialJson={smData[0]} />
      )}
    </div>
  );
};

export default StructureTabView;
