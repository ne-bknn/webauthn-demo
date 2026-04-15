import type { FlowType } from '../types';
import { useCredentialStore } from '../context/CredentialStoreContext';

interface FlowSelectorProps {
  activeFlow: FlowType;
  onFlowChange: (flow: FlowType) => void;
  onReset: () => void;
}

export function FlowSelector({ activeFlow, onFlowChange, onReset }: FlowSelectorProps) {
  const { credentials } = useCredentialStore();

  return (
    <div className="flow-selector">
      <button
        className={`flow-tab ${activeFlow === 'registration' ? 'flow-tab--active' : ''}`}
        onClick={() => onFlowChange('registration')}
      >
        Registration
      </button>
      <button
        className={`flow-tab ${activeFlow === 'authentication' ? 'flow-tab--active' : ''}`}
        onClick={() => onFlowChange('authentication')}
      >
        Authentication
        {credentials.length === 0 && (
          <span className="flow-tab-badge" title="No credentials stored">!</span>
        )}
      </button>
      <button className="reset-button" onClick={onReset}>
        Reset Flow
      </button>
    </div>
  );
}
