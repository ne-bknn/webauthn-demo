import type { TokenInfo } from '../../types';

interface TokenCardProps {
  info: TokenInfo | null;
  label?: string;
}

export function TokenCard({ info, label }: TokenCardProps) {
  if (!info) {
    return <div className="token-card token-card--empty" />;
  }

  return (
    <div className="token-card">
      {label && <div className="cell-label">{label}</div>}
      <div className="token-card-content">
        {(info.iconLight || info.iconDark) && (
          <img
            className="token-icon"
            src={info.iconDark || info.iconLight}
            alt={info.name}
          />
        )}
        <div className="token-field">
          <span className="token-field-label">Name</span>
          <span className="token-field-value">{info.name || 'Unknown'}</span>
        </div>
        <div className="token-field">
          <span className="token-field-label">AAGUID</span>
          <span className="token-field-value token-mono">{info.aaguid || 'N/A'}</span>
        </div>
        <div className="token-field">
          <span className="token-field-label">Counter</span>
          <span className="token-field-value">{info.counter}</span>
        </div>
        {info.transports && info.transports.length > 0 && (
          <div className="token-field">
            <span className="token-field-label">Transports</span>
            <span className="token-field-value">
              {info.transports.map(t => (
                <span key={t} className="token-tag">{t}</span>
              ))}
            </span>
          </div>
        )}
        {info.flags && (
          <div className="token-flags">
            <span className="token-field-label">Flags</span>
            <div className="token-flag-list">
              <span className={`token-flag ${info.flags.userPresent ? 'flag-on' : 'flag-off'}`}>
                UP
              </span>
              <span className={`token-flag ${info.flags.userVerified ? 'flag-on' : 'flag-off'}`}>
                UV
              </span>
              <span className={`token-flag ${info.flags.backupEligibility ? 'flag-on' : 'flag-off'}`}>
                BE
              </span>
              <span className={`token-flag ${info.flags.backupState ? 'flag-on' : 'flag-off'}`}>
                BS
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
