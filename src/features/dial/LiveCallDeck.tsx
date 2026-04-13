"use client";

import { gql } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { EvaluatorDraft } from "@/lib/evaluator/types";
import type { PersonaDraft } from "@/lib/persona/types";
import { WaveformCanvas } from "./WaveformCanvas";
import type { EventItem, Speaker, TranscriptItem } from "./types";

const GET_EVALUATOR_META = gql`
  query GetEvaluatorMeta($id: String!) {
    evaluator(id: $id) {
      id
      profile {
        title
        description
      }
      updatedAt
    }
  }
`;

const GET_PERSONA_META = gql`
  query GetPersonaMeta($id: String!) {
    persona(id: $id) {
      id
      name
      role
      updatedAt
    }
  }
`;

const UPSERT_CALL_META = gql`
  mutation UpsertCallMeta($input: CallSessionMetaInput!) {
    upsertCallMeta(input: $input) {
      callId
      updatedAt
      startedAt
      stoppedAt
    }
  }
`;

const APPEND_CALL_TRANSCRIPT = gql`
  mutation AppendCallTranscript($callId: String!, $item: CallTranscriptItemInput!) {
    appendCallTranscript(callId: $callId, item: $item) {
      callId
      updatedAt
    }
  }
`;

const APPEND_CALL_EVENT = gql`
  mutation AppendCallEvent($callId: String!, $item: CallEventItemInput!) {
    appendCallEvent(callId: $callId, item: $item) {
      callId
      updatedAt
    }
  }
`;

function formatTime(ms: number) {
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

const AGENT_LINES = [
  "Hi — I’m here to help. Can you share what happened?",
  "Got it. Let me confirm: you’re seeing this issue only today?",
  "Thanks. I’m checking the timeline now.",
  "I’ll walk you through the next step.",
];

const CUSTOMER_LINES = [
  "Yes, it started after the last update.",
  "I’m not sure — it just keeps failing.",
  "I need this fixed today.",
  "Ok, what should I do next?",
];

export function LiveCallDeck({ callId }: { callId: string }) {
  const client = useApolloClient();

  const [evaluatorId, setEvaluatorId] = useState("demo");
  const [personaId, setPersonaId] = useState("demo");
  const [evaluatorMeta, setEvaluatorMeta] = useState<EvaluatorDraft | null>(null);
  const [personaMeta, setPersonaMeta] = useState<PersonaDraft | null>(null);

  const [running, setRunning] = useState(false);
  const [speaker, setSpeaker] = useState<Exclude<Speaker, "system">>("agent");
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  const tickRef = useRef(0);
  const intervalRef = useRef<number | null>(null);

  const speakingAccent = speaker === "agent" ? "agent" : "customer";

  const loadEvaluator = async () => {
    const res = await client.query<{ evaluator: EvaluatorDraft }>({
      query: GET_EVALUATOR_META,
      variables: { id: evaluatorId },
      fetchPolicy: "no-cache",
    });
    setEvaluatorMeta(res.data.evaluator);
  };

  const loadPersona = async () => {
    const res = await client.query<{ persona: PersonaDraft }>({
      query: GET_PERSONA_META,
      variables: { id: personaId },
      fetchPolicy: "no-cache",
    });
    setPersonaMeta(res.data.persona);
  };

  useEffect(() => {
    void loadEvaluator();
    void loadPersona();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = () => {
    if (intervalRef.current) return;
    setRunning(true);
    void client.mutate({
      mutation: UPSERT_CALL_META,
      variables: {
        input: {
          callId,
          evaluatorId,
          personaId,
          startedAt: Date.now(),
          stoppedAt: null,
        },
      },
    });
    setEvents((e) => [
      ...e,
      {
        id: `evt-${Date.now()}`,
        at: Date.now(),
        level: "info",
        message: "Session started.",
      },
    ]);
    void client.mutate({
      mutation: APPEND_CALL_EVENT,
      variables: {
        callId,
        item: {
          id: `evt-${Date.now()}`,
          at: Date.now(),
          level: "info",
          message: "Session started.",
        },
      },
    });

    intervalRef.current = window.setInterval(() => {
      tickRef.current += 1;
      const isAgent = tickRef.current % 2 === 1;
      const nextSpeaker: "agent" | "customer" = isAgent ? "agent" : "customer";
      setSpeaker(nextSpeaker);

      const line =
        nextSpeaker === "agent"
          ? AGENT_LINES[tickRef.current % AGENT_LINES.length]
          : CUSTOMER_LINES[tickRef.current % CUSTOMER_LINES.length];

      setTranscript((t) => [
        ...t,
        {
          id: `t-${Date.now()}-${tickRef.current}`,
          at: Date.now(),
          speaker: nextSpeaker,
          text: line,
        },
      ]);
      void client.mutate({
        mutation: APPEND_CALL_TRANSCRIPT,
        variables: {
          callId,
          item: {
            id: `t-${Date.now()}-${tickRef.current}`,
            at: Date.now(),
            speaker: nextSpeaker,
            text: line,
          },
        },
      });

      if (tickRef.current % 3 === 0) {
        setEvents((e) => [
          ...e,
          {
            id: `evt-${Date.now()}-${tickRef.current}`,
            at: Date.now(),
            level: "info",
            message: isAgent
              ? "Evaluator: metric nodes updated."
              : "Transcript: keyword detected.",
          },
        ]);
        void client.mutate({
          mutation: APPEND_CALL_EVENT,
          variables: {
            callId,
            item: {
              id: `evt-${Date.now()}-${tickRef.current}`,
              at: Date.now(),
              level: "info",
              message: isAgent
                ? "Evaluator: metric nodes updated."
                : "Transcript: keyword detected.",
            },
          },
        });
      }

      if (tickRef.current % 7 === 0) {
        setEvents((e) => [
          ...e,
          {
            id: `evt-${Date.now()}-${tickRef.current}`,
            at: Date.now(),
            level: "warn",
            message: "Potential compliance risk detected.",
          },
        ]);
        void client.mutate({
          mutation: APPEND_CALL_EVENT,
          variables: {
            callId,
            item: {
              id: `evt-${Date.now()}-${tickRef.current}`,
              at: Date.now(),
              level: "warn",
              message: "Potential compliance risk detected.",
            },
          },
        });
      }
    }, 1100);
  };

  const stop = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
    void client.mutate({
      mutation: UPSERT_CALL_META,
      variables: {
        input: {
          callId,
          evaluatorId,
          personaId,
          stoppedAt: Date.now(),
        },
      },
    });
    setEvents((e) => [
      ...e,
      {
        id: `evt-${Date.now()}`,
        at: Date.now(),
        level: "info",
        message: "Session stopped.",
      },
    ]);
    void client.mutate({
      mutation: APPEND_CALL_EVENT,
      variables: {
        callId,
        item: {
          id: `evt-${Date.now()}`,
          at: Date.now(),
          level: "info",
          message: "Session stopped.",
        },
      },
    });
  };

  useEffect(() => {
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const topRight = useMemo(
    () => (
      <div className="flex items-center gap-2">
        <a
          href={`/diagnose/${callId}`}
          className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
        >
          Diagnose
        </a>
        {running ? (
          <button
            type="button"
            onClick={stop}
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Start
          </button>
        )}
      </div>
    ),
    [callId, running],
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Live Call Deck</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Call ID: <span className="font-mono">{callId}</span>
          </p>
        </div>
        {topRight}
      </header>

      <section className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">Waveform (live)</h2>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Canvas waveform driven by rAF (smooth, minimal React work).
                </p>
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                Speaking:{" "}
                <span className="font-mono">{running ? speaker : "idle"}</span>
              </div>
            </div>

            <div className="mt-3 h-44 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              <WaveformCanvas
                speaking={running}
                accent={speakingAccent}
                className="h-full w-full"
              />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-sm font-semibold">Session configuration</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
                  Evaluator
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={evaluatorId}
                    onChange={(e) => setEvaluatorId(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
                    placeholder="e.g. demo"
                  />
                  <button
                    type="button"
                    onClick={() => void loadEvaluator()}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                  >
                    Load
                  </button>
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  {evaluatorMeta?.profile?.title?.trim()
                    ? evaluatorMeta.profile.title
                    : "No title (set in Evaluator → Profile)."}
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
                  Persona
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={personaId}
                    onChange={(e) => setPersonaId(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
                    placeholder="e.g. demo"
                  />
                  <button
                    type="button"
                    onClick={() => void loadPersona()}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                  >
                    Load
                  </button>
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  {personaMeta?.name?.trim()
                    ? `${personaMeta.name} (${personaMeta.role || "role"})`
                    : "No name (set in Persona basics)."}
                </div>
              </div>
            </div>

            <div className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
              Tip: these IDs map to `/define/evaluator/[id]` and `/define/persona/[id]` drafts in the local GraphQL store.
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-sm font-semibold">Transcript feed</h2>
            <div className="mt-3 max-h-[330px] space-y-2 overflow-auto pr-1 text-sm">
              {transcript.length === 0 ? (
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Start the session to generate live transcript.
                </div>
              ) : (
                transcript.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-900"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                      <span className="font-medium">
                        {t.speaker === "agent" ? "Agent" : "Customer"}
                      </span>
                      <span className="font-mono">{formatTime(t.at)}</span>
                    </div>
                    <div className="mt-1 text-zinc-800 dark:text-zinc-200">
                      {t.text}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-sm font-semibold">Event log</h2>
            <div className="mt-3 max-h-[260px] space-y-2 overflow-auto pr-1 text-sm">
              {events.length === 0 ? (
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  No events yet.
                </div>
              ) : (
                events
                  .slice()
                  .reverse()
                  .map((evt) => (
                    <div
                      key={evt.id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      <div className="min-w-0">
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">
                          <span
                            className={[
                              "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                              evt.level === "info"
                                ? "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                                : evt.level === "warn"
                                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                  : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
                            ].join(" ")}
                          >
                            {evt.level.toUpperCase()}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-zinc-800 dark:text-zinc-200">
                          {evt.message}
                        </div>
                      </div>
                      <div className="shrink-0 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                        {formatTime(evt.at)}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

