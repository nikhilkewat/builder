"use client";

import { gql } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";
import type { PersonaDraft } from "@/lib/persona/types";
import { validatePersonaDraft } from "@/lib/persona/validation";
import { usePersonaBuilderStore } from "./store";

const GET_PERSONA = gql`
  query GetPersona($id: String!) {
    persona(id: $id) {
      id
      name
      role
      description
      defaultVoice
      speakingRate
      tone
      updatedAt
      modifiers {
        key
        enabled
      }
      scenarioCards {
        id
        title
        summary
      }
    }
  }
`;

const SAVE_PERSONA = gql`
  mutation SavePersona($input: PersonaDraftInput!) {
    savePersona(input: $input) {
      id
      updatedAt
    }
  }
`;

export function PersonaBuilder({ personaId }: { personaId: string }) {
  const client = useApolloClient();

  const status = usePersonaBuilderStore((s) => s.status);
  const setStatus = usePersonaBuilderStore((s) => s.setStatus);
  const name = usePersonaBuilderStore((s) => s.name);
  const role = usePersonaBuilderStore((s) => s.role);
  const description = usePersonaBuilderStore((s) => s.description);
  const defaultVoice = usePersonaBuilderStore((s) => s.defaultVoice);
  const speakingRate = usePersonaBuilderStore((s) => s.speakingRate);
  const tone = usePersonaBuilderStore((s) => s.tone);
  const modifiers = usePersonaBuilderStore((s) => s.modifiers);
  const scenarioCards = usePersonaBuilderStore((s) => s.scenarioCards);
  const setField = usePersonaBuilderStore((s) => s.setField);
  const toggleModifier = usePersonaBuilderStore((s) => s.toggleModifier);
  const updateScenarioCard = usePersonaBuilderStore((s) => s.updateScenarioCard);
  const hydrate = usePersonaBuilderStore((s) => s.hydrate);
  const toDraft = usePersonaBuilderStore((s) => s.toDraft);

  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadPersona() {
      setStatus("loading");
      setMessage(null);

      try {
        const result = await client.query<{ persona: PersonaDraft }>({
          query: GET_PERSONA,
          variables: { id: personaId },
          fetchPolicy: "no-cache",
        });

        if (!cancelled && result.data.persona) {
          hydrate(result.data.persona);
          setMessage("Persona loaded.");
        }
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            error instanceof Error ? error.message : "Failed to load persona.",
          );
        }
      }
    }

    void loadPersona();

    return () => {
      cancelled = true;
    };
  }, [client, hydrate, personaId, setStatus]);

  const savePersona = async () => {
    const draft = toDraft(personaId);
    const validation = validatePersonaDraft(draft);
    setErrors(validation.errors);

    if (!validation.isValid) {
      setMessage("Fix validation errors before saving.");
      return;
    }

    setStatus("saving");
    setMessage(null);

    try {
      await client.mutate({
        mutation: SAVE_PERSONA,
        variables: { input: draft },
      });
      setStatus("ready");
      setMessage("Persona saved.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Failed to save persona.");
    }
  };

  const headerMeta = useMemo(
    () => [
      { label: "Persona ID", value: personaId },
      { label: "Status", value: status },
    ],
    [personaId, status],
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Configure Persona
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

        <button
          type="button"
          onClick={savePersona}
          disabled={status === "loading" || status === "saving"}
          className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {status === "saving" ? "Saving..." : "Save"}
        </button>
      </header>

      {message ? (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          {message}
        </div>
      ) : null}

      {errors.length > 0 ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          {errors.join(" ")}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-sm font-semibold">Persona basics</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="space-y-1">
                <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
                  Name
                </div>
                <input
                  value={name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="e.g. Banking support caller"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
                />
              </label>
              <label className="space-y-1">
                <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
                  Role
                </div>
                <input
                  value={role}
                  onChange={(e) => setField("role", e.target.value)}
                  placeholder="Customer / Prospect / Supervisor"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
                />
              </label>
              <label className="space-y-1 sm:col-span-2">
                <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
                  Description
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Describe the persona's context, motivation, and communication style."
                  className="min-h-28 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-sm font-semibold">Persona cards</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {scenarioCards.map((card) => (
                <label
                  key={card.id}
                  className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
                >
                  <div className="text-sm font-semibold">{card.title}</div>
                  <textarea
                    value={card.summary}
                    onChange={(e) =>
                      updateScenarioCard(card.id, e.target.value)
                    }
                    placeholder="Short scenario summary"
                    className="mt-3 min-h-28 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-sm font-semibold">Voice configuration</h2>
            <div className="mt-4 space-y-3">
              <label className="space-y-1">
                <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
                  Default voice
                </div>
                <input
                  value={defaultVoice}
                  onChange={(e) => setField("defaultVoice", e.target.value)}
                  placeholder="e.g. allison-neutral"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
                />
              </label>

              <label className="space-y-1">
                <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
                  Speaking rate
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0.5}
                    max={1.5}
                    step={0.05}
                    value={speakingRate}
                    onChange={(e) =>
                      setField("speakingRate", Number(e.target.value))
                    }
                    className="w-full"
                  />
                  <span className="w-12 text-right text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
                    {speakingRate.toFixed(2)}
                  </span>
                </div>
              </label>

              <label className="space-y-1">
                <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
                  Tone
                </div>
                <select
                  value={tone}
                  onChange={(e) => setField("tone", e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
                >
                  <option>Neutral</option>
                  <option>Warm</option>
                  <option>Assertive</option>
                  <option>Urgent</option>
                </select>
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-sm font-semibold">Behaviour modifiers</h2>
            <div className="mt-4 space-y-2">
              {modifiers.map((modifier) => (
                <label
                  key={modifier.key}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
                >
                  <span>{modifier.key}</span>
                  <input
                    type="checkbox"
                    checked={modifier.enabled}
                    onChange={() => toggleModifier(modifier.key)}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

