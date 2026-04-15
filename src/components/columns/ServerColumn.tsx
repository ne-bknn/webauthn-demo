import { CodeCell } from '../cells/CodeCell';
import type { CellDefinition, CellOutput } from '../../types';

interface ServerColumnProps {
  cell?: CellDefinition;
  code: string;
  onCodeChange: (code: string) => void;
  onRun: () => void;
  isRunning: boolean;
  isDisabled: boolean;
  output?: CellOutput;
}

export function ServerColumn({
  cell,
  code,
  onCodeChange,
  onRun,
  isRunning,
  isDisabled,
  output,
}: ServerColumnProps) {
  if (!cell || cell.type === 'empty') {
    return <div className="column-cell column-cell--empty" />;
  }

  return (
    <div className="column-cell column-cell--server">
      <span className="column-badge column-badge--server">Server</span>
      <CodeCell
        code={code}
        onChange={onCodeChange}
        onRun={onRun}
        isRunning={isRunning}
        isDisabled={isDisabled}
        readOnly={cell.readOnly}
        output={output}
        label={cell.label}
      />
    </div>
  );
}
