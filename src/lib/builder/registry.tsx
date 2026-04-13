"use client";

import { Builder } from "@builder.io/react";
import { MetricsFlowCanvas } from "@/features/evaluator-builder/MetricsFlowCanvas";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {description ? (
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

Builder.registerComponent(Section, {
  name: "KlearcomSection",
  inputs: [
    { name: "title", type: "string", required: true },
    { name: "description", type: "string" },
  ],
  canHaveChildren: true,
});

Builder.registerComponent(MetricsFlowCanvas, {
  name: "EvaluatorMetricsGraph",
  inputs: [],
});

