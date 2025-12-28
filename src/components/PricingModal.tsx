"use client";

import { X, Zap, Loader2, Sparkles, Lock } from "lucide-react";
import { useState } from "react";

export default function PricingModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  // 👇 处理支付的核心逻辑 (已优化体验)
  const handleCheckout = async (plan: 'basic' | 'pro') => {
    if (loading) return; // 防止重复点击
    setLoading(true);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      
      const data = await res.json();
      
      if (data.url) {
        // ✅ 成功获取跳转链接
        // 注意：这里不要 setloading(false)
        // 让 Loading 遮罩一直显示，直到浏览器完成跳转，避免页面卡顿/白屏
        window.location.href = data.url;
      } else {
        alert("支付初始化失败，请稍后重试");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert("网络连接错误，请检查您的网络");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zen-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative transition-all">
        
        {/* 关闭按钮 - Loading 时禁用 */}
        <button 
          onClick={!loading ? onClose : undefined} 
          disabled={loading}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition z-10 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <X className="w-5 h-5 opacity-50" />
        </button>

        <div className="p-8 text-center relative">
          <div className="w-16 h-16 bg-zen-gold/20 rounded-full flex items-center justify-center mx-auto mb-6 text-zen-gold">
            <Zap className="w-8 h-8 fill-current" />
          </div>
          <h2 className="text-2xl font-serif text-zen-black mb-2">补充灵石</h2>
          <p className="text-sm text-zen-black/50 mb-8">
            您的免费体验次数已用完。<br/>请补充灵石以继续探索时空能量。
          </p>

          <div className="space-y-4">
            {/* 套餐 A (Basic) - 9.9元 */}
            <div 
              onClick={() => handleCheckout('basic')}
              className={`
                border border-zen-black/10 rounded-xl p-4 flex items-center justify-between 
                hover:border-zen-gold transition cursor-pointer group select-none
                ${loading ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
              `}
            >
              <div className="text-left">
                <div className="font-bold text-lg text-zen-black">9.9元 <span className="text-xs font-normal opacity-50">/ 10次</span></div>
                <div className="text-xs text-zen-green flex items-center gap-1">
                  新手推荐
                </div>
              </div>
              <button className="px-4 py-1.5 rounded-full bg-zen-black text-white text-xs group-hover:bg-zen-gold transition">
                购买
              </button>
            </div>

            {/* 套餐 B (Pro) - 29.9元 */}
            <div 
              onClick={() => handleCheckout('pro')}
              className={`
                border border-zen-gold/50 bg-zen-gold/5 rounded-xl p-4 flex items-center justify-between 
                cursor-pointer relative overflow-hidden hover:shadow-md transition-all select-none
                ${loading ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
              `}
            >
              <div className="absolute top-0 right-0 bg-zen-gold text-white text-[10px] px-2 py-0.5 rounded-bl-lg">热销</div>
              <div className="text-left">
                <div className="font-bold text-lg text-zen-black">29.9元 <span className="text-xs font-normal opacity-50">/ 35次</span></div>
                <div className="text-xs text-zen-gold font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 多送 5 次
                </div>
              </div>
              <button className="px-4 py-1.5 rounded-full bg-zen-gold text-zen-black text-xs font-bold shadow-sm">
                购买
              </button>
            </div>
          </div>

          <p className="text-[10px] text-center mt-6 opacity-30 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" /> Secure payment powered by Stripe
          </p>

          {/* 👇 优化后的 Loading 遮罩 */}
          {loading && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] flex flex-col items-center justify-center z-20 rounded-3xl animate-fade-in">
              <div className="relative">
                <Loader2 className="w-10 h-10 text-zen-gold animate-spin mb-4" />
                <div className="absolute inset-0 blur-lg bg-zen-gold/30 animate-pulse"></div>
              </div>
              <p className="text-sm font-medium text-zen-black tracking-widest mb-1">
                正在连接安全支付网关...
              </p>
              <p className="text-[10px] text-zen-black/40">
                请勿关闭页面，即将跳转
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}