import type { MarketOverview } from "@/lib/types";
import { fetchYahooStockHistory } from "@/lib/yahoo-finance";

const marketSymbols = [
  { symbol: "^TWII", name: "\u53f0\u7063\u52a0\u6b0a\u6307\u6578" },
  { symbol: "^GSPC", name: "S&P 500" },
  { symbol: "^IXIC", name: "NASDAQ" },
  { symbol: "^DJI", name: "Dow Jones" }
] as const;

export async function getMarketOverviewList(): Promise<MarketOverview[]> {
  return Promise.all(
    marketSymbols.map(async (item) => {
      const history = await fetchYahooStockHistory(item.symbol, "1y");
      const currentPrice = history.bars.at(-1)?.close ?? 0;
      const basePrice = history.bars.at(0)?.close ?? currentPrice;

      return {
        symbol: item.symbol,
        name: item.name,
        currentPrice: round(currentPrice),
        changePercent: round(basePrice === 0 ? 0 : ((currentPrice - basePrice) / basePrice) * 100),
        points: []
      };
    })
  );
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
