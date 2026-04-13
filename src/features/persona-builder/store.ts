import { create } from "zustand";
import type { PersonaDraft } from "@/lib/persona/types";

type PersonaBuilderState = {
  status: "idle" | "loading" | "saving" | "error" | "ready";
  setStatus: (status: PersonaBuilderState["status"]) => void;

  name: string;
  role: string;
  description: string;
  defaultVoice: string;
  speakingRate: number;
  tone: string;
  modifiers: PersonaDraft["modifiers"];
  scenarioCards: PersonaDraft["scenarioCards"];

  setField: (
    key:
      | "name"
      | "role"
      | "description"
      | "defaultVoice"
      | "speakingRate"
      | "tone",
    value: string | number,
  ) => void;
  toggleModifier: (key: string) => void;
  updateScenarioCard: (id: string, summary: string) => void;

  hydrate: (draft: PersonaDraft) => void;
  toDraft: (id: string) => PersonaDraft;
};

export const usePersonaBuilderStore = create<PersonaBuilderState>((set) => ({
  status: "idle",
  setStatus: (status) => set({ status }),

  name: "",
  role: "",
  description: "",
  defaultVoice: "",
  speakingRate: 1,
  tone: "Neutral",
  modifiers: [],
  scenarioCards: [],

  setField: (key, value) => set({ [key]: value } as Partial<PersonaBuilderState>),
  toggleModifier: (key) =>
    set((state) => ({
      modifiers: state.modifiers.map((modifier) =>
        modifier.key === key
          ? { ...modifier, enabled: !modifier.enabled }
          : modifier,
      ),
    })),
  updateScenarioCard: (id, summary) =>
    set((state) => ({
      scenarioCards: state.scenarioCards.map((card) =>
        card.id === id ? { ...card, summary } : card,
      ),
    })),

  hydrate: (draft) =>
    set({
      name: draft.name,
      role: draft.role,
      description: draft.description,
      defaultVoice: draft.defaultVoice,
      speakingRate: draft.speakingRate,
      tone: draft.tone,
      modifiers: draft.modifiers,
      scenarioCards: draft.scenarioCards,
      status: "ready",
    }),
  toDraft: (id) => {
    const state = usePersonaBuilderStore.getState();
    return {
      id,
      name: state.name,
      role: state.role,
      description: state.description,
      defaultVoice: state.defaultVoice,
      speakingRate: state.speakingRate,
      tone: state.tone,
      modifiers: state.modifiers,
      scenarioCards: state.scenarioCards,
      updatedAt: new Date().toISOString(),
    };
  },
}));

