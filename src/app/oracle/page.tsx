"use client";

import { useState, useRef } from "react";
import SonicPlayer from "../../components/SonicPlayer";
import Link from "next/link";
import { ArrowLeft, Fingerprint, Scale, Lightbulb } from "lucide-react";
// 👇 1. 引入弹窗组件
import PricingModal from "../../components/PricingModal";

export default function OraclePage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [holding, setHolding] = useState(false); // 是否正在长按
  const [result, setResult] = useState<any>(null);

  // 👇 2. 定义付费弹窗状态
  const [showPaywall, setShowPaywall] = useState(false);
  
  // 长按计时器
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef(0); // 0 - 100

  // 开始长按
  const startHold = () => {
    if (!query.trim()) return alert("请先在心中默念并输入您的困惑...");
    setHolding(true);
    progressRef.current = 0;
    
    // 模拟充能过程，3秒后触发
    timerRef.current = setInterval(() => {
      progressRef.current += 2; // 增加进度
      if (progressRef.current >= 100) {
        finishHold();
      }
    }, 30);
  };

  // 结束长按 (如果没按够时间就松开)
  const endHold = () => {
    if (progressRef.current < 100) {
      setHolding(false);
      if (timerRef.current) clearInterval(timerRef.current);
      progressRef.current = 0;
    }
  };

  // 长按完成，触发 API
  const finishHold = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setHolding(false);
    setLoading(true);

    try {
      const res = await fetch("/api/oracle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      // 👇👇👇 3. 核心拦截逻辑：如果没钱了 (402)，弹出充值框
      if (res.status === 402) {
        setShowPaywall(true);
        setLoading(false); // 停止加载动画
        return;
      }
      // 👆👆👆

      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setResult(json.data);
    } catch (err: any) {
      alert("灵感链接断开：" + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zen-bg font-serif text-zen-black selection:bg-zen-gold/20 flex flex-col">
      <SonicPlayer />
      
      {/* 顶部 */}
      <nav className="p-6">
        <Link href="/" className="flex items-center text-xs tracking-[0.2em] opacity-60 hover:opacity-100 transition">
          <ArrowLeft className="w-4 h-4 mr-2" /> 归位
        </Link>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20 max-w-2xl mx-auto w-full">
        
        {/* 输入状态 */}
        {!result && (
          <div className={`w-full transition-all duration-700 ${loading ? 'opacity-0 scale-95' : 'opacity-100'}`}>
            <div className="text-center mb-12">
              <h1 className="text-3xl font-light mb-4">决策罗盘</h1>
              <p className="text-zen-black/40 text-sm tracking-widest">
                在心中默念问题，长按指纹注入意念
              </p>
            </div>

            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="例如：我应该接受那个外派的工作机会吗？还是继续留在现在的公司？"
              className="w-full bg-white/50 backdrop-blur border border-zen-black/10 rounded-2xl p-6 text-lg focus:outline-none focus:border-zen-gold transition min-h-[160px] resize-none placeholder:text-zen-black/20"
            />

            {/* 指纹长按区 */}
            <div className="mt-12 flex justify-center">
              <div 
                onMouseDown={startHold}
                onMouseUp={endHold}
                onTouchStart={startHold}
                onTouchEnd={endHold}
                className={`relative w-24 h-24 rounded-full flex items-center justify-center cursor-pointer select-none transition-all duration-300
                  ${holding ? 'scale-110 shadow-[0_0_50px_rgba(230,207,161,0.6)]' : 'hover:bg-zen-black/5'}
                `}
              >
                {/* 进度环 */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                  <circle cx="48" cy="48" r="46" stroke="currentColor" strokeWidth="2" fill="none" className="text-zen-black/5" />
                  {holding && (
                    <circle cx="48" cy="48" r="46" stroke="currentColor" strokeWidth="2" fill="none" 
                      className="text-zen-gold transition-all duration-75"
                      strokeDasharray="289"
                      strokeDashoffset={289 - (289 * progressRef.current) / 100}
                    />
                  )}
                </svg>
                
                <Fingerprint className={`w-12 h-12 transition-colors ${holding ? 'text-zen-gold animate-pulse' : 'text-zen-black/20'}`} />
              </div>
            </div>
            
            {holding && <p className="text-center text-xs text-zen-gold mt-4 animate-pulse tracking-widest">能量注入中...</p>}
          </div>
        )}

        {/* 加载状态 */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center animate-breathe">
            <div className="w-64 h-64 border border-zen-gold/30 rounded-full flex items-center justify-center animate-spin-slow">
              <div className="w-48 h-48 border border-dashed border-zen-black/10 rounded-full"></div>
            </div>
            <p className="absolute mt-32 text-xs tracking-[0.3em] text-zen-black/40">起卦推演中...</p>
          </div>
        )}

        {/* 结果展示 */}
        {result && (
          <div className="w-full animate-float-up">
            {/* 卦象卡片 */}
            <div className="bg-zen-black text-zen-white p-8 rounded-3xl shadow-2xl mb-8 relative overflow-hidden text-center">
              <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-zen-gold/20 rounded-full blur-[80px]"></div>
              <h2 className="text-6xl font-serif mb-2 relative z-10">{result.hexagram}</h2>
              <h3 className="text-lg tracking-[0.2em] opacity-80 mb-6 relative z-10">{result.title}</h3>
              <p className="text-sm leading-relaxed opacity-60 font-light border-t border-white/10 pt-6">
                {result.analysis}
              </p>
            </div>

            {/* 策略分析 */}
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-zen-black/5 flex gap-4">
                <Scale className="w-6 h-6 text-zen-black/40 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold tracking-widest uppercase mb-2 text-zen-black/40">Risk vs Reward</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-zen-green">▲ 收益：</span> {result.pros_cons.gain}</p>
                    <p><span className="text-zen-red">▼ 风险：</span> {result.pros_cons.risk}</p>
                  </div>
                </div>
              </div>

              <div className="bg-zen-gold/10 p-6 rounded-2xl border border-zen-gold/20 flex gap-4">
                <Lightbulb className="w-6 h-6 text-zen-gold shrink-0" />
                <div>
                  <h4 className="text-xs font-bold tracking-widest uppercase mb-2 text-zen-gold">Strategic Move</h4>
                  <p className="text-zen-black/80 text-sm font-medium">{result.strategy}</p>
                </div>
              </div>

              <div className="text-center py-8">
                 <p className="text-zen-black/40 text-xs tracking-[0.2em] italic">“{result.intuition}”</p>
              </div>
              
              <button 
                onClick={() => { setResult(null); setQuery(""); }}
                className="w-full py-4 text-xs tracking-widest text-zen-black/30 hover:text-zen-black hover:bg-white/50 rounded-xl transition"
              >
                再问一卦
              </button>
            </div>
          </div>
        )}

      </main>

      {/* 👇 4. 渲染弹窗 */}
      {showPaywall && <PricingModal onClose={() => setShowPaywall(false)} />}
    </div>
  );
}