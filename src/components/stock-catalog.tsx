"use client";

import { useMemo, useState } from "react";
import type { StockSearchItem } from "@/lib/types";

interface StockCatalogProps {
  items: StockSearchItem[];
}

export function StockCatalog({ items }: StockCatalogProps) {
  const [sector, setSector] = useState("\u5168\u90e8");
  const [query, setQuery] = useState("");

  const sectorOptions = useMemo(() => {
    return ["\u5168\u90e8", ...new Set(items.map((item) => item.sector).filter(Boolean))];
  }, [items]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter((item) => {
      const sectorMatched = sector === "\u5168\u90e8" || item.sector === sector;
      const queryMatched =
        !normalized ||
        item.name.toLowerCase().includes(normalized) ||
        item.code.toLowerCase().includes(normalized) ||
        item.symbol.toLowerCase().includes(normalized);
      return sectorMatched && queryMatched;
    });
  }, [items, query, sector]);

  return (
    <main className="page-shell">
      <section className="hero compact-hero">
        <p className="eyebrow">Stock Catalog</p>
        <h1>{"\u5168\u90e8\u53f0\u80a1\u6e05\u55ae"}</h1>
        <p className="hero-copy">
          {
            "\u4ee5 Fugle \u53f0\u80a1 ticker \u70ba\u4e3b\uff0c\u986f\u793a\u76ee\u524d\u53ef\u53d6\u5f97\u7684\u4e0a\u5e02\u3001\u4e0a\u6ac3\u80a1\u7968\u6e05\u55ae\uff0c\u53ef\u4f9d\u7522\u696d\u5206\u985e\u8207\u95dc\u9375\u5b57\u7be9\u9078\u3002"
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
