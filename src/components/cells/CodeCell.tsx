import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import type { CellOutput } from '../../types';

interface CodeCellProps {
  code: string;
  onChange: (code: string) => void;
  onRun: () => void;
  isRunning: boolean;
  isDisabled: boolean;
  readOnly?: boolean;
  output?: CellOutput;
  label?: string;
}

export function CodeCell({
  code,
  onChange,
  onRun,
  isRunning,
  isDisabled,
  readOnly,
  output,
  label,
}: CodeCellProps) {
  return (
    <div className="code-cell">
      {label && <div className="cell-label">{label}</div>}
      <div className="code-cell-editor">
        <CodeMirror
          value={code}
          onChange={onChange}
          extensions={[javascript()]}
          theme={vscodeDark}
          readOnly={readOnly || isDisabled}
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            highlightActiveLine: !isDisabled,
          }}
          minHeight="60px"
          maxHeight="300px"
        />
      </div>
      <div className="code-cell-toolbar">
        <button
          className="run-button"
          onClick={onRun}
          disabled={isDisabled || isRunning}
        >
          {isRunning ? (
            <>
              <span className="spinner" /> Running...
            </>
          ) : (
            <>&#9654; Run</>
          )}
        </button>
      </div>
      {output && (
        <div className="code-cell-output">
          {output.logs && output.logs.length > 0 && (
            <div className="cell-logs">
              {output.logs.map((log, i) => (
                <div
                  key={i}
                  className={`log-line${log.startsWith('[ERROR]') ? ' log-error' : log.startsWith('[WARN]') ? ' log-warn' : ''}`}
                >
                  {log}
                </div>
              ))}
            </div>
          )}
          {output.data !== undefined && (
            <div className="cell-result">
              <span className="result-label">Result:</span>
              <pre>{typeof output.data === 'object' ? JSON.stringify(output.data, null, 2) : String(output.data)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
