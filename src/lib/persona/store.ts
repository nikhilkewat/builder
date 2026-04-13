import { EMPTY_PERSONA_DRAFT, type PersonaDraft } from "./types";

const personaStore = new Map<string, PersonaDraft>();

export function getPersonaDraft(id: string): PersonaDraft {
  return personaStore.get(id) ?? EMPTY_PERSONA_DRAFT(id);
}

export function savePersonaDraft(input: PersonaDraft): PersonaDraft {
  const nextDraft: PersonaDraft = {
    ...input,
    updatedAt: new Date().toISOString(),
  };
  personaStore.set(input.id, nextDraft);
  return nextDraft;
}

export function listPersonaDrafts(limit = 20): PersonaDraft[] {
  return [...personaStore.values()]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit);
}

export function countPersonas(): number {
  return personaStore.size;
}

