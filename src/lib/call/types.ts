export type CallTranscriptItem = {
  id: string;
  at: number;
  speaker: "agent" | "customer";
  text: string;
};

export type CallEventItem = {
  id: string;
  at: number;
  level: "info" | "warn" | "error";
  message: string;
};

export type CallSession = {
  callId: string;
  evaluatorId: string;
  personaId: string;
  startedAt: number | null;
  stoppedAt: number | null;
  transcript: CallTranscriptItem[];
  events: CallEventItem[];
  updatedAt: number;
};

