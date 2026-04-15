export type FlowType = 'registration' | 'authentication';

export type ColumnId = 'token' | 'browser' | 'wire' | 'server';

export type StepStatus = 'pending' | 'running' | 'completed' | 'error';

export type FlowDirection = 'server-to-browser' | 'browser-to-server';

export interface CellDefinition {
  type: 'code' | 'json' | 'token-info' | 'status' | 'empty';
  defaultCode?: string;
  readOnly?: boolean;
  label?: string;
}

export interface StepDefinition {
  id: string;
  label: string;
  description: string;
  direction: FlowDirection;
  activeColumns: ColumnId[];
  cells: Partial<Record<ColumnId, CellDefinition>>;
}

export interface CellOutput {
  data: unknown;
  displayJson?: string;
  logs?: string[];
}

export interface StepState {
  status: StepStatus;
  outputs: Partial<Record<ColumnId, CellOutput>>;
  error?: string;
}

export interface StoredCredential {
  id: string;
  publicKey: string;
  algorithm: string;
  transports: string[];
  user: { id: string; name: string; displayName?: string };
  registeredAt: number;
  counter: number;
  aaguid?: string;
  authenticatorName?: string;
}

export interface TokenInfo {
  aaguid: string;
  name: string;
  iconLight?: string;
  iconDark?: string;
  counter: number;
  flags?: {
    userPresent: boolean;
    userVerified: boolean;
    backupEligibility: boolean;
    backupState: boolean;
  };
  transports?: string[];
}
