import { NextRequest, NextResponse } from "next/server";
import { searchStocks } from "@/lib/stock-directory";
import { searchFugleStockByCode } from "@/lib/fugle-marketdata";
import { searchYahooStocks } from "@/lib/yahoo-marketdata";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const sector = request.nextUrl.searchParams.get("sector")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({
      items: searchStocks("", sector).slice(0, 16)
    });
  }

  try {
    const localItems = searchStocks(query, sector);
    const fugleItems = await searchFugleStockByCode(query);
    const yahooItems = await searchYahooStocks(query).catch(() => []);
    const merged = [...localItems, ...fugleItems, ...yahooItems].filter(
      (item, index, array) => array.findIndex((candidate) => candidate.symbol === item.symbol) === index
    );

    return NextResponse.json({
      items: merged.slice(0, 16)
    });
  } catch {
    return NextResponse.json({
      items: searchStocks(query, sector).slice(0, 16)
    });
  }
}
