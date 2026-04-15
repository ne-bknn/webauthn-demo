import type { StepDefinition, StepState, CellOutput, TokenInfo, ColumnId } from '../types';
import { TokenColumn } from './columns/TokenColumn';
import { BrowserColumn } from './columns/BrowserColumn';
import { WireColumn } from './columns/WireColumn';
import { ServerColumn } from './columns/ServerColumn';

interface StepRowProps {
  step: StepDefinition;
  stepState?: StepState;
  isActive: boolean;
  isPending: boolean;
  browserCode: string;
  serverCode: string;
  onBrowserCodeChange: (code: string) => void;
  onServerCodeChange: (code: string) => void;
  onRunBrowser: () => void;
  onRunServer: () => void;
  isRunning: boolean;
  wireData: unknown;
  onWireEdit: (editedData: unknown) => void;
  tokenInfo: TokenInfo | null;
}

export function StepRow({
  step,
  stepState,
  isActive,
  isPending,
  browserCode,
  serverCode,
  onBrowserCodeChange,
  onServerCodeChange,
  onRunBrowser,
  onRunServer,
  isRunning,
  wireData,
  onWireEdit,
  tokenInfo,
}: StepRowProps) {
  const status = stepState?.status ?? 'pending';
  const statusClass =
    status === 'completed'
      ? 'step-row--completed'
      : status === 'error'
        ? 'step-row--error'
        : isActive
          ? 'step-row--active'
          : 'step-row--pending';

  const browserOutput: CellOutput | undefined = stepState?.outputs?.browser;
  const serverOutput: CellOutput | undefined = stepState?.outputs?.server;

  const renderColumn = (col: ColumnId) => {
    switch (col) {
      case 'token':
        return <TokenColumn key="token" cell={step.cells.token} tokenInfo={tokenInfo} />;
      case 'browser':
        return (
          <BrowserColumn
            key="browser"
            cell={step.cells.browser}
            code={browserCode}
            onCodeChange={onBrowserCodeChange}
            onRun={onRunBrowser}
            isRunning={isRunning}
            isDisabled={isPending}
            output={browserOutput}
          />
        );
      case 'wire':
        return (
          <WireColumn
            key="wire"
            cell={step.cells.wire}
            data={wireData}
            direction={step.direction}
            onEdit={onWireEdit}
          />
        );
      case 'server':
        return (
          <ServerColumn
            key="server"
            cell={step.cells.server}
            code={serverCode}
            onCodeChange={onServerCodeChange}
            onRun={onRunServer}
            isRunning={isRunning}
            isDisabled={isPending}
            output={serverOutput}
          />
        );
    }
  };

  return (
    <div className={`step-row ${statusClass}`}>
      <div className="step-label">
        <span className="step-label-text">{step.label}</span>
        <span className="step-description">{step.description}</span>
        {status === 'error' && stepState?.error && (
          <span className="step-error">{stepState.error}</span>
        )}
      </div>
      <div
        className="step-cells"
        style={{ gridTemplateColumns: `repeat(${step.activeColumns.length}, 1fr)` }}
      >
        {step.activeColumns.map(col => renderColumn(col))}
      </div>
    </div>
  );
}
