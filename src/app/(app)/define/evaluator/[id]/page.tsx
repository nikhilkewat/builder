import { EvaluatorBuilder } from "@/features/evaluator-builder/EvaluatorBuilder";

type PageProps = { params: Promise<{ id: string }> };

export default async function EvaluatorDefinePage({ params }: PageProps) {
  const { id } = await params;

  return <EvaluatorBuilder evaluatorId={id} />;
}

