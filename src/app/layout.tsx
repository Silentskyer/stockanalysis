import Link from "next/link";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StockScope",
  description: "\u4f7f\u7528 Fugle \u8cc7\u6599\u9032\u884c\u53f0\u80a1\u500b\u80a1\u5206\u6790\u8207\u5927\u76e4\u89c0\u5bdf\u3002"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>
        <header className="topbar">
          <div className="topbar-inner">
            <Link className="brand" href="/">
              StockScope
            </Link>
            <nav className="topnav">
              <Link href="/">{"\u500b\u80a1\u5206\u6790"}</Link>
              <Link href="/market">{"\u7d71\u4e00\u5927\u76e4"}</Link>
              <Link href="/stocks">{"\u80a1\u7968\u6e05\u55ae"}</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
