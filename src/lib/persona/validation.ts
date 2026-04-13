import type { PersonaDraft } from "./types";

export type PersonaValidationResult = {
  isValid: boolean;
  errors: string[];
};

export function validatePersonaDraft(draft: PersonaDraft): PersonaValidationResult {
  const errors: string[] = [];

  if (!draft.name.trim()) {
    errors.push("Persona name is required.");
  }

  if (!draft.role.trim()) {
    errors.push("Persona role is required.");
  }

  if (!draft.description.trim()) {
    errors.push("Persona description is required.");
  }

  if (!draft.defaultVoice.trim()) {
    errors.push("Default voice is required.");
  }

  if (draft.scenarioCards.some((card) => !card.summary.trim())) {
    errors.push("Each persona scenario card needs a summary.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

