import Link from "next/link";

type AppShellProps = {
  title?: string;
  children: React.ReactNode;
};

export function AppShell({ title, children }: AppShellProps) {
  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-zinc-200 bg-white/70 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/60">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-semibold tracking-tight">
              Klearcom
            </Link>
            {title ? (
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                / {title}
              </span>
            ) : null}
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/dashboard"
              className="text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/define/evaluator/demo"
              className="text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
            >
              Evaluator
            </Link>
            <Link
              href="/define/persona/demo"
              className="text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
            >
              Persona
            </Link>
            <Link
              href="/dial/demo-call"
              className="text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
            >
              Dial
            </Link>
            <Link
              href="/diagnose/demo-call"
              className="text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
            >
              Diagnose
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}

