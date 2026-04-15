import { useCallback } from 'react';

export interface ExecutionScope {
  [key: string]: unknown;
}

interface ExecutionResult {
  result: unknown;
  logs: string[];
}

export function useCodeExecution() {
  const execute = useCallback(
    async (code: string, scope: ExecutionScope): Promise<ExecutionResult> => {
      const logs: string[] = [];
      const captureConsole = {
        log: (...args: unknown[]) => {
          logs.push(
            args
              .map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)))
              .join(' ')
          );
        },
        error: (...args: unknown[]) => {
          logs.push(
            '[ERROR] ' +
              args
                .map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)))
                .join(' ')
          );
        },
        warn: (...args: unknown[]) => {
          logs.push(
            '[WARN] ' +
              args
                .map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)))
                .join(' ')
          );
        },
      };

      const scopeWithConsole = { ...scope, console: captureConsole };
      const scopeKeys = Object.keys(scopeWithConsole);
      const scopeValues = Object.values(scopeWithConsole);

      const wrappedCode = `
        return (async () => {
          ${code}
        })();
      `;

      try {
        const fn = new Function(...scopeKeys, wrappedCode);
        const result = await fn(...scopeValues);
        return { result, logs };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logs.push(`[ERROR] ${message}`);
        throw err;
      }
    },
    []
  );

  return { execute };
}
