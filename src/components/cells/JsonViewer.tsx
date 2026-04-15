import { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json as jsonLang } from '@codemirror/lang-json';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';

interface JsonViewerProps {
  data: unknown;
  direction?: 'left-to-right' | 'right-to-left';
  label?: string;
  editable?: boolean;
  onEdit?: (editedData: unknown) => void;
}

export function JsonViewer({ data, direction, label, editable, onEdit }: JsonViewerProps) {
  const json = data === undefined || data === null
    ? ''
    : typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  const [editedJson, setEditedJson] = useState(json);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isEdited, setIsEdited] = useState(false);

  useEffect(() => {
    setEditedJson(json);
    setIsEdited(false);
    setParseError(null);
  }, [json]);

  if (!data && data !== 0 && data !== false) {
    return <div className="json-viewer json-viewer--empty" />;
  }

  const handleChange = (value: string) => {
    setEditedJson(value);
    setIsEdited(value !== json);
    try {
      JSON.parse(value);
      setParseError(null);
    } catch {
      setParseError('Invalid JSON');
    }
  };

  const handleApply = () => {
    try {
      const parsed = JSON.parse(editedJson);
      onEdit?.(parsed);
      setIsEdited(false);
      setParseError(null);
    } catch {
      setParseError('Invalid JSON');
    }
  };

  const handleReset = () => {
    setEditedJson(json);
    setIsEdited(false);
    setParseError(null);
    onEdit?.(data);
  };

  return (
    <div className={`json-viewer${isEdited ? ' json-viewer--edited' : ''}`}>
      {(label || direction) && (
        <div className="json-viewer-header">
          {direction === 'right-to-left' && <span className="direction-arrow">&#8592;</span>}
          {label && <span className="cell-label">{label}</span>}
          {direction === 'left-to-right' && <span className="direction-arrow">&#8594;</span>}
          {isEdited && <span className="edited-badge">modified</span>}
        </div>
      )}
      {editable ? (
        <>
          <CodeMirror
            value={editedJson}
            onChange={handleChange}
            extensions={[jsonLang()]}
            theme={vscodeDark}
            basicSetup={{
              lineNumbers: false,
              foldGutter: true,
              highlightActiveLine: true,
            }}
            minHeight="40px"
            maxHeight="300px"
          />
          {parseError && <div className="json-parse-error">{parseError}</div>}
          {isEdited && (
            <div className="json-edit-toolbar">
              <button className="json-apply-button" onClick={handleApply} disabled={!!parseError}>
                Apply Changes
              </button>
              <button className="json-reset-button" onClick={handleReset}>
                Reset
              </button>
            </div>
          )}
        </>
      ) : (
        <pre className="json-content">{json}</pre>
      )}
    </div>
  );
}
