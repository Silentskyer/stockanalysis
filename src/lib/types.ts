export type Signal = "buy" | "hold" | "sell";

export interface PriceBar {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PeriodAnalysis {
  label: "週線" | "月線" | "年線";
  signal: Signal;
  score: number;
  trend: string;
  momentum: string;
  movingAverage: string;
  volatility: string;
  reason: string;
}

export interface StockAnalysisResult {
  symbol: string;
  name: string;
  currentPrice: number;
  overallSignal: Signal;
  overallScore: number;
  yearPositionLabel: string;
  summary: string;
  riskNotice: string;
  periods: PeriodAnalysis[];
}
