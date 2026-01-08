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
  let mockFormatJson;
  let mockInjectTemplate;
  let mockRestoreRemovedProps;
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
    mockFormatJson = jest.fn((data) => JSON.stringify(data, null, 2));
    mockInjectTemplate = jest.fn();
    mockRestoreRemovedProps = jest.fn(() => initialJson);
    mockSanitizeDisplayedText = jest.fn(() => cleanedJson);

    jest.spyOn(smeHooks, 'useStructureUpdate').mockImplementation(() => ({
      updateStructure: mockUpdateStructure,
    }));
    jest.spyOn(smeHooks, 'useTextEditor').mockImplementation(() => ({
      formatJson: mockFormatJson,
      injectTemplate: mockInjectTemplate,
      restoreRemovedProps: mockRestoreRemovedProps,
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
      expect(getByText(/The "id" fields are read-only. Please save edited structure to reflect these changes in the visual editor and the waveform./)).toBeInTheDocument();
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


      expect(mockSanitizeDisplayedText).toHaveBeenCalledWith(initialJson);
      expect(mockFormatJson).toHaveBeenCalled();
    });

    test('does not process JSON when initialJson is null', () => {
      renderWithRedux(<TextEditor />);


      expect(mockSanitizeDisplayedText).not.toHaveBeenCalled();
    });
  });

  describe('has a \'Save JSON\' button that', () => {
    test('attempts to parse and save JSON when clicking \'Save JSON\' for parsable JSON', () => {
      const { getByTestId } = renderWithRedux(<TextEditor initialJson={initialJson} />);

      const saveButton = getByTestId('save-text');
      fireEvent.click(saveButton);

      expect(mockRestoreRemovedProps).toHaveBeenCalledTimes(1);
      expect(mockUpdateStructure).toHaveBeenCalledTimes(1);
    });

    test('throws an error when clicking \'Save JSON\' for un-parsable JSON', () => {
      const originalError = console.error;
      console.error = jest.fn();

      const { queryByTestId, getByTestId } = renderWithRedux(<TextEditor initialJson={initialJson} />);

      // Mock JSON.parse to throw error
      jest.spyOn(JSON, 'parse').mockImplementationOnce(() => {
        throw new Error('Invalid JSON');
      });

      const saveButton = getByTestId('save-text');
      act(() => fireEvent.click(saveButton));

      expect(mockRestoreRemovedProps).not.toHaveBeenCalledTimes(1);
      expect(mockUpdateStructure).not.toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalled();

      waitFor(() => {
        const errorAlert = queryByTestId('.alert-danger');
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveTextContent('Unable to save JSON, please check again.');
      });

      console.error = originalError;
    });
  });

  describe('has a \'Copy JSON\' button that', () => {
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

      act(() => fireEvent.click(copyButton));

      waitFor(() => expect(getByText('Copied!')).toBeInTheDocument());

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
          'Failed to copy to clipboard:', expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('inserts new items with template buttons', () => {
    test('calling injectTemplate when \'New Heading Template\' is clicked', () => {
      const { getByTestId } = renderWithRedux(<TextEditor initialJson={initialJson} />);
      const addHeadingButton = getByTestId('add-heading-template');

      fireEvent.click(addHeadingButton);

      expect(mockInjectTemplate).toHaveBeenCalledWith(
        expect.anything(), // mock view of CodeMirror
        { label: '', type: 'div', items: [] }
      );
    });

    test('calling injectTemplate when \'New Timespan Template\' is clicked', () => {
      const { getByTestId } = renderWithRedux(<TextEditor initialJson={initialJson} />);
      const addTimespanButton = getByTestId('add-timespan-template');

      fireEvent.click(addTimespanButton);

      expect(mockInjectTemplate).toHaveBeenCalledWith(
        expect.anything(), // mock view of CodeMirror
        { label: '', type: 'span', begin: '', end: '' }
      );
    });
  });

  describe('has validation status that', () => {
    let originalError;
    beforeAll(() => {
      originalError = console.error;
      console.error = jest.fn();
    });
    afterAll(() => { console.error = originalError; });

    test('does not display initially', () => {
      const { queryByTestId } = renderWithRedux(<TextEditor />);
      expect(queryByTestId('validation-success')).not.toBeInTheDocument();
    });

    test('shows validation errors for invalid JSON', () => {
      const { container, queryByTestId } = renderWithRedux(<TextEditor initialJson={initialJson} />);

      const editorElement = container.querySelector('.cm-editor');
      const view = EditorView.findFromDOM(editorElement);

      const invalidJson = { type: 'div', label: '', items: [] };
      act(() => {
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: JSON.stringify(invalidJson, null, 2) }
        });
      });

      waitFor(() => {
        const lintMarkers = container.querySelectorAll('.cm-lint-marker-error');
        expect(lintMarkers.length).toBeGreaterThan(0);
        const errorAlert = queryByTestId('validation-errors');
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveTextContent('Validation Errors');
      });
    });

    test('shows success message for valid JSON', () => {
      const { container } = renderWithRedux(<TextEditor initialJson={initialJson} />);

      const editorElement = container.querySelector('.cm-editor');
      const view = EditorView.findFromDOM(editorElement);

      const validJson = {
        type: 'root', label: 'Valid Root',
        items: [
          {
            type: 'div', label: 'Valid Heading',
            items: [
              {
                type: 'span', label: 'Valid Timespan',
                begin: '00:00:05.000', end: '00:00:15.000',
              }
            ]
          }
        ]
      };
      act(() => {
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: JSON.stringify(validJson, null, 2) }
        });
      });

      waitFor(() => {
        const successAlert = container.querySelector('.alert-success');
        expect(successAlert).toBeInTheDocument();
        expect(successAlert).toHaveTextContent('✓ Valid structure!');
      });
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
});
