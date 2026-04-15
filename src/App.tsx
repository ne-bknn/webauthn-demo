import { CredentialStoreProvider } from './context/CredentialStoreContext';
import { FlowRunner } from './components/FlowRunner';
import './App.css';

function App() {
  return (
    <CredentialStoreProvider>
      <div className="app">
        <header className="app-header">
          <h1>WebAuthn / FIDO2 Interactive Demo</h1>
          <p className="app-subtitle">
            Explore the WebAuthn registration and authentication flows step by step.
            Edit code, tamper with wire data, and see what happens.
          </p>
        </header>
        <main className="app-main">
          <FlowRunner />
        </main>
      </div>
    </CredentialStoreProvider>
  );
}

export default App;
