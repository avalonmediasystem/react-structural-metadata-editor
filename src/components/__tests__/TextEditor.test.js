import React from 'react';
import { act, fireEvent, waitFor } from '@testing-library/react';
import TextEditor from '../TextEditor';
import { renderWithRedux } from '../../services/testing-helpers';
import * as smeHooks from '../../services/sme-hooks';
import { EditorView } from '@codemirror/view';

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('TextEditor component', () => {
  let mockUpdateStructure;
  let mockCreateIdMap;
  let mockFormatJson;
  let mockInjectTemplate;
  let mockRestoreIds;
  let mockSanitizeDisplayedText;

  const initialJson = {
    type: 'root', label: 'Test Root', id: 'test-id-1',
    items: [
      {
        type: 'div', label: 'Test Heading', id: 'test-id-2',
        items: [
          {
            type: 'span', label: 'Test Timespan', id: 'test-id-3',
            begin: '00:00:03.342', end: '00:00:10.352',
          }
        ]
      }
    ],
  };
  // Sanitized version of initialJson without extra properties
  const cleanedJson = {
    type: 'root', label: 'Test Root',
    items: [
      {
        type: 'div', label: 'Test Heading',
        items: [
          {
            type: 'span', label: 'Test Timespan',
            begin: '00:00:03.342', end: '00:00:10.352',
          }
        ]
      }
    ],
  };
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Set up mock implementations
    mockUpdateStructure = jest.fn();
    mockCreateIdMap = jest.fn(() => new Map([['0', 'test-id-1'], ['1', 'test-id-2'], ['2', 'test-id-3']]));
    mockFormatJson = jest.fn((data) => JSON.stringify(data, null, 2));
    mockInjectTemplate = jest.fn();
    mockRestoreIds = jest.fn(() => initialJson);
    mockSanitizeDisplayedText = jest.fn(() => cleanedJson);

    jest.spyOn(smeHooks, 'useStructureUpdate').mockImplementation(() => ({
      updateStructure: mockUpdateStructure,
    }));
    jest.spyOn(smeHooks, 'useTextEditor').mockImplementation(() => ({
      createIdMap: mockCreateIdMap,
      formatJson: mockFormatJson,
      injectTemplate: mockInjectTemplate,
      restoreIds: mockRestoreIds,
      sanitizeDisplayedText: mockSanitizeDisplayedText,
    }));
  });

  describe('renders', () => {
    test('editor and its components successfully', () => {
      const { container } = renderWithRedux(<TextEditor />);
      expect(container.querySelector('.text-editor')).toBeInTheDocument();
      expect(container.querySelector('.codemirror-text-editor')).toBeInTheDocument();
      expect(container.querySelector('.text-editor-sidebar')).toBeInTheDocument();
    });

    test('all action buttons', () => {
      const { getByTestId } = renderWithRedux(<TextEditor />);
      expect(getByTestId('add-heading-template')).toBeInTheDocument();
      expect(getByTestId('add-heading-template')).toHaveTextContent('New Heading Template');
      expect(getByTestId('add-timespan-template')).toBeInTheDocument();
      expect(getByTestId('add-timespan-template')).toHaveTextContent('New Timespan Template');

      expect(getByTestId('save-text')).toBeInTheDocument();
      expect(getByTestId('save-text')).toHaveTextContent('Save JSON');
      expect(getByTestId('copy-text')).toBeInTheDocument();
      expect(getByTestId('copy-text')).toHaveTextContent('Copy JSON');
    });

    test('info alert about saving', () => {
      const { getByText } = renderWithRedux(<TextEditor />);
      expect(getByText(/Please save edited structure to reflect these changes in the visual editor. Use the template buttons to insert new headings\/timespans./)).toBeInTheDocument();
    });

    test('validation state element in sidebar', () => {
      const { container } = renderWithRedux(<TextEditor />);
      const sidebar = container.querySelector('.text-editor-sidebar');
      expect(sidebar).toBeInTheDocument();

      const statusDiv = container.querySelector('.text-editor-status');
      expect(statusDiv).toBeInTheDocument();
    });
  });

  describe('on load', () => {
    test('processes and displays initial JSON', () => {
      renderWithRedux(<TextEditor initialJson={initialJson} />);

      expect(mockCreateIdMap).toHaveBeenCalledWith(initialJson);
      expect(mockSanitizeDisplayedText).toHaveBeenCalledWith(initialJson);
      expect(mockFormatJson).toHaveBeenCalled();
    });

    test('does not process JSON when initialJson is null', () => {
      renderWithRedux(<TextEditor />);

      expect(mockCreateIdMap).not.toHaveBeenCalled();
      expect(mockSanitizeDisplayedText).not.toHaveBeenCalled();
    });
  });

  test('attempts to parse and save JSON when clicking \'Save JSON\' ', () => {
    const { getByTestId } = renderWithRedux(<TextEditor initialJson={initialJson} />);

    const saveButton = getByTestId('save-text');
    fireEvent.click(saveButton);

    expect(mockRestoreIds).toHaveBeenCalledTimes(1);
    expect(mockUpdateStructure).toHaveBeenCalledTimes(1);
  });

  describe('has \'Copy JSON\' button that', () => {
    test('calls clipboard.writeText on click', async () => {
      const { getByTestId } = renderWithRedux(<TextEditor />);
      const copyButton = getByTestId('copy-text');

      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
      });
    });

    test('shows success message after copying', async () => {
      const { getByTestId, getByText } = renderWithRedux(<TextEditor />);
      const copyButton = getByTestId('copy-text');

      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(getByText('Copied!')).toBeInTheDocument();
      });

      // Wait for button text to reset
      await waitFor(() => {
        expect(getByText('Copy JSON')).toBeInTheDocument();
      }, { timeout: 2500 });
    });

    test('handles clipboard write error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      navigator.clipboard.writeText.mockRejectedValueOnce(new Error('Clipboard error'));

      const { getByTestId } = renderWithRedux(<TextEditor />);
      const copyButton = getByTestId('copy-text');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to copy to clipboard:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('creates new items with template buttons', () => {
    test('calling injectTemplate when \'New Heading Template\' is clicked', () => {
      const { getByTestId } = renderWithRedux(<TextEditor initialJson={initialJson} />);
      const addHeadingButton = getByTestId('add-heading-template');

      fireEvent.click(addHeadingButton);

      expect(mockInjectTemplate).toHaveBeenCalledWith(
        expect.anything(),
        { label: '', type: 'div', items: [] }
      );
    });

    test('calling injectTemplate when \'New Timespan Template\' is clicked', () => {
      const { getByTestId } = renderWithRedux(<TextEditor initialJson={initialJson} />);
      const addTimespanButton = getByTestId('add-timespan-template');

      fireEvent.click(addTimespanButton);

      expect(mockInjectTemplate).toHaveBeenCalledWith(
        expect.anything(),
        { label: '', type: 'span', begin: '', end: '' }
      );
    });
  });

  describe('has validation status that', () => {
    test('does not display initially', () => {
      const { container } = renderWithRedux(<TextEditor />);
      const successAlert = container.querySelector('.alert-success');
      expect(successAlert).not.toBeInTheDocument();
    });

    test('shows validation errors for invalid JSON', async () => {
      const originalError = console.error;
      console.error = jest.fn();

      const { container } = renderWithRedux(<TextEditor initialJson={initialJson} />);

      const editorElement = container.querySelector('.cm-editor');
      const view = EditorView.findFromDOM(editorElement);

      const invalidJson = { type: 'div', label: '', items: [] };
      act(() => {
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: JSON.stringify(invalidJson, null, 2) }
        });
      });

      // Wait for debounced validation (300ms debounce time + buffer)
      await waitFor(() => {
        const lintMarkers = container.querySelectorAll('.cm-lint-marker-error');
        expect(lintMarkers.length).toBeGreaterThan(0);
        const errorAlert = container.querySelector('.alert-danger');
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveTextContent('Validation Errors');
      });
      console.error = originalError;
    });
  });

  describe('has a CodeMirror editor', () => {
    test('that is editable', () => {
      const { container } = renderWithRedux(<TextEditor />);

      const cmEditor = container.querySelector('.cm-editor');
      expect(cmEditor).toBeInTheDocument();
      expect(cmEditor).not.toHaveAttribute('contenteditable', 'false');
    });

    test('with line numbers', () => {
      const { container } = renderWithRedux(<TextEditor />);

      const lineNumbers = container.querySelector('.cm-lineNumbers');
      expect(lineNumbers).toBeInTheDocument();
    });

    test('with a lint gutter', () => {
      const { container } = renderWithRedux(<TextEditor />);

      const gutters = container.querySelector('.cm-gutters');
      expect(gutters).toBeInTheDocument();
    });
  });

  describe('ID Restoration', () => {
    test('save action restored IDs correctly', () => {
      const { getByText } = renderWithRedux(<TextEditor initialJson={initialJson} />);

      const saveButton = getByText('Save JSON');
      fireEvent.click(saveButton);

      expect(saveButton).toBeInTheDocument();
      expect(mockRestoreIds).toHaveBeenCalledTimes(1);

      expect(mockRestoreIds).toHaveBeenCalledWith(cleanedJson, new Map([['0', 'test-id-1'], ['1', 'test-id-2'], ['2', 'test-id-3']]));
    });

    test('uses the JSON passed to the component', () => {
      renderWithRedux(<TextEditor initialJson={initialJson} />);

      expect(mockCreateIdMap).toHaveBeenCalledWith(initialJson);
    });
  });
});
