import { EVALUATOR_TABS, type EvaluatorTab } from "@/features/evaluator-builder/tabs";
import type { EvaluatorDraft } from "./types";

export type ValidationResult = {
  isValid: boolean;
  errorsByTab: Partial<Record<EvaluatorTab, string[]>>;
};

export function validateEvaluatorDraft(draft: EvaluatorDraft): ValidationResult {
  const errorsByTab: ValidationResult["errorsByTab"] = {};

  if (!draft.instructions.trim()) {
    errorsByTab.Instructions = [
      ...(errorsByTab.Instructions ?? []),
      "Instructions are required.",
    ];
  }

  if (!draft.desiredOutcome.trim()) {
    errorsByTab.Outcome = [
      ...(errorsByTab.Outcome ?? []),
      "Desired outcome is required.",
    ];
  }

  if (draft.metricsGraph.nodes.length === 0) {
    errorsByTab.Metrics = [
      ...(errorsByTab.Metrics ?? []),
      "At least one metric node is required.",
    ];
  }

  if (draft.metricsGraph.edges.length === 0) {
    errorsByTab.Metrics = [
      ...(errorsByTab.Metrics ?? []),
      "At least one edge is required to connect metric flow.",
    ];
  }

  if (draft.personality.traits.length === 0) {
    errorsByTab.Personality = [
      ...(errorsByTab.Personality ?? []),
      "At least one personality trait is required.",
    ];
  }

  if (!draft.profile.title.trim()) {
    errorsByTab.Profile = [
      ...(errorsByTab.Profile ?? []),
      "Profile title is required.",
    ];
  }

  if (!draft.profile.description.trim()) {
    errorsByTab.Profile = [
      ...(errorsByTab.Profile ?? []),
      "Profile description is required.",
    ];
  }

  const isValid = EVALUATOR_TABS.every((tab) => (errorsByTab[tab] ?? []).length === 0);
  return { isValid, errorsByTab };
}

