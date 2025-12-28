"use client";

import Link from "next/link";
import { 
  ArrowRight, Clock, LayoutDashboard, 
  Calendar, Compass, User, Moon 
} from "lucide-react";

import SonicPlayer from "../components/SonicPlayer"; 
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <div className="min-h-screen bg-zen-bg font-serif text-zen-black selection:bg-zen-green/20 overflow-hidden relative">
      <SonicPlayer />
      
      {/* 装饰性背景层 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-zen-green/5 to-transparent blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-zen-gold/5 to-transparent blur-[100px]" />
      </div>

      {/* 顶部交互组件 */}
      <div className="fixed top-6 left-6 z-50">
        <Link 
          href="/history" 
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/40 backdrop-blur-md border border-zen-black/5 text-zen-black hover:bg-white transition shadow-sm group"
        >
          <Clock className="w-5 h-5 opacity-30 group-hover:opacity-100 transition" />
        </Link>
      </div>

      <div className="fixed top-6 right-6 z-50">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-5 py-2 rounded-full bg-zen-black text-zen-white text-[10px] tracking-widest hover:bg-zen-gold hover:text-zen-black transition shadow-lg">
              AUTHENTICATE
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <div className="p-1 bg-white/40 backdrop-blur rounded-full border border-zen-black/5 shadow-sm">
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        
        {/* 核心视觉区 (Hero Section) */}
        <div className="text-center space-y-10 mb-12 animate-fade-in">
          <div className="relative inline-block">
            <h1 className="text-5xl md:text-7xl font-light tracking-widest text-zen-black">
              灵境 · <span className="font-serif italic">SoulSpace</span>
            </h1>
            
            {/* 🌙 梦境彩蛋按钮 */}
            <Link 
              href="/dream" 
              className="absolute -right-10 -top-2 group/moon cursor-pointer"
            >
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute w-6 h-6 rounded-full bg-zen-gold/10 group-hover/moon:bg-zen-gold/30 group-hover/moon:scale-150 transition-all duration-700 blur-md animate-pulse"></div>
                <Moon className="w-4 h-4 text-zen-gold/30 group-hover/moon:text-zen-gold transition-colors" />
              </div>
            </Link>
          </div>
          
          {/* 正文：修复换行问题，显示为两行 */}
          <div className="space-y-3">
            <p className="text-sm tracking-[0.4em] text-zen-black/50 font-light">
              境 随 心 转 <span className="mx-2 opacity-30">|</span> 心 依 境 安
            </p>
            <p className="text-xs tracking-[0.2em] text-zen-black/30 font-light">
              重塑空间的场能，觉察潜意识的留白
            </p>
          </div>
        </div>

        {/* 功能导航网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl justify-items-center animate-fade-in-up">
          
          <Link href="/analyze">
            <button className="w-64 px-8 py-4 rounded-full border border-zen-black/10 text-zen-black/60 hover:bg-zen-black hover:text-zen-white transition-all font-light tracking-[0.2em] text-sm flex items-center justify-center gap-2 group hover:-translate-y-1 bg-white/30 backdrop-blur-sm">
              <LayoutDashboard className="w-4 h-4 opacity-70" />
              <span>空间诊断</span>
            </button>
          </Link>

          <Link href="/face">
            <button className="w-64 px-8 py-4 rounded-full border border-zen-black/10 text-zen-black/60 hover:bg-zen-black hover:text-zen-white transition-all font-light tracking-[0.2em] text-sm flex items-center justify-center gap-2 group hover:-translate-y-1 bg-white/30 backdrop-blur-sm">
              <User className="w-4 h-4 opacity-70" />
              <span>灵境观相</span>
            </button>
          </Link>

          <Link href="/oracle">
            <button className="w-64 px-8 py-4 rounded-full border border-zen-black/10 text-zen-black/60 hover:bg-zen-black hover:text-zen-white transition-all font-light tracking-[0.2em] text-sm flex items-center justify-center gap-2 group hover:-translate-y-1 bg-white/30 backdrop-blur-sm">
              <Compass className="w-4 h-4 opacity-70" />
              <span>决策罗盘</span>
              <span className="w-1.5 h-1.5 rounded-full bg-zen-gold group-hover:bg-zen-white animate-pulse"></span>
            </button>
          </Link>

          <Link href="/daily">
            <button className="w-64 px-8 py-4 rounded-full border border-zen-black/10 text-zen-black/60 hover:bg-zen-black hover:text-zen-white transition-all font-light tracking-[0.2em] text-sm flex items-center justify-center gap-2 group hover:-translate-y-1 bg-white/30 backdrop-blur-sm">
              <Calendar className="w-4 h-4 opacity-70" />
              <span>灵境日课</span>
            </button>
          </Link>

        </div>

        <footer className="absolute bottom-8 text-[9px] tracking-[0.5em] text-zen-black/10 uppercase">
          © Powered by SoulSpace AI
        </footer>

      </main>
    </div>
  );
}
