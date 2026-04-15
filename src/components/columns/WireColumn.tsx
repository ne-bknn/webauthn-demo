import { JsonViewer } from '../cells/JsonViewer';
import type { CellDefinition, FlowDirection } from '../../types';

interface WireColumnProps {
  cell?: CellDefinition;
  data: unknown;
  direction: FlowDirection;
  onEdit?: (editedData: unknown) => void;
}

export function WireColumn({ cell, data, direction, onEdit }: WireColumnProps) {
  if (!cell || cell.type === 'empty') {
    return <div className="column-cell column-cell--empty" />;
  }

  const arrowDirection =
    direction === 'server-to-browser' ? 'left-to-right' as const : 'right-to-left' as const;

  return (
    <div className="column-cell column-cell--wire">
      <span className="column-badge column-badge--wire">Wire</span>
      <JsonViewer
        data={data}
        direction={arrowDirection}
        label={cell.label}
        editable={true}
        onEdit={onEdit}
      />
    </div>
  );
}
