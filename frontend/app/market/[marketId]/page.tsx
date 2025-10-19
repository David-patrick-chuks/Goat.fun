"use client";

import { useParams } from "next/navigation";
import MarketPage from "@/components/market/MarketPage";

export default function MarketDetailPage() {
  const params = useParams();
  const marketId = params.marketId as string;

  return <MarketPage marketId={marketId} />;
}
