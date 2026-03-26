import type { ChartPoint } from "@/lib/types";

interface LineChartProps {
  title: string;
  subtitle: string;
  points: ChartPoint[];
  tone?: "primary" | "market";
}

export function LineChart({ title, subtitle, points, tone = "primary" }: LineChartProps) {
  const safePoints = points.length ? points : [{ timestamp: Date.now() / 1000, value: 0 }];
  const values = safePoints.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const path = safePoints
    .map((point, index) => {
      const x = (index / Math.max(safePoints.length - 1, 1)) * 100;
      const y = 100 - ((point.value - min) / range) * 100;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <article className="chart-card">
      <div className="chart-head">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <div className="chart-scale">
          <span>{formatNumber(max)}</span>
          <span>{formatNumber(min)}</span>
        </div>
      </div>
      <div className="chart-shell">
        <svg className={`chart-svg chart-${tone}`} viewBox="0 0 100 100" preserveAspectRatio="none">
          <path className="chart-area" d={`${path} L 100 100 L 0 100 Z`} />
          <path className="chart-line" d={path} />
        </svg>
      </div>
    </article>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("zh-TW", {
    maximumFractionDigits: 2
  }).format(value);
}
