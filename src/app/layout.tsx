import type { Metadata, Viewport } from "next";
import { Inter, Noto_Serif_SC } from "next/font/google";
import "./globals.css";

import { ClerkProvider } from '@clerk/nextjs';
import { zhCN } from '@clerk/localizations';

const inter = Inter({ subsets: ["latin"] });
// 引入思源宋体，增加文化感
const notoSerifSC = Noto_Serif_SC({ 
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-noto-serif-sc',
});

export const metadata: Metadata = {
  title: "灵境 · 心居",
  description: "AI 驱动的东方美学空间疗愈",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "灵境",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#F5F5F0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider 
      localization={zhCN}
      appearance={{
        layout: {
          socialButtonsPlacement: 'bottom',
          socialButtonsVariant: 'blockButton', // 改成 block 样式，Google 按钮会更显眼好看
        },
        variables: {
          colorPrimary: '#D4AF37', // 核心金色
          colorText: '#2C2C2C',    // 深沉黑
          fontFamily: 'var(--font-noto-serif-sc), serif', // 强制使用宋体
          borderRadius: '1rem',    // 全局圆角
        },
        elements: {
          // 1. 卡片主体：磨砂玻璃感 + 更柔和的阴影
          card: "bg-white/95 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-stone-100 rounded-[32px] p-8",
          
          // 2. 标题和副标题
          headerTitle: "text-2xl font-serif text-zen-black tracking-widest font-light",
          headerSubtitle: "text-stone-400 tracking-wider text-xs mt-2",
          
          // 3. Google 登录按钮：去掉默认的土气边框，改成雅致的风格
          socialButtonsBlockButton: "h-12 border border-stone-200 bg-white hover:bg-stone-50 hover:border-zen-gold/50 transition-all duration-500 rounded-full",
          socialButtonsBlockButtonText: "text-stone-600 font-sans tracking-wide text-xs",
          
          // 4. 分割线
          dividerLine: "bg-stone-100",
          dividerText: "text-stone-300 text-[10px] tracking-[0.2em] uppercase",
          
          // 5. 输入框：更加扁平，聚焦时发金光
          formFieldInput: "h-12 rounded-xl border-stone-200 bg-stone-50/50 focus:bg-white focus:border-zen-gold focus:ring-4 focus:ring-zen-gold/10 transition-all duration-300",
          formFieldLabel: "text-stone-500 tracking-wider text-xs mb-2",
          
          // 6. 主按钮 (继续)：黑金风格，增加投影
          formButtonPrimary: "h-12 bg-zen-black hover:bg-zen-gold text-white tracking-[0.3em] font-light rounded-full shadow-lg hover:shadow-zen-gold/40 hover:-translate-y-0.5 transition-all duration-500",
          
          // 7. 底部链接 (注册/切换账号)
          footerActionLink: "text-zen-gold hover:text-zen-black font-serif italic decoration-1 underline-offset-4",
          identityPreviewText: "text-zen-black tracking-wider",
          identityPreviewEditButton: "text-zen-gold hover:text-zen-black",
          
          // 8. 隐藏底部的 "Development mode" 橙色条 (在开发环境虽然隐藏不了，但我们可以让它不那么刺眼)
          developmentModeBadge: "hidden", // 尝试隐藏，或改成透明
        }
      }}
    >
      <html lang="zh-CN">
        <body className={`${inter.className} ${notoSerifSC.variable} bg-zen-bg`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}