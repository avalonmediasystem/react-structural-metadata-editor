import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import TextEditor from '../TextEditor';
import { renderWithRedux } from '../../services/testing-helpers';
import * as smeHooks from '../../services/sme-hooks';

// Mock the sme-hooks module
jest.mock('../../services/sme-hooks', () => ({
  useStructureUpdate: jest.fn(),
  useTextEditor: jest.fn(),
}));

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
    type: 'root',
    label: 'Test Root',
    id: 'test-id-1',
    items: [
      {
        type: 'div',
        label: 'Test Heading',
        id: 'test-id-2',
        items: [
          {
            type: 'span',
            label: 'Test Timespan',
            id: 'test-id-3',
            begin: '00:00:03.342',
            end: '00:00:10.352',
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
    mockCreateIdMap = jest.fn(() => new Map([['0', '123a-456b-789c-0d']]));
    mockFormatJson = jest.fn((data) => JSON.stringify(data, null, 2));
    mockInjectTemplate = jest.fn();
    mockRestoreIds = jest.fn((data) => ({ ...data, id: '123a-456b-789c-0d' }));
    mockSanitizeDisplayedText = jest.fn((data) => {
      const { id, active, timeRange, nestedSpan, valid, ...rest } = data;
      return rest;
    });

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
      expect(getByText(/Please save JSON to reflect these changes/)).toBeInTheDocument();
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
      renderWithRedux(<TextEditor initialJson={null} />);

      expect(mockCreateIdMap).not.toHaveBeenCalled();
      expect(mockSanitizeDisplayedText).not.toHaveBeenCalled();
    });
  });

  test('clicking \'Save JSON\' attempts to parse and save JSON', () => {
    const { getByTestId } = renderWithRedux(<TextEditor initialJson={initialJson} />);

    const saveButton = getByTestId('save-text');
    fireEvent.click(saveButton);

    expect(mockRestoreIds).toHaveBeenCalledTimes(1);
    expect(mockUpdateStructure).toHaveBeenCalledTimes(1);
  });

  describe('copy JSON functionality', () => {
    test('calls clipboard.writeText', async () => {
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

  describe('create new item functionality with template buttons', () => {
    test('calls injectTemplate when \'New Heading Template\' is clicked', () => {
      const { getByTestId } = renderWithRedux(<TextEditor initialJson={initialJson} />);
      const addHeadingButton = getByTestId('add-heading-template');

      fireEvent.click(addHeadingButton);

      expect(mockInjectTemplate).toHaveBeenCalledWith(
        expect.anything(),
        { label: '', type: 'div', items: [] }
      );
    });

    test('calls injectTemplate when \'New Timespan Template\' is clicked', () => {
      const { getByTestId } = renderWithRedux(<TextEditor initialJson={initialJson} />);
      const addTimespanButton = getByTestId('add-timespan-template');

      fireEvent.click(addTimespanButton);

      expect(mockInjectTemplate).toHaveBeenCalledWith(
        expect.anything(),
        { label: '', type: 'span', begin: '', end: '' }
      );
    });
  });

});
