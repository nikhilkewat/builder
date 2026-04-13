import { EMPTY_EVALUATOR_DRAFT, type EvaluatorDraft } from "./types";

const evaluatorStore = new Map<string, EvaluatorDraft>();

export function getEvaluatorDraft(id: string): EvaluatorDraft {
  return evaluatorStore.get(id) ?? EMPTY_EVALUATOR_DRAFT(id);
}

export function saveEvaluatorDraft(input: EvaluatorDraft): EvaluatorDraft {
  const nextDraft: EvaluatorDraft = {
    ...input,
    updatedAt: new Date().toISOString(),
  };
  evaluatorStore.set(input.id, nextDraft);
  return nextDraft;
}

export function listEvaluatorDrafts(limit = 20): EvaluatorDraft[] {
  return [...evaluatorStore.values()]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit);
}

export function countEvaluators(): number {
  return evaluatorStore.size;
}

