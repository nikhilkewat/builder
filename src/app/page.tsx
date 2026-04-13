export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Klearcom</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          App Router skeleton for the five core screens.
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          <a
            className="rounded-xl border border-zinc-200 bg-white p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            href="/dashboard"
          >
            <div className="text-sm font-medium">Scenarios Dashboard</div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              KPI cards, scenario table, live session count
            </div>
          </a>

          <a
            className="rounded-xl border border-zinc-200 bg-white p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            href="/define/evaluator/demo"
          >
            <div className="text-sm font-medium">Evaluator Builder</div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Wizard (instructions/outcome/metrics/personality/profile)
            </div>
          </a>

          <a
            className="rounded-xl border border-zinc-200 bg-white p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            href="/define/persona/demo"
          >
            <div className="text-sm font-medium">Configure Persona</div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Persona cards, voice config, behaviour modifiers
            </div>
          </a>

          <a
            className="rounded-xl border border-zinc-200 bg-white p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            href="/dial/demo-call"
          >
            <div className="text-sm font-medium">Live Call Deck</div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Animated waveform, transcript feed, event log
            </div>
          </a>

          <a
            className="rounded-xl border border-zinc-200 bg-white p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 sm:col-span-2"
            href="/diagnose/demo-call"
          >
            <div className="text-sm font-medium">Call Diagnostics</div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Failure timeline, KPI scorecard, PCAP export
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
