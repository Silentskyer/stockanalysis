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
            "\u4f60\u53ef\u4ee5\u76f4\u63a5\u8f38\u5165\u4e2d\u6587\u540d\u7a31\u3001\u80a1\u7968\u4ee3\u78bc\uff0c\u6216\u5f9e\u80a1\u7968\u5217\u8868\u8207\u81ea\u9078\u6e05\u55ae\u5feb\u901f\u5207\u63db\u3002\u9996\u9801\u5c08\u6ce8\u500b\u80a1\u5206\u6790\uff0c\u5927\u76e4\u8207\u5168\u90e8\u80a1\u7968\u6e05\u55ae\u53ef\u5728\u4e0a\u65b9\u5c0e\u89bd\u5207\u63db\u3002"
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
