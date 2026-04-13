import { PersonaBuilder } from "@/features/persona-builder/PersonaBuilder";

type PageProps = { params: Promise<{ id: string }> };

export default async function PersonaDefinePage({ params }: PageProps) {
  const { id } = await params;

  return <PersonaBuilder personaId={id} />;
}

