"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createReadOnlyIdExtension = exports.createCustomJsonLinter = void 0;
var _jsonSourcemap = _interopRequireDefault(require("@mischnic/json-sourcemap"));
var _lint = require("@codemirror/lint");
var _state = require("@codemirror/state");
var _ajv = _interopRequireDefault(require("ajv"));
// JSON Schema for structural metadata validation
var schema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  required: ["type", "label"],
  properties: {
    type: {
      type: "string",
      "enum": ["div", "span", "root"],
      description: "Element type: 'div' for headings / 'span' for timespans"
    },
    label: {
      type: "string",
      minLength: 2,
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
      type: "array",
      minItems: 1,
      description: "Child elements (required for headings with at least one item)",
      items: {
        $ref: "#"
      }
    }
  },
  allOf: [{
    // If type is "div", items must be present with at least one element
    "if": {
      properties: {
        type: {
          "const": "div"
        }
      }
    },
    then: {
      required: ["items"],
      properties: {
        items: {
          type: "array",
          minItems: 1
        }
      }
    }
  }, {
    // If type is "span", begin and end must be present
    "if": {
      properties: {
        type: {
          "const": "span"
        }
      }
    },
    then: {
      required: ["begin", "end"]
    }
  }]
};

// Create AJV instance and compile the JSON schema
var ajv = new _ajv["default"]({
  allErrors: true,
  verbose: true
});
var validateSchema = ajv.compile(schema);

/**
 * Custom linter extension for CodeMirror for JSON validation using AJV schema validator.
 * @param {Function} updateValidationState - callback to update validation state
 * @returns {Extension} CodeMirror linter extension
 */
var createCustomJsonLinter = exports.createCustomJsonLinter = function createCustomJsonLinter(updateValidationState) {
  return (0, _lint.linter)(function (view) {
    // Get JSON from text editor
    var content = view.state.doc.toString();

    // Quick JSON syntax check to avoid heavy validation below
    try {
      JSON.parse(content);
    } catch (error) {
      var errorMessage = error && error.message ? error.message : 'Invalid JSON';
      updateValidationState(false, ["JSON Syntax Error: ".concat(errorMessage)]);
      return [];
    }

    // When JSON is valid, proceed with schema validation
    var diagnostics = [];
    try {
      // Parse JSON data with source map
      var parsedJson = _jsonSourcemap["default"].parse(content);
      var data = parsedJson.data;
      var pointers = parsedJson.pointers;

      // Validate using AJV schema
      var valid = validateSchema(data);
      if (!valid && validateSchema.errors) {
        // Convert AJV errors to CodeMirror diagnostics
        validateSchema.errors.forEach(function (error) {
          // Skip generic conditional schema errors (if/then/else) as they're redundant
          if (error.keyword === 'if' || error.keyword === 'then' || error.keyword === 'else') {
            return;
          }
          var message = error.message;

          // Get the JSON pointer for the error location
          var errorPath = error.instancePath;
          if (errorPath === undefined && error.dataPath !== undefined) {
            // Fallback to 'dataPath' for post ajv v8 compatibility
            errorPath = convertDataPathToInstancePath(error.dataPath);
          }
          var pointer = pointers[errorPath];
          // Initialize lineNumber to current line with the cursor or 1
          var lineNumber = view.state.doc.lineAt(view.state.selection.main.head).number || 1;
          // Read line number from source map if it exists. These line numbers are 0-indexed
          if (pointer) lineNumber = pointer.value.line + 1;
          var line = view.state.doc.line(lineNumber);

          // Customize error messages based on error type
          if (error.keyword === 'required') {
            var missingProp = error.params.missingProperty;
            message = "Missing required \"".concat(missingProp, "\" field");
          } else if (error.keyword === 'minLength' && error.schemaPath.includes('label')) {
            message = 'Label needs to be at least 2 characters long';
          } else if (error.keyword === 'pattern') {
            var fieldName = errorPath.split('/').pop();
            message = "Invalid \"".concat(fieldName, "\" time format (expected HH:MM:SS.mmm or similar)");
          } else if (error.keyword === 'minItems') {
            message = 'Must have at least one child item';
          } else if (error.keyword === 'enum') {
            var _fieldName = errorPath.split('/').pop();
            message = "Invalid value for \"".concat(_fieldName, "\". Must be one of: ").concat(error.params.allowedValues.join(', '));
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
        var diagnosticFrom = [];
        var uniqueDiagnostics = diagnostics.filter(function (d) {
          if (diagnosticFrom.includes(d.from)) {
            return false;
          } else {
            diagnosticFrom.push(d.from);
            return true;
          }
        });

        // Convert diagnostics to error messages with line numbers for the sidebar
        var errorMessages = uniqueDiagnostics.map(function (d) {
          var line = view.state.doc.lineAt(d.from);
          return "Line ".concat(line.number, ": ").concat(d.message);
        });

        // Update validation state with debouncing
        var isValidResult = uniqueDiagnostics.length === 0;
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
};

/**
 * Convert legacy property 'dataPath' value for the location of the failing data in the schema
 * from array bracket format to JSON pointer format, which aligns with the newer property
 * 'instancePath' format in ajv v8+.
 * Pre v8 uses dot notation with array brackets: .items[0].label and
 * ajv v8+ uses JSON Pointer format: /items/0/label
 * @param {String} dataPath pre ajv@8.x 'dataPath' (e.g., ".items[0].label")
 * @returns {String} JSON Pointer format (e.g., "/items/0/label")
 */
function convertDataPathToInstancePath(dataPath) {
  if (!dataPath || dataPath === '') {
    return '';
  }
  var path = dataPath.startsWith('.') ? dataPath.slice(1) : dataPath;
  // Replace array bracket notation [N] with /N
  path = path.replace(/\[(\d+)\]/g, '/$1');
  path = path.replace(/\./g, '/');
  if (path && !path.startsWith('/')) {
    path = '/' + path;
  }
  return path;
}

/**
 * Find all positions of "id" properties in the JSON document using syntax tree
 * @param {EditorState} state - CodeMirror editor state
 * @returns {Array<number>} flat array of [from1, to1, from2, to2, ...] for read-only ranges
 */
var findIdPropertyRanges = function findIdPropertyRanges(doc) {
  var readOnlyProperties = ["id"];
  var ranges = [];
  var text = doc.toString();

  // Regex to find property keys in JSON
  var propRegex = /"(\w+)"\s*:/g;
  var match;
  while ((match = propRegex.exec(text)) !== null) {
    if (readOnlyProperties.includes(match[1])) {
      // Mark the text index range for the property key and value as read-only
      var line = doc.lineAt(match.index);
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
var createReadOnlyIdExtension = exports.createReadOnlyIdExtension = function createReadOnlyIdExtension() {
  return _state.EditorState.changeFilter.of(function (tr) {
    // Only filter user-generated changes, not programmatic ones
    if (!tr.docChanged) return true;

    // Get all id property key/value text index ranges
    var readOnlyRanges = findIdPropertyRanges(tr.startState.doc);

    // Check if the current change overlaps with a read-only text index range
    var hasConflict = false;
    tr.changes.iterChangedRanges(function (chFrom, chTo) {
      // Calculate if this is a multi-line item removal
      var startLine = tr.startState.doc.lineAt(chFrom);
      var startChars = startLine.text.trim();
      var endLine = tr.startState.doc.lineAt(chTo);
      var endChars = endLine.text.trim();
      var isItemDeletion = endLine.number > startLine.number && startChars.endsWith('{') && endChars.endsWith('},');
      // Skip conflict check for removing an entire item
      if (isItemDeletion) return;
      for (var i = 0; i < readOnlyRanges.length; i += 2) {
        var roFrom = readOnlyRanges[i];
        var roTo = readOnlyRanges[i + 1];
        if (chTo > roFrom && chFrom < roTo) {
          hasConflict = true;
          break;
        }
      }
    });
    return !hasConflict;
  });
};