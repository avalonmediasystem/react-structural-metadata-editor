import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { lineNumbers, EditorView } from '@codemirror/view';
import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { linter, lintGutter } from '@codemirror/lint';
import { debounce } from 'lodash';
import Ajv from 'ajv';
import jsonSourceMap from '@mischnic/json-sourcemap';
import { useStructureUpdate, useTextEditor } from '../services/sme-hooks';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import '../styles/text-editor.css';

// JSON Schema for structural metadata validation
const schema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  required: ["type", "label"],
  properties: {
    type: {
      type: "string",
      enum: ["div", "span", "root"],
      description: "Element type: 'div' for headings / 'span' for timespans"
    },
    label: {
      type: "string", minLength: 2,
      description: "Label for the element"
    },
    begin: {
      type: "string",
      pattern: "^(\\d+:){0,2}\\d+(\\.\\d+)?$",
      description: "Begin time (required for timespans, format: HH:MM:SS.mmm)"
    },
    end: {
      type: "string",
      pattern: "^(\\d+:){0,2}\\d+(\\.\\d+)?$",
      description: "End time (required for timespans, format: HH:MM:SS.mmm)"
    },
    items: {
      type: "array", minItems: 1,
      description: "Child elements (required for headings with at least one item)",
      items: { $ref: "#" }
    }
  },
  allOf: [
    {
      // If type is "div", items must be present with at least one element
      if: { properties: { type: { const: "div" } } },
      then: { required: ["items"], properties: { items: { type: "array", minItems: 1 } } }
    },
    {
      // If type is "span", begin and end must be present
      if: { properties: { type: { const: "span" } } },
      then: { required: ["begin", "end"] }
    }
  ]
};

// Create AJV instance and compile the JSON schema
const ajv = new Ajv({ allErrors: true, verbose: true });
const validateSchema = ajv.compile(schema);

const TextEditor = ({ initialJson = null }) => {
  const [jsonContent, setJsonContent] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [validationErrors, setValidationErrors] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [hasBeenEdited, setHasBeenEdited] = useState(false);

  // Track in-progress validation to show/hide validation status
  const isValidating = useRef(false);

  const idMapRef = useRef(new Map());
  const editorViewRef = useRef(null);

  const { updateStructure } = useStructureUpdate();
  const { createIdMap, formatJson, injectTemplate, restoreIds, sanitizeDisplayedText } = useTextEditor();

  useEffect(() => {
    if (initialJson) {
      // Create id map before filtering
      idMapRef.current = createIdMap(initialJson);
      // Filter ids and other extra properties from displayed text
      const sanitizedText = sanitizeDisplayedText(initialJson);
      // Format filtered data
      const formatted = formatJson(sanitizedText);
      setJsonContent(formatted);
    }
  }, [initialJson, formatJson, createIdMap, sanitizeDisplayedText]);

  /**
   * Handle save action in editor. This updates the Redux store with the latest
   * JSON from the text editor, which re-renders the visual editor
   * on the other tab.
   */
  const handleSave = () => {
    if (isValid) {
      try {
        const parsedData = JSON.parse(jsonContent);
        // Restore ids to the edited data
        const withIds = restoreIds(parsedData, idMapRef.current);
        updateStructure([withIds]);
      } catch (error) {
        console.error('Failed to parse JSON:', error);
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
  const handleAddHeading = useCallback(() => {
    if (!editorViewRef.current) return;

    const headingTemplate = { label: "", type: "div", items: [] };
    injectTemplate(editorViewRef, headingTemplate);
  }, []);

  /**
   * Handle adding a new timespan template at cursor position
   */
  const handleAddTimespan = useCallback(() => {
    if (!editorViewRef.current) return;

    const timespanTemplate = { label: "", type: "span", begin: "", end: "" };
    injectTemplate(editorViewRef, timespanTemplate);
  }, []);

  /**
   * Debounced validation state update function using lodash
   */
  const updateValidationStateRef = useRef(
    debounce((isValidResult, errorMessages) => {
      setIsValid(isValidResult);
      setValidationErrors(errorMessages);
      isValidating.current = false;
    }, 300)
  );

  /**
   * Custom linter extension for CodeMirror for JSON validation using AJV schema validator.
   * 'useMemo' helps stabilize the extension reference across renders.
   */
  const customJsonLinter = useMemo(() => linter((view) => {
    // Get JSON from text editor
    const content = view.state.doc.toString();

    // Quick JSON syntax check to avoid heavy validation below
    try {
      JSON.parse(content);
    } catch (error) {
      const errorMessage = error && error.message ? error.message : 'Invalid JSON';
      updateValidationStateRef.current(false, [`JSON Syntax Error: ${errorMessage}`]);
      return [];
    }

    // When JSON is valid, proceed with schema validation
    const diagnostics = [];

    try {
      // Parse JSON data with source map
      const parsedJson = jsonSourceMap.parse(content);
      const data = parsedJson.data;
      const pointers = parsedJson.pointers;

      // Validate using AJV schema
      const valid = validateSchema(data);

      if (!valid && validateSchema.errors) {
        // Convert AJV errors to CodeMirror diagnostics
        validateSchema.errors.forEach(error => {
          // Skip generic conditional schema errors (if/then/else) as they're redundant
          if (error.keyword === 'if' || error.keyword === 'then' || error.keyword === 'else') {
            return;
          }
          let message = error.message;

          // Get the JSON pointer for the error location using error's instancePath
          const pointer = pointers[error.instancePath];
          // Initialize lineNumber to current line with the cursor or 1
          let lineNumber = view.state.doc.lineAt(view.state.selection.main.head).number || 1;
          // Read line number from source map if it exists. These line numbers are 0-indexed
          if (pointer) lineNumber = pointer.value.line + 1;
          const line = view.state.doc.line(lineNumber);

          // Customize error messages based on error type
          if (error.keyword === 'required') {
            const missingProp = error.params.missingProperty;
            message = `Missing required "${missingProp}" field`;
          } else if (error.keyword === 'minLength' && error.instancePath.endsWith('/label')) {
            message = 'Label needs to be at least 2 characters long';
          } else if (error.keyword === 'pattern') {
            const fieldName = error.instancePath.split('/').pop();
            message = `Invalid "${fieldName}" time format (expected HH:MM:SS.mmm or similar)`;
          } else if (error.keyword === 'minItems') {
            // For minItems error, the instancePath points to the items array itself
            message = 'Must have at least one child item';
          } else if (error.keyword === 'enum') {
            const fieldName = error.instancePath.split('/').pop();
            message = `Invalid value for "${fieldName}". Must be one of: ${error.params.allowedValues.join(', ')}`;
          }

          // Add to diagnostics to display errors in the editor
          diagnostics.push({
            from: line.from,
            to: line.to,
            severity: 'error',
            message: message
          });
        });

        // Dedupe diagnostics
        const diagnosticFrom = [];
        const uniqueDiagnostics = diagnostics.filter((d) => {
          if (diagnosticFrom.includes(d.from)) {
            return false;
          } else {
            diagnosticFrom.push(d.from);
            return true;
          }
        });

        // Convert diagnostics to error messages with line numbers for the sidebar
        const errorMessages = uniqueDiagnostics.map(d => {
          const line = view.state.doc.lineAt(d.from);
          return `Line ${line.number}: ${d.message}`;
        });

        // Update validation state with debouncing
        const isValidResult = uniqueDiagnostics.length === 0;
        updateValidationStateRef.current(isValidResult, errorMessages);

        return uniqueDiagnostics;
      } else {
        // Valid JSON with no schema errors
        updateValidationStateRef.current(true, []);
        return [];
      }
    } catch (error) {
      // Extra layer of error handling for validation, however this would hardly get invoked
      // since JSON syntax gets pre-validated.
      console.error('Unexpected error in schema validation:', error);
      return [];
    }
  }), []);

  return (
    <section className="text-editor">
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
            lintGutter()
          ]}
          onChange={handleChange}
          onCreateEditor={(view) => {
            editorViewRef.current = view;
          }}
          readOnly={false}
          data-testid="codemirror-editor"
        />
      </div>

      <div className="text-editor-sidebar">
        <Alert variant="info" className="p-2 m-2">
          <strong>Note:</strong> Please save JSON to reflect these changes in the visual editor.
        </Alert>
        <div className="text-editor-status">
          {/* Display validation success/errors only adter an edit has been made */}
          {(hasBeenEdited && !isValidating.current) && (
            <>
              {(!isValid && validationErrors.length > 0) ? (
                <Alert variant="danger" className="validation-errors my-0 p-2">
                  <strong>Validation Errors:</strong>
                  <ul className="mb-0 mt-2">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </Alert>
              ) : (
                <Alert variant="success" className="my-0 p-2">
                  ✓ Valid structure!
                </Alert>
              )}
            </>
          )}
        </div>
        <div className="text-editor-buttons">
          <div className="d-flex mb-2">
            <Button
              variant="info"
              onClick={handleAddHeading}
              title="Insert heading template at cursor"
              className="w-100 mx-1 mt-2"
              data-testid="add-heading-template"
            >
              New Heading Template
            </Button>
            <Button
              variant="info"
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
              variant={copySuccess ? "success" : "secondary"}
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
      </div>
    </section>
  );
};

export default TextEditor;
