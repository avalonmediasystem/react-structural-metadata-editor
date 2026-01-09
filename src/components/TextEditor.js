import React, { useState, useEffect, useMemo, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { lineNumbers, EditorView } from '@codemirror/view';
import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { lintGutter } from '@codemirror/lint';
import { useStructureUpdate, useTextEditor } from '../services/sme-hooks';
import { createCustomJsonLinter, createReadOnlyIdExtension } from '../services/codemirror-extensions';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import '../styles/text-editor.css';

const TextEditor = ({ initialJson = null }) => {
  const [jsonContent, setJsonContent] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [validationErrors, setValidationErrors] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [hasBeenEdited, setHasBeenEdited] = useState(false);

  // Track in-progress validation to show/hide validation status
  const isValidating = useRef(false);

  const editorViewRef = useRef(null);

  const { updateStructure } = useStructureUpdate();
  const { formatJson, injectTemplate, restoreRemovedProps, sanitizeDisplayedText } = useTextEditor();

  useEffect(() => {
    if (initialJson) {
      // Filter ids and other extra properties from displayed text
      const sanitizedText = sanitizeDisplayedText(initialJson);
      // Format filtered data
      const formatted = formatJson(sanitizedText);
      setJsonContent(formatted);
    }
  }, [initialJson, formatJson, sanitizeDisplayedText]);

  /**
   * Handle save action in editor. This updates the Redux store with the latest
   * JSON from the text editor, which re-renders the visual editor
   * on the other tab.
   */
  const handleSave = () => {
    if (isValid) {
      try {
        const parsedData = JSON.parse(jsonContent);
        // Restore removed properties on to the edited data
        const withOtherProps = restoreRemovedProps(parsedData);
        updateStructure([withOtherProps]);
      } catch (error) {
        console.error('Failed to parse JSON:', error);
        setIsValid(false);
        setValidationErrors(['Unable to save JSON, please check again.']);
      }
    }
  };

  /**
   * Handle copy to clipboard function in the editor
   */
  const handleCopy = async () => {
    if (isValid) {
      try {
        await navigator.clipboard.writeText(jsonContent);
        setCopySuccess(true);
        // Reset button once content is copied
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  /**
   * Update text changes from the editor in state
   * @param {String} value current text from editor
   */
  const handleChange = (value) => {
    isValidating.current = true;
    setJsonContent(value);
    setHasBeenEdited(true);
  };

  /**
   * Handle adding a new heading template at cursor position
   */
  const handleAddHeading = () => {
    if (!editorViewRef.current) return;

    const headingTemplate = { label: "", type: "div", items: [] };
    injectTemplate(editorViewRef, headingTemplate);
  };

  /**
   * Handle adding a new timespan template at cursor position
   */
  const handleAddTimespan = () => {
    if (!editorViewRef.current) return;

    const timespanTemplate = { label: "", type: "span", begin: "", end: "" };
    injectTemplate(editorViewRef, timespanTemplate);
  };

  /**
   * Validation state update function
   */
  const updateValidationState = (isValidResult, errorMessages) => {
    setIsValid(isValidResult);
    setValidationErrors(errorMessages);
    isValidating.current = false;
  };

  /**
   * Custom linter extension for CodeMirror for JSON validation using AJV schema validator.
   * 'useMemo' helps stabilize the extension reference across renders.
   */
  const customJsonLinter = useMemo(() => createCustomJsonLinter(updateValidationState), []);

  /**
   * Custom extension to make "id" fields read-only.
   * 'useMemo' helps stabilize the extension reference across renders.
   */
  const readOnlyIdExtension = useMemo(() => createReadOnlyIdExtension(), []);

  return (
    <section className="text-editor">
      <div className="text-editor-header">
        <Alert variant="info" className="p-2 m-2">
          <strong>Info:</strong> The "id" fields are read-only. Please save edited structure to reflect
          these changes in the visual editor and the waveform.
        </Alert>
      </div>
      <div className="text-editor-body">
        <div className="codemirror-text-editor">
          <CodeMirror
            value={jsonContent}
            theme={"light"}
            extensions={[
              json(),
              lineNumbers(),
              syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
              EditorView.lineWrapping,
              EditorView.editable.of(true),
              customJsonLinter,
              lintGutter(),
              readOnlyIdExtension
            ]}
            onChange={handleChange}
            onCreateEditor={(view) => { editorViewRef.current = view; }}
            readOnly={false}
            data-testid="codemirror-editor"
          />
        </div>
        <div className="text-editor-sidebar">
          <div className="text-editor-buttons">
            <div className="d-flex mb-2">
              <Button
                variant="outline-secondary"
                onClick={handleAddHeading}
                title="Insert heading template at cursor"
                className="w-100 mx-1 mt-2"
                data-testid="add-heading-template"
              >
                New Heading Template
              </Button>
              <Button
                variant="outline-secondary"
                onClick={handleAddTimespan}
                title="Insert timespan template at cursor"
                className="w-100 mx-1 mt-2"
                data-testid="add-timespan-template"
              >
                New Timespan Template
              </Button>
            </div>
            <div className="d-flex">
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!isValid}
                title="Save JSON changes"
                className="w-100 mx-1"
                data-testid="save-text"
              >
                Save JSON
              </Button>
              <Button
                variant={copySuccess ? "secondary" : "success"}
                onClick={handleCopy}
                disabled={!isValid}
                title="Copy JSON to clipboard"
                className="w-100 mx-1"
                data-testid="copy-text"
              >
                {copySuccess ? "Copied!" : "Copy JSON"}
              </Button>
            </div>
          </div>
          <div className="text-editor-status">
            {/* Display validation success/errors only after an edit has been made */}
            {(hasBeenEdited && !isValidating.current) && (
              <>
                {(!isValid && validationErrors.length > 0) ? (
                  <Alert variant="danger" className="validation-errors my-0 p-2" data-testid="validation-errors">
                    <strong>Validation Errors:</strong>
                    <ul className="mb-0 mt-2">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </Alert>
                ) : (
                  <Alert variant="success" className="my-0 p-2" data-testid="validation-success">
                    ✓ Valid structure!
                  </Alert>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TextEditor;
