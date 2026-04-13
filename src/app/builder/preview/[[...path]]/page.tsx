import { BuilderPreview } from "@/components/builder/BuilderPreview";

type PageProps = {
  params: Promise<{ path?: string[] }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};
//Builder
export default async function BuilderPreviewPage({
  params,
  searchParams,
}: PageProps) {
  const { path } = await params;
  const sp = (await searchParams) ?? {};

  const model = typeof sp.model === "string" ? sp.model : "page";
  const urlPath = `/${(path ?? []).join("/")}`;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Builder Preview</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Model: <span className="font-mono">{model}</span> - urlPath:{" "}
          <span className="font-mono">{urlPath}</span>
        </p>
      </div>
      <BuilderPreview model={model} urlPath={urlPath} />
    </div>
  );
}

