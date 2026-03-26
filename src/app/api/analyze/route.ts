import { NextRequest, NextResponse } from "next/server";
import { analyzeStock } from "@/lib/analyze-stock";

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol")?.trim().toUpperCase();

  if (!symbol) {
    return NextResponse.json(
      { error: "請提供股票代碼，例如 AAPL 或 2330.TW。" },
      { status: 400 }
    );
  }

  try {
    const result = await analyzeStock(symbol);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "分析失敗，請稍後再試。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
