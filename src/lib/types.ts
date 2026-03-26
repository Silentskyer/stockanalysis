export type Signal = "buy" | "hold" | "sell";

export interface PriceBar {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartPoint {
  timestamp: number;
  value: number;
}

export interface PeriodAnalysis {
  label: "\u9031\u7dda" | "\u6708\u7dda" | "\u5e74\u7dda";
  signal: Signal;
  score: number;
  trend: string;
  momentum: string;
  movingAverage: string;
  volatility: string;
  reason: string;
  aiSignal: Signal;
  aiReason: string;
}

export interface MarketOverview {
  symbol: string;
  name: string;
  currentPrice: number;
  changePercent: number;
  points: ChartPoint[];
}

export interface StockSearchItem {
  symbol: string;
  code: string;
  name: string;
  market: "TW";
  sector: string;
  description: string;
  source: "local" | "fugle" | "yahoo";
}

export interface StockAnalysisResult {
  symbol: string;
  name: string;
  market: "TW";
  sector: string;
  currentPrice: number | null;
  changePercent: number | null;
  overallSignal: Signal;
  overallScore: number;
  yearPositionLabel: string;
  summary: string;
  riskNotice: string;
  periods: PeriodAnalysis[];
  chartPoints: ChartPoint[];
  benchmark: MarketOverview;
  newsSummary: string | null;
  dataSources: string[];
}
