"use client";

import LivestreamsContent from "@/components/livestreams/LivestreamsContent";
import { Suspense } from "react";

export default function LivestreamsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Live Streams</h1>
          <p className="text-gray-400">Watch live market discussions and trading</p>
        </div>
        <Suspense>
          <LivestreamsContent />
        </Suspense>
      </div>
    </div>
  );
}
