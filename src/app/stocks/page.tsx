import { StockCatalog } from "@/components/stock-catalog";
import { fetchAllFugleTickers } from "@/lib/fugle-marketdata";
import { stockDirectory } from "@/lib/stock-directory";

export default async function StocksPage() {
  const fugleItems = await fetchAllFugleTickers().catch(() => []);
  const merged = [...fugleItems, ...stockDirectory]
    .filter((item, index, array) => array.findIndex((candidate) => candidate.symbol === item.symbol) === index)
    .sort((left, right) => Number(left.symbol) - Number(right.symbol));

  return <StockCatalog items={merged} />;
}
