import type { PriceBar, StockSearchItem } from "@/lib/types";

interface YahooChartResponse {
  chart?: {
    result?: Array<{
      meta?: {
        symbol?: string;
        longName?: string;
        shortName?: string;
      };
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: Array<number | null>;
          high?: Array<number | null>;
          low?: Array<number | null>;
          close?: Array<number | null>;
          volume?: Array<number | null>;
        }>;
      };
    }>;
  };
}

interface YahooSearchResponse {
  quotes?: Array<{
    symbol?: string;
    shortname?: string;
    longname?: string;
    exchDisp?: string;
    typeDisp?: string;
  }>;
}

export async function fetchYahooStockHistory(symbol: string, range = "1y") {
  const params = new URLSearchParams({
    interval: "1d",
    range,
    includePrePost: "false",
    events: "div,splits"
  });

  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?${params.toString()}`,
    {
      headers: {
        "User-Agent": "Mozilla/5.0"
      },
      next: {
        revalidate: 300
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Yahoo Finance \u56de\u50b3\u932f\u8aa4\uff1a${response.status}`);
  }

  const data = (await response.json()) as YahooChartResponse;
  const result = data.chart?.result?.[0];
  const quote = result?.indicators?.quote?.[0];
  const timestamps = result?.timestamp ?? [];

  const bars: PriceBar[] = timestamps
    .map((timestamp, index) => {
      const open = quote?.open?.[index];
      const high = quote?.high?.[index];
      const low = quote?.low?.[index];
      const close = quote?.close?.[index];
      const volume = quote?.volume?.[index];

      if (open == null || high == null || low == null || close == null || volume == null) {
        return null;
      }

      return {
        timestamp,
        open,
        high,
        low,
        close,
        volume
      };
    })
    .filter((bar): bar is PriceBar => bar !== null);

  return {
    symbol: result?.meta?.symbol ?? symbol,
    name: result?.meta?.longName ?? result?.meta?.shortName ?? symbol,
    bars
  };
}

export async function fetchYahooStockHistoryWithFallback(symbols: string[], range = "1y") {
  let lastError: unknown = null;

  for (const symbol of symbols) {
    try {
      return await fetchYahooStockHistory(symbol, range);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Yahoo Finance \u7121\u6cd5\u53d6\u5f97\u8cc7\u6599");
}

export async function fetchYahooQuote(symbol: string) {
  const history = await fetchYahooStockHistory(symbol, "5d");
  const bars = history.bars;
  const currentPrice = bars.at(-1)?.close ?? 0;
  const previousClose = bars.at(-2)?.close ?? currentPrice;
  const changePercent = previousClose === 0 ? 0 : ((currentPrice - previousClose) / previousClose) * 100;

  return {
    symbol: history.symbol,
    name: history.name,
    currentPrice,
    changePercent
  };
}

export async function fetchYahooQuoteWithFallback(symbols: string[]) {
  let lastError: unknown = null;

  for (const symbol of symbols) {
    try {
      return await fetchYahooQuote(symbol);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Yahoo Finance \u7121\u6cd5\u53d6\u5f97\u5831\u50f9");
}

export async function searchYahooStocks(query: string) {
  const params = new URLSearchParams({
    q: query,
    quotesCount: "10",
    newsCount: "0"
  });

  const response = await fetch(
    `https://query1.finance.yahoo.com/v1/finance/search?${params.toString()}`,
    {
      headers: {
        "User-Agent": "Mozilla/5.0"
      },
      next: {
        revalidate: 300
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Yahoo Search \u56de\u50b3\u932f\u8aa4\uff1a${response.status}`);
  }

  const data = (await response.json()) as YahooSearchResponse;
  return (data.quotes ?? [])
    .filter((item) => item.symbol?.endsWith(".TW") || item.symbol?.endsWith(".TWO"))
    .map<StockSearchItem>((item) => ({
      symbol: (item.symbol ?? "").replace(/\.(TW|TWO)$/i, ""),
      code: (item.symbol ?? "").replace(/\.(TW|TWO)$/i, ""),
      name: item.longname ?? item.shortname ?? item.symbol ?? "",
      market: "TW",
      sector: item.typeDisp ?? "\u5176\u4ed6",
      description: item.exchDisp ?? "Yahoo",
      source: "yahoo"
    }));
}
