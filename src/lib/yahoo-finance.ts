import type { PriceBar } from "@/lib/types";

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

export async function fetchYahooStockHistory(symbol: string) {
  const params = new URLSearchParams({
    interval: "1d",
    range: "5y",
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
    throw new Error(`Yahoo Finance 回傳錯誤：${response.status}`);
  }

  const data = (await response.json()) as YahooChartResponse;
  const result = data.chart?.result?.[0];
  const quote = result?.indicators?.quote?.[0];
  const timestamps = result?.timestamp;

  if (!result || !quote || !timestamps?.length) {
    const message = data.chart?.error?.description ?? "找不到對應股票資料。";
    throw new Error(message);
  }

  const bars: PriceBar[] = timestamps
    .map((timestamp, index) => {
      const open = quote.open?.[index];
      const high = quote.high?.[index];
      const low = quote.low?.[index];
      const close = quote.close?.[index];
      const volume = quote.volume?.[index];

      if (
        open == null ||
        high == null ||
        low == null ||
        close == null ||
        volume == null
      ) {
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

  if (bars.length < 260) {
    throw new Error("歷史資料不足，無法完成週、月、年分析。");
  }

  return {
    symbol: result.meta?.symbol ?? symbol,
    name: result.meta?.longName ?? result.meta?.shortName ?? symbol,
    bars
  };
}
