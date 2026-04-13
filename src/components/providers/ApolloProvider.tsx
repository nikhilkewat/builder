"use client";

import { useMemo } from "react";
import { ApolloProvider as BaseApolloProvider } from "@apollo/client/react";
import { createApolloClient } from "@/lib/apollo/client";

export function ApolloProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = useMemo(() => createApolloClient(), []);

  return <BaseApolloProvider client={client}>{children}</BaseApolloProvider>;
}

