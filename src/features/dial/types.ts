export type Speaker = "agent" | "customer" | "system";

export type TranscriptItem = {
  id: string;
  at: number;
  speaker: Exclude<Speaker, "system">;
  text: string;
};

export type EventItem = {
  id: string;
  at: number;
  level: "info" | "warn" | "error";
  message: string;
};

