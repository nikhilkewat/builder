export const EVALUATOR_TABS = [
  "Instructions",
  "Outcome",
  "Metrics",
  "Personality",
  "Profile",
] as const;

export type EvaluatorTab = (typeof EVALUATOR_TABS)[number];

