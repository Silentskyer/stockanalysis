# Stock Analysis

使用 Fugle 台股資料建立股票分析網站，輸出週、月、年三種視角的趨勢分析，並提供買進、賣出或觀望建議與簡短說明。

## 功能

- 輸入台股代碼或中文名稱後查詢個股分析
- 從 Fugle 取得歷史股價、即時報價與基本資料
- 以週、月、年視角計算趨勢、均線、動能與波動
- 綜合評分後輸出買進 / 賣出 / 觀望建議
- 顯示簡略解說與風險提示
- 提供台股代表標的總覽與股票清單頁

## 技術

- Next.js App Router
- TypeScript
- Server Route Handler 作為分析 API
- Fugle Market Data API

## 環境變數

- `FUGLE_API_KEY`

## 啟動

安裝 Node.js 20+ 後執行：

```bash
npm install
npm run dev
```

然後開啟 `http://localhost:3000`。

## API

- `GET /api/analyze?symbol=2330`
- `GET /api/analyze?symbol=6223`
- `GET /api/search?q=旺宏`

## 部署

Vercel 請設定：

- `FUGLE_API_KEY`
- Node.js 20

## 注意事項

此專案輸出的買賣建議僅為技術分析輔助，不構成任何投資建議。
