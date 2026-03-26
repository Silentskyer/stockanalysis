import type { StockSearchItem } from "@/lib/types";

export interface StockDirectoryItem extends StockSearchItem {
  aliases: string[];
}

export const sectorOptions = [
  "\u5168\u90e8",
  "\u96fb\u5b50",
  "\u91d1\u878d",
  "\u5851\u81a0",
  "\u822a\u904b",
  "ETF",
  "\u901a\u8a0a",
  "\u5176\u4ed6"
] as const;

export const stockDirectory: StockDirectoryItem[] = [
  {
    symbol: "2330.TW",
    code: "2330",
    name: "\u53f0\u7a4d\u96fb",
    market: "TW",
    sector: "\u96fb\u5b50",
    aliases: ["tsmc", "taiwan semiconductor", "\u53f0\u7063\u7a4d\u9ad4\u96fb\u8def", "\u53f0\u7a4d"],
    description: "\u534a\u5c0e\u9ad4\u8207\u5148\u9032\u88fd\u7a0b\u6307\u6a19\u80a1\u3002",
    source: "local"
  },
  {
    symbol: "2337.TW",
    code: "2337",
    name: "\u65fa\u5b8f",
    market: "TW",
    sector: "\u96fb\u5b50",
    aliases: ["mxic", "\u65fa\u5b8f\u96fb\u5b50", "macronix"],
    description: "\u8a18\u61b6\u9ad4\u8207 NOR Flash \u76f8\u95dc\u80a1\u3002",
    source: "local"
  },
  {
    symbol: "2317.TW",
    code: "2317",
    name: "\u9d3b\u6d77",
    market: "TW",
    sector: "\u96fb\u5b50",
    aliases: ["hon hai", "foxconn", "\u5bcc\u58eb\u5eb7"],
    description: "\u96fb\u5b50\u4ee3\u5de5\u8207 AI \u4f3a\u670d\u5668\u4f9b\u61c9\u93c8\u4ee3\u8868\u3002",
    source: "local"
  },
  {
    symbol: "6223.TW",
    code: "6223",
    name: "\u65fa\u77fd",
    market: "TW",
    sector: "\u96fb\u5b50",
    aliases: ["MPI", "\u65fa\u77fd\u79d1\u6280", "mpi corp"],
    description: "\u534a\u5c0e\u9ad4\u6e2c\u8a66\u4ecb\u9762\u8207 probe card \u76f8\u95dc\u80a1\u3002",
    source: "local"
  },
  {
    symbol: "2454.TW",
    code: "2454",
    name: "\u806f\u767c\u79d1",
    market: "TW",
    sector: "\u96fb\u5b50",
    aliases: ["mediatek", "\u767c\u54e5"],
    description: "IC \u8a2d\u8a08\u9f8d\u982d\u3002",
    source: "local"
  },
  {
    symbol: "2303.TW",
    code: "2303",
    name: "\u806f\u96fb",
    market: "TW",
    sector: "\u96fb\u5b50",
    aliases: ["umc", "\u806f\u83ef\u96fb\u5b50"],
    description: "\u6676\u5713\u4ee3\u5de5\u696d\u8005\u3002",
    source: "local"
  },
  {
    symbol: "2308.TW",
    code: "2308",
    name: "\u53f0\u9054\u96fb",
    market: "TW",
    sector: "\u96fb\u5b50",
    aliases: ["delta"],
    description: "\u96fb\u6e90\u7ba1\u7406\u8207\u81ea\u52d5\u5316\u4e3b\u984c\u3002",
    source: "local"
  },
  {
    symbol: "1301.TW",
    code: "1301",
    name: "\u53f0\u5851",
    market: "TW",
    sector: "\u5851\u81a0",
    aliases: ["formosa plastics"],
    description: "\u5851\u81a0\u65cf\u7fa4\u4ee3\u8868\u80a1\u3002",
    source: "local"
  },
  {
    symbol: "1303.TW",
    code: "1303",
    name: "\u5357\u4e9e",
    market: "TW",
    sector: "\u5851\u81a0",
    aliases: ["nan ya"],
    description: "\u5851\u5316\u8207\u6750\u6599\u696d\u8005\u3002",
    source: "local"
  },
  {
    symbol: "1326.TW",
    code: "1326",
    name: "\u53f0\u5316",
    market: "TW",
    sector: "\u5851\u81a0",
    aliases: ["formosa chemicals"],
    description: "\u5316\u7e96\u8207\u5851\u5316\u76f8\u95dc\u696d\u52d9\u3002",
    source: "local"
  },
  {
    symbol: "2881.TW",
    code: "2881",
    name: "\u5bcc\u90a6\u91d1",
    market: "TW",
    sector: "\u91d1\u878d",
    aliases: ["fubon"],
    description: "\u91d1\u63a7\u6b0a\u503c\u80a1\u3002",
    source: "local"
  },
  {
    symbol: "2882.TW",
    code: "2882",
    name: "\u570b\u6cf0\u91d1",
    market: "TW",
    sector: "\u91d1\u878d",
    aliases: ["cathay"],
    description: "\u58fd\u96aa\u8207\u9280\u884c\u96d9\u6838\u5fc3\u3002",
    source: "local"
  },
  {
    symbol: "2886.TW",
    code: "2886",
    name: "\u5146\u8c50\u91d1",
    market: "TW",
    sector: "\u91d1\u878d",
    aliases: ["mega financial"],
    description: "\u91d1\u63a7\u8207\u9280\u884c\u9ad4\u7cfb\u4ee3\u8868\u3002",
    source: "local"
  },
  {
    symbol: "2603.TW",
    code: "2603",
    name: "\u9577\u69ae",
    market: "TW",
    sector: "\u822a\u904b",
    aliases: ["evergreen marine"],
    description: "\u8ca8\u6ac3\u6d77\u904b\u6307\u6a19\u80a1\u3002",
    source: "local"
  },
  {
    symbol: "2609.TW",
    code: "2609",
    name: "\u967d\u660e",
    market: "TW",
    sector: "\u822a\u904b",
    aliases: ["yang ming"],
    description: "\u6d77\u904b\u65cf\u7fa4\u4ee3\u8868\u3002",
    source: "local"
  },
  {
    symbol: "2615.TW",
    code: "2615",
    name: "\u842c\u6d77",
    market: "TW",
    sector: "\u822a\u904b",
    aliases: ["wan hai"],
    description: "\u8ca8\u6ac3\u822a\u904b\u696d\u8005\u3002",
    source: "local"
  },
  {
    symbol: "2412.TW",
    code: "2412",
    name: "\u4e2d\u83ef\u96fb",
    market: "TW",
    sector: "\u901a\u8a0a",
    aliases: ["cht", "chunghwa telecom"],
    description: "\u96fb\u4fe1\u9632\u79a6\u578b\u500b\u80a1\u3002",
    source: "local"
  },
  {
    symbol: "0050.TW",
    code: "0050",
    name: "\u5143\u5927\u53f0\u706350",
    market: "TW",
    sector: "ETF",
    aliases: ["\u53f0\u706350", "yuanta 50"],
    description: "\u8ffd\u8e64\u53f0\u7063 50 \u6307\u6578\u7684 ETF\u3002",
    source: "local"
  },
  {
    symbol: "0056.TW",
    code: "0056",
    name: "\u5143\u5927\u9ad8\u80a1\u606f",
    market: "TW",
    sector: "ETF",
    aliases: ["\u9ad8\u80a1\u606f"],
    description: "\u53f0\u80a1\u9ad8\u80a1\u606f ETF\u3002",
    source: "local"
  },
  {
    symbol: "006208.TW",
    code: "006208",
    name: "\u5bcc\u90a6\u53f050",
    market: "TW",
    sector: "ETF",
    aliases: ["\u53f050"],
    description: "\u53f0\u80a1\u5927\u76e4 ETF\u3002",
    source: "local"
  },
  {
    symbol: "AAPL",
    code: "AAPL",
    name: "Apple",
    market: "US",
    sector: "\u96fb\u5b50",
    aliases: ["\u860b\u679c", "apple"],
    description: "\u6d88\u8cbb\u96fb\u5b50\u8207\u670d\u52d9\u751f\u614b\u7cfb\u9f8d\u982d\u3002",
    source: "local"
  },
  {
    symbol: "MSFT",
    code: "MSFT",
    name: "Microsoft",
    market: "US",
    sector: "\u96fb\u5b50",
    aliases: ["\u5fae\u8edf", "microsoft"],
    description: "\u96f2\u7aef\u8207 AI \u5e73\u53f0\u9f8d\u982d\u3002",
    source: "local"
  },
  {
    symbol: "NVDA",
    code: "NVDA",
    name: "NVIDIA",
    market: "US",
    sector: "\u96fb\u5b50",
    aliases: ["\u8f1d\u9054", "nvidia"],
    description: "AI \u6676\u7247\u8207\u8cc7\u6599\u4e2d\u5fc3\u6307\u6a19\u80a1\u3002",
    source: "local"
  }
];

export function normalizeStockQuery(input: string) {
  const query = input.trim();
  if (!query) return "";

  const normalized = query.toLowerCase();
  const exact = stockDirectory.find((item) => {
    return (
      item.symbol.toLowerCase() === normalized ||
      item.code.toLowerCase() === normalized ||
      item.name === query ||
      item.aliases.some((alias) => alias.toLowerCase() === normalized)
    );
  });

  if (exact) return exact.symbol;
  if (/^\d{4,6}$/.test(query)) return `${query}.TW`;
  return query.toUpperCase();
}

export function searchStocks(input: string, sector = "\u5168\u90e8") {
  const query = input.trim().toLowerCase();

  return stockDirectory
    .filter((item) => {
      const sectorMatched = sector === "\u5168\u90e8" || item.sector === sector;
      const queryMatched =
        !query ||
        item.symbol.toLowerCase().includes(query) ||
        item.code.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.aliases.some((alias) => alias.toLowerCase().includes(query));
      return sectorMatched && queryMatched;
    })
    .slice(0, 20);
}

export function findDirectoryItem(symbol: string) {
  return stockDirectory.find((item) => item.symbol === symbol);
}
