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

interface FugleTickersResponse {
  exchange?: string;
  market?: string;
  data?: Array<{
    symbol?: string;
    name?: string;
    industry?: string;
    market?: string;
  }>;
  items?: Array<{
    symbol?: string;
    name?: string;
    industry?: string;
    market?: string;
  }>;
}

const industryNameMap: Record<string, string> = {
  "00": "ETF",
  "01": "\u6c34\u6ce5\u5de5\u696d",
  "02": "\u98df\u54c1\u5de5\u696d",
  "03": "\u5851\u81a0\u5de5\u696d",
  "04": "\u7d21\u7e54\u7e96\u7dad",
  "05": "\u96fb\u6a5f\u6a5f\u68b0",
  "06": "\u96fb\u5668\u96fb\u7e9c",
  "08": "\u73bb\u7483\u9676\u74f7",
  "09": "\u9020\u7d19\u5de5\u696d",
  "10": "\u92fc\u9435\u5de5\u696d",
  "11": "\u6a61\u81a0\u5de5\u696d",
  "12": "\u6c7d\u8eca\u5de5\u696d",
  "14": "\u5efa\u6750\u71df\u9020",
  "15": "\u822a\u904b\u696d",
  "16": "\u89c0\u5149\u9910\u65c5",
  "17": "\u91d1\u878d\u4fdd\u96aa",
  "19": "\u7d9c\u5408",
  "20": "\u5176\u4ed6",
  "21": "\u5316\u5b78\u5de5\u696d",
  "22": "\u751f\u6280\u91ab\u7642",
  "23": "\u6cb9\u96fb\u71c3\u6c23",
  "24": "\u534a\u5c0e\u9ad4\u696d",
  "25": "\u96fb\u8166\u53ca\u9031\u908a\u8a2d\u5099\u696d",
  "26": "\u5149\u96fb\u696d",
  "27": "\u901a\u4fe1\u7db2\u8def\u696d",
  "28": "\u96fb\u5b50\u96f6\u7d44\u4ef6\u696d",
  "29": "\u96fb\u5b50\u901a\u8def\u696d",
  "30": "\u8cc7\u8a0a\u670d\u52d9\u696d",
  "31": "\u5176\u4ed6\u96fb\u5b50\u696d",
  "32": "\u6587\u5316\u5275\u610f\u696d",
  "33": "\u8fb2\u696d\u79d1\u6280\u696d",
  "35": "\u7da0\u80fd\u74b0\u4fdd",
  "36": "\u6578\u4f4d\u96f2\u7aef",
  "37": "\u904b\u52d5\u4f11\u9592",
  "38": "\u5c45\u5bb6\u751f\u6d3b",
  "80": "\u7ba1\u7406\u80a1\u7968"
};

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

export async function fetchAllFugleTickers() {
  const [twse, tpex] = await Promise.allSettled([
    fugleFetch<FugleTickersResponse>(`/intraday/tickers?exchange=TWSE&type=EQUITY&isNormal=true`),
    fugleFetch<FugleTickersResponse>(`/intraday/tickers?exchange=TPEx&type=EQUITY&isNormal=true`)
  ]);

  const normalizeItems = (payload: FugleTickersResponse | null) => {
    const rawItems = payload?.data ?? payload?.items ?? [];
    return rawItems
      .filter((item) => item.symbol && item.name)
      .map<StockSearchItem>((item) => ({
        symbol: item.symbol ?? "",
        code: item.symbol ?? "",
        name: item.name ?? item.symbol ?? "",
        market: "TW",
        sector: resolveIndustryName(item.industry),
        description: payload?.market ?? item.market ?? payload?.exchange ?? "Fugle",
        source: "fugle"
      }));
  };

  const merged = [
    ...normalizeItems(twse.status === "fulfilled" ? twse.value : null),
    ...normalizeItems(tpex.status === "fulfilled" ? tpex.value : null)
  ];

  return merged.filter(
    (item, index, array) => array.findIndex((candidate) => candidate.symbol === item.symbol) === index
  );
}

function resolveIndustryName(industry?: string) {
  if (!industry) {
    return "\u5176\u4ed6";
  }

  return industryNameMap[industry] ?? industry;
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
