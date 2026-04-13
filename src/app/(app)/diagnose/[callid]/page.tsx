type PageProps = {
  params: Promise<{ callid: string }>;
};

export default async function DiagnosePage({ params }: PageProps) {
  const { callid } = await params;

  const { CallDiagnostics } = await import("@/features/diagnose/CallDiagnostics");
  return <CallDiagnostics callId={callid} />;
}

