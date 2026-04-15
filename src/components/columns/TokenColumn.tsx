import { TokenCard } from '../cells/TokenCard';
import type { TokenInfo, CellDefinition } from '../../types';

interface TokenColumnProps {
  cell?: CellDefinition;
  tokenInfo: TokenInfo | null;
}

export function TokenColumn({ cell, tokenInfo }: TokenColumnProps) {
  if (!cell || cell.type === 'empty') {
    return <div className="column-cell column-cell--empty" />;
  }

  return (
    <div className="column-cell column-cell--token">
      <span className="column-badge column-badge--token">Token</span>
      <TokenCard info={tokenInfo} label={cell.label} />
    </div>
  );
}
