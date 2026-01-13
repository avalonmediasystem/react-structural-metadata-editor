
import jsonSourceMap from '@mischnic/json-sourcemap';
import { linter } from '@codemirror/lint';
import { EditorState } from '@codemirror/state';
import Ajv from 'ajv';

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

/**
 * Custom linter extension for CodeMirror for JSON validation using AJV schema validator.
 * @param {Function} updateValidationState - callback to update validation state
 * @returns {Extension} CodeMirror linter extension
 */
export const createCustomJsonLinter = (updateValidationState) => linter((view) => {
  // Get JSON from text editor
  const content = view.state.doc.toString();

  // Quick JSON syntax check to avoid heavy validation below
  try {
    JSON.parse(content);
  } catch (error) {
    const errorMessage = error && error.message ? error.message : 'Invalid JSON';
    updateValidationState(false, [`JSON Syntax Error: ${errorMessage}`]);
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
        } else if (error.keyword === 'minLength' && error.schemaPath.includes('label')) {
          message = 'Label needs to be at least 2 characters long';
        } else if (error.keyword === 'pattern') {
          const [_, __, fieldName,] = error.schemaPath.split('/');
          message = `Invalid "${fieldName}" time format (expected HH:MM:SS.mmm or similar)`;
        } else if (error.keyword === 'minItems') {
          message = 'Must have at least one child item';
        } else if (error.keyword === 'enum') {
          const [_, __, fieldName,] = error.schemaPath.split('/');
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
      updateValidationState(isValidResult, errorMessages);

      return uniqueDiagnostics;
    } else {
      // Valid JSON with no schema errors
      updateValidationState(true, []);
      return [];
    }
  } catch (error) {
    // Extra layer of error handling for validation, however this would hardly get invoked
    // since JSON syntax gets pre-validated.
    console.error('Unexpected error in schema validation:', error);
    return [];
  }
});

/**
 * Find all positions of "id" properties in the JSON document using syntax tree
 * @param {EditorState} state - CodeMirror editor state
 * @returns {Array<number>} flat array of [from1, to1, from2, to2, ...] for read-only ranges
 */
const findIdPropertyRanges = (doc) => {
  const readOnlyProperties = ["id"];
  const ranges = [];
  const text = doc.toString();

  // Regex to find property keys in JSON
  const propRegex = /"(\w+)"\s*:/g;
  let match;
  while ((match = propRegex.exec(text)) !== null) {
    if (readOnlyProperties.includes(match[1])) {
      // Mark the text index range for the property key and value as read-only
      const line = doc.lineAt(match.index);
      ranges.push(line.from, line.to);
    }
  }
  // This a flat array of [from1, to1, from2, to2,..]
  return ranges;
};

/**
 * Custom extension to make "id" fields read-only.
 * Implements an EditorState.changeFilter function that checks if the attempted user
 * change (transaction) overlaps with any of the defined read-only text ranges.
 * @returns {Extension} CodeMirror changeFilter extension
 */
export const createReadOnlyIdExtension = () => {
  return EditorState.changeFilter.of((tr) => {
    // Only filter user-generated changes, not programmatic ones
    if (!tr.docChanged) return true;

    // Get all id property key/value text index ranges
    const readOnlyRanges = findIdPropertyRanges(tr.startState.doc);

    // Check if the current change overlaps with a read-only text index range
    let hasConflict = false;
    tr.changes.iterChangedRanges((chFrom, chTo) => {
      // Calculate if this is a multi-line item removal
      const startLine = tr.startState.doc.lineAt(chFrom);
      const startChars = startLine.text.trim();
      const endLine = tr.startState.doc.lineAt(chTo);
      const endChars = endLine.text.trim();
      const isItemDeletion = endLine.number > startLine.number
        && startChars.endsWith('{') && endChars.endsWith('},');
      // Skip conflict check for removing an entire item
      if (isItemDeletion) return;

      for (let i = 0; i < readOnlyRanges.length; i += 2) {
        const roFrom = readOnlyRanges[i];
        const roTo = readOnlyRanges[i + 1];
        if (chTo > roFrom && chFrom < roTo) {
          hasConflict = true;
          break;
        }
      }
    });
    return !hasConflict;
  });
};
