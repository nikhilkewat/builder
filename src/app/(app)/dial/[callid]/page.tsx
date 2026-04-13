type PageProps = {
  params: Promise<{ callid: string }>;
};

import { LiveCallDeck } from "@/features/dial/LiveCallDeck";

export default async function DialPage({ params }: PageProps) {
  const { callid } = await params;

  return <LiveCallDeck callId={callid} />;
}

