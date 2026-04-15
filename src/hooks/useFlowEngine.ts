import { useState, useCallback, useEffect, useRef } from 'react';
import type { StepDefinition, StepState, CellOutput, ColumnId } from '../types';

export function useFlowEngine(steps: StepDefinition[]) {
  const [stepStates, setStepStates] = useState<Record<string, StepState>>({});
  const [stepData, setStepData] = useState<Record<string, unknown>>({});
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [editedCode, setEditedCode] = useState<Record<string, string>>({});

  // Reset when steps change (flow switch)
  const prevStepsRef = useRef(steps);
  useEffect(() => {
    if (prevStepsRef.current !== steps) {
      prevStepsRef.current = steps;
      setStepStates({});
      setStepData({});
      setActiveStepIndex(0);
    }
  }, [steps]);

  const completeStep = useCallback(
    (stepId: string, outputs: Partial<Record<ColumnId, CellOutput>>, result: unknown) => {
      setStepStates(prev => ({
        ...prev,
        [stepId]: { status: 'completed', outputs },
      }));
      setStepData(prev => ({ ...prev, [stepId]: result }));
      setActiveStepIndex(prev => {
        const idx = steps.findIndex(s => s.id === stepId);
        return idx >= 0 ? Math.max(prev, idx + 1) : prev;
      });
    },
    [steps]
  );

  const setStepRunning = useCallback((stepId: string) => {
    setStepStates(prev => ({
      ...prev,
      [stepId]: { status: 'running', outputs: {} },
    }));
  }, []);

  const failStep = useCallback((stepId: string, error: string) => {
    setStepStates(prev => ({
      ...prev,
      [stepId]: { status: 'error', outputs: {}, error },
    }));
  }, []);

  const resetFrom = useCallback(
    (stepIndex: number) => {
      setStepStates(prev => {
        const next = { ...prev };
        for (let i = stepIndex; i < steps.length; i++) {
          delete next[steps[i].id];
        }
        return next;
      });
      setStepData(prev => {
        const next = { ...prev };
        for (let i = stepIndex; i < steps.length; i++) {
          delete next[steps[i].id];
        }
        return next;
      });
      setActiveStepIndex(stepIndex);
    },
    [steps]
  );

  const resetFlow = useCallback(() => {
    setStepStates({});
    setStepData({});
    setActiveStepIndex(0);
  }, []);

  const updateCode = useCallback((stepId: string, columnId: ColumnId, code: string) => {
    setEditedCode(prev => ({ ...prev, [`${stepId}:${columnId}`]: code }));
  }, []);

  const getCode = useCallback(
    (stepId: string, columnId: ColumnId): string => {
      const key = `${stepId}:${columnId}`;
      if (editedCode[key] !== undefined) return editedCode[key];
      const step = steps.find(s => s.id === stepId);
      return step?.cells[columnId]?.defaultCode ?? '';
    },
    [steps, editedCode]
  );

  return {
    steps,
    stepStates,
    stepData,
    activeStepIndex,
    completeStep,
    setStepRunning,
    failStep,
    resetFrom,
    resetFlow,
    updateCode,
    getCode,
  };
}
