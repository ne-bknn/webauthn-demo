import { useCredentialStore } from '../../context/CredentialStoreContext';

export function CredentialStore() {
  const { credentials, clearCredentials } = useCredentialStore();

  return (
    <div className="credential-store">
      <div className="credential-store-header">
        <h3>Server Storage</h3>
        {credentials.length > 0 && (
          <button className="clear-button" onClick={clearCredentials}>
            Clear All
          </button>
        )}
      </div>
      {credentials.length === 0 ? (
        <div className="credential-store-empty">
          No credentials stored. Complete a registration flow first.
        </div>
      ) : (
        <div className="credential-list">
          {credentials.map(cred => (
            <div key={cred.id} className="credential-item">
              <div className="credential-field">
                <span className="credential-field-label">User</span>
                <span className="credential-field-value">{cred.user.name}</span>
              </div>
              <div className="credential-field">
                <span className="credential-field-label">Credential ID</span>
                <span className="credential-field-value credential-mono">
                  {cred.id.slice(0, 20)}...
                </span>
              </div>
              <div className="credential-field">
                <span className="credential-field-label">Algorithm</span>
                <span className="credential-field-value">{cred.algorithm}</span>
              </div>
              <div className="credential-field">
                <span className="credential-field-label">Counter</span>
                <span className="credential-field-value">{cred.counter}</span>
              </div>
              {cred.authenticatorName && (
                <div className="credential-field">
                  <span className="credential-field-label">Authenticator</span>
                  <span className="credential-field-value">{cred.authenticatorName}</span>
                </div>
              )}
              <div className="credential-field">
                <span className="credential-field-label">Registered</span>
                <span className="credential-field-value">
                  {new Date(cred.registeredAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
