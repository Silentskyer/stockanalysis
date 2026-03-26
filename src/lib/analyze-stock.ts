import type { PeriodAnalysis, PriceBar, Signal, StockAnalysisResult } from "@/lib/types";
import { fetchYahooStockHistory } from "@/lib/yahoo-finance";

export async function analyzeStock(symbol: string): Promise<StockAnalysisResult> {
  const { bars, name, symbol: resolvedSymbol } = await fetchYahooStockHistory(symbol);
  const currentPrice = bars.at(-1)?.close ?? 0;

  const weekAnalysis = buildPeriodAnalysis("週線", bars.slice(-30), 5, 10);
  const monthAnalysis = buildPeriodAnalysis("月線", bars.slice(-120), 20, 60);
  const yearAnalysis = buildPeriodAnalysis("年線", bars.slice(-260), 60, 120);
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
      "本結果以歷史價格與成交量推估，不代表未來報酬；若遇到財報、政策或突發事件，訊號可能快速失效。",
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
  if (base === 0) {
    return 0;
  }

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

  if (baseline === 0) {
    return 0;
  }

  const volumeRatio = recent / baseline;
  return clamp((volumeRatio - 1) * 10, -8, 8);
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildYearPositionLabel(bars: PriceBar[], currentPrice: number) {
  const yearHigh = Math.max(...bars.map((bar) => bar.high));
  const yearLow = Math.min(...bars.map((bar) => bar.low));

  if (yearHigh === yearLow) {
    return "區間資料不足";
  }

  const ratio = ((currentPrice - yearLow) / (yearHigh - yearLow)) * 100;

  if (ratio >= 75) {
    return "偏高區";
  }

  if (ratio <= 25) {
    return "偏低區";
  }

  return "中間區";
}

function buildSummary(name: string, periods: PeriodAnalysis[], overallSignal: Signal) {
  const bullishCount = periods.filter((period) => period.signal === "buy").length;
  const bearishCount = periods.filter((period) => period.signal === "sell").length;

  if (overallSignal === "buy") {
    return `${name} 目前以多頭結構為主，${bullishCount} 個週期站在偏強區，較適合分批觀察切入。`;
  }

  if (overallSignal === "sell") {
    return `${name} 目前轉弱訊號較明顯，${bearishCount} 個週期偏空，若已持有可優先檢查停利停損。`;
  }

  return `${name} 現階段多空訊號分歧，短中長週期尚未同步，較適合等待更明確的突破或轉弱。`;
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
    shortMa > longMa ? "短期均線位於長期均線之上" : "短期均線仍低於長期均線";
  const momentum =
    priceChange >= 0 ? `區間漲幅約 ${round(priceChange)}%` : `區間跌幅約 ${round(Math.abs(priceChange))}%`;
  const risk = volatility > 0.45 ? "波動偏大，訊號可靠度需要折扣。" : "波動尚可，訊號穩定度相對較好。";

  if (signal === "buy") {
    return `${label}分數 ${score}，${direction}，${momentum}，整體偏向強勢延續。${risk}`;
  }

  if (signal === "sell") {
    return `${label}分數 ${score}，${direction}，${momentum}，結構偏弱，較適合保守看待。${risk}`;
  }

  return `${label}分數 ${score}，${direction}，${momentum}，目前多空尚未拉開差距。${risk}`;
}

function describeTrend(priceChange: number, shortMa: number, longMa: number) {
  if (priceChange > 6 && shortMa > longMa) {
    return "上升趨勢";
  }

  if (priceChange < -6 && shortMa < longMa) {
    return "下降趨勢";
  }

  return "盤整中";
}

function describeMomentum(priceChange: number) {
  if (priceChange > 8) {
    return "強";
  }

  if (priceChange > 2) {
    return "偏強";
  }

  if (priceChange < -8) {
    return "弱";
  }

  if (priceChange < -2) {
    return "偏弱";
  }

  return "中性";
}

function describeMovingAverage(currentPrice: number, shortMa: number, longMa: number) {
  if (currentPrice > shortMa && shortMa > longMa) {
    return "價位在雙均線之上";
  }

  if (currentPrice < shortMa && shortMa < longMa) {
    return "價位在雙均線之下";
  }

  return "均線糾結";
}

function describeVolatility(volatility: number) {
  if (volatility > 0.5) {
    return "高";
  }

  if (volatility > 0.28) {
    return "中";
  }

  return "低";
}

function scoreToSignal(score: number): Signal {
  if (score >= 62) {
    return "buy";
  }

  if (score <= 38) {
    return "sell";
  }

  return "hold";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
