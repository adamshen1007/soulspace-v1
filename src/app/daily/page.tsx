"use client";

import { useState, useEffect } from "react";
import SonicPlayer from "../../components/SonicPlayer";
import Link from "next/link";
import { ArrowLeft, Calendar, CheckCircle, XCircle, RefreshCw } from "lucide-react";
// 👇 1. 引入弹窗组件
import PricingModal from "../../components/PricingModal";

export default function DailyPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [isRevealed, setIsRevealed] = useState(false); // 是否已撕开日历
  
  // 👇 2. 定义付费弹窗状态
  const [showPaywall, setShowPaywall] = useState(false);

  // 获取今日日期字符串
  const today = new Date().toLocaleDateString('zh-CN', { 
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' 
  });

  const fetchDaily = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: today }),
      });

      // 👇👇👇 3. 核心拦截逻辑：如果没钱了 (402)，弹出充值框
      if (res.status === 402) {
        setShowPaywall(true);
        setLoading(false); // 停止加载动画
        return; // 终止后续逻辑（日历不会被撕开）
      }
      // 👆👆👆

      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setIsRevealed(true); // 只有成功获取数据且扣费成功后，才撕开日历
      }
    } catch (err) {
      // 只有非 402 的网络错误才报这个错
      alert("日历连接超时");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 font-serif text-zen-black flex flex-col items-center relative">
      <SonicPlayer />
      
      <nav className="w-full p-6 fixed top-0 left-0 z-50">
        <Link href="/" className="flex items-center text-xs tracking-[0.2em] opacity-60 hover:opacity-100 transition">
          <ArrowLeft className="w-4 h-4 mr-2" /> 归位
        </Link>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center w-full px-6 py-20">
        
        {/* 日历容器 */}
        <div className="relative w-full max-w-sm aspect-[3/4] perspective-1000">
          
          {/* 1. 封面 (未撕开状态) */}
          <div 
            onClick={() => !loading && !isRevealed && fetchDaily()}
            className={`absolute inset-0 bg-zen-black text-zen-white rounded-2xl shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-1000 origin-top z-20 border-t-8 border-zen-gold/50
              ${isRevealed ? 'rotate-x-180 opacity-0 pointer-events-none translate-y-20' : 'rotate-x-0 opacity-100'}
              ${loading ? 'animate-pulse' : 'hover:-translate-y-2'}
            `}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="w-4 h-4 rounded-full bg-stone-800 absolute top-4"></div>
            <Calendar className="w-16 h-16 mb-6 opacity-80" />
            <h1 className="text-4xl font-light tracking-widest mb-2">日课</h1>
            <p className="text-xs tracking-[0.5em] opacity-50">{today}</p>
            <p className="mt-12 text-xs border border-white/20 px-4 py-2 rounded-full animate-bounce">
              {loading ? "正在读取..." : "点击开启今日指引"}
            </p>
          </div>

          {/* 2. 内页 (内容状态) */}
          {data && (
            <div className={`absolute inset-0 bg-white rounded-2xl shadow-lg p-8 flex flex-col animate-fade-in z-10 border-t-8 border-zen-green/30`}>
              {/* 顶部打孔装饰 */}
              <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-stone-100 shadow-inner"></div>

              {/* 头部信息 */}
              <div className="text-center border-b border-zen-black/5 pb-6 mb-6">
                <p className="text-xs text-zen-black/40 tracking-widest mb-2">{data.date_str}</p>
                <div className="flex items-center justify-center gap-4">
                  <h2 className="text-5xl font-bold text-zen-black">{data.theme}</h2>
                  <div className="flex flex-col text-xs text-left text-zen-black/40 space-y-1">
                    <span>能量 {data.energy_level}%</span>
                    <span>宜 {data.lucky_color}</span>
                  </div>
                </div>
              </div>

              {/* 核心内容 */}
              <div className="flex-1 space-y-6">
                
                {/* 每日一句 */}
                <div className="text-center px-4">
                  <p className="text-lg leading-relaxed font-light text-zen-black/80">“{data.quote}”</p>
                </div>

                {/* 行动卡片 */}
                <div className="bg-zen-bg p-5 rounded-xl border border-zen-black/5">
                  <div className="flex items-center gap-2 mb-2 text-zen-green">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-bold tracking-widest">MICRO RITUAL</span>
                  </div>
                  <h3 className="font-bold text-zen-black mb-1">{data.todo.title}</h3>
                  <p className="text-xs text-zen-black/60">{data.todo.description}</p>
                </div>

                {/* 忌讳 */}
                <div className="flex items-center gap-3 text-xs text-zen-black/50 justify-center">
                  <XCircle className="w-3 h-3 text-zen-red" />
                  <span>今日忌：{data.avoid}</span>
                </div>
              </div>

              {/* 底部 */}
              <div className="mt-auto pt-6 text-center">
                <button 
                   onClick={() => window.location.reload()}
                   className="text-zen-black/20 hover:text-zen-black transition flex items-center justify-center mx-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 👇 4. 渲染弹窗 */}
      {showPaywall && <PricingModal onClose={() => setShowPaywall(false)} />}
    </div>
  );
}