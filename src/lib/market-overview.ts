import type { MarketOverview } from "@/lib/types";
import { fetchFugleQuote } from "@/lib/fugle-marketdata";

const marketSymbols = [
  { symbol: "0050", name: "\u5143\u5927\u53f0\u706350" },
  { symbol: "006208", name: "\u5bcc\u90a6\u53f050" },
  { symbol: "0056", name: "\u5143\u5927\u9ad8\u80a1\u606f" },
  { symbol: "2330", name: "\u53f0\u7a4d\u96fb" }
] as const;

export async function getMarketOverviewList(): Promise<MarketOverview[]> {
  return Promise.all(
    marketSymbols.map(async (item) => {
      const quote = await fetchFugleQuote(item.symbol);

      return {
        symbol: quote.symbol,
        name: quote.name ?? item.name,
        currentPrice: round(quote.lastPrice ?? quote.closePrice ?? 0),
        changePercent: round(quote.changePercent ?? 0),
        points: []
      };
    })
  );
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
