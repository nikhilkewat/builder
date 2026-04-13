"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

type DashboardQuery = {
  dashboard: {
    liveSessions: number;
    evaluatorCount: number;
    personaCount: number;
    recentEvaluators: Array<{
      id: string;
      updatedAt: string;
      profile: { title: string; description: string };
    }>;
    recentPersonas: Array<{
      id: string;
      updatedAt: string;
      name: string;
      role: string;
    }>;
    recentCalls: Array<{
      callId: string;
      updatedAt: number;
      evaluatorId: string;
      personaId: string;
      startedAt: number | null;
      stoppedAt: number | null;
    }>;
  };
};

const DASHBOARD = gql`
  query Dashboard {
    dashboard {
      liveSessions
      evaluatorCount
      personaCount
      recentEvaluators {
        id
        updatedAt
        profile {
          title
          description
        }
      }
      recentPersonas {
        id
        updatedAt
        name
        role
      }
      recentCalls {
        callId
        updatedAt
        evaluatorId
        personaId
        startedAt
        stoppedAt
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

function formatIso(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString([], { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function Dashboard() {
  const { data, loading, error, refetch } = useQuery<DashboardQuery>(DASHBOARD, {
    fetchPolicy: "no-cache",
    pollInterval: 2000,
  });

  const dashboard = data?.dashboard;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Live sessions, recent drafts, and quick links.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void refetch()}
            className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          >
            Refresh
          </button>
          <a
            href="/define/evaluator/demo"
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            New evaluator
          </a>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          {error.message}
        </div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Live sessions",
            value: loading ? "…" : String(dashboard?.liveSessions ?? 0),
          },
          {
            label: "Evaluators",
            value: loading ? "…" : String(dashboard?.evaluatorCount ?? 0),
          },
          {
            label: "Personas",
            value: loading ? "…" : String(dashboard?.personaCount ?? 0),
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              {kpi.label}
            </div>
            <div className="mt-2 text-2xl font-semibold">{kpi.value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent evaluators</h2>
            <a
              href="/define/evaluator/demo"
              className="text-xs font-medium text-zinc-900 hover:underline dark:text-white"
            >
              Open
            </a>
          </div>
          <div className="mt-3 space-y-2">
            {(dashboard?.recentEvaluators ?? []).length === 0 ? (
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                No evaluators yet. Create one to see it here.
              </div>
            ) : (
              dashboard?.recentEvaluators.map((e) => (
                <a
                  key={e.id}
                  href={`/define/evaluator/${e.id}`}
                  className="block rounded-lg border border-zinc-200 px-3 py-2 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {e.profile.title?.trim() ? e.profile.title : e.id}
                      </div>
                      <div className="truncate text-xs text-zinc-600 dark:text-zinc-400">
                        {e.profile.description || "—"}
                      </div>
                    </div>
                    <div className="shrink-0 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                      {formatIso(e.updatedAt)}
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent personas</h2>
            <a
              href="/define/persona/demo"
              className="text-xs font-medium text-zinc-900 hover:underline dark:text-white"
            >
              Open
            </a>
          </div>
          <div className="mt-3 space-y-2">
            {(dashboard?.recentPersonas ?? []).length === 0 ? (
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                No personas yet. Create one to see it here.
              </div>
            ) : (
              dashboard?.recentPersonas.map((p) => (
                <a
                  key={p.id}
                  href={`/define/persona/${p.id}`}
                  className="block rounded-lg border border-zinc-200 px-3 py-2 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {p.name?.trim() ? p.name : p.id}
                      </div>
                      <div className="truncate text-xs text-zinc-600 dark:text-zinc-400">
                        {p.role || "—"}
                      </div>
                    </div>
                    <div className="shrink-0 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                      {formatIso(p.updatedAt)}
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent calls</h2>
          <a
            href="/dial/demo-call"
            className="text-xs font-medium text-zinc-900 hover:underline dark:text-white"
          >
            Dial
          </a>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <div className="grid grid-cols-12 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
            <div className="col-span-4">Call</div>
            <div className="col-span-3">Evaluator</div>
            <div className="col-span-3">Persona</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          {(dashboard?.recentCalls ?? []).length === 0 ? (
            <div className="px-3 py-3 text-sm text-zinc-600 dark:text-zinc-400">
              No calls yet. Start a session in Dial.
            </div>
          ) : (
            dashboard?.recentCalls.map((c) => {
              const live = Boolean(c.startedAt && !c.stoppedAt);
              return (
                <a
                  key={c.callId}
                  href={`/diagnose/${c.callId}`}
                  className="grid grid-cols-12 px-3 py-3 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <div className="col-span-4 font-medium">
                    <span className="font-mono">{c.callId}</span>
                    {c.startedAt ? (
                      <span className="ml-2 text-xs text-zinc-600 dark:text-zinc-400">
                        {formatTimeMs(c.startedAt)}
                      </span>
                    ) : null}
                  </div>
                  <div className="col-span-3 text-zinc-600 dark:text-zinc-400">
                    <span className="font-mono">{c.evaluatorId}</span>
                  </div>
                  <div className="col-span-3 text-zinc-600 dark:text-zinc-400">
                    <span className="font-mono">{c.personaId}</span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span
                      className={[
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                        live
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200",
                      ].join(" ")}
                    >
                      {live ? "Live" : "Ended"}
                    </span>
                  </div>
                </a>
              );
            })
          )}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Scenarios</h2>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Boilerplate placeholder
          </div>
        </div>
        <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <div className="grid grid-cols-12 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
            <div className="col-span-5">Name</div>
            <div className="col-span-3">Persona</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          <div className="grid grid-cols-12 px-3 py-3 text-sm">
            <div className="col-span-5 font-medium">Demo scenario</div>
            <div className="col-span-3 text-zinc-600 dark:text-zinc-400">
              <span className="font-mono">demo</span>
            </div>
            <div className="col-span-2">
              <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Active
              </span>
            </div>
            <div className="col-span-2 text-right">
              <a
                className="text-sm font-medium text-zinc-900 hover:underline dark:text-white"
                href="/dial/demo-call"
              >
                Dial
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

