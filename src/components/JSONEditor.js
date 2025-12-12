import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { lineNumbers, EditorView } from '@codemirror/view';
import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import '../styles/json-editor.css';
import { useStructureUpdate } from '../services/sme-hooks';

const JsonEditor = ({ initialJson = null, readOnly = false }) => {
  const [jsonContent, setJsonContent] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const idMapRef = useRef(new Map());

  const { updateStructure } = useStructureUpdate();

  /**
   * Remove id from displayed JSON structure
   */
  const removeIds = useCallback((data) => {
    if (!data) return data;

    const filterIds = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map(filterIds);
      } else if (obj && typeof obj === 'object') {
        const { id, timeRange, nestedSpan, valid, ...rest } = obj;
        if (rest.items?.length === 0) delete rest.items;
        const filtered = {};
        for (const key in rest) {
          filtered[key] = filterIds(rest[key]);
        }
        return filtered;
      }
      return obj;
    };

    return filterIds(data);
  }, []);

  /**
   * Store original id mappings before removing
   */
  const createIdMap = useCallback((data) => {
    const idMap = new Map();

    const traverse = (obj, path = []) => {
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => traverse(item, [...path, index]));
      } else if (obj && typeof obj === 'object') {
        if (obj.id) {
          idMap.set(path.join('.'), obj.id);
        }
        if (obj.items) {
          traverse(obj.items, [...path, 'items']);
        }
      }
    };

    traverse(data);
    return idMap;
  }, []);

  /**
   * Restore ids onto edited data before saving it back to the 
   * Redux store
   */
  const restoreIds = useCallback((editedData, idMap) => {
    const restore = (obj, path = []) => {
      if (Array.isArray(obj)) {
        return obj.map((item, index) => restore(item, [...path, index]));
      } else if (obj && typeof obj === 'object') {
        const pathKey = path.join('.');
        const id = idMap.get(pathKey);
        const restored = { ...obj };
        if (id) {
          restored.id = id;
        }
        if (restored.items) {
          restored.items = restore(restored.items, [...path, 'items']);
        }
        return restored;
      }
      return obj;
    };

    return restore(editedData);
  }, []);

  // Handle export to clipboard
  const handleExport = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(jsonContent);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }, [jsonContent]);

  /**
   * Handle save action. This updates the Redux store with the latest
   * JSON from the text editor, which re-renders the visual editor
   * on the other tab.
   */
  const handleSave = useCallback(() => {
    try {
      const parsedData = JSON.parse(jsonContent);
      // Restore ids to the edited data
      const withIds = restoreIds(parsedData, idMapRef.current);
      updateStructure([withIds]);
    } catch (error) {
      console.error('Failed to parse JSON:', error);
    }
  }, [jsonContent, restoreIds]);

  /**
   * Handle text changes in the editor
   */
  const handleChange = useCallback((value) => {
    setJsonContent(value);
  }, []);

  useEffect(() => {
    if (initialJson) {
      // Create id map before filtering
      idMapRef.current = createIdMap(initialJson);
      // Filter ids and other extra properties for display
      const filtered = removeIds(initialJson);
      // Format filtered data
      const formatted = formatJson(filtered);
      setJsonContent(formatted);
    }
  }, [initialJson, formatJson, createIdMap, removeIds]);

  /**
   * Format JSON with 2-space indentation for displaying in the text editor
   */
  const formatJson = useCallback((data) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return 'Error formatting JSON structure..';
    }
  }, []);

  return (
    <div className="json-editor-container">
      <div className="json-editor-buttons">
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={readOnly}
          title="Save JSON changes"
          className="w-100 mx-1"
        >
          Save JSON
        </Button>
        <Button
          variant={copySuccess ? "success" : "secondary"}
          onClick={handleExport}
          title="Copy JSON to clipboard"
          className="w-100 mx-1"
        >
          {copySuccess ? "Copied!" : "Copy JSON"}
        </Button>
      </div>
      <div className="json-editor-main">
        <CodeMirror
          value={jsonContent}
          theme={"light"}
          extensions={[
            json(),
            lineNumbers(),
            syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
            EditorView.lineWrapping,
            EditorView.editable.of(true),
          ]}
          onChange={handleChange}
          readOnly={false}
        />
      </div>
    </div>
  );
};

export default JsonEditor;
