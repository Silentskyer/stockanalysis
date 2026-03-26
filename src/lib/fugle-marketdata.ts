import type { PriceBar, StockSearchItem } from "@/lib/types";

const baseUrl = "https://api.fugle.tw/marketdata/v1.0/stock";

interface FugleTickerResponse {
  symbol: string;
  name: string;
  market?: string;
  industry?: string;
}

interface FugleQuoteResponse {
  symbol: string;
  name: string;
  lastPrice?: number;
  closePrice?: number;
  changePercent?: number;
  tradeVolume?: number;
}

interface FugleHistoricalResponse {
  symbol: string;
  data: Array<{
    date: string;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    volume?: number;
  }>;
}

export async function fetchFugleStockHistory(symbol: string) {
  const data = await fugleFetch<FugleHistoricalResponse>(
    `/historical/candles/${encodeURIComponent(symbol)}?fields=open,high,low,close,volume&sort=asc&timeframe=D`
  );

  const bars: PriceBar[] = data.data
    .map((item) => {
      if (
        item.open == null ||
        item.high == null ||
        item.low == null ||
        item.close == null ||
        item.volume == null
      ) {
        return null;
      }

      return {
        timestamp: Math.floor(new Date(`${item.date}T00:00:00+08:00`).getTime() / 1000),
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume
      };
    })
    .filter((bar): bar is PriceBar => bar !== null);

  const ticker = await fetchFugleTicker(symbol);

  return {
    symbol: ticker.symbol,
    name: ticker.name,
    bars
  };
}

export async function fetchFugleTicker(symbol: string) {
  return fugleFetch<FugleTickerResponse>(`/intraday/ticker/${encodeURIComponent(symbol)}`);
}

export async function fetchFugleQuote(symbol: string) {
  return fugleFetch<FugleQuoteResponse>(`/intraday/quote/${encodeURIComponent(symbol)}`);
}

export async function searchFugleStockByCode(query: string): Promise<StockSearchItem[]> {
  if (!/^\d{4,6}$/.test(query.trim())) {
    return [];
  }

  try {
    const ticker = await fetchFugleTicker(query.trim());
    return [
      {
        symbol: ticker.symbol,
        code: ticker.symbol,
        name: ticker.name,
        market: "TW",
        sector: ticker.industry ?? "\u5176\u4ed6",
        description: ticker.market ?? "Fugle",
        source: "fugle"
      }
    ];
  } catch {
    return [];
  }
}

async function fugleFetch<T>(path: string): Promise<T> {
  const apiKey = process.env.FUGLE_API_KEY;

  if (!apiKey) {
    throw new Error("FUGLE_API_KEY \u672a\u8a2d\u5b9a");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      "X-API-KEY": apiKey
    },
    next: {
      revalidate: 300
    }
  });

  if (!response.ok) {
    throw new Error(`Fugle API \u56de\u50b3\u932f\u8aa4\uff1a${response.status}`);
  }

  return (await response.json()) as T;
}
