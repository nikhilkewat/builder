export type PersonaDraft = {
  id: string;
  name: string;
  role: string;
  description: string;
  defaultVoice: string;
  speakingRate: number;
  tone: string;
  modifiers: Array<{
    key: string;
    enabled: boolean;
  }>;
  scenarioCards: Array<{
    id: string;
    title: string;
    summary: string;
  }>;
  updatedAt: string;
};

export const EMPTY_PERSONA_DRAFT = (id: string): PersonaDraft => ({
  id,
  name: "",
  role: "",
  description: "",
  defaultVoice: "",
  speakingRate: 1,
  tone: "Neutral",
  modifiers: [
    { key: "Interrupt politely", enabled: true },
    { key: "Stay compliant", enabled: true },
    { key: "Escalate frustration", enabled: false },
  ],
  scenarioCards: [
    { id: "primary", title: "Primary", summary: "" },
    { id: "fallback", title: "Fallback", summary: "" },
    { id: "edge-cases", title: "Edge cases", summary: "" },
  ],
  updatedAt: new Date().toISOString(),
});

