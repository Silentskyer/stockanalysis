"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { StockAnalysisResult } from "@/lib/types";
import {
  normalizeStockQuery,
  searchStocks,
  stockDirectory,
  type StockDirectoryItem
} from "@/lib/stock-directory";

const defaultQuery = "\u53f0\u7a4d\u96fb";
const favoriteStorageKey = "stockanalysis:favorites";

const copy = {
  emptyQuery: "\u8acb\u8f38\u5165\u80a1\u7968\u540d\u7a31\u6216\u4ee3\u78bc\u3002",
  searchFailed: "\u67e5\u8a62\u5931\u6557",
  searchLabel: "\u641c\u5c0b\u80a1\u7968",
  searchSubtitle:
    "\u652f\u63f4\u4e2d\u6587\u540d\u7a31\u3001\u80a1\u7968\u4ee3\u78bc\uff0c\u53f0\u80a1\u53ea\u6253\u6578\u5b57\u4e5f\u53ef\u4ee5\u3002",
  searchBadge: "\u4e2d\u6587 / \u4ee3\u78bc / \u6578\u5b57",
  searchPlaceholder:
    "\u4f8b\u5982 \u53f0\u7a4d\u96fb\u30012330\u30010050\u3001Apple\u3001\u8f1d\u9054",
  analyzeLoading: "\u5206\u6790\u4e2d...",
  analyze: "\u958b\u59cb\u5206\u6790",
  searchHint:
    "\u8f38\u5165\u300c\u53f0\u7a4d\u96fb\u300d\u6703\u81ea\u52d5\u5c0d\u61c9\u300c2330.TW\u300d\uff0c\u8f38\u5165\u300c2330\u300d\u4e5f\u6703\u76f4\u63a5\u8f49\u6210\u53f0\u80a1\u4ee3\u78bc\u3002",
  addFavorite: "\u52a0\u5165\u81ea\u9078",
  addedFavorite: "\u5df2\u52a0\u5165\u81ea\u9078",
  price: "\u73fe\u50f9",
  yearPosition: "\u5e74\u5167\u5340\u9593\u4f4d\u7f6e",
  overallScore: "\u7d9c\u5408\u5206\u6578",
  scorePrefix: "\u5206\u6578",
  trend: "\u8da8\u52e2",
  momentum: "\u52d5\u80fd",
  movingAverage: "\u5747\u7dda",
  volatility: "\u6ce2\u52d5",
  emptyResult:
    "\u8f38\u5165\u80a1\u7968\u540d\u7a31\u6216\u4ee3\u78bc\u5f8c\uff0c\u5c31\u80fd\u67e5\u770b\u9031\u7dda\u3001\u6708\u7dda\u3001\u5e74\u7dda\u5206\u6790\u8207\u8cb7\u8ce3\u5efa\u8b70\u3002",
  stockList: "\u80a1\u7968\u5217\u8868",
  clickable: "\u53ef\u76f4\u63a5\u9ede\u9078",
  favorites: "\u81ea\u9078\u80a1\u7968",
  countUnit: "\u6a94",
  remove: "\u79fb\u9664",
  emptyFavorites:
    "\u5f9e\u5206\u6790\u7d50\u679c\u52a0\u5165\u81ea\u9078\u5f8c\uff0c\u6703\u986f\u793a\u5728\u9019\u88e1\u3002"
} as const;

export function AnalysisDashboard() {
  const [query, setQuery] = useState(defaultQuery);
  const [activeSymbol, setActiveSymbol] = useState("2330.TW");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StockAnalysisResult | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const saved = window.localStorage.getItem(favoriteStorageKey);
    if (!saved) return;

    try {
      setFavorites(JSON.parse(saved) as string[]);
    } catch {
      window.localStorage.removeItem(favoriteStorageKey);
    }
  }, []);

  useEffect(() => {
    void runAnalysis("2330.TW");
  }, []);

  useEffect(() => {
    window.localStorage.setItem(favoriteStorageKey, JSON.stringify(favorites));
  }, [favorites]);

  const filteredStocks = useMemo(() => searchStocks(query), [query]);
  const favoriteStocks = stockDirectory.filter((item) => favorites.includes(item.symbol));

  async function runAnalysis(input: string) {
    const normalizedSymbol = normalizeStockQuery(input);

    if (!normalizedSymbol) {
      setError(copy.emptyQuery);
      return;
    }

    setLoading(true);
    setError(null);
    setActiveSymbol(normalizedSymbol);

    try {
      const response = await fetch(`/api/analyze?symbol=${encodeURIComponent(normalizedSymbol)}`);
      const payload = (await response.json()) as StockAnalysisResult | { error: string };

      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : copy.searchFailed);
      }

      setResult(payload);
      setQuery(findDisplayLabel(normalizedSymbol));
    } catch (submitError) {
      setResult(null);
      setError(submitError instanceof Error ? submitError.message : copy.searchFailed);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAnalysis(query);
  }

  function handlePick(item: StockDirectoryItem) {
    setQuery(item.name);
    void runAnalysis(item.symbol);
  }

  function toggleFavorite(symbol: string) {
    setFavorites((current) =>
      current.includes(symbol) ? current.filter((item) => item !== symbol) : [...current, symbol]
    );
  }

  return (
    <section className="dashboard">
      <div className="dashboard-grid">
        <div className="dashboard-main">
          <form className="search-card" onSubmit={handleSubmit}>
            <div className="search-heading">
              <div>
                <label className="search-label" htmlFor="symbol">
                  {copy.searchLabel}
                </label>
                <p className="search-subtitle">{copy.searchSubtitle}</p>
              </div>
              <span className="search-badge">{copy.searchBadge}</span>
            </div>
            <div className="search-row">
              <input
                id="symbol"
                className="search-input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy.searchPlaceholder}
              />
              <button className="search-button" disabled={loading} type="submit">
                {loading ? copy.analyzeLoading : copy.analyze}
              </button>
            </div>
            <p className="search-hint">{copy.searchHint}</p>
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
                  <div className="summary-actions">
                    <button
                      className={`favorite-button ${favorites.includes(result.symbol) ? "active" : ""}`}
                      onClick={() => toggleFavorite(result.symbol)}
                      type="button"
                    >
                      {favorites.includes(result.symbol) ? copy.addedFavorite : copy.addFavorite}
                    </button>
                    <span className={`signal-badge signal-${result.overallSignal}`}>
                      {toSignalLabel(result.overallSignal)}
                    </span>
                  </div>
                </div>
                <div className="price-row">
                  <div>
                    <span className="metric-label">{copy.price}</span>
                    <strong>{formatNumber(result.currentPrice)}</strong>
                  </div>
                  <div>
                    <span className="metric-label">{copy.yearPosition}</span>
                    <strong>{result.yearPositionLabel}</strong>
                  </div>
                  <div>
                    <span className="metric-label">{copy.overallScore}</span>
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
                    <p className="period-score">
                      {copy.scorePrefix} {period.score}
                    </p>
                    <p>{period.reason}</p>
                    <dl className="metric-grid">
                      <div>
                        <dt>{copy.trend}</dt>
                        <dd>{period.trend}</dd>
                      </div>
                      <div>
                        <dt>{copy.momentum}</dt>
                        <dd>{period.momentum}</dd>
                      </div>
                      <div>
                        <dt>{copy.movingAverage}</dt>
                        <dd>{period.movingAverage}</dd>
                      </div>
                      <div>
                        <dt>{copy.volatility}</dt>
                        <dd>{period.volatility}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="status-card">{copy.emptyResult}</div>
          )}
        </div>

        <aside className="sidebar">
          <section className="sidebar-card">
            <div className="sidebar-title-row">
              <h3>{copy.stockList}</h3>
              <span className="sidebar-note">{copy.clickable}</span>
            </div>
            <div className="stock-list">
              {filteredStocks.map((item) => (
                <button
                  className={`stock-item ${activeSymbol === item.symbol ? "active" : ""}`}
                  key={item.symbol}
                  onClick={() => handlePick(item)}
                  type="button"
                >
                  <div>
                    <strong>
                      {item.name} <span className="stock-code">{item.code}</span>
                    </strong>
                    <p>{item.description}</p>
                  </div>
                  <span className="stock-market">{item.market}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="sidebar-card">
            <div className="sidebar-title-row">
              <h3>{copy.favorites}</h3>
              <span className="sidebar-note">
                {favoriteStocks.length} {copy.countUnit}
              </span>
            </div>
            {favoriteStocks.length ? (
              <div className="favorite-list">
                {favoriteStocks.map((item) => (
                  <div className="favorite-item" key={item.symbol}>
                    <button className="favorite-pick" onClick={() => handlePick(item)} type="button">
                      {item.name} <span>{item.code}</span>
                    </button>
                    <button
                      className="favorite-remove"
                      onClick={() => toggleFavorite(item.symbol)}
                      type="button"
                    >
                      {copy.remove}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-note">{copy.emptyFavorites}</p>
            )}
          </section>
        </aside>
      </div>
    </section>
  );
}

function findDisplayLabel(symbol: string) {
  const match = stockDirectory.find((item) => item.symbol === symbol);
  return match ? match.name : symbol;
}

function toSignalLabel(signal: StockAnalysisResult["overallSignal"]) {
  if (signal === "buy") return "\u9069\u5408\u8cb7\u9032";
  if (signal === "sell") return "\u9069\u5408\u8ce3\u51fa";
  return "\u5efa\u8b70\u89c0\u671b";
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("zh-TW", {
    maximumFractionDigits: 2
  }).format(value);
}
