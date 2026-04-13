"use client";

import { gql } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";
import { validateEvaluatorDraft } from "@/lib/evaluator/validation";
import type { EvaluatorDraft } from "@/lib/evaluator/types";
import { EVALUATOR_TABS, type EvaluatorTab } from "./tabs";
import { useEvaluatorBuilderStore } from "./store";
import { MetricsFlowCanvas } from "./MetricsFlowCanvas";

type EvaluatorBuilderProps = {
  evaluatorId: string;
};

const GET_EVALUATOR = gql`
  query GetEvaluator($id: String!) {
    evaluator(id: $id) {
      id
      instructions
      desiredOutcome
      updatedAt
      metricsGraph {
        nodes {
          id
          label
          x
          y
        }
        edges {
          id
          source
          target
        }
      }
      personality {
        traits {
          key
          weight
        }
      }
      profile {
        title
        description
      }
    }
  }
`;

const SAVE_EVALUATOR = gql`
  mutation SaveEvaluator($input: EvaluatorDraftInput!) {
    saveEvaluator(input: $input) {
      id
      updatedAt
    }
  }
`;

function TabButton({
  tab,
  active,
  onClick,
}: {
  tab: EvaluatorTab;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800",
      ].join(" ")}
      aria-current={active ? "page" : undefined}
    >
      {tab}
    </button>
  );
}

export function EvaluatorBuilder({ evaluatorId }: EvaluatorBuilderProps) {
  const client = useApolloClient();
  const { activeTab, setActiveTab, status, setStatus, instructions, setInstructions, desiredOutcome, setDesiredOutcome, traits, setTrait, profile, setProfile, selectedNodeId, addMetricNode, removeSelectedNode, hydrate, toDraft } = useEvaluatorBuilderStore(s => s);


  const [errorsByTab, setErrorsByTab] = useState<
    Partial<Record<EvaluatorTab, string[]>>
  >({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDraft() {
      setStatus("loading");
      setMessage(null);

      if (cancelled) {
        return;
      }

      try {
        const result = await client.query<{ evaluator: EvaluatorDraft }>({
          query: GET_EVALUATOR,
          variables: { id: evaluatorId },
          fetchPolicy: "no-cache",
        });

        if (cancelled) {
          return;
        }

        if (result.data?.evaluator) {
          hydrate(result.data.evaluator);
          setMessage("Evaluator loaded.");
        } else {
          setStatus("ready");
        }
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            error instanceof Error ? error.message : "Failed to load evaluator.",
          );
        }
      }
    }

    void loadDraft();

    return () => {
      cancelled = true;
    };
  }, [client, evaluatorId, hydrate, setStatus]);

  const saveDraft = async () => {
    const draft = toDraft(evaluatorId);
    const validation = validateEvaluatorDraft(draft);
    setErrorsByTab(validation.errorsByTab);

    if (!validation.isValid) {
      const firstInvalidTab = EVALUATOR_TABS.find(
        (tab) => (validation.errorsByTab[tab] ?? []).length > 0,
      );
      if (firstInvalidTab) {
        setActiveTab(firstInvalidTab);
      }
      setMessage("Fix validation errors before saving.");
      return;
    }

    setStatus("saving");
    setMessage(null);

    try {
      await client.mutate({
        mutation: SAVE_EVALUATOR,
        variables: { input: draft },
      });
      setStatus("ready");
      setMessage("Evaluator saved.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Failed to save evaluator.",
      );
    }
  };

  const headerMeta = useMemo(
    () => [
      { label: "Evaluator ID", value: evaluatorId },
      { label: "Status", value: status },
    ],
    [evaluatorId, status],
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Evaluator Builder
          </h1>
          <div className="flex flex-wrap gap-4 text-xs text-zinc-600 dark:text-zinc-400">
            {headerMeta.map((m) => (
              <div key={m.label}>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {m.label}:
                </span>{" "}
                <span className="font-mono">{m.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={saveDraft}
            disabled={status === "loading" || status === "saving"}
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {status === "saving" ? "Saving..." : "Save"}
          </button>
        </div>
      </header>

      {message ? (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          {message}
        </div>
      ) : null}

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-wrap gap-2">
          {EVALUATOR_TABS.map((tab) => (
            <div key={tab} className="space-y-1">
              <TabButton
                tab={tab}
                active={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              />
              {(errorsByTab[tab] ?? []).length > 0 ? (
                <div className="px-1 text-[11px] text-red-600 dark:text-red-400">
                  {errorsByTab[tab]?.length} issue
                  {errorsByTab[tab]?.length === 1 ? "" : "s"}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-4">
          {activeTab === "Instructions" ? (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold">Instructions</h2>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="What should the evaluator watch for? Provide context, constraints, and examples."
                className="min-h-40 w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600"
              />
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                Tip: we’ll later sync this into Builder.io content blocks.
              </div>
              {(errorsByTab.Instructions ?? []).length > 0 ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
                  {errorsByTab.Instructions?.join(" ")}
                </div>
              ) : null}
            </div>
          ) : null}

          {activeTab === "Outcome" ? (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold">Desired outcome</h2>
              <textarea
                value={desiredOutcome}
                onChange={(e) => setDesiredOutcome(e.target.value)}
                placeholder="What does success look like? What is the expected resolution?"
                className="min-h-32 w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600"
              />
              {(errorsByTab.Outcome ?? []).length > 0 ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
                  {errorsByTab.Outcome?.join(" ")}
                </div>
              ) : null}
            </div>
          ) : null}

          {activeTab === "Metrics" ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold">Metrics graph</h2>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    Build the evaluator as a node/edge graph (React Flow).
                  </p>
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  Drag nodes, connect edges, then map to scorecard.
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={addMetricNode}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                >
                  Add node
                </button>
                <button
                  type="button"
                  onClick={removeSelectedNode}
                  disabled={!selectedNodeId}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                >
                  Delete selected
                </button>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  Selected:{" "}
                  <span className="font-mono">
                    {selectedNodeId ?? "none"}
                  </span>
                </div>
              </div>
              <MetricsFlowCanvas />
              {(errorsByTab.Metrics ?? []).length > 0 ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
                  {errorsByTab.Metrics?.join(" ")}
                </div>
              ) : null}
            </div>
          ) : null}

          {activeTab === "Personality" ? (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold">Personality weighting</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {traits.map((t) => (
                  <label
                    key={t.key}
                    className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
                  >
                    <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
                      {t.key}
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={t.weight}
                        onChange={(e) =>
                          setTrait(t.key, Number(e.currentTarget.value))
                        }
                        className="w-full"
                      />
                      <div className="w-12 text-right text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
                        {t.weight.toFixed(2)}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                Next: connect these weights to metric scoring and rubric.
              </div>
              {(errorsByTab.Personality ?? []).length > 0 ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
                  {errorsByTab.Personality?.join(" ")}
                </div>
              ) : null}
            </div>
          ) : null}

          {activeTab === "Profile" ? (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold">Evaluator profile</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
                    Title
                  </div>
                  <input
                    value={profile.title}
                    onChange={(e) => setProfile({ title: e.target.value })}
                    placeholder="e.g. Banking Support QA"
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-600"
                  />
                </label>
                <label className="space-y-1 sm:col-span-2">
                  <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
                    Description
                  </div>
                  <textarea
                    value={profile.description}
                    onChange={(e) =>
                      setProfile({ description: e.target.value })
                    }
                    placeholder="A short description for admins and dashboards."
                    className="min-h-28 w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-600"
                  />
                </label>
              </div>
              {(errorsByTab.Profile ?? []).length > 0 ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
                  {errorsByTab.Profile?.join(" ")}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

