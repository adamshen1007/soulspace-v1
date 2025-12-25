import Link from "next/link";
import { ArrowRight, Sparkles, Clock, LayoutDashboard, Calendar, Compass } from "lucide-react";
// 👇 关键修改：把 ./ 改成 @/ 或者 ../
import SonicPlayer from "../components/SonicPlayer"; 
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <div className="min-h-screen bg-zen-bg font-serif text-zen-black selection:bg-zen-green/20 overflow-hidden relative">
      <SonicPlayer />
      
      {/* decorative background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-zen-green/10 to-transparent blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-zen-gold/10 to-transparent blur-[100px]" />
      </div>

      {/* 左上角：历史记录入口 */}
      <Link href="/history" className="fixed top-6 left-6 z-50 p-3 rounded-full bg-white/50 backdrop-blur-md border border-zen-black/10 text-zen-black hover:bg-white transition shadow-sm group">
        <Clock className="w-5 h-5 opacity-40 group-hover:opacity-100 transition" />
      </Link>

      {/* 右上角：用户登录系统 */}
      <div className="fixed top-6 right-6 z-50">
        <SignedOut>
          {/* 未登录显示 */}
          <SignInButton mode="modal">
            <button className="px-5 py-2 rounded-full bg-zen-black text-zen-white text-xs tracking-widest hover:bg-zen-gold hover:text-zen-black transition shadow-lg">
              登录 / 注册
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          {/* 已登录显示 */}
          <div className="p-1 bg-white/50 backdrop-blur rounded-full border border-zen-black/5">
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        
        {/* Hero Section */}
        <div className="text-center space-y-8 mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-zen-black/5 text-xs tracking-[0.2em] text-zen-black/60 mb-4 hover:bg-white transition cursor-default">
            <Sparkles className="w-3 h-3 text-zen-gold" />
            <span>AI DRIVEN MINDFULNESS</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-light tracking-widest text-zen-black">
            灵境 · <span className="font-serif italic">SoulSpace</span>
          </h1>
          
          <p className="text-sm md:text-base tracking-[0.3em] text-zen-black/40 max-w-lg mx-auto leading-loose">
            境随心转，心依境安。<br/>
            重塑你的空间，觉察你的能量。
          </p>
        </div>

        {/* Feature Navigation Grid */}
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl justify-center items-center">
          
          {/* 1. 空间诊断 */}
          <Link href="/analyze">
            <button className="w-64 px-8 py-4 rounded-full border border-zen-black/10 text-zen-black/60 hover:bg-zen-black hover:text-zen-white transition-all font-light tracking-[0.2em] text-sm flex items-center justify-center gap-2 group hover:-translate-y-1">
              <LayoutDashboard className="w-4 h-4 opacity-70" />
              <span>空间诊断</span>
              {/* 这里保留一个微小的装饰，区分不同按钮 */}
              <ArrowRight className="w-3 h-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
            </button>
          </Link>

          {/* 2. 决策罗盘 */}
          <Link href="/oracle">
            <button className="w-64 px-8 py-4 rounded-full border border-zen-black/10 text-zen-black/60 hover:bg-zen-black hover:text-zen-white transition-all font-light tracking-[0.2em] text-sm flex items-center justify-center gap-2 group hover:-translate-y-1">
              <Compass className="w-4 h-4 opacity-70" />
              <span>决策罗盘</span>
              <span className="w-1.5 h-1.5 rounded-full bg-zen-gold group-hover:bg-zen-white animate-pulse"></span>
            </button>
          </Link>

          {/* 3. 灵境日课 */}
          <Link href="/daily">
            <button className="w-64 px-8 py-4 rounded-full border border-zen-black/10 text-zen-black/60 hover:bg-zen-black hover:text-zen-white transition-all font-light tracking-[0.2em] text-sm flex items-center justify-center gap-2 group hover:-translate-y-1">
              <LayoutDashboard className="w-4 h-4 opacity-70" />
              <span>灵境日课</span>
              {/* 这里保留一个微小的装饰，区分不同按钮 */}
              <ArrowRight className="w-3 h-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
            </button>
          </Link>

        </div>

        <footer className="absolute bottom-8 text-[10px] tracking-[0.5em] text-zen-black/20 uppercase">
          Designed by SoulSpace AI
        </footer>

      </main>
    </div>
  );
}
