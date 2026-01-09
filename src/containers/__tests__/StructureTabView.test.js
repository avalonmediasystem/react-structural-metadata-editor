import React from 'react';
import { fireEvent } from '@testing-library/react';
import StructureTabView from '../StructureTabView';
import { renderWithRedux, testSmData } from '../../services/testing-helpers';
import Peaks from 'peaks';

// Set up a redux store for the tests
const peaksOptions = {
  container: null,
  mediaElement: null,
  dataUri: null,
  dataUriDefaultFormat: 'json',
  keyboard: true,
  _zoomLevelIndex: 0,
  _zoomLevels: [512, 1024, 2048, 4096],
};

let peaksInst = null;
Peaks.init(peaksOptions, (_err, peaks) => {
  peaksInst = peaks;
});

// Set up Redux store for tests
const initialState = {
  structuralMetadata: {
    smData: testSmData,
    initSmData: testSmData,
    smDataIsValid: true
  },
  manifest: {
    manifestFetched: true
  },
  peaksInstance: {
    peaks: peaksInst
  },
  forms: {
    structureInfo: {
      structureRetrieved: true,
      structureSaved: true
    },
    streamInfo: {
      streamMediaError: false
    },
    editingDisabled: false,
    alerts: []
  }
};

// Mock react-dnd and related libraries
jest.mock('react-dnd', () => ({
  useDrag: jest.fn(() => [{ isDragging: false }, jest.fn()]),
  useDrop: jest.fn(() => [{ isOver: false }, jest.fn()]),
}));
jest.mock('react-dnd-html5-backend', () => ({
  HTML5Backend: jest.fn(),
}));

describe('StructureTabView component', () => {
  const mockStructureIsSaved = jest.fn();
  const props = { disableSave: false, structureIsSaved: mockStructureIsSaved, structureURL: "" };
  describe('renders', () => {
    test('visual editor with default props', () => {
      const { queryByTestId } = renderWithRedux(<StructureTabView {...props} />, { initialState });
      expect(queryByTestId('visual-editor-section')).toBeInTheDocument();
    });

    test('ButtonSection in default view', () => {
      const { queryByTestId } = renderWithRedux(<StructureTabView {...props} />, { initialState });
      expect(queryByTestId('button-section')).toBeInTheDocument();
    });

    test('StructureOutputContainer in default view', () => {
      const { queryByTestId } = renderWithRedux(<StructureTabView {...props} />, { initialState });
      expect(queryByTestId('structure-output-section')).toBeInTheDocument();
    });

    test('displays the \'Save Structure\' button in default view', () => {
      const { queryByTestId } = renderWithRedux(<StructureTabView {...props} />, { initialState });
      expect(queryByTestId('structure-save-button')).toBeInTheDocument;
    });
  });

  describe('with prop \'showTextEditor=true\'', () => {
    const props = { disableSave: false, structureIsSaved: mockStructureIsSaved, structureURL: "", showTextEditor: true };
    test('renders view mode toggle button', () => {
      const { getByText } = renderWithRedux(<StructureTabView {...props} />, { initialState });
      expect(getByText('Visual Editor')).toBeInTheDocument();
      expect(getByText('Text Editor')).toBeInTheDocument();
    });

    test('\'Visual Editor\' button is active by default', () => {
      const { getByTestId } = renderWithRedux(
        <StructureTabView
          disableSave={false}
          structureIsSaved={mockStructureIsSaved}
          structureURL=""
          showTextEditor={true}
        />,
        { initialState }
      );
      expect(getByTestId('visual-editor-button')).toHaveClass('btn-primary');
      expect(getByTestId('text-editor-button')).toHaveClass('btn-outline-secondary');
    });

    test('switches to text-editor when \'Text Editor\' button is clicked', () => {
      const { getByTestId, queryByTestId } = renderWithRedux(<StructureTabView {...props} />, { initialState });

      const textEditorButton = getByTestId('text-editor-button');
      const visualEditorButton = getByTestId('visual-editor-button');

      // Initially, Visual Editor button is active
      expect(visualEditorButton).toHaveClass('btn-primary');
      expect(textEditorButton).toHaveClass('btn-outline-secondary');

      fireEvent.click(textEditorButton);

      // Text Editor button is active
      expect(visualEditorButton).toHaveClass('btn-outline-secondary');
      expect(textEditorButton).toHaveClass('btn-primary');

      // Displays the TextEditor component not the visual components
      expect(getByTestId('codemirror-editor')).toBeInTheDocument();
      expect(queryByTestId('button-section')).not.toBeInTheDocument();
      expect(queryByTestId('structure-output-section')).not.toBeInTheDocument();
    });

    test('switches back to visual view when \'Visual Editor\' button is clicked', () => {
      const { getByTestId, queryByTestId } = renderWithRedux(<StructureTabView {...props} />, { initialState });

      const textEditorButton = getByTestId('text-editor-button');
      const visualEditorButton = getByTestId('visual-editor-button');

      // Setup: switch to text view
      fireEvent.click(textEditorButton);

      expect(textEditorButton).toHaveClass('btn-primary');
      expect(getByTestId('codemirror-editor')).toBeInTheDocument();
      expect(queryByTestId('button-section')).not.toBeInTheDocument();

      // Switch back to visual view
      fireEvent.click(visualEditorButton);

      expect(visualEditorButton).toHaveClass('btn-primary');
      expect(getByTestId('button-section')).toBeInTheDocument();
      expect(getByTestId('structure-output-section')).toBeInTheDocument();
      expect(queryByTestId('codemirror-editor')).not.toBeInTheDocument();
    });

    test('TextEditor receives smData from Redux store', () => {
      const { getByText, getByTestId } = renderWithRedux(
        <StructureTabView
          disableSave={false}
          structureIsSaved={mockStructureIsSaved}
          structureURL=""
          showTextEditor={true}
        />,
        { initialState }
      );

      // Switch to text view
      fireEvent.click(getByText('Text Editor'));

      const codeMirrorEditor = getByTestId('codemirror-editor');
      expect(codeMirrorEditor).toBeInTheDocument();
    });
  });

  describe('\'Save Structure\' button', () => {
    test('does not render when \'disableSave=true\'', () => {
      const { queryByTestId } = renderWithRedux(
        <StructureTabView
          disableSave={true} structureIsSaved={mockStructureIsSaved} structureURL=""
        />,
        { initialState }
      );
      expect(queryByTestId('structure-save-button')).not.toBeInTheDocument();
    });

    test('renders when \'disableSave=false\' (default)', () => {
      const { getByTestId } = renderWithRedux(
        <StructureTabView
          disableSave={false} structureIsSaved={mockStructureIsSaved} structureURL=""
        />,
        { initialState }
      );
      expect(getByTestId('structure-save-button')).toBeInTheDocument();
      expect(getByTestId('structure-save-button')).not.toBeDisabled();
    });
  });
});
