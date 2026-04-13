import { graphql, buildSchema } from "graphql";
import {
  countEvaluators,
  getEvaluatorDraft,
  listEvaluatorDrafts,
  saveEvaluatorDraft,
} from "@/lib/evaluator/store";
import type { EvaluatorDraft } from "@/lib/evaluator/types";
import {
  countPersonas,
  getPersonaDraft,
  listPersonaDrafts,
  savePersonaDraft,
} from "@/lib/persona/store";
import type { PersonaDraft } from "@/lib/persona/types";
import {
  countLiveSessions,
  getCallSession,
  listCallSessions,
  appendEvent,
  appendTranscript,
  upsertCallSessionMeta,
} from "@/lib/call/store";
import type { CallSession } from "@/lib/call/types";

const schema = buildSchema(`
  type EvaluatorTrait {
    key: String!
    weight: Float!
  }

  type EvaluatorNode {
    id: String!
    label: String!
    x: Float!
    y: Float!
  }

  type EvaluatorEdge {
    id: String!
    source: String!
    target: String!
  }

  type MetricsGraph {
    nodes: [EvaluatorNode!]!
    edges: [EvaluatorEdge!]!
  }

  type Personality {
    traits: [EvaluatorTrait!]!
  }

  type Profile {
    title: String!
    description: String!
  }

  type EvaluatorDraft {
    id: String!
    instructions: String!
    desiredOutcome: String!
    metricsGraph: MetricsGraph!
    personality: Personality!
    profile: Profile!
    updatedAt: String!
  }

  type PersonaModifier {
    key: String!
    enabled: Boolean!
  }

  type PersonaScenarioCard {
    id: String!
    title: String!
    summary: String!
  }

  type PersonaDraft {
    id: String!
    name: String!
    role: String!
    description: String!
    defaultVoice: String!
    speakingRate: Float!
    tone: String!
    modifiers: [PersonaModifier!]!
    scenarioCards: [PersonaScenarioCard!]!
    updatedAt: String!
  }

  type CallTranscriptItem {
    id: String!
    at: Float!
    speaker: String!
    text: String!
  }

  type CallEventItem {
    id: String!
    at: Float!
    level: String!
    message: String!
  }

  type CallSession {
    callId: String!
    evaluatorId: String!
    personaId: String!
    startedAt: Float
    stoppedAt: Float
    transcript: [CallTranscriptItem!]!
    events: [CallEventItem!]!
    updatedAt: Float!
  }

  type DashboardStats {
    liveSessions: Float!
    evaluatorCount: Float!
    personaCount: Float!
    recentEvaluators: [EvaluatorDraft!]!
    recentPersonas: [PersonaDraft!]!
    recentCalls: [CallSession!]!
  }

  input CallTranscriptItemInput {
    id: String!
    at: Float!
    speaker: String!
    text: String!
  }

  input CallEventItemInput {
    id: String!
    at: Float!
    level: String!
    message: String!
  }

  input CallSessionMetaInput {
    callId: String!
    evaluatorId: String!
    personaId: String!
    startedAt: Float
    stoppedAt: Float
  }

  input EvaluatorTraitInput {
    key: String!
    weight: Float!
  }

  input EvaluatorNodeInput {
    id: String!
    label: String!
    x: Float!
    y: Float!
  }

  input EvaluatorEdgeInput {
    id: String!
    source: String!
    target: String!
  }

  input MetricsGraphInput {
    nodes: [EvaluatorNodeInput!]!
    edges: [EvaluatorEdgeInput!]!
  }

  input PersonalityInput {
    traits: [EvaluatorTraitInput!]!
  }

  input ProfileInput {
    title: String!
    description: String!
  }

  input EvaluatorDraftInput {
    id: String!
    instructions: String!
    desiredOutcome: String!
    metricsGraph: MetricsGraphInput!
    personality: PersonalityInput!
    profile: ProfileInput!
  }

  input PersonaModifierInput {
    key: String!
    enabled: Boolean!
  }

  input PersonaScenarioCardInput {
    id: String!
    title: String!
    summary: String!
  }

  input PersonaDraftInput {
    id: String!
    name: String!
    role: String!
    description: String!
    defaultVoice: String!
    speakingRate: Float!
    tone: String!
    modifiers: [PersonaModifierInput!]!
    scenarioCards: [PersonaScenarioCardInput!]!
  }

  type Query {
    evaluator(id: String!): EvaluatorDraft!
    persona(id: String!): PersonaDraft!
    evaluators(limit: Float): [EvaluatorDraft!]!
    personas(limit: Float): [PersonaDraft!]!
    callSession(callId: String!): CallSession!
    calls(limit: Float): [CallSession!]!
    dashboard: DashboardStats!
  }

  type Mutation {
    saveEvaluator(input: EvaluatorDraftInput!): EvaluatorDraft!
    savePersona(input: PersonaDraftInput!): PersonaDraft!
    upsertCallMeta(input: CallSessionMetaInput!): CallSession!
    appendCallTranscript(callId: String!, item: CallTranscriptItemInput!): CallSession!
    appendCallEvent(callId: String!, item: CallEventItemInput!): CallSession!
  }
`);

const root = {
  evaluator: ({ id }: { id: string }) => getEvaluatorDraft(id),
  saveEvaluator: ({ input }: { input: EvaluatorDraft }) => saveEvaluatorDraft(input),
  persona: ({ id }: { id: string }) => getPersonaDraft(id),
  savePersona: ({ input }: { input: PersonaDraft }) => savePersonaDraft(input),
  evaluators: ({ limit }: { limit?: number }) =>
    listEvaluatorDrafts(limit ?? 20),
  personas: ({ limit }: { limit?: number }) => listPersonaDrafts(limit ?? 20),
  callSession: ({ callId }: { callId: string }) => getCallSession(callId),
  calls: ({ limit }: { limit?: number }) => listCallSessions(limit ?? 20),
  dashboard: () => ({
    liveSessions: countLiveSessions(),
    evaluatorCount: countEvaluators(),
    personaCount: countPersonas(),
    recentEvaluators: listEvaluatorDrafts(5),
    recentPersonas: listPersonaDrafts(5),
    recentCalls: listCallSessions(5),
  }),
  upsertCallMeta: ({ input }: { input: { callId: string; evaluatorId: string; personaId: string; startedAt?: number | null; stoppedAt?: number | null } }) =>
    upsertCallSessionMeta({
      callId: input.callId,
      evaluatorId: input.evaluatorId,
      personaId: input.personaId,
      startedAt: input.startedAt,
      stoppedAt: input.stoppedAt,
    }) as CallSession,
  appendCallTranscript: ({
    callId,
    item,
  }: {
    callId: string;
    item: { id: string; at: number; speaker: string; text: string };
  }) =>
    appendTranscript(callId, {
      id: item.id,
      at: item.at,
      speaker: item.speaker as "agent" | "customer",
      text: item.text,
    }),
  appendCallEvent: ({
    callId,
    item,
  }: {
    callId: string;
    item: { id: string; at: number; level: string; message: string };
  }) =>
    appendEvent(callId, {
      id: item.id,
      at: item.at,
      level: item.level as "info" | "warn" | "error",
      message: item.message,
    }),
};

export async function POST(req: Request) {
  const body = (await req.json()) as {
    query?: string;
    variables?: Record<string, unknown>;
    operationName?: string;
  };

  const result = await graphql({
    schema,
    source: body.query ?? "",
    rootValue: root,
    variableValues: body.variables,
    operationName: body.operationName,
  });

  return Response.json(result, { status: result.errors ? 400 : 200 });
}

