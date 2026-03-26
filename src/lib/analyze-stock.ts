import { findDirectoryItem } from "@/lib/stock-directory";
import { fetchFugleQuote, fetchFugleStockHistory } from "@/lib/fugle-marketdata";
import { fetchGeminiNewsSummary } from "@/lib/gemini-news";
import type { MarketOverview, PeriodAnalysis, PriceBar, Signal, StockAnalysisResult } from "@/lib/types";
import {
  fetchYahooQuote,
  fetchYahooQuoteWithFallback,
  fetchYahooStockHistory,
  fetchYahooStockHistoryWithFallback
} from "@/lib/yahoo-marketdata";

export async function analyzeStock(symbol: string): Promise<StockAnalysisResult> {
  const yahooSymbols = [`${symbol}.TW`, `${symbol}.TWO`];
  const [fugleHistory, fugleQuote, yahooHistory, yahooQuote, benchmarkFugleQuote, benchmarkYahooQuote] =
    await Promise.allSettled([
      fetchFugleStockHistory(symbol),
      fetchFugleQuote(symbol),
      fetchYahooStockHistoryWithFallback(yahooSymbols),
      fetchYahooQuoteWithFallback(yahooSymbols),
      fetchFugleQuote("0050"),
      fetchYahooQuote("0050.TW")
    ]);

  const history = selectHistory(fugleHistory, yahooHistory);
  const quote = selectQuote(fugleQuote, yahooQuote, history.bars);

  const resolvedSymbol = history.symbol || quote?.symbol || symbol;
  const name = history.name || quote?.name || findDirectoryItem(resolvedSymbol)?.name || symbol;
  const bars = history.bars;
  const currentPrice = quote?.currentPrice ?? null;
  const availableBars = bars.length;
  const directoryItem = findDirectoryItem(resolvedSymbol) ?? findDirectoryItem(symbol);
  const weekAnalysis = buildAdaptivePeriodAnalysis("\u9031\u7dda", bars, 30, 5, 10);
  const monthAnalysis = buildAdaptivePeriodAnalysis("\u6708\u7dda", bars, 90, 20, 60);
  const yearAnalysis = buildAdaptivePeriodAnalysis("\u5e74\u7dda", bars, 180, 60, 120);
  const periods = [weekAnalysis, monthAnalysis, yearAnalysis];
  const overallScore = Math.round(
    periods.reduce((sum, period) => sum + period.score, 0) / periods.length
  );
  const overallSignal = currentPrice == null && availableBars === 0 ? "hold" : scoreToSignal(overallScore);
  const yearPositionLabel = buildYearPositionLabel(bars, currentPrice);
  const benchmark = buildMarketOverview(benchmarkFugleQuote, benchmarkYahooQuote);
  const newsSummary =
    (await fetchGeminiNewsSummary({
      symbol: resolvedSymbol,
      name,
      sector: directoryItem?.sector ?? "\u5176\u4ed6",
      currentPrice: currentPrice == null ? null : round(currentPrice),
      changePercent: quote?.changePercent == null ? null : round(quote.changePercent)
    })) ?? null;
  const dataSources = buildDataSources(fugleHistory, fugleQuote, yahooHistory, yahooQuote, Boolean(newsSummary));
  const summary = buildSummary(name, periods, overallSignal, availableBars, newsSummary, currentPrice == null);

  return {
    symbol: resolvedSymbol,
    name,
    market: "TW",
    sector: directoryItem?.sector ?? "\u5176\u4ed6",
    currentPrice: currentPrice == null ? null : round(currentPrice),
    changePercent: quote?.changePercent == null ? null : round(quote.changePercent),
    overallSignal,
    overallScore,
    yearPositionLabel,
    summary,
    riskNotice:
      "\u672c\u7d50\u679c\u4f9d\u50f9\u683c\u3001\u6210\u4ea4\u91cf\u8207\u65b0\u805e\u6458\u8981\u505a\u8f14\u52a9\u5206\u6790\uff0c\u50c5\u4f9b\u53c3\u8003\uff0c\u4e0d\u69cb\u6210\u6295\u8cc7\u5efa\u8b70\u3002",
    periods,
    chartPoints: [],
    benchmark,
    newsSummary,
    dataSources
  };
}

function selectHistory(
  fugleHistory: PromiseSettledResult<Awaited<ReturnType<typeof fetchFugleStockHistory>>>,
  yahooHistory: PromiseSettledResult<Awaited<ReturnType<typeof fetchYahooStockHistory>>>
) {
  if (fugleHistory.status === "fulfilled" && fugleHistory.value.bars.length) {
    return fugleHistory.value;
  }

  if (yahooHistory.status === "fulfilled" && yahooHistory.value.bars.length) {
    return {
      symbol: yahooHistory.value.symbol.replace(/\.(TW|TWO)$/i, ""),
      name: yahooHistory.value.name,
      bars: yahooHistory.value.bars
    };
  }

  return {
    symbol: "",
    name: "",
    bars: [] as PriceBar[]
  };
}

function selectQuote(
  fugleQuote: PromiseSettledResult<Awaited<ReturnType<typeof fetchFugleQuote>>>,
  yahooQuote: PromiseSettledResult<Awaited<ReturnType<typeof fetchYahooQuote>>>,
  bars: PriceBar[]
) {
  if (fugleQuote.status === "fulfilled") {
    const currentPrice =
      fugleQuote.value.lastPrice ?? fugleQuote.value.closePrice ?? bars.at(-1)?.close ?? null;

    return {
      symbol: fugleQuote.value.symbol,
      name: fugleQuote.value.name,
      currentPrice,
      changePercent: currentPrice == null ? null : (fugleQuote.value.changePercent ?? 0)
    };
  }

  if (yahooQuote.status === "fulfilled") {
    return {
      symbol: yahooQuote.value.symbol.replace(/\.(TW|TWO)$/i, ""),
      name: yahooQuote.value.name,
      currentPrice: yahooQuote.value.currentPrice,
      changePercent: yahooQuote.value.changePercent
    };
  }

  if (bars.length) {
    const currentPrice = bars.at(-1)?.close ?? 0;
    const previous = bars.at(-2)?.close ?? currentPrice;
    return {
      symbol: "",
      name: "",
      currentPrice,
      changePercent: previous === 0 ? 0 : ((currentPrice - previous) / previous) * 100
    };
  }

  return null;
}

function buildDataSources(
  fugleHistory: PromiseSettledResult<Awaited<ReturnType<typeof fetchFugleStockHistory>>>,
  fugleQuote: PromiseSettledResult<Awaited<ReturnType<typeof fetchFugleQuote>>>,
  yahooHistory: PromiseSettledResult<Awaited<ReturnType<typeof fetchYahooStockHistory>>>,
  yahooQuote: PromiseSettledResult<Awaited<ReturnType<typeof fetchYahooQuote>>>,
  hasGeminiSummary: boolean
) {
  const sources: string[] = [];
  if (fugleHistory.status === "fulfilled" || fugleQuote.status === "fulfilled") {
    sources.push("Fugle");
  }
  if (yahooHistory.status === "fulfilled" || yahooQuote.status === "fulfilled") {
    sources.push("Yahoo");
  }
  if (hasGeminiSummary) {
    sources.push("Gemini");
  }
  return sources;
}

function buildAdaptivePeriodAnalysis(
  label: PeriodAnalysis["label"],
  allBars: PriceBar[],
  preferredLength: number,
  shortWindow: number,
  longWindow: number
): PeriodAnalysis {
  const minimumBars = 20;
  const bars = allBars.slice(-Math.min(preferredLength, allBars.length));

  if (bars.length < minimumBars) {
    return {
      label,
      signal: "hold",
      score: 50,
      trend: "\u8cc7\u6599\u4e0d\u8db3",
      momentum: "\u8cc7\u6599\u4e0d\u8db3",
      movingAverage: "\u8cc7\u6599\u4e0d\u8db3",
      volatility: "\u8cc7\u6599\u4e0d\u8db3",
      reason: `${label}\u6b77\u53f2\u8cc7\u6599\u4ecd\u504f\u5c11\uff0c\u5148\u63d0\u4f9b\u73fe\u50f9\u8207\u65b0\u805e\u8f14\u52a9\u89c0\u5bdf\u3002`
    };
  }

  const safeShortWindow = Math.min(shortWindow, Math.max(3, Math.floor(bars.length / 3)));
  const safeLongWindow = Math.min(longWindow, Math.max(safeShortWindow + 2, Math.floor(bars.length * 0.8)));
  return buildPeriodAnalysis(label, bars, safeShortWindow, safeLongWindow);
}

function buildPeriodAnalysis(
  label: PeriodAnalysis["label"],
  bars: PriceBar[],
  shortWindow: number,
  longWindow: number
): PeriodAnalysis {
  const closes = bars.map((bar) => bar.close);
  const currentPrice = closes.at(-1) ?? 0;
  const previousPrice = closes.at(-Math.max(2, Math.floor(closes.length * 0.2))) ?? currentPrice;
  const shortMa = movingAverage(closes, shortWindow);
  const longMa = movingAverage(closes, longWindow);
  const priceChange = percentageChange(previousPrice, currentPrice);
  const momentumScore = clamp(priceChange / 2, -20, 20);
  const trendScore = clamp(((shortMa - longMa) / Math.max(longMa, 1)) * 120, -20, 20);
  const volatilityValue = annualizedVolatility(closes);
  const volatilityScore = clamp(18 - volatilityValue * 100, -10, 15);
  const volumeScore = volumeTrendScore(bars);
  const score = round(clamp(50 + momentumScore + trendScore + volatilityScore + volumeScore, 0, 100));
  const signal = scoreToSignal(score);

  return {
    label,
    signal,
    score,
    trend: describeTrend(priceChange, shortMa, longMa),
    momentum: describeMomentum(priceChange),
    movingAverage: describeMovingAverage(currentPrice, shortMa, longMa),
    volatility: describeVolatility(volatilityValue),
    reason: buildPeriodReason(label, signal, score, priceChange, shortMa, longMa, volatilityValue)
  };
}

function buildMarketOverview(
  fugleQuote: PromiseSettledResult<Awaited<ReturnType<typeof fetchFugleQuote>>>,
  yahooQuote: PromiseSettledResult<Awaited<ReturnType<typeof fetchYahooQuote>>>
): MarketOverview {
  if (fugleQuote.status === "fulfilled") {
    return {
      symbol: fugleQuote.value.symbol,
      name: fugleQuote.value.name,
      currentPrice: round(fugleQuote.value.lastPrice ?? fugleQuote.value.closePrice ?? 0),
      changePercent: round(fugleQuote.value.changePercent ?? 0),
      points: []
    };
  }

  if (yahooQuote.status === "fulfilled") {
    return {
      symbol: yahooQuote.value.symbol.replace(/\.(TW|TWO)$/i, ""),
      name: yahooQuote.value.name,
      currentPrice: round(yahooQuote.value.currentPrice),
      changePercent: round(yahooQuote.value.changePercent),
      points: []
    };
  }

  return {
    symbol: "0050",
    name: "\u5143\u5927\u53f0\u706350",
    currentPrice: 0,
    changePercent: 0,
    points: []
  };
}

function movingAverage(values: number[], window: number) {
  const sample = values.slice(-window);
  return sample.reduce((sum, value) => sum + value, 0) / sample.length;
}

function percentageChange(base: number, current: number) {
  if (base === 0) return 0;
  return ((current - base) / base) * 100;
}

function annualizedVolatility(closes: number[]) {
  if (closes.length < 2) return 0;
  const returns = closes.slice(1).map((price, index) => Math.log(price / closes[index]));
  const average = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  const variance =
    returns.reduce((sum, value) => sum + (value - average) ** 2, 0) / Math.max(returns.length - 1, 1);
  return Math.sqrt(variance) * Math.sqrt(252);
}

function volumeTrendScore(bars: PriceBar[]) {
  if (bars.length < 5) return 0;
  const recent = average(bars.slice(-5).map((bar) => bar.volume));
  const baseline = average(bars.slice(-20).map((bar) => bar.volume));
  if (baseline === 0) return 0;
  return clamp((recent / baseline - 1) * 10, -8, 8);
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildYearPositionLabel(bars: PriceBar[], currentPrice: number | null) {
  if (!bars.length || currentPrice == null) return "\u5340\u9593\u8cc7\u6599\u4e0d\u8db3";
  const yearHigh = Math.max(...bars.map((bar) => bar.high));
  const yearLow = Math.min(...bars.map((bar) => bar.low));
  if (yearHigh === yearLow) return "\u5340\u9593\u8cc7\u6599\u4e0d\u8db3";

  const ratio = ((currentPrice - yearLow) / (yearHigh - yearLow)) * 100;
  if (ratio >= 75) return "\u504f\u9ad8\u5340";
  if (ratio <= 25) return "\u504f\u4f4e\u5340";
  return "\u4e2d\u9593\u5340";
}

function buildSummary(
  name: string,
  periods: PeriodAnalysis[],
  overallSignal: Signal,
  availableBars: number,
  newsSummary: string | null,
  missingQuote: boolean
) {
  const bullishCount = periods.filter((period) => period.signal === "buy").length;
  const bearishCount = periods.filter((period) => period.signal === "sell").length;
  const limitedData = availableBars < 180;

  if (missingQuote && newsSummary) {
    return `${name} \u76ee\u524d\u884c\u60c5\u8207\u6b77\u53f2\u8cc7\u6599\u4ecd\u6709\u7f3a\u53e3\uff0c\u5df2\u5148\u6539\u7528 AI \u65b0\u805e\u6458\u8981\u8f14\u52a9\u89c0\u5bdf\uff0c\u5efa\u8b70\u66ab\u4ee5\u89c0\u671b\u70ba\u4e3b\u3002`;
  }

  if (missingQuote) {
    return `${name} \u76ee\u524d\u884c\u60c5\u8cc7\u6599\u4e0d\u5b8c\u6574\uff0c\u53ef\u5148\u4f9d\u65b0\u805e\u8207\u7522\u696d\u8da8\u52e2\u89c0\u5bdf\uff0c\u66ab\u4e0d\u5efa\u8b70\u4f9d\u6b64\u76f4\u63a5\u4ea4\u6613\u3002`;
  }

  if (overallSignal === "buy") {
    return `${name} \u76ee\u524d\u591a\u982d\u7d50\u69cb\u8f03\u5b8c\u6574\uff0c${bullishCount} \u500b\u9031\u671f\u7ad9\u5728\u504f\u5f37\u5340\uff0c\u8f03\u9069\u5408\u5206\u6279\u89c0\u5bdf\u5e03\u5c40\u3002${limitedData ? "\u4f46\u6b77\u53f2\u8cc7\u6599\u504f\u5c11\uff0c\u5224\u8b80\u8981\u66f4\u4fdd\u5b88\u3002" : ""}`;
  }

  if (overallSignal === "sell") {
    return `${name} \u76ee\u524d\u8f49\u5f31\u8a0a\u865f\u8f03\u660e\u986f\uff0c${bearishCount} \u500b\u9031\u671f\u504f\u7a7a\uff0c\u82e5\u5df2\u6301\u6709\u53ef\u512a\u5148\u6aa2\u67e5\u505c\u5229\u505c\u640d\u3002${limitedData ? "\u4f46\u6b77\u53f2\u8cc7\u6599\u504f\u5c11\uff0c\u8acb\u642d\u914d\u5176\u4ed6\u8cc7\u8a0a\u4ea4\u53c9\u78ba\u8a8d\u3002" : ""}`;
  }

  if (!availableBars && newsSummary) {
    return `${name} \u76ee\u524d\u884c\u60c5\u8cc7\u6599\u4e0d\u5b8c\u6574\uff0c\u5df2\u6539\u4ee5\u65b0\u805e\u6458\u8981\u505a\u8f14\u52a9\u5224\u8b80\uff0c\u5efa\u8b70\u5148\u89c0\u671b\u3002`;
  }

  return `${name} \u73fe\u968e\u6bb5\u591a\u7a7a\u8a0a\u865f\u5206\u6b67\uff0c\u77ed\u4e2d\u9577\u9031\u671f\u5c1a\u672a\u540c\u6b65\uff0c\u8f03\u9069\u5408\u7b49\u5f85\u66f4\u660e\u78ba\u7684\u65b9\u5411\u3002${limitedData ? "\u76ee\u524d\u53ef\u7528\u6b77\u53f2\u8cc7\u6599\u8f03\u5c11\uff0c\u5efa\u8b70\u4ee5\u8f03\u4fdd\u5b88\u7684\u89d2\u5ea6\u89e3\u8b80\u3002" : ""}`;
}

function buildPeriodReason(
  label: PeriodAnalysis["label"],
  signal: Signal,
  score: number,
  priceChange: number,
  shortMa: number,
  longMa: number,
  volatility: number
) {
  const direction =
    shortMa > longMa
      ? "\u77ed\u671f\u5747\u7dda\u4f4d\u65bc\u9577\u671f\u5747\u7dda\u4e4b\u4e0a"
      : "\u77ed\u671f\u5747\u7dda\u4ecd\u4f4e\u65bc\u9577\u671f\u5747\u7dda";
  const momentum =
    priceChange >= 0
      ? `\u5340\u9593\u6f32\u5e45\u7d04 ${round(priceChange)}%`
      : `\u5340\u9593\u8dcc\u5e45\u7d04 ${round(Math.abs(priceChange))}%`;
  const risk =
    volatility > 0.45
      ? "\u6ce2\u52d5\u504f\u5927\uff0c\u8a0a\u865f\u53ef\u9760\u5ea6\u9700\u8981\u6298\u6263\u3002"
      : "\u6ce2\u52d5\u5c1a\u53ef\uff0c\u8a0a\u865f\u7a69\u5b9a\u5ea6\u76f8\u5c0d\u8f03\u597d\u3002";

  if (signal === "buy") return `${label}\u5206\u6578 ${score}\uff0c${direction}\uff0c${momentum}\uff0c\u6574\u9ad4\u504f\u5411\u5f37\u52e2\u5ef6\u7e8c\u3002${risk}`;
  if (signal === "sell") return `${label}\u5206\u6578 ${score}\uff0c${direction}\uff0c${momentum}\uff0c\u7d50\u69cb\u504f\u5f31\uff0c\u8f03\u9069\u5408\u4fdd\u5b88\u770b\u5f85\u3002${risk}`;
  return `${label}\u5206\u6578 ${score}\uff0c${direction}\uff0c${momentum}\uff0c\u76ee\u524d\u591a\u7a7a\u5c1a\u672a\u62c9\u958b\u5dee\u8ddd\u3002${risk}`;
}

function describeTrend(priceChange: number, shortMa: number, longMa: number) {
  if (priceChange > 6 && shortMa > longMa) return "\u4e0a\u5347\u8da8\u52e2";
  if (priceChange < -6 && shortMa < longMa) return "\u4e0b\u964d\u8da8\u52e2";
  return "\u76e4\u6574\u4e2d";
}

function describeMomentum(priceChange: number) {
  if (priceChange > 8) return "\u5f37";
  if (priceChange > 2) return "\u504f\u5f37";
  if (priceChange < -8) return "\u5f31";
  if (priceChange < -2) return "\u504f\u5f31";
  return "\u4e2d\u6027";
}

function describeMovingAverage(currentPrice: number, shortMa: number, longMa: number) {
  if (currentPrice > shortMa && shortMa > longMa) return "\u50f9\u4f4d\u5728\u96d9\u5747\u7dda\u4e4b\u4e0a";
  if (currentPrice < shortMa && shortMa < longMa) return "\u50f9\u4f4d\u5728\u96d9\u5747\u7dda\u4e4b\u4e0b";
  return "\u5747\u7dda\u7cfe\u7d50";
}

function describeVolatility(volatility: number) {
  if (volatility > 0.5) return "\u9ad8";
  if (volatility > 0.28) return "\u4e2d";
  return "\u4f4e";
}

function scoreToSignal(score: number): Signal {
  if (score >= 62) return "buy";
  if (score <= 38) return "sell";
  return "hold";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
