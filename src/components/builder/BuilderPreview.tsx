"use client";

import { builder, BuilderComponent } from "@builder.io/react";
import { useEffect, useMemo, useState } from "react";
import "@/lib/builder/init";

type BuilderPreviewProps = {
  model: string;
  urlPath: string;
};

export function BuilderPreview({ model, urlPath }: BuilderPreviewProps) {
  const [content, setContent] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const publicKey =
    process.env.NEXT_PUBLIC_BUILDER_KEY ?? process.env.PUBLIC_BUILDER_KEY;

  const ready = useMemo(() => Boolean(publicKey), [publicKey]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!ready) return;

      setError(null);
      setLoaded(false);
      const fetched = await builder
        .get(model, {
          userAttributes: {
            urlPath,
          },
        })
        .toPromise();

      if (!cancelled) {
        setContent(fetched ?? null);
        setLoaded(true);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [model, ready, urlPath]);

  if (!ready) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
        Missing `NEXT_PUBLIC_BUILDER_KEY` in `.env.local`.
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
        {error}
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
        Loading Builder content for <span className="font-mono">{urlPath}</span>{" "}
        …
      </div>
    );
  }

  if (!content) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300">
        No Builder content found for model <span className="font-mono">{model}</span>{" "}
        at urlPath <span className="font-mono">{urlPath}</span>.
      </div>
    );
  }

  // BuilderComponent expects the full content JSON object.
  return <BuilderComponent model={model} content={content} />;
}

