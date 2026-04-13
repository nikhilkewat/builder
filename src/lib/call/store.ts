import type { CallEventItem, CallSession, CallTranscriptItem } from "./types";

const callStore = new Map<string, CallSession>();

function now() {
  return Date.now();
}

export function upsertCallSessionMeta(input: {
  callId: string;
  evaluatorId: string;
  personaId: string;
  startedAt?: number | null;
  stoppedAt?: number | null;
}) {
  const existing =
    callStore.get(input.callId) ??
    ({
      callId: input.callId,
      evaluatorId: input.evaluatorId,
      personaId: input.personaId,
      startedAt: null,
      stoppedAt: null,
      transcript: [],
      events: [],
      updatedAt: now(),
    } satisfies CallSession);

  const next: CallSession = {
    ...existing,
    evaluatorId: input.evaluatorId ?? existing.evaluatorId,
    personaId: input.personaId ?? existing.personaId,
    startedAt:
      input.startedAt === undefined ? existing.startedAt : input.startedAt,
    stoppedAt: input.stoppedAt === undefined ? existing.stoppedAt : input.stoppedAt,
    updatedAt: now(),
  };

  callStore.set(input.callId, next);
  return next;
}

export function appendTranscript(callId: string, item: CallTranscriptItem) {
  const session =
    callStore.get(callId) ??
    ({
      callId,
      evaluatorId: "demo",
      personaId: "demo",
      startedAt: null,
      stoppedAt: null,
      transcript: [],
      events: [],
      updatedAt: now(),
    } satisfies CallSession);

  const next: CallSession = {
    ...session,
    transcript: [...session.transcript, item].slice(-500),
    updatedAt: now(),
  };
  callStore.set(callId, next);
  return next;
}

export function appendEvent(callId: string, item: CallEventItem) {
  const session =
    callStore.get(callId) ??
    ({
      callId,
      evaluatorId: "demo",
      personaId: "demo",
      startedAt: null,
      stoppedAt: null,
      transcript: [],
      events: [],
      updatedAt: now(),
    } satisfies CallSession);

  const next: CallSession = {
    ...session,
    events: [...session.events, item].slice(-1000),
    updatedAt: now(),
  };
  callStore.set(callId, next);
  return next;
}

export function getCallSession(callId: string): CallSession {
  return (
    callStore.get(callId) ??
    ({
      callId,
      evaluatorId: "demo",
      personaId: "demo",
      startedAt: null,
      stoppedAt: null,
      transcript: [],
      events: [],
      updatedAt: now(),
    } satisfies CallSession)
  );
}

export function listCallSessions(limit = 20): CallSession[] {
  return [...callStore.values()]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit);
}

export function countLiveSessions(): number {
  let count = 0;
  for (const session of callStore.values()) {
    if (session.startedAt && !session.stoppedAt) count += 1;
  }
  return count;
}

