import { useState, useCallback } from 'react';
import { server, parsers, utils } from '@passwordless-id/webauthn';
import type { FlowType, StepDefinition, TokenInfo, ColumnId, CellOutput } from '../types';
import { registrationSteps } from '../constants/registrationSteps';
import { authenticationSteps } from '../constants/authenticationSteps';
import { useFlowEngine } from '../hooks/useFlowEngine';
import { useCodeExecution } from '../hooks/useCodeExecution';
import { useCredentialStore } from '../context/CredentialStoreContext';
import { StepRow } from './StepRow';
import { CredentialStore } from './cells/CredentialStore';
import { FlowSelector } from './FlowSelector';

function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlToBuffer(str: string): ArrayBuffer {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - base64.length % 4);
  const binary = atob(base64 + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function getSteps(flow: FlowType): StepDefinition[] {
  return flow === 'registration' ? registrationSteps : authenticationSteps;
}

export function FlowRunner() {
  const [activeFlow, setActiveFlow] = useState<FlowType>('registration');
  const steps = getSteps(activeFlow);
  const engine = useFlowEngine(steps);
  const { execute } = useCodeExecution();
  const store = useCredentialStore();

  // Wire data overrides: when user edits wire JSON, store the override
  const [wireOverrides, setWireOverrides] = useState<Record<string, unknown>>({});
  // Token info per step
  const [tokenInfos, setTokenInfos] = useState<Record<string, TokenInfo | null>>({});

  const handleFlowChange = useCallback((flow: FlowType) => {
    setActiveFlow(flow);
    setWireOverrides({});
    setTokenInfos({});
  }, []);

  const handleReset = useCallback(() => {
    engine.resetFlow();
    setWireOverrides({});
    setTokenInfos({});
  }, [engine]);

  const handleWireEdit = useCallback((stepId: string, editedData: unknown) => {
    setWireOverrides(prev => ({ ...prev, [stepId]: editedData }));
  }, []);

  // Determine wire data for a step: either the override or the original from stepData
  const getWireData = useCallback((step: StepDefinition): unknown => {
    if (wireOverrides[step.id] !== undefined) return wireOverrides[step.id];
    // Wire shows the output of the step that produces data flowing through it
    if (step.direction === 'server-to-browser') {
      // Server produced data, wire shows it going to browser
      return engine.stepData[step.id];
    } else {
      // Browser produced data, wire shows it going to server
      // Find the source step — it's the step itself if browser has code,
      // or the previous step's output
      return engine.stepData[step.id];
    }
  }, [wireOverrides, engine.stepData]);

  // Get the step data, applying wire overrides so downstream steps see tampered data
  const getEffectiveStepData = useCallback((): Record<string, unknown> => {
    const effective = { ...engine.stepData };
    for (const [stepId, override] of Object.entries(wireOverrides)) {
      if (override !== undefined) {
        effective[stepId] = override;
      }
    }
    return effective;
  }, [engine.stepData, wireOverrides]);

  const extractTokenInfo = useCallback((result: unknown, step: StepDefinition): TokenInfo | null => {
    if (!result || typeof result !== 'object') return null;

    try {
      const reg = result as Record<string, unknown>;

      // For registration: parse from the registration response
      if (reg.response && typeof reg.response === 'object') {
        const response = reg.response as Record<string, unknown>;
        if (response.authenticatorData && typeof response.authenticatorData === 'string') {
          const parsed = parsers.parseAuthenticator(response.authenticatorData);
          return {
            aaguid: parsed.aaguid || 'N/A',
            name: step.id.includes('reg') ? 'Registered Authenticator' : 'Authenticator',
            counter: parsed.counter ?? 0,
            flags: {
              userPresent: parsed.flags?.userPresent ?? false,
              userVerified: parsed.flags?.userVerified ?? false,
              backupEligibility: parsed.flags?.backupEligibility ?? false,
              backupState: parsed.flags?.backupState ?? false,
            },
            transports: (reg as Record<string, unknown>).authenticatorAttachment
              ? [(reg as Record<string, unknown>).authenticatorAttachment as string]
              : undefined,
          };
        }
      }
    } catch {
      // If parsing fails, return minimal info
    }

    return null;
  }, []);

  const runStep = useCallback(
    async (stepId: string, columnId: ColumnId) => {
      const step = steps.find(s => s.id === stepId);
      if (!step) return;

      const stepIndex = steps.indexOf(step);

      // If re-running a completed step, reset everything after it
      if (engine.stepStates[stepId]?.status === 'completed') {
        engine.resetFrom(stepIndex);
      }

      engine.setStepRunning(stepId);

      const code = engine.getCode(stepId, columnId);
      const effectiveStepData = getEffectiveStepData();

      const scope = {
        server,
        parsers,
        utils,
        bufferToBase64url,
        base64urlToBuffer,
        stepData: effectiveStepData,
        credentials: store.credentials,
        addCredential: store.addCredential,
        updateCredential: store.updateCredential,
        navigator: window.navigator,
        window,
        TextEncoder,
      };

      try {
        const { result, logs } = await execute(code, scope);

        const outputs: Partial<Record<ColumnId, CellOutput>> = {};
        outputs[columnId] = {
          data: result,
          logs,
        };

        // Extract token info if this step has a token cell
        if (step.cells.token?.type === 'token-info') {
          const info = extractTokenInfo(result, step);
          setTokenInfos(prev => ({ ...prev, [stepId]: info }));
        }

        engine.completeStep(stepId, outputs, result);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        engine.failStep(stepId, message);
      }
    },
    [steps, engine, execute, store, getEffectiveStepData, extractTokenInfo]
  );

  // Determine which column has the runnable code for each step
  const getRunColumn = (step: StepDefinition): ColumnId | null => {
    if (step.cells.browser?.type === 'code') return 'browser';
    if (step.cells.server?.type === 'code') return 'server';
    return null;
  };

  return (
    <div className="flow-runner">
      <FlowSelector
        activeFlow={activeFlow}
        onFlowChange={handleFlowChange}
        onReset={handleReset}
      />

      <div className="steps-container">
        {steps.map((step, index) => {
          const isActive = index === engine.activeStepIndex;
          const isPending = index > engine.activeStepIndex;
          const runColumn = getRunColumn(step);

          return (
            <StepRow
              key={step.id}
              step={step}
              stepState={engine.stepStates[step.id]}
              isActive={isActive}
              isPending={isPending}
              browserCode={engine.getCode(step.id, 'browser')}
              serverCode={engine.getCode(step.id, 'server')}
              onBrowserCodeChange={code => engine.updateCode(step.id, 'browser', code)}
              onServerCodeChange={code => engine.updateCode(step.id, 'server', code)}
              onRunBrowser={() => runStep(step.id, 'browser')}
              onRunServer={() => runStep(step.id, 'server')}
              isRunning={engine.stepStates[step.id]?.status === 'running'}
              wireData={getWireData(step)}
              onWireEdit={data => handleWireEdit(step.id, data)}
              tokenInfo={tokenInfos[step.id] ?? null}
            />
          );
        })}
      </div>

      <CredentialStore />
    </div>
  );
}
