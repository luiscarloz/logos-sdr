export enum FlowStep {
  GREETING = 'greeting',
  QUALIFICATION = 'qualification',
  NEEDS_DISCOVERY = 'needs_discovery',
  RECOMMENDATION = 'recommendation',
  OBJECTION_HANDLING = 'objection_handling',
  SCHEDULING = 'scheduling',
  HANDOFF = 'handoff',
  NURTURING = 'nurturing',
}

// Valid transitions: from -> allowed next steps
const TRANSITIONS: Record<string, string[]> = {
  [FlowStep.GREETING]: [FlowStep.QUALIFICATION, FlowStep.GREETING],
  [FlowStep.QUALIFICATION]: [
    FlowStep.NEEDS_DISCOVERY,
    FlowStep.QUALIFICATION,
    FlowStep.NURTURING,
  ],
  [FlowStep.NEEDS_DISCOVERY]: [
    FlowStep.RECOMMENDATION,
    FlowStep.NEEDS_DISCOVERY,
    FlowStep.QUALIFICATION,
  ],
  [FlowStep.RECOMMENDATION]: [
    FlowStep.SCHEDULING,
    FlowStep.OBJECTION_HANDLING,
    FlowStep.RECOMMENDATION,
    FlowStep.NEEDS_DISCOVERY,
  ],
  [FlowStep.OBJECTION_HANDLING]: [
    FlowStep.RECOMMENDATION,
    FlowStep.SCHEDULING,
    FlowStep.OBJECTION_HANDLING,
    FlowStep.NURTURING,
  ],
  [FlowStep.SCHEDULING]: [FlowStep.HANDOFF, FlowStep.SCHEDULING, FlowStep.OBJECTION_HANDLING],
  [FlowStep.HANDOFF]: [FlowStep.HANDOFF],
  [FlowStep.NURTURING]: [
    FlowStep.QUALIFICATION,
    FlowStep.NEEDS_DISCOVERY,
    FlowStep.NURTURING,
  ],
};

export function isValidTransition(from: string, to: string): boolean {
  const allowed = TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.includes(to);
}

export function resolveNextStep(currentStep: string, suggestedStep: string | null): string {
  if (!suggestedStep) return currentStep;
  if (isValidTransition(currentStep, suggestedStep)) return suggestedStep;
  return currentStep;
}
