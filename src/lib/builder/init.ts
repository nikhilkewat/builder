"use client";

import { builder } from "@builder.io/react";
import "@/lib/builder/registry";

const publicKey =
  process.env.NEXT_PUBLIC_BUILDER_KEY ?? process.env.PUBLIC_BUILDER_KEY;

if (!publicKey) {
  // Avoid throwing to keep the boilerplate bootable without env configured.
  // Builder preview routes will show an error state instead.
} else {
  builder.init(publicKey);
}

