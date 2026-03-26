interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

export async function fetchGeminiNewsSummary(params: {
  symbol: string;
  name: string;
  sector: string;
  currentPrice: number | null;
  changePercent: number | null;
}) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const priceText =
    params.currentPrice == null
      ? "\u73fe\u50f9\u66ab\u7121"
      : `\u73fe\u50f9 ${params.currentPrice}`;
  const changeText =
    params.changePercent == null
      ? "\u6f32\u8dcc\u5e45\u66ab\u7121"
      : `\u6f32\u8dcc\u5e45 ${params.changePercent}%`;
  const prompt =
    `\u8acb\u7528\u7e41\u9ad4\u4e2d\u6587\uff0c\u91dd\u5c0d\u53f0\u80a1 ${params.name}(${params.symbol}) ` +
    `\u64b0\u5beb 120 \u5b57\u4ee5\u5167\u7684\u65b0\u805e\u8207\u89c0\u5bdf\u6458\u8981\u3002` +
    `\u8acb\u7d50\u5408\u6700\u8fd1\u65b0\u805e\u3001\u7522\u696d\u8da8\u52e2\u8207\u516c\u958b\u8cc7\u8a0a\uff0c` +
    `\u91cd\u9ede\u8aaa\u660e\u8a72\u516c\u53f8\u76ee\u524d\u7684\u4e3b\u8981\u8a71\u984c\u6216\u98a8\u96aa\u3002` +
    `\u80cc\u666f\u8cc7\u8a0a\uff1a\u7522\u696d ${params.sector}\uff0c${priceText}\uff0c${changeText}\u3002` +
    `\u82e5\u8cc7\u6599\u4e0d\u8db3\uff0c\u8acb\u660e\u78ba\u8aaa\u660e\u8cc7\u8a0a\u6709\u9650\uff0c\u4e0d\u8981\u63cf\u8ff0\u70ba\u5df2\u78ba\u8a8d\u4e8b\u5be6\u3002`;

  const bodyWithSearch = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ],
    tools: [{ google_search: {} }]
  };

  const searchedText = await tryGeminiRequest(apiKey, bodyWithSearch);
  if (searchedText) {
    return searchedText;
  }

  return tryGeminiRequest(apiKey, {
    contents: bodyWithSearch.contents
  });
}

async function tryGeminiRequest(apiKey: string, body: object) {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        next: {
          revalidate: 300
        }
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();

    return text || null;
  } catch {
    return null;
  }
}
