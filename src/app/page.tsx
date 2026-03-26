import { AnalysisDashboard } from "@/components/analysis-dashboard";

const sampleSymbols = [
  "\u53f0\u7a4d\u96fb",
  "2330",
  "0050",
  "Apple",
  "\u8f1d\u9054"
];

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Yahoo Finance Stock Analysis</p>
        <h1>
          {
            "\u4e2d\u6587\u67e5\u80a1\u7968\u3001\u770b\u6e05\u55ae\u3001\u5b58\u81ea\u9078\uff0c\u7528\u66f4\u76f4\u89ba\u7684\u65b9\u5f0f\u8b80\u61c2\u8cb7\u8ce3\u8a0a\u865f\u3002"
          }
        </h1>
        <p className="hero-copy">
          {
            "\u4f60\u53ef\u4ee5\u76f4\u63a5\u8f38\u5165\u4e2d\u6587\u540d\u7a31\u3001\u80a1\u7968\u4ee3\u78bc\uff0c\u6216\u5f9e\u80a1\u7968\u5217\u8868\u8207\u81ea\u9078\u6e05\u55ae\u5feb\u901f\u5207\u63db\u3002\u7cfb\u7d71\u6703\u4ee5 Yahoo Finance \u6b77\u53f2\u8cc7\u6599\u6574\u7406\u9031\u7dda\u3001\u6708\u7dda\u3001\u5e74\u7dda\u5206\u6790\uff0c\u8f38\u51fa\u76ee\u524d\u8f03\u504f\u5411\u8cb7\u9032\u3001\u8ce3\u51fa\u6216\u89c0\u671b\uff0c\u4e26\u9644\u4e0a\u7c21\u77ed\u8aaa\u660e\u3002"
          }
        </p>
        <div className="symbol-row" aria-label={"\u7bc4\u4f8b\u67e5\u8a62"}>
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
