"use client";

import { FormEvent, useState } from "react";
import type { StockAnalysisResult } from "@/lib/types";

const defaultSymbol = "2330.TW";

export function AnalysisDashboard() {
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StockAnalysisResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analyze?symbol=${encodeURIComponent(symbol)}`);
      const payload = (await response.json()) as StockAnalysisResult | { error: string };

      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "查詢失敗");
      }

      setResult(payload);
    } catch (submitError) {
      setResult(null);
      setError(submitError instanceof Error ? submitError.message : "查詢失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="dashboard">
      <form className="search-card" onSubmit={handleSubmit}>
        <label className="search-label" htmlFor="symbol">
          股票代碼
        </label>
        <div className="search-row">
          <input
            id="symbol"
            className="search-input"
            value={symbol}
            onChange={(event) => setSymbol(event.target.value)}
            placeholder="例如 2330.TW / AAPL / TSLA"
          />
          <button className="search-button" disabled={loading} type="submit">
            {loading ? "分析中..." : "開始分析"}
          </button>
        </div>
        <p className="search-hint">
          台股可使用 `2330.TW`、ETF 可使用 `0050.TW`，美股可直接輸入 `AAPL`。
        </p>
      </form>

      {error ? <div className="status-card error-card">{error}</div> : null}

      {result ? (
        <div className="result-grid">
          <article className="summary-card">
            <div className="summary-head">
              <div>
                <p className="summary-symbol">{result.symbol}</p>
                <h2>{result.name}</h2>
              </div>
              <span className={`signal-badge signal-${result.overallSignal}`}>
                {toSignalLabel(result.overallSignal)}
              </span>
            </div>
            <div className="price-row">
              <div>
                <span className="metric-label">現價</span>
                <strong>{formatNumber(result.currentPrice)}</strong>
              </div>
              <div>
                <span className="metric-label">年內高低區間位置</span>
                <strong>{result.yearPositionLabel}</strong>
              </div>
              <div>
                <span className="metric-label">綜合分數</span>
                <strong>{result.overallScore}</strong>
              </div>
            </div>
            <p className="summary-text">{result.summary}</p>
            <p className="risk-text">{result.riskNotice}</p>
          </article>

          <div className="period-grid">
            {result.periods.map((period) => (
              <article className="period-card" key={period.label}>
                <div className="period-top">
                  <h3>{period.label}</h3>
                  <span className={`signal-badge signal-${period.signal}`}>
                    {toSignalLabel(period.signal)}
                  </span>
                </div>
                <p className="period-score">分數 {period.score}</p>
                <p>{period.reason}</p>
                <dl className="metric-grid">
                  <div>
                    <dt>趨勢</dt>
                    <dd>{period.trend}</dd>
                  </div>
                  <div>
                    <dt>動能</dt>
                    <dd>{period.momentum}</dd>
                  </div>
                  <div>
                    <dt>均線</dt>
                    <dd>{period.movingAverage}</dd>
                  </div>
                  <div>
                    <dt>波動</dt>
                    <dd>{period.volatility}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="status-card">
          輸入股票代碼後即可取得週、月、年分析結果，以及簡短的買賣判斷說明。
        </div>
      )}
    </section>
  );
}

function toSignalLabel(signal: StockAnalysisResult["overallSignal"]) {
  if (signal === "buy") {
    return "適合買進";
  }

  if (signal === "sell") {
    return "適合賣出";
  }

  return "建議觀望";
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("zh-TW", {
    maximumFractionDigits: 2
  }).format(value);
}
