import { AnalysisDashboard } from "@/components/analysis-dashboard";

const sampleSymbols = ["2330.TW", "0050.TW", "AAPL", "MSFT", "NVDA"];

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Yahoo Finance Stock Analysis</p>
        <h1>用週、月、年三個時間尺度，快速判斷現在適不適合買或賣。</h1>
        <p className="hero-copy">
          這個網站會根據 Yahoo Finance 歷史價格與成交量，計算趨勢、均線、動能與波動，
          整理出買進、賣出或觀望建議，並補上簡短說明，讓你更快掌握個股現況。
        </p>
        <div className="symbol-row" aria-label="範例股票代碼">
          {sampleSymbols.map((symbol) => (
            <span className="symbol-chip" key={symbol}>
              {symbol}
            </span>
          ))}
        </div>
      </section>
      <AnalysisDashboard />
    </main>
  );
}
