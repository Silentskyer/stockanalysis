export interface StockDirectoryItem {
  symbol: string;
  code: string;
  name: string;
  market: "TW" | "US";
  aliases: string[];
  description: string;
}

export const stockDirectory: StockDirectoryItem[] = [
  {
    symbol: "2330.TW",
    code: "2330",
    name: "\u53f0\u7a4d\u96fb",
    market: "TW",
    aliases: ["tsmc", "taiwan semiconductor", "\u53f0\u7063\u7a4d\u9ad4\u96fb\u8def", "\u53f0\u7a4d", "\u6676\u5713\u4ee3\u5de5"],
    description: "\u53f0\u80a1\u6b0a\u503c\u6838\u5fc3\uff0c\u534a\u5c0e\u9ad4\u8207\u5148\u9032\u88fd\u7a0b\u4ee3\u8868\u3002"
  },
  {
    symbol: "2317.TW",
    code: "2317",
    name: "\u9d3b\u6d77",
    market: "TW",
    aliases: ["hon hai", "foxconn", "\u5bcc\u58eb\u5eb7"],
    description: "\u96fb\u5b50\u4ee3\u5de5\u9f8d\u982d\uff0c\u6db5\u84cb AI \u4f3a\u670d\u5668\u8207\u6d88\u8cbb\u96fb\u5b50\u4f9b\u61c9\u93c8\u3002"
  },
  {
    symbol: "2454.TW",
    code: "2454",
    name: "\u806f\u767c\u79d1",
    market: "TW",
    aliases: ["mediatek", "\u767c\u54e5"],
    description: "IC \u8a2d\u8a08\u9f8d\u982d\uff0c\u624b\u6a5f\u6676\u7247\u8207\u908a\u7de3 AI \u984c\u6750\u660e\u78ba\u3002"
  },
  {
    symbol: "2308.TW",
    code: "2308",
    name: "\u53f0\u9054\u96fb",
    market: "TW",
    aliases: ["delta", "delta electronics"],
    description: "\u96fb\u6e90\u7ba1\u7406\u8207\u5de5\u696d\u81ea\u52d5\u5316\u4ee3\u8868\u516c\u53f8\u3002"
  },
  {
    symbol: "2412.TW",
    code: "2412",
    name: "\u4e2d\u83ef\u96fb",
    market: "TW",
    aliases: ["cht", "chunghwa telecom"],
    description: "\u96fb\u4fe1\u9632\u79a6\u578b\u500b\u80a1\uff0c\u6b96\u5229\u7387\u8207\u73fe\u91d1\u6d41\u76f8\u5c0d\u7a69\u5b9a\u3002"
  },
  {
    symbol: "2881.TW",
    code: "2881",
    name: "\u5bcc\u90a6\u91d1",
    market: "TW",
    aliases: ["fubon", "\u5bcc\u90a6"],
    description: "\u91d1\u63a7\u6b0a\u503c\u80a1\uff0c\u53d7\u5229\u7387\u8207\u91d1\u878d\u5e02\u5834\u6ce2\u52d5\u5f71\u97ff\u3002"
  },
  {
    symbol: "2882.TW",
    code: "2882",
    name: "\u570b\u6cf0\u91d1",
    market: "TW",
    aliases: ["cathay", "\u570b\u6cf0"],
    description: "\u58fd\u96aa\u8207\u9280\u884c\u96d9\u6838\u5fc3\uff0c\u6ce2\u52d5\u53d7\u8cc7\u672c\u5e02\u5834\u5f71\u97ff\u8f03\u5927\u3002"
  },
  {
    symbol: "0050.TW",
    code: "0050",
    name: "\u5143\u5927\u53f0\u706350",
    market: "TW",
    aliases: ["\u53f0\u706350", "etf 50", "yuanta 50"],
    description: "\u8ffd\u8e64\u53f0\u7063\u5927\u578b\u6b0a\u503c\u80a1\uff0c\u9069\u5408\u89c0\u5bdf\u5927\u76e4\u4e3b\u6d41\u65b9\u5411\u3002"
  },
  {
    symbol: "0056.TW",
    code: "0056",
    name: "\u5143\u5927\u9ad8\u80a1\u606f",
    market: "TW",
    aliases: ["\u9ad8\u80a1\u606f", "yuanta high dividend"],
    description: "\u9ad8\u80a1\u606f ETF\uff0c\u5e38\u7528\u65bc\u6536\u76ca\u578b\u914d\u7f6e\u3002"
  },
  {
    symbol: "006208.TW",
    code: "006208",
    name: "\u5bcc\u90a6\u53f050",
    market: "TW",
    aliases: ["\u53f050", "fubon 50"],
    description: "\u8ffd\u8e64\u53f0\u7063 50 \u6307\u6578\u7684 ETF\u3002"
  },
  {
    symbol: "AAPL",
    code: "AAPL",
    name: "Apple",
    market: "US",
    aliases: ["\u860b\u679c", "apple"],
    description: "\u6d88\u8cbb\u96fb\u5b50\u8207\u670d\u52d9\u751f\u614b\u7cfb\u9f8d\u982d\u3002"
  },
  {
    symbol: "MSFT",
    code: "MSFT",
    name: "Microsoft",
    market: "US",
    aliases: ["\u5fae\u8edf", "microsoft"],
    description: "\u96f2\u7aef\u3001AI \u8207\u4f01\u696d\u8edf\u9ad4\u5e73\u53f0\u9f8d\u982d\u3002"
  },
  {
    symbol: "NVDA",
    code: "NVDA",
    name: "NVIDIA",
    market: "US",
    aliases: ["\u8f1d\u9054", "\u82f1\u5049\u9054", "nvidia"],
    description: "AI \u6676\u7247\u8207\u8cc7\u6599\u4e2d\u5fc3\u6838\u5fc3\u6a19\u7684\u3002"
  },
  {
    symbol: "AMZN",
    code: "AMZN",
    name: "Amazon",
    market: "US",
    aliases: ["\u4e9e\u99ac\u905c", "amazon"],
    description: "\u96fb\u5546\u8207\u96f2\u7aef\u96d9\u4e3b\u8ef8\u516c\u53f8\u3002"
  },
  {
    symbol: "GOOGL",
    code: "GOOGL",
    name: "Alphabet",
    market: "US",
    aliases: ["google", "\u8c37\u6b4c", "alphabet"],
    description: "\u641c\u5c0b\u3001\u5ee3\u544a\u8207\u96f2\u7aef\u670d\u52d9\u9f8d\u982d\u3002"
  },
  {
    symbol: "META",
    code: "META",
    name: "Meta",
    market: "US",
    aliases: ["facebook", "meta", "\u81c9\u66f8"],
    description: "\u793e\u7fa4\u5e73\u53f0\u8207\u5ee3\u544a\u6280\u8853\u4ee3\u8868\u516c\u53f8\u3002"
  }
];

export function normalizeStockQuery(input: string) {
  const query = input.trim();
  if (!query) return "";

  const normalizedQuery = query.toLowerCase();
  const exact = stockDirectory.find((item) => {
    return (
      item.symbol.toLowerCase() === normalizedQuery ||
      item.code.toLowerCase() === normalizedQuery ||
      item.name === query ||
      item.aliases.some((alias) => alias.toLowerCase() === normalizedQuery)
    );
  });

  if (exact) return exact.symbol;
  if (/^\d{4,6}$/.test(query)) return `${query}.TW`;
  return query.toUpperCase();
}

export function searchStocks(input: string) {
  const query = input.trim().toLowerCase();
  if (!query) return stockDirectory.slice(0, 12);

  return stockDirectory
    .filter((item) => {
      return (
        item.symbol.toLowerCase().includes(query) ||
        item.code.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.aliases.some((alias) => alias.toLowerCase().includes(query))
      );
    })
    .slice(0, 12);
}
