import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StockScope",
  description: "以 Yahoo Finance 資料進行週、月、年股票分析。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
