import { MarketBoard } from "@/components/market-board";
import { getMarketOverviewList } from "@/lib/market-overview";

export default async function MarketPage() {
  const markets = await getMarketOverviewList();
  return <MarketBoard markets={markets} />;
}
