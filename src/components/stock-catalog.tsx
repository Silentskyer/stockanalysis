"use client";

import { useMemo, useState } from "react";
import { sectorOptions, stockDirectory } from "@/lib/stock-directory";

export function StockCatalog() {
  const [sector, setSector] = useState<(typeof sectorOptions)[number]>("\u5168\u90e8");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return stockDirectory.filter((item) => {
      const sectorMatched = sector === "\u5168\u90e8" || item.sector === sector;
      const queryMatched =
        !normalized ||
        item.name.toLowerCase().includes(normalized) ||
        item.code.toLowerCase().includes(normalized) ||
        item.symbol.toLowerCase().includes(normalized) ||
        item.aliases.some((alias) => alias.toLowerCase().includes(normalized));
      return sectorMatched && queryMatched;
    });
  }, [query, sector]);

  return (
    <main className="page-shell">
      <section className="hero compact-hero">
        <p className="eyebrow">Stock Catalog</p>
        <h1>{"\u80a1\u7968\u6e05\u55ae\u9801\u9762"}</h1>
        <p className="hero-copy">
          {
            "\u96c6\u4e2d\u6aa2\u8996\u7ad9\u5167\u6536\u9304\u7684\u80a1\u7968\u6e05\u55ae\uff0c\u53ef\u4ee5\u4f9d\u96fb\u5b50\u3001\u5851\u81a0\u3001\u91d1\u878d\u3001ETF \u7b49\u985e\u5225\u9032\u884c\u5207\u63db\u3002"
          }
        </p>
      </section>

      <section className="card-stack">
        <div className="search-card">
          <div className="filter-row">
            <input
              className="search-input"
              onChange={(event) => setQuery(event.target.value)}
              placeholder={"\u641c\u5c0b\u80a1\u7968\u540d\u7a31\u6216\u4ee3\u78bc"}
              value={query}
            />
            <div className="sector-chip-row">
              {sectorOptions.map((item) => (
                <button
                  className={`sector-chip ${sector === item ? "active" : ""}`}
                  key={item}
                  onClick={() => setSector(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <section className="sidebar-card">
          <div className="sidebar-title-row">
            <h3>{sector}</h3>
            <span className="sidebar-note">{filtered.length} {"\u6a94"}</span>
          </div>
          <div className="stock-list">
            {filtered.map((item) => (
              <div className="stock-item static-item" key={item.symbol}>
                <div>
                  <strong>
                    {item.name} <span className="stock-code">{item.code}</span>
                  </strong>
                  <p>{item.description}</p>
                </div>
                <span className="stock-market">{item.sector}</span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
