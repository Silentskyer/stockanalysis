import type { PeriodAnalysis, PriceBar, Signal, StockAnalysisResult } from "@/lib/types";
import { fetchYahooStockHistory } from "@/lib/yahoo-finance";

export async function analyzeStock(symbol: string): Promise<StockAnalysisResult> {
  const { bars, name, symbol: resolvedSymbol } = await fetchYahooStockHistory(symbol);
  const currentPrice = bars.at(-1)?.close ?? 0;

  const weekAnalysis = buildPeriodAnalysis("\u9031\u7dda", bars.slice(-30), 5, 10);
  const monthAnalysis = buildPeriodAnalysis("\u6708\u7dda", bars.slice(-120), 20, 60);
  const yearAnalysis = buildPeriodAnalysis("\u5e74\u7dda", bars.slice(-260), 60, 120);
  const periods = [weekAnalysis, monthAnalysis, yearAnalysis];

  const overallScore = Math.round(
    periods.reduce((sum, period) => sum + period.score, 0) / periods.length
  );

  const overallSignal = scoreToSignal(overallScore);
  const yearPositionLabel = buildYearPositionLabel(bars.slice(-260), currentPrice);

  return {
    symbol: resolvedSymbol,
    name,
    currentPrice: round(currentPrice),
    overallSignal,
    overallScore,
    yearPositionLabel,
    summary: buildSummary(name, periods, overallSignal),
    riskNotice:
      "\u672c\u7d50\u679c\u4f9d\u6b77\u53f2\u50f9\u683c\u8207\u6210\u4ea4\u91cf\u4f30\u7b97\uff0c\u50c5\u4f9b\u6280\u8853\u5206\u6790\u53c3\u8003\uff0c\u4e0d\u69cb\u6210\u6295\u8cc7\u5efa\u8b70\uff1b\u82e5\u9047\u5230\u8ca1\u5831\u3001\u653f\u7b56\u6216\u7a81\u767c\u4e8b\u4ef6\uff0c\u8a0a\u865f\u53ef\u80fd\u5feb\u901f\u5931\u6548\u3002",
    periods
  };
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
  const trendScore = clamp(((shortMa - longMa) / longMa) * 120, -20, 20);
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

function movingAverage(values: number[], window: number) {
  const sample = values.slice(-window);
  return sample.reduce((sum, value) => sum + value, 0) / sample.length;
}

function percentageChange(base: number, current: number) {
  if (base === 0) return 0;
  return ((current - base) / base) * 100;
}

function annualizedVolatility(closes: number[]) {
  const returns = closes.slice(1).map((price, index) => Math.log(price / closes[index]));
  const average = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  const variance =
    returns.reduce((sum, value) => sum + (value - average) ** 2, 0) / Math.max(returns.length - 1, 1);
  return Math.sqrt(variance) * Math.sqrt(252);
}

function volumeTrendScore(bars: PriceBar[]) {
  const recent = average(bars.slice(-5).map((bar) => bar.volume));
  const baseline = average(bars.slice(-20).map((bar) => bar.volume));
  if (baseline === 0) return 0;
  const volumeRatio = recent / baseline;
  return clamp((volumeRatio - 1) * 10, -8, 8);
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildYearPositionLabel(bars: PriceBar[], currentPrice: number) {
  const yearHigh = Math.max(...bars.map((bar) => bar.high));
  const yearLow = Math.min(...bars.map((bar) => bar.low));

  if (yearHigh === yearLow) return "\u5340\u9593\u8cc7\u6599\u4e0d\u8db3";

  const ratio = ((currentPrice - yearLow) / (yearHigh - yearLow)) * 100;
  if (ratio >= 75) return "\u504f\u9ad8\u5340";
  if (ratio <= 25) return "\u504f\u4f4e\u5340";
  return "\u4e2d\u9593\u5340";
}

function buildSummary(name: string, periods: PeriodAnalysis[], overallSignal: Signal) {
  const bullishCount = periods.filter((period) => period.signal === "buy").length;
  const bearishCount = periods.filter((period) => period.signal === "sell").length;

  if (overallSignal === "buy") {
    return `${name} \u76ee\u524d\u591a\u982d\u7d50\u69cb\u8f03\u5b8c\u6574\uff0c${bullishCount} \u500b\u9031\u671f\u7ad9\u5728\u504f\u5f37\u5340\uff0c\u8f03\u9069\u5408\u5206\u6279\u89c0\u5bdf\u5e03\u5c40\u3002`;
  }

  if (overallSignal === "sell") {
    return `${name} \u76ee\u524d\u8f49\u5f31\u8a0a\u865f\u8f03\u660e\u986f\uff0c${bearishCount} \u500b\u9031\u671f\u504f\u7a7a\uff0c\u82e5\u5df2\u6301\u6709\u53ef\u512a\u5148\u6aa2\u67e5\u505c\u5229\u505c\u640d\u3002`;
  }

  return `${name} \u73fe\u968e\u6bb5\u591a\u7a7a\u8a0a\u865f\u5206\u6b67\uff0c\u77ed\u4e2d\u9577\u9031\u671f\u5c1a\u672a\u540c\u6b65\uff0c\u8f03\u9069\u5408\u7b49\u5f85\u66f4\u660e\u78ba\u7684\u65b9\u5411\u3002`;
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

  if (signal === "buy") {
    return `${label}\u5206\u6578 ${score}\uff0c${direction}\uff0c${momentum}\uff0c\u6574\u9ad4\u504f\u5411\u5f37\u52e2\u5ef6\u7e8c\u3002${risk}`;
  }

  if (signal === "sell") {
    return `${label}\u5206\u6578 ${score}\uff0c${direction}\uff0c${momentum}\uff0c\u7d50\u69cb\u504f\u5f31\uff0c\u8f03\u9069\u5408\u4fdd\u5b88\u770b\u5f85\u3002${risk}`;
  }

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
