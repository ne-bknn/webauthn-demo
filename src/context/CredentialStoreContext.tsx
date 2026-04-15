import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { StoredCredential } from '../types';

interface CredentialStoreValue {
  credentials: StoredCredential[];
  addCredential: (cred: StoredCredential) => void;
  updateCredential: (id: string, updates: Partial<StoredCredential>) => void;
  clearCredentials: () => void;
}

const CredentialStoreContext = createContext<CredentialStoreValue | null>(null);

export function CredentialStoreProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<StoredCredential[]>([]);

  const addCredential = useCallback((cred: StoredCredential) => {
    setCredentials(prev => [...prev, cred]);
  }, []);

  const updateCredential = useCallback((id: string, updates: Partial<StoredCredential>) => {
    setCredentials(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const clearCredentials = useCallback(() => {
    setCredentials([]);
  }, []);

  return (
    <CredentialStoreContext.Provider
      value={{ credentials, addCredential, updateCredential, clearCredentials }}
    >
      {children}
    </CredentialStoreContext.Provider>
  );
}

export function useCredentialStore() {
  const ctx = useContext(CredentialStoreContext);
  if (!ctx) throw new Error('useCredentialStore must be used within CredentialStoreProvider');
  return ctx;
}
