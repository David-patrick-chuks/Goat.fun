"use client";

import LivestreamsContent from "@/components/livestreams/LivestreamsContent";
import MarketDetails from "@/components/livestreams/MarketDetails";
import { Suspense } from "react";

export default function LivestreamsPage() {
  return (
    <Suspense>
      <MarketDetails />
      <LivestreamsContent />
    </Suspense>
  );
}
