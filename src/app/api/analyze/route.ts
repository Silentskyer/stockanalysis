import { NextRequest, NextResponse } from "next/server";
import { analyzeStock } from "@/lib/analyze-stock";

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol")?.trim().toUpperCase();

  if (!symbol) {
    return NextResponse.json(
      {
        error: "\u8acb\u63d0\u4f9b\u80a1\u7968\u4ee3\u78bc\uff0c\u4f8b\u5982 AAPL \u6216 2330.TW\u3002"
      },
      { status: 400 }
    );
  }

  try {
    const result = await analyzeStock(symbol);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "\u5206\u6790\u5931\u6557\uff0c\u8acb\u7a0d\u5f8c\u518d\u8a66\u3002";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
