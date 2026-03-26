# Stock Analysis

使用 Yahoo Finance 歷史資料建立股票分析網站，輸出週、月、年三種視角的趨勢分析，並提供買進、賣出或觀望建議與簡短說明。

## 功能

- 輸入股票代碼後查詢個股分析
- 從 Yahoo Finance Chart API 取得歷史價格與成交量
- 以週、月、年視角計算趨勢、均線、動能、波動
- 綜合評分後輸出買進 / 賣出 / 觀望建議
- 顯示簡略解說與風險提示

## 技術

- Next.js App Router
- TypeScript
- Server Route Handler 作為分析 API
- 原生 `fetch` 串接 Yahoo Finance

## 啟動

目前此工作區未安裝 Node.js / npm，因此尚未能在本機直接執行。安裝 Node.js 20+ 後執行：

```bash
npm install
npm run dev
```

然後開啟 `http://localhost:3000`。

## GitHub 與 Vercel 部署

1. 將此專案推送到 GitHub 儲存庫。
2. 在 Vercel 匯入該 GitHub 專案。
3. Framework Preset 選擇 Next.js。
4. Node.js 版本使用 20 以上。
5. Build Command 使用 `npm run build`，Install Command 使用 `npm install`。

此專案目前不需要額外環境變數即可啟動；資料由伺服器端向 Yahoo Finance 即時抓取。

## API

- `GET /api/analyze?symbol=2330.TW`
- `GET /api/analyze?symbol=AAPL`

## 注意事項

此專案輸出的買賣建議僅為技術分析輔助，不構成任何投資建議。
