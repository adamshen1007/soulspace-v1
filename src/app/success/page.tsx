"use client";

import Link from "next/link";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [countdown, setCountdown] = useState(5);

  // 倒计时自动跳转
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      window.location.href = "/"; // 倒计时结束后跳回首页
    }
  }, [countdown]);

  return (
    <div className="min-h-screen bg-zen-bg flex items-center justify-center p-6 font-serif">
      <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl max-w-md w-full text-center relative overflow-hidden animate-fade-in-up border border-stone-100">
        
        {/* 背景装饰光晕 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-zen-green/10 rounded-full blur-[40px] translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-zen-gold/10 rounded-full blur-[40px] -translate-x-1/3 translate-y-1/3"></div>

        {/* 成功图标 */}
        <div className="relative w-20 h-20 bg-zen-green rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-zen-green/30">
          <Check className="w-10 h-10 text-white" strokeWidth={3} />
          <div className="absolute inset-0 border-2 border-white/30 rounded-full animate-ping-slow"></div>
        </div>

        <h1 className="text-3xl text-zen-black mb-2 tracking-widest">支付成功</h1>
        <p className="text-sm text-zen-black/50 mb-8 tracking-wider">
          灵力已注入您的账户<br/>
          愿这份能量助您洞见真知
        </p>

        {/* 订单信息微件 */}
        <div className="bg-stone-50 rounded-xl p-4 mb-8 border border-stone-100 flex items-center justify-center gap-2">
           <Sparkles className="w-4 h-4 text-zen-gold" />
           <span className="text-xs text-stone-500 font-sans">
             订单号: {sessionId?.slice(0, 10)}...
           </span>
        </div>

        {/* 按钮区 */}
        <div className="space-y-4">
          <Link href="/">
            <button className="w-full h-12 bg-zen-black hover:bg-zen-gold text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-zen-gold/30 tracking-[0.2em] text-sm flex items-center justify-center gap-2 group">
              <span>立即体验</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          
          <p className="text-xs text-stone-400 font-sans">
            {countdown} 秒后自动返回首页...
          </p>
        </div>

      </div>
    </div>
  );
}