import { create } from "zustand";
import type { Edge, Node } from "@xyflow/react";
import type { EvaluatorTab } from "./tabs";
import type { EvaluatorDraft } from "@/lib/evaluator/types";

type EvaluatorBuilderState = {
  activeTab: EvaluatorTab;
  setActiveTab: (tab: EvaluatorTab) => void;

  status: "idle" | "loading" | "saving" | "error" | "ready";
  setStatus: (status: EvaluatorBuilderState["status"]) => void;

  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;

  instructions: string;
  setInstructions: (value: string) => void;

  desiredOutcome: string;
  setDesiredOutcome: (value: string) => void;

  nodes: Node[];
  edges: Edge[];
  setGraph: (next: { nodes: Node[]; edges: Edge[] }) => void;
  addMetricNode: () => void;
  removeSelectedNode: () => void;

  traits: Array<{ key: string; weight: number }>;
  setTrait: (key: string, weight: number) => void;

  profile: {
    title: string;
    description: string;
  };
  setProfile: (patch: Partial<EvaluatorBuilderState["profile"]>) => void;

  hydrate: (draft: EvaluatorDraft) => void;
  toDraft: (id: string) => EvaluatorDraft;
};

const DEFAULT_NODES: Node[] = [
  {
    id: "metric-1",
    type: "default",
    position: { x: 60, y: 80 },
    data: { label: "Metric: Empathy" },
  },
  {
    id: "metric-2",
    type: "default",
    position: { x: 320, y: 200 },
    data: { label: "Metric: Compliance" },
  },
];

const DEFAULT_EDGES: Edge[] = [
  { id: "e-1-2", source: "metric-1", target: "metric-2" },
];

function isSameGraph(a: { nodes: Node[]; edges: Edge[] }, b: { nodes: Node[]; edges: Edge[] }) {
  if (a.nodes.length !== b.nodes.length || a.edges.length !== b.edges.length) {
    return false;
  }

  for (let i = 0; i < a.nodes.length; i += 1) {
    const left = a.nodes[i];
    const right = b.nodes[i];
    if (
      left.id !== right.id ||
      left.position.x !== right.position.x ||
      left.position.y !== right.position.y ||
      left.type !== right.type
    ) {
      return false;
    }
  }

  for (let i = 0; i < a.edges.length; i += 1) {
    const left = a.edges[i];
    const right = b.edges[i];
    if (
      left.id !== right.id ||
      left.source !== right.source ||
      left.target !== right.target
    ) {
      return false;
    }
  }

  return true;
}

export const useEvaluatorBuilderStore = create<EvaluatorBuilderState>((set,get) => ({
  activeTab: "Instructions",
  setActiveTab: (tab) => set({ activeTab: tab }),

  status: "idle",
  setStatus: (status) => set({ status }),

  selectedNodeId: null,
  setSelectedNodeId: (id) =>
    set((s) => (s.selectedNodeId === id ? {} : { selectedNodeId: id })),

  instructions: "",
  setInstructions: (value) => set({ instructions: value }),

  desiredOutcome: "",
  setDesiredOutcome: (value) => set({ desiredOutcome: value }),

  nodes: DEFAULT_NODES,
  edges: DEFAULT_EDGES,
  setGraph: (next) =>
    set((s) =>
      isSameGraph({ nodes: s.nodes, edges: s.edges }, next)
        ? {}
        : { nodes: next.nodes, edges: next.edges },
    ),
  addMetricNode: () =>
    set((s) => {
      const nextId = `metric-${s.nodes.length + 1}`;
      return {
        nodes: [
          ...s.nodes,
          {
            id: nextId,
            type: "default",
            position: {
              x: 120 + s.nodes.length * 40,
              y: 120 + s.nodes.length * 30,
            },
            data: { label: `Metric: ${nextId}` },
          },
        ],
        selectedNodeId: nextId,
      };
    }),
  removeSelectedNode: () =>
    set((s) => {
      if (!s.selectedNodeId) {
        return {};
      }

      return {
        nodes: s.nodes.filter((node) => node.id !== s.selectedNodeId),
        edges: s.edges.filter(
          (edge) =>
            edge.source !== s.selectedNodeId && edge.target !== s.selectedNodeId,
        ),
        selectedNodeId: null,
      };
    }),

  traits: [
    { key: "Warmth", weight: 0.6 },
    { key: "Directness", weight: 0.4 },
  ],
  setTrait: (key, weight) =>
    set((s) => ({
      traits: s.traits.some((t) => t.key === key)
        ? s.traits.map((t) => (t.key === key ? { key, weight } : t))
        : [...s.traits, { key, weight }],
    })),

  profile: { title: "", description: "" },
  setProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),

  hydrate: (draft) =>
    set({
      instructions: draft.instructions,
      desiredOutcome: draft.desiredOutcome,
      nodes: draft.metricsGraph.nodes.map((node) => ({
        id: node.id,
        type: "default",
        position: { x: node.x, y: node.y },
        data: { label: node.label },
      })),
      edges: draft.metricsGraph.edges,
      traits: draft.personality.traits,
      profile: draft.profile,
      status: "ready",
      selectedNodeId: null,
    }),
  toDraft: (id) => {
    const state = get()
    return {
      id,
      instructions: state.instructions,
      desiredOutcome: state.desiredOutcome,
      metricsGraph: {
        nodes: state.nodes.map((node) => ({
          id: node.id,
          label:
            typeof node.data?.label === "string" ? node.data.label : node.id,
          x: node.position.x,
          y: node.position.y,
        })),
        edges: state.edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
        })),
      },
      personality: {
        traits: state.traits,
      },
      profile: state.profile,
      updatedAt: new Date().toISOString(),
    };
  },
}));

