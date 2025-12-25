import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// 👇 1. 引入 Clerk 组件
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "灵境 · SoulSpace",
  description: "AI 驱动的空间疗愈与决策辅助系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 👇 2. 用 ClerkProvider 包裹最外层 html
    <ClerkProvider>
      <html lang="zh-CN">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}