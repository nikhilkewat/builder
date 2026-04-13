"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";

type CallSessionQuery = {
  callSession: {
    callId: string;
    evaluatorId: string;
    personaId: string;
    startedAt: number | null;
    stoppedAt: number | null;
    updatedAt: number;
    transcript: Array<{
      id: string;
      at: number;
      speaker: string;
      text: string;
    }>;
    events: Array<{
      id: string;
      at: number;
      level: string;
      message: string;
    }>;
  };
};

const CALL_SESSION = gql`
  query CallSession($callId: String!) {
    callSession(callId: $callId) {
      callId
      evaluatorId
      personaId
      startedAt
      stoppedAt
      updatedAt
      transcript {
        id
        at
        speaker
        text
      }
      events {
        id
        at
        level
        message
      }
    }
  }
`;

function formatTimeMs(ms: number) {
  return new Date(ms).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function CallDiagnostics({ callId }: { callId: string }) {
  const { data, loading, error } = useQuery<CallSessionQuery>(CALL_SESSION, {
    variables: { callId },
    fetchPolicy: "no-cache",
    pollInterval: 1500,
  });

  const session = data?.callSession;

  const derived = useMemo(() => {
    const startedAt = session?.startedAt ?? null;
    const stoppedAt = session?.stoppedAt ?? null;
    const end = stoppedAt ?? Date.now();
    const durationSec =
      startedAt ? Math.max(0, Math.round((end - startedAt) / 1000)) : 0;

    const warnCount = (session?.events ?? []).filter((e) => e.level === "warn")
      .length;
    const errorCount = (session?.events ?? []).filter((e) => e.level === "error")
      .length;
    const turnCount = (session?.transcript ?? []).length;

    const overall =
      startedAt && turnCount > 0
        ? Math.max(
            0,
            Math.min(100, 100 - warnCount * 8 - errorCount * 20),
          )
        : 0;

    return { durationSec, warnCount, errorCount, turnCount, overall };
  }, [session]);

  const timeline = (session?.events ?? [])
    .filter((e) => e.level !== "info")
    .slice()
    .reverse()
    .slice(0, 20);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Call Diagnostics
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Call ID: <span className="font-mono">{callId}</span>
          </p>
          {session ? (
            <div className="flex flex-wrap gap-4 text-xs text-zinc-600 dark:text-zinc-400">
              <div>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  Evaluator:
                </span>{" "}
                <span className="font-mono">{session.evaluatorId}</span>
              </div>
              <div>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  Persona:
                </span>{" "}
                <span className="font-mono">{session.personaId}</span>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/dial/${callId}`}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          >
            Back to dial
          </a>
          <button
            type="button"
            onClick={() =>
              downloadJson(`call-${callId}-events.json`, session?.events ?? [])
            }
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          >
            Export PCAP (stub)
          </button>
          <button
            type="button"
            onClick={() => downloadJson(`call-${callId}-report.json`, session)}
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Download report
          </button>
        </div>
      </header>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          {error.message}
        </div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold">Failure timeline</h2>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              {loading ? "Loading…" : `${timeline.length} items`}
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {timeline.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-3 py-10 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
                No warnings/errors yet. Start a session in Dial to generate events.
              </div>
            ) : (
              timeline.map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800"
                >
                  <div className="min-w-0">
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      <span
                        className={[
                          "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                          evt.level === "warn"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
                        ].join(" ")}
                      >
                        {evt.level.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
                      {evt.message}
                    </div>
                  </div>
                  <div className="shrink-0 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                    {formatTimeMs(evt.at)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-sm font-semibold">KPI scorecard</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                { label: "Overall", value: `${derived.overall}/100` },
                { label: "Warnings", value: String(derived.warnCount) },
                { label: "Errors", value: String(derived.errorCount) },
                { label: "Turns", value: String(derived.turnCount) },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
                >
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    {kpi.label}
                  </div>
                  <div className="mt-1 text-lg font-semibold">{kpi.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                Duration
              </div>
              <div className="mt-1 font-semibold">
                {derived.durationSec}s
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-sm font-semibold">Transcript snapshot</h2>
            <div className="mt-3 max-h-[240px] space-y-2 overflow-auto pr-1 text-sm">
              {(session?.transcript ?? []).slice(-8).map((t) => (
                <div
                  key={t.id}
                  className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-900"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                    <span className="font-medium">{t.speaker}</span>
                    <span className="font-mono">{formatTimeMs(t.at)}</span>
                  </div>
                  <div className="mt-1 text-zinc-800 dark:text-zinc-200">
                    {t.text}
                  </div>
                </div>
              ))}

              {(session?.transcript ?? []).length === 0 ? (
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  No transcript yet.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

