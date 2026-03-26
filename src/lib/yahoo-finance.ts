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
    error?: {
      description?: string;
    } | null;
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

export async function fetchYahooStockHistory(symbol: string, range = "5y") {
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
        revalidate: 3600
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Yahoo Finance \u56de\u50b3\u932f\u8aa4\uff1a${response.status}`);
  }

  const data = (await response.json()) as YahooChartResponse;
  const result = data.chart?.result?.[0];
  const quote = result?.indicators?.quote?.[0];
  const timestamps = result?.timestamp;

  if (!result || !quote || !timestamps?.length) {
    const message = data.chart?.error?.description ?? "\u627e\u4e0d\u5230\u5c0d\u61c9\u80a1\u7968\u8cc7\u6599\u3002";
    throw new Error(message);
  }

  const bars: PriceBar[] = timestamps
    .map((timestamp, index) => {
      const open = quote.open?.[index];
      const high = quote.high?.[index];
      const low = quote.low?.[index];
      const close = quote.close?.[index];
      const volume = quote.volume?.[index];

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
    symbol: result.meta?.symbol ?? symbol,
    name: result.meta?.longName ?? result.meta?.shortName ?? symbol,
    bars
  };
}

export async function searchYahooStocks(query: string) {
  const params = new URLSearchParams({
    q: query,
    quotesCount: "8",
    newsCount: "0"
  });

  const response = await fetch(
    `https://query1.finance.yahoo.com/v1/finance/search?${params.toString()}`,
    {
      headers: {
        "User-Agent": "Mozilla/5.0"
      },
      next: {
        revalidate: 3600
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Yahoo Search \u56de\u50b3\u932f\u8aa4\uff1a${response.status}`);
  }

  const data = (await response.json()) as YahooSearchResponse;

  return (data.quotes ?? [])
    .filter((quote) => quote.symbol && (quote.shortname || quote.longname))
    .map<StockSearchItem>((quote) => ({
      symbol: quote.symbol ?? "",
      code: quote.symbol ?? "",
      name: quote.longname ?? quote.shortname ?? quote.symbol ?? "",
      market: inferMarketFromSymbol(quote.symbol ?? "", quote.exchDisp ?? ""),
      sector: quote.typeDisp ?? "\u5176\u4ed6",
      description: quote.exchDisp ?? quote.typeDisp ?? "Yahoo Finance",
      source: "yahoo"
    }));
}

function inferMarketFromSymbol(symbol: string, exchange: string) {
  if (symbol.endsWith(".TW") || exchange.includes("Taiwan")) {
    return "TW";
  }

  return "US";
}
