export type EvaluatorTrait = {
  key: string;
  weight: number;
};

export type EvaluatorNode = {
  id: string;
  label: string;
  x: number;
  y: number;
};

export type EvaluatorEdge = {
  id: string;
  source: string;
  target: string;
};

export type EvaluatorDraft = {
  id: string;
  instructions: string;
  desiredOutcome: string;
  metricsGraph: {
    nodes: EvaluatorNode[];
    edges: EvaluatorEdge[];
  };
  personality: {
    traits: EvaluatorTrait[];
  };
  profile: {
    title: string;
    description: string;
  };
  updatedAt: string;
};

export const EMPTY_EVALUATOR_DRAFT = (id: string): EvaluatorDraft => ({
  id,
  instructions: "",
  desiredOutcome: "",
  metricsGraph: { nodes: [], edges: [] },
  personality: { traits: [] },
  profile: { title: "", description: "" },
  updatedAt: new Date().toISOString(),
});

