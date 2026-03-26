import type { MarketOverview } from "@/lib/types";

interface MarketBoardProps {
  markets: MarketOverview[];
}

export function MarketBoard({ markets }: MarketBoardProps) {
  return (
    <main className="page-shell">
      <section className="hero compact-hero">
        <p className="eyebrow">Market Overview</p>
        <h1>{"\u7d71\u4e00\u5927\u76e4\u9801\u9762"}</h1>
        <p className="hero-copy">
          {
            "\u96c6\u4e2d\u6aa2\u8996\u53f0\u80a1\u4ee3\u8868\u6a19\u7684\uff0c\u5feb\u901f\u638c\u63e1\u53f0\u80a1\u5927\u76e4\u8207\u4e3b\u6d41 ETF \u7684\u57fa\u672c\u72c0\u614b\u3002"
          }
        </p>
      </section>

      <section className="market-grid">
        {markets.map((market) => (
          <article className="summary-card" key={market.symbol}>
            <p className="summary-symbol">{market.symbol}</p>
            <h2>{market.name}</h2>
            <div className="price-row single-row">
              <div>
                <span className="metric-label">{"\u73fe\u5728\u6307\u6578"}</span>
                <strong>{formatNumber(market.currentPrice)}</strong>
              </div>
              <div>
                <span className="metric-label">{"\u8fd1\u4e00\u5e74\u6f32\u8dcc"}</span>
                <strong className={market.changePercent >= 0 ? "positive-text" : "negative-text"}>
                  {formatSigned(market.changePercent)}%
                </strong>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("zh-TW", {
    maximumFractionDigits: 2
  }).format(value);
}

function formatSigned(value: number) {
  const rounded = Math.round(value * 100) / 100;
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
}
